import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import data from '../data/typing_quotes_categorized.json';

const getRandomQuote = (difficulty) => {
    return data[difficulty][Math.floor(Math.random() * data[difficulty].length)];
};

/**
 * Custom hook encapsulating all state and logic for the typing test.
 *
 * @param {Object} params
 * @param {string} params.difficulty - Selected difficulty level ('easy' | 'hard')
 * @param {number} params.timer - Selected timer duration in seconds
 * @returns {Object} All state values and callbacks needed by UI components
 */
export function useTypingTest({ difficulty, timer }) {
    const [quote, setQuote] = useState(null);
    const [userTyping, setUserTyping] = useState('');
    const [timeLeft, setTimeLeft] = useState(timer);
    const [isActive, setIsActive] = useState(false);
    const [completedAttempt, setCompletedAttempt] = useState(null);

    const inputRef = useRef(null);

    // Stable ref so the difficulty effect can read the current timer value
    // without listing timer as a dep, which would re-trigger quote reloads
    // on every timer change.
    const timerRef = useRef(timer);

    // Mutable refs for data that must be readable inside interval closures
    // without causing re-renders or stale captures.
    const userTypingRef = useRef('');
    const totalErrorsRef = useRef(0);
    const wpmTimelineRef = useRef([]);

    // Fires when difficulty changes: load a new quote and fully reset test state.
    useEffect(() => {
        setQuote(getRandomQuote(difficulty));
        setUserTyping('');
        setTimeLeft(timerRef.current);
        setIsActive(false);
        setCompletedAttempt(null);
        userTypingRef.current = '';
        totalErrorsRef.current = 0;
        wpmTimelineRef.current = [];
    }, [difficulty]);

    // Fires when timer setting changes: preserve the current quote, only reset
    // progress and timer so the user does not lose their quote mid-read.
    useEffect(() => {
        timerRef.current = timer;
        setTimeLeft(timer);
        setUserTyping('');
        setIsActive(false);
        setCompletedAttempt(null);
        userTypingRef.current = '';
        totalErrorsRef.current = 0;
        wpmTimelineRef.current = [];
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
        setQuote(getRandomQuote(difficulty));
        setUserTyping('');
        setTimeLeft(timer);
        setIsActive(false);
        setCompletedAttempt(null);
        userTypingRef.current = '';
        totalErrorsRef.current = 0;
        wpmTimelineRef.current = [];
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [difficulty, timer]);

    const handleTypingChange = useCallback(
        (e) => {
            const currentInput = e.target.value;
            const targetLength = quote?.quote.length;

            if (currentInput.length === targetLength) {
                // Stop the timer instantly on completion.
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

        const timeline = [...wpmTimelineRef.current];
        const typedLength = userTypingRef.current.length;
        const errors = totalErrorsRef.current;
        const correctChars = Math.max(0, typedLength - errors);
        const elapsed = timeline.length > 0 ? timeline[timeline.length - 1].second : 0;
        const elapsedMin = elapsed / 60;

        const finalWpm =
            elapsedMin === 0 ? 0 : Math.max(0, Math.round(correctChars / 5 / elapsedMin));
        const rawWpm =
            elapsedMin === 0 ? 0 : Math.max(0, Math.round(typedLength / 5 / elapsedMin));
        const accuracy =
            typedLength === 0 ? 100 : Math.round((correctChars / typedLength) * 100);

        // Consistency: 100 minus the coefficient of variation of per-second WPM.
        let consistency = 100;
        const wpmValues = timeline.map((t) => t.wpm).filter((w) => w > 0);
        if (wpmValues.length > 1) {
            const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
            if (mean > 0) {
                const variance =
                    wpmValues.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmValues.length;
                const stddev = Math.sqrt(variance);
                consistency = Math.round(Math.max(0, Math.min(100, 100 - (stddev / mean) * 100)));
            }
        }

        setCompletedAttempt({
            id: String(Date.now()),
            timestamp: Date.now(),
            difficulty,
            timer,
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
        });
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
