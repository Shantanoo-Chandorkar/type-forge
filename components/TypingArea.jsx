'use client';
import { memo, Fragment, useEffect } from 'react';
import CharNode from '@/components/CharNode';

/**
 * The typing area: quote display, hidden textarea, blinking cursor, reset button,
 * and keyboard hint. Wrapped in memo to prevent re-renders from parent changes
 * unrelated to typing state (controls updates, timer ticks).
 *
 * @param {Object} props
 * @param {Object} props.quote - Current quote object
 * @param {Array<string>} props.quoteArray - Quote split into individual characters
 * @param {Array<string>} props.charStatuses - Per-character status ('pending'|'correct'|'incorrect')
 * @param {string} props.userTyping - Current user input string
 * @param {boolean} props.isTestOver - Whether the test has ended
 * @param {Object} props.inputRef - Ref forwarded to the hidden textarea
 * @param {Function} props.handleTypingChange - onChange handler for the textarea
 * @param {Function} props.resetTest - Callback to reset and reload the test
 */
const TypingArea = memo(function TypingArea({
    quote,
    quoteArray,
    charStatuses,
    userTyping,
    isTestOver,
    inputRef,
    handleTypingChange,
    resetTest,
}) {
    // Tab key resets the test from anywhere on the page.
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                resetTest();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [resetTest]);

    return (
        <div className="pt-6 w-full">
            <div className="relative w-full cursor-text" onClick={() => inputRef.current?.focus()}>
                <div className="z-10 relative pointer-events-none break-words leading-relaxed">
                    {quoteArray.map((char, index) => (
                        <Fragment key={`${char}-${index}`}>
                            {index === userTyping.length && !isTestOver && (
                                <span className="typing-cursor" aria-hidden="true" />
                            )}
                            <CharNode char={char} status={charStatuses[index]} />
                        </Fragment>
                    ))}
                </div>
                <textarea
                    ref={inputRef}
                    className="absolute top-0 left-0 w-full h-full opacity-0 resize-none z-0 cursor-text"
                    id="type-input"
                    onChange={handleTypingChange}
                    value={userTyping}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={isTestOver}
                    maxLength={quote?.quote.length}
                />
            </div>
            <div className="flex flex-col items-center gap-2 pt-8">
                <button
                    onClick={resetTest}
                    className="text-[#aaaaaa] hover:text-[#2d2d2d] transition-colors"
                    aria-label="Reset test"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
                <span className="text-sm font-mono text-[#aaaaaa]">tab to restart</span>
            </div>
        </div>
    );
});

export default TypingArea;
