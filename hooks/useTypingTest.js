import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import quotesData from '../data/typing_quotes_categorized.json';
import commonWordsData from '../data/common_words.json';
import punctuationData from '../data/punctuation_drills.json';
import codeData from '../data/code_snippets.json';
import academicData from '../data/academic_text.json';

/**
 * Returns a random entry from an array.
 *
 * @param {Array} pool - Array to sample from
 * @returns {any | null} Random element, or null if pool is empty
 */
function getRandomFromPool(pool) {
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Selects the quote pool for the given content mode and difficulty.
 * Falls back gracefully when a difficulty level does not exist in a dataset
 * (e.g. academic has no 'easy', code maps difficulty to language).
 *
 * @param {string} contentMode - 'quotes' | 'common-words' | 'punctuation' | 'code' | 'academic'
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {Array} Array of quote objects
 */
function getQuotePool(contentMode, difficulty) {
    switch (contentMode) {
        case 'common-words':
            return commonWordsData[difficulty] ?? commonWordsData['easy'];
        case 'punctuation':
            return punctuationData[difficulty] ?? punctuationData['medium'];
        case 'code': {
            // Difficulty maps to language: easy=javascript, medium=python, hard=sql
            const langMap = { easy: 'javascript', medium: 'python', hard: 'sql' };
            return codeData[langMap[difficulty] ?? 'javascript'];
        }
        case 'academic':
            // Academic has only medium and hard; easy falls back to medium.
            return academicData[difficulty] ?? academicData['medium'];
        default:
            // 'quotes'
            return quotesData[difficulty] ?? quotesData['easy'];
    }
}

/**
 * Assembles a completed attempt object from resolved test values.
 * Pure function; no ref or state access — all inputs passed explicitly.
 *
 * @param {Object} params
 * @param {Array}   params.timeline           - Per-second WPM snapshots from the test run
 * @param {number}  params.typedLength        - Total characters typed
 * @param {number}  params.errors             - Total incorrect characters
 * @param {Object}  params.keyErrors          - Per-key error counts map
 * @param {number}  params.timer              - Selected timer duration in seconds
 * @param {string}  params.difficulty         - Selected difficulty level
 * @param {string}  params.contentMode        - Content mode for this attempt
 * @param {boolean} params.testOverAndCompleted - Whether the quote was fully typed
 * @returns {Object} Completed attempt object ready for storage
 */
function assembleAttempt({
    timeline,
    typedLength,
    errors,
    keyErrors,
    timer,
    difficulty,
    contentMode,
    testOverAndCompleted,
}) {
    const correctChars = Math.max(0, typedLength - errors);
    const elapsed = timeline.length > 0 ? timeline[timeline.length - 1].second : 0;
    const elapsedMin = elapsed / 60;

    const finalWpm = elapsedMin === 0 ? 0 : Math.max(0, Math.round(correctChars / 5 / elapsedMin));
    const rawWpm = elapsedMin === 0 ? 0 : Math.max(0, Math.round(typedLength / 5 / elapsedMin));
    const accuracy = typedLength === 0 ? 100 : Math.round((correctChars / typedLength) * 100);

    // Consistency: 100 minus the coefficient of variation of per-second WPM.
    let consistency = 100;
    const wpmValues = timeline.map((t) => t.wpm).filter((w) => w > 0);
    if (wpmValues.length > 1) {
        const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
        if (mean > 0) {
            const variance = wpmValues.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmValues.length;
            const stddev = Math.sqrt(variance);
            consistency = Math.round(Math.max(0, Math.min(100, 100 - (stddev / mean) * 100)));
        }
    }

    return {
        id: String(Date.now()),
        timestamp: Date.now(),
        difficulty,
        timer,
        contentMode,
        wpm: finalWpm,
        rawWpm,
        accuracy,
        errors,
        consistency,
        timeElapsed: elapsed,
        completed: testOverAndCompleted,
        characters: {
            correct: correctChars,
            incorrect: errors,
            total: typedLength,
        },
        wpmTimeline: timeline,
        keyErrors,
    };
}

/**
 * Custom hook encapsulating all state and logic for the typing test.
 *
 * @param {Object} params
 * @param {string} params.difficulty - Selected difficulty level ('easy' | 'medium' | 'hard')
 * @param {number} params.timer - Selected timer duration in seconds
 * @param {string} [params.contentMode] - Content mode ('quotes' | 'common-words' | 'punctuation' | 'code' | 'academic' | 'custom')
 * @param {string | null} [params.customText] - Plain text to use as the typing target when contentMode is 'custom'
 * @returns {Object} All state values and callbacks needed by UI components
 */
export function useTypingTest({ difficulty, timer, contentMode = 'quotes', customText = null }) {
    const [quote, setQuote] = useState(null);
    const [userTyping, setUserTyping] = useState('');
    const [timeLeft, setTimeLeft] = useState(timer);
    const [isActive, setIsActive] = useState(false);
    const [completedAttempt, setCompletedAttempt] = useState(null);

    const inputRef = useRef(null);

    // Stable ref so the difficulty/contentMode effect can read the current timer value
    // without listing timer as a dep, which would re-trigger quote reloads on every
    // timer change.
    const timerRef = useRef(timer);

    // Mutable refs for data that must be readable inside interval closures
    // without causing re-renders or stale captures.
    const userTypingRef = useRef('');
    const totalErrorsRef = useRef(0);
    const wpmTimelineRef = useRef([]);
    // Per-key error map for the current test run: { char: errorCount }
    const keyErrorsRef = useRef({});

    /**
     * Picks a fresh quote for the current mode/difficulty, or uses customText directly.
     * Returns a quote object { quote: string, author: string }.
     *
     * @returns {{ quote: string, author: string } | null}
     */
    const pickQuote = useCallback(() => {
        if (contentMode === 'custom' && customText) {
            return { quote: customText, author: 'custom' };
        }
        return getRandomFromPool(getQuotePool(contentMode, difficulty));
    }, [contentMode, difficulty, customText]);

    // Fires when difficulty, contentMode, or customText changes:
    // load a new quote and fully reset test state.
    useEffect(() => {
        startTransition(() => {
            setQuote(pickQuote());
            setUserTyping('');
            setTimeLeft(timerRef.current);
            setIsActive(false);
            setCompletedAttempt(null);
        });
        userTypingRef.current = '';
        totalErrorsRef.current = 0;
        wpmTimelineRef.current = [];
        keyErrorsRef.current = {};
    }, [difficulty, contentMode, customText]); // pickQuote excluded intentionally; changes track through these three deps

    // Fires when timer setting changes: preserve the current quote, only reset
    // progress and timer so the user does not lose their quote mid-read.
    useEffect(() => {
        timerRef.current = timer;
        startTransition(() => {
            setTimeLeft(timer);
            setUserTyping('');
            setIsActive(false);
            setCompletedAttempt(null);
        });
        userTypingRef.current = '';
        totalErrorsRef.current = 0;
        wpmTimelineRef.current = [];
        keyErrorsRef.current = {};
    }, [timer]);

    // Interval created once per test run rather than once per second,
    // preventing a new setInterval on every timeLeft state update.
    // Also pushes a per-second WPM snapshot to wpmTimelineRef.
    useEffect(() => {
        if (!isActive) return;
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += 1;

            const typedLength = userTypingRef.current.length;
            const errors = totalErrorsRef.current;
            const correctChars = Math.max(0, typedLength - errors);
            const elapsedMin = elapsed / 60;
            const wpm = Math.max(0, Math.round(correctChars / 5 / elapsedMin));
            const rawWpm = Math.max(0, Math.round(typedLength / 5 / elapsedMin));

            wpmTimelineRef.current.push({ second: elapsed, wpm, rawWpm, errors });

            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    const resetTest = useCallback(() => {
        setQuote(pickQuote());
        setUserTyping('');
        setTimeLeft(timer);
        setIsActive(false);
        setCompletedAttempt(null);
        userTypingRef.current = '';
        totalErrorsRef.current = 0;
        wpmTimelineRef.current = [];
        keyErrorsRef.current = {};
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [pickQuote, timer]);

    const handleTypingChange = useCallback(
        (e) => {
            const currentInput = e.target.value;
            const prevLength = userTypingRef.current.length;
            const targetLength = quote?.quote.length;

            // Track per-key error: only when a new character is added (not on backspace).
            if (currentInput.length > prevLength) {
                const newIndex = currentInput.length - 1;
                const expectedChar = quote?.quote[newIndex];
                const typedChar = currentInput[newIndex];
                if (expectedChar && typedChar !== expectedChar) {
                    keyErrorsRef.current[expectedChar] =
                        (keyErrorsRef.current[expectedChar] ?? 0) + 1;
                }
            }

            if (currentInput.length === targetLength) {
                setIsActive(false);
            } else if (!isActive && timeLeft > 0 && currentInput.length > 0) {
                setIsActive(true);
            }

            userTypingRef.current = currentInput;
            setUserTyping(currentInput);
        },
        [quote, isActive, timeLeft],
    );

    const quoteArray = useMemo(() => quote?.quote.split('') ?? [], [quote]);
    const userTypingArray = useMemo(() => userTyping.split(''), [userTyping]);

    const charStatuses = useMemo(() => {
        return quoteArray.map((char, index) => {
            if (index >= userTypingArray.length) return 'pending';
            return userTypingArray[index] === char ? 'correct' : 'incorrect';
        });
    }, [quoteArray, userTypingArray]);

    const totalErrors = useMemo(
        () => charStatuses.filter((s) => s === 'incorrect').length,
        [charStatuses],
    );

    // Keep ref in sync so the interval closure can read the latest error count.
    useEffect(() => {
        totalErrorsRef.current = totalErrors;
    }, [totalErrors]);

    const testOverAndCompleted = useMemo(
        () => quoteArray.length > 0 && quoteArray.length === userTyping.length,
        [quoteArray, userTyping],
    );

    const testOverAndNotCompleted = useMemo(
        () => timeLeft === 0 && quoteArray.length !== userTyping.length,
        [timeLeft, quoteArray, userTyping],
    );

    const isTestOver = useMemo(
        () => testOverAndCompleted || testOverAndNotCompleted,
        [testOverAndCompleted, testOverAndNotCompleted],
    );

    const wordsPerMinute = useMemo(() => {
        const elapsedTime = timer - timeLeft;
        const totalCorrectChars = userTyping.length - totalErrors;
        const result = elapsedTime === 0 ? 0 : totalCorrectChars / 5 / (elapsedTime / 60);
        return Math.max(0, Math.round(result));
    }, [timer, timeLeft, userTyping, totalErrors]);

    // When the test ends, assemble the full attempt object from accumulated refs.
    useEffect(() => {
        if (!isTestOver || !quote) return;

        setCompletedAttempt(
            assembleAttempt({
                timeline: [...wpmTimelineRef.current],
                typedLength: userTypingRef.current.length,
                errors: totalErrorsRef.current,
                keyErrors: { ...keyErrorsRef.current },
                timer,
                difficulty,
                contentMode,
                testOverAndCompleted,
            }),
        );
        // Only trigger when isTestOver flips to true; the other values are
        // settings/snapshot reads that should not re-trigger the effect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTestOver]);

    return {
        quote,
        userTyping,
        timeLeft,
        isActive,
        inputRef,
        quoteArray,
        userTypingArray,
        charStatuses,
        totalErrors,
        testOverAndCompleted,
        testOverAndNotCompleted,
        isTestOver,
        wordsPerMinute,
        completedAttempt,
        handleTypingChange,
        resetTest,
    };
}
