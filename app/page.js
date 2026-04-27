'use client';
import { useState, useEffect } from 'react';
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
    const [userTyping, setUseTyping] = useState(null);


    useEffect(() => {
        setRandomeQuote(getRandomQuote(difficulty));
    }, [difficulty]);

    const handleTimerChange = (e) => {
        setTimer(e.target.value);
    };

    const handleDifficultyChange = (e) => {
        setDifficulty(e.target.value);
    };

    const handleTypingChange =(e) => {
        setUseTyping(e.target.value);
    }

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
                            >
                                <option value="">Select the timer value</option>
                                {TIMER_VALUES.map((timer, index) => (
                                    <option key={index} value={timer}>
                                        {timer}
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
                            >
                                {/* <option value=''>Select the difficulty value</option> */}
                                {DIFFICULTY_LEVELS.map((difficulty, index) => (
                                    <option key={index} value={difficulty}>
                                        {difficulty}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                </div>
                <label htmlFor="type-input" className="w-full text-left">
                    <textarea
                        className="w-full p-10 border border-gray-300 border-2"
                        id="type-input"
                        placeholder={randomQuote?.quote}
                        onChange={handleTypingChange}
                    ></textarea>
                </label>
            </div>
        </div>
    );
}
