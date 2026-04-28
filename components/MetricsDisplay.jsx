/**
 * Displays the countdown timer in M:SS format, error count, and WPM.
 *
 * @param {Object} props
 * @param {number} props.timeLeft - Seconds remaining in the current test
 * @param {number} props.timerMax - Total timer duration in seconds
 * @param {number} props.totalErrors - Total character errors so far
 * @param {number} props.wordsPerMinute - Current words per minute rate
 */
export default function MetricsDisplay({ timeLeft, timerMax, totalErrors, wordsPerMinute }) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className="flex items-end gap-8 pt-8">
            <span className="text-5xl font-bold font-mono text-[#2d2d2d] leading-none tabular-nums">
                {formattedTime}
            </span>
            <div className="flex items-center gap-6 pb-1">
                <span className="text-sm font-mono text-[#aaaaaa]">
                    errors <strong className="text-[#c94040]">{totalErrors}</strong>
                </span>
                <span className="text-sm font-mono text-[#aaaaaa]">
                    wpm <strong className="text-[#2d2d2d]">{wordsPerMinute}</strong>
                </span>
            </div>
        </div>
    );
}
