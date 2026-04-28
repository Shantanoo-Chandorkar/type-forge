'use client';
import { useState } from 'react';
import { useTypingTest } from '@/hooks/useTypingTest';
import ControlsBar from '@/components/ControlsBar';
import MetricsDisplay from '@/components/MetricsDisplay';
import TypingArea from '@/components/TypingArea';

export default function Home() {
    const [timer, setTimer] = useState(60);
    const [difficulty, setDifficulty] = useState('easy');
    const testState = useTypingTest({ difficulty, timer });

    if (!testState.quote) return null;

    return (
        <main className="max-w-4xl mx-auto px-12 w-full pb-16">
            <div className="pt-16">
                <ControlsBar
                    timer={timer}
                    difficulty={difficulty}
                    onTimerChange={setTimer}
                    onDifficultyChange={setDifficulty}
                    isActive={testState.isActive}
                />
            </div>
            <MetricsDisplay
                timeLeft={testState.timeLeft}
                timerMax={timer}
                totalErrors={testState.totalErrors}
                wordsPerMinute={testState.wordsPerMinute}
            />
            <TypingArea
                quote={testState.quote}
                quoteArray={testState.quoteArray}
                charStatuses={testState.charStatuses}
                userTyping={testState.userTyping}
                isTestOver={testState.isTestOver}
                inputRef={testState.inputRef}
                handleTypingChange={testState.handleTypingChange}
                resetTest={testState.resetTest}
            />
        </main>
    );
}
