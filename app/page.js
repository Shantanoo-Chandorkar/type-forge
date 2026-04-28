'use client';
import { useState, useEffect } from 'react';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useAnalytics } from '@/context/AnalyticsContext';
import ControlsBar from '@/components/ControlsBar';
import MetricsDisplay from '@/components/MetricsDisplay';
import TypingArea from '@/components/TypingArea';
import ResultsScreen from '@/components/ResultsScreen';

export default function Home() {
    const [timer, setTimer] = useState(60);
    const [difficulty, setDifficulty] = useState('easy');
    const testState = useTypingTest({ difficulty, timer });
    const { addAttempt } = useAnalytics();

    // Persist the attempt once, when the test ends.
    useEffect(() => {
        if (testState.completedAttempt) {
            addAttempt(testState.completedAttempt);
        }
        // addAttempt is stable; only re-run when a new attempt object appears.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testState.completedAttempt]);

    if (!testState.quote) return null;

    if (testState.isTestOver && testState.completedAttempt) {
        return <ResultsScreen attempt={testState.completedAttempt} resetTest={testState.resetTest} />;
    }

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
