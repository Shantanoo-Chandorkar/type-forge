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

    const inputRef = useRef(null);

    // Load a new quote and reset all test state when settings change.
    useEffect(() => {
        setQuote(getRandomQuote(difficulty));
        setUserTyping('');
        setTimeLeft(timer);
        setIsActive(false);
    }, [difficulty, timer]);

    // Interval created once per test run rather than once per second,
    // preventing a new setInterval on every timeLeft state update.
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
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
        handleTypingChange,
        resetTest,
    };
}
