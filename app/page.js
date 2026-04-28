'use client';
import { useState, useEffect, useRef } from 'react';
import CharNode from '@/components/CharNode';
import data from '../data/typing_quotes_categorized.json';

const getRandomQuote = (difficulty) => {
    // const quoteKeys = Object.keys(data);
    // const randomQuoteKey = quoteKeys[Math.floor(Math.random() * quoteKeys.length)];
    const randomQuote = data[difficulty][Math.floor(Math.random() * data[difficulty].length)];

    return randomQuote;
};

const TIMER_VALUES = [15, 30, 60, 120];
const NUMBER_OF_WORDS = [10, 25, 50, 100];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export default function Home() {
    const [randomQuote, setRandomeQuote] = useState(null);
    const [timer, setTimer] = useState(15);
    const [difficulty, setDifficulty] = useState('easy');

    // Execution states.
    const [userTyping, setUserTyping] = useState('');
    const [timeLeft, setTimeLeft] = useState(15); // Same as timer.
    const [isActive, setIsActive] = useState(false);

    // To capture the user typed input.
    const inputRef = useRef(null);

    // Only runs on mount or
    // When the dropdown options change
    useEffect(() => {
        setRandomeQuote(getRandomQuote(difficulty));
        setUserTyping('');
        setTimeLeft(parseInt(timer, 10));
        setIsActive(false);
    }, [difficulty, timer]);

    // Interval Engine.
    useEffect(() => {
        let countDownInterval;
        if (isActive && timeLeft > 0) {
            countDownInterval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(countDownInterval);
        }

        return () => {
            clearInterval(countDownInterval);
        };
    }, [isActive, timeLeft]);

    const handleTimerChange = (e) => {
        setTimer(e.target.value);
    };

    const handleDifficultyChange = (e) => {
        setDifficulty(e.target.value);
    };

    const handleTypingChange = (e) => {
        const currentInput = e.target.value;
        const targetLength = randomQuote?.quote.length;

        // Check completion state immediately.
        if (currentInput.length === targetLength) {
            setIsActive(false); // Stop the timer instantly.
        }
        // Start the clock on first key stroke input.
        else if (!isActive && timeLeft > 0 && currentInput.length > 0) {
            setIsActive(true);
        }
        setUserTyping(e.target.value);
    };

    // Return early if randomQuote is not available yet.
    if (!randomQuote) return null;

    // Convert the quote string and user typing string to arrays of characters.
    // This is done to independently check the status of each character typed.
    const quoteString = randomQuote.quote;
    const quoteArray = quoteString.split('');
    const userTypingArray = userTyping.split('');

    const testOverAndCompleted = quoteString.length > 0 && quoteString.length === userTyping.length;
    const testOverAndNotCompleted = timeLeft === 0 && quoteString.length !== userTyping.length;
    const isTestOver = testOverAndCompleted || testOverAndNotCompleted;

    const totalErrors = userTypingArray.reduce((errorCount, char, index) => {
        // If the typed character do not match the target character, increment the errorCount.
        // char - typed character.
        // quoteArray[index] - target character.
        if (char !== quoteArray[index]) {
            errorCount++;
        }

        return errorCount;
    }, 0);

    return (
        <div className="flex w-full m-auto justify-center items-center h-screen flex-col gap-4">
            <h1>{`Type Forge - Let's build this in a non-AI way.`}</h1>
            <div className="w-[80%] mx-auto flex flex-col gap-2 justify-center items-start">
                <div className="w-full flex gap-8">
                    <>
                        <label className="flex gap-2" htmlFor="timer">
                            Timer
                            <select
                                className="border border-gray-300 border-2"
                                onChange={handleTimerChange}
                                value={timer}
                                id="timer"
                                disabled={isActive}
                            >
                                {/* <option value="">Select the timer value</option> */}
                                {TIMER_VALUES.map((timeVal, index) => (
                                    <option key={index} value={timeVal}>
                                        {timeVal}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                    <>
                        <label className="flex gap-2" htmlFor="difficulty">
                            Difficulty
                            <select
                                id="difficulty"
                                className="border border-gray-300 border-2"
                                onChange={handleDifficultyChange}
                                value={difficulty}
                                disabled={isActive}
                            >
                                {/* <option value=''>Select the difficulty value</option> */}
                                {DIFFICULTY_LEVELS.map((level, index) => (
                                    <option key={index} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                    <>
                        <p>
                            Time Left:{' '}
                            {timeLeft > 0 ? <span>{timeLeft}</span> : <span>{`--|--`}</span>}
                        </p>
                    </>
                    <>
                        <p>Total Errors: {totalErrors}</p>
                    </>
                </div>
                <div
                    className={`relative w-full p-10 border border-2 text-left bg-white 
                        ${
                            testOverAndNotCompleted || totalErrors
                                ? 'border-red-500 cursor-not-allowed'
                                : testOverAndCompleted
                                  ? 'border-green-500 cursor-not-allowed'
                                  : 'border-gray-300 cursor-text'
                        }`}
                    onClick={() => inputRef.current?.focus()}
                >
                    {/* Render using CharNode */}
                    <div className="z-10 relative pointer-events-none break-words">
                        {quoteArray.map((char, index) => {
                            let status = 'pending';

                            // Tri-state Logic
                            if (index < userTypingArray.length) {
                                status = userTypingArray[index] === char ? 'correct' : 'incorrect';
                            }

                            return <CharNode key={index} char={char} status={status} />;
                        })}
                    </div>
                    {/* Capture using textarea */}
                    <textarea
                        ref={inputRef}
                        className="absolute top-0 left-0 w-full h-full opacity-0 resize-none z-0"
                        id="type-input"
                        onChange={handleTypingChange}
                        value={userTyping}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        disabled={isTestOver}
                        maxLength={quoteString.length}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
