'use client';
import { useState, useEffect, startTransition } from 'react';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useAnalytics } from '@/context/AnalyticsContext';
import ControlsBar from '@/components/ControlsBar';
import MetricsDisplay from '@/components/MetricsDisplay';
import TypingArea from '@/components/TypingArea';
import ResultsScreen from '@/components/ResultsScreen';
import CustomTextModal from '@/components/CustomTextModal';

export default function Home() {
    const [timer, setTimer] = useState(60);
    const [difficulty, setDifficulty] = useState('easy');
    const [contentMode, setContentMode] = useState('quotes');
    const [customText, setCustomText] = useState(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    // Stores the personal best recorded before the last attempt, for comparison display.
    const [prevBestForLastAttempt, setPrevBestForLastAttempt] = useState(null);

    const testState = useTypingTest({ difficulty, timer, contentMode, customText });
    const { addAttempt, getPersonalBest } = useAnalytics();

    // Persist the attempt once when the test ends, capturing the previous best first.
    useEffect(() => {
        if (testState.completedAttempt) {
            const prev = getPersonalBest(
                testState.completedAttempt.difficulty,
                testState.completedAttempt.timer,
            );
            startTransition(() => setPrevBestForLastAttempt(prev));
            addAttempt(testState.completedAttempt);
        }
        // addAttempt and getPersonalBest are stable; only re-run when a new attempt appears.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testState.completedAttempt]);

    /**
     * Handles content mode selection. Clicking 'custom' opens the text entry modal;
     * all other modes switch immediately and clear any stored custom text.
     *
     * @param {string} mode - The selected content mode id
     */
    function handleContentModeChange(mode) {
        if (mode === 'custom') {
            setShowCustomModal(true);
        } else {
            setContentMode(mode);
            setCustomText(null);
        }
    }

    /**
     * Called when the user confirms their custom text in the modal.
     * Sets the sanitized text as the typing target and switches to custom mode.
     *
     * @param {string} text - Sanitized plain text from the modal
     */
    function handleCustomTextConfirm(text) {
        setCustomText(text);
        setContentMode('custom');
        setShowCustomModal(false);
    }

    /**
     * Launches a specific drill by switching content mode and difficulty.
     * Called from ResultsScreen when the user clicks "Start drill".
     *
     * @param {Object} drill
     * @param {string} drill.contentMode - Target content mode
     * @param {string} drill.difficulty - Target difficulty ('easy' | 'medium' | 'hard')
     */
    function handleStartDrill({ contentMode: newMode, difficulty: newDiff }) {
        setContentMode(newMode);
        setDifficulty(newDiff);
        setCustomText(null);
        testState.resetTest();
    }

    if (!testState.quote) return null;

    if (testState.isTestOver && testState.completedAttempt) {
        return (
            <ResultsScreen
                attempt={testState.completedAttempt}
                resetTest={testState.resetTest}
                prevBest={prevBestForLastAttempt}
                onStartDrill={handleStartDrill}
            />
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 w-full pb-16">
            {showCustomModal && (
                <CustomTextModal
                    onConfirm={handleCustomTextConfirm}
                    onClose={() => setShowCustomModal(false)}
                />
            )}
            <div className="pt-16">
                <ControlsBar
                    timer={timer}
                    difficulty={difficulty}
                    contentMode={contentMode}
                    onTimerChange={setTimer}
                    onDifficultyChange={setDifficulty}
                    onContentModeChange={handleContentModeChange}
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
            {contentMode === 'custom' && customText && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setShowCustomModal(true)}
                        className="text-xs text-muted hover:text-foreground transition-colors font-mono"
                    >
                        change text
                    </button>
                </div>
            )}
        </main>
    );
}
