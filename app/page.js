'use client';
import { useState, useEffect } from 'react';
import data from '../data/typing_quotes_categorized.json';

const getRandomQuote = () => {
    const quoteKeys = Object.keys(data);

    const randomQuoteKey = quoteKeys[Math.floor(Math.random() * quoteKeys.length)];
    const randomQuote = data[randomQuoteKey][Math.floor(Math.random() * data[randomQuoteKey].length)];

    return randomQuote;
}

export default function Home() {
    const [randomQuote, setRandomeQuote] = useState(null);

    useEffect(() => {
        setRandomeQuote(getRandomQuote());
    }, []);
    return (
        <div className="flex w-full m-auto justify-center items-center h-screen flex-col gap-4">
            <h1>{`Type Forge - Let's build this in a non-AI way.`}</h1>
            <div className='w-[80%] mx-auto flex flex-col gap-2 justify-center items-center'>
                <label htmlFor='type-input' className='w-full text-left'>Type here</label>
                <textarea className='w-full p-10 border border-gray-300 border-2' id='type-input' placeholder={randomQuote?.quote}></textarea>
            </div>
        </div>
    );
}
