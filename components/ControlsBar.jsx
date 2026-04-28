const TIMER_VALUES = [15, 30, 60, 120];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

/**
 * Inline selector bar for timer and difficulty settings.
 * Rendered as plain text buttons — disabled while a test is in progress.
 *
 * @param {Object} props
 * @param {number} props.timer - Currently selected timer value in seconds
 * @param {string} props.difficulty - Currently selected difficulty level
 * @param {Function} props.onTimerChange - Callback receiving the new timer value (number)
 * @param {Function} props.onDifficultyChange - Callback receiving the new difficulty string
 * @param {boolean} props.isActive - Whether a test is currently running
 */
export default function ControlsBar({
    timer,
    difficulty,
    onTimerChange,
    onDifficultyChange,
    isActive,
}) {
    return (
        <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 ${isActive ? 'opacity-40 pointer-events-none' : ''}`}
        >
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#aaaaaa] uppercase tracking-widest">
                    time
                </span>
                {TIMER_VALUES.map((value) => (
                    <button
                        key={value}
                        onClick={() => onTimerChange(value)}
                        className={`text-sm font-mono transition-colors ${
                            timer === value
                                ? 'font-bold text-[#2d2d2d]'
                                : 'text-[#aaaaaa] hover:text-[#2d2d2d]'
                        }`}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#aaaaaa] uppercase tracking-widest">
                    difficulty
                </span>
                {DIFFICULTY_LEVELS.map((level) => (
                    <button
                        key={level}
                        onClick={() => onDifficultyChange(level)}
                        className={`text-sm font-mono transition-colors ${
                            difficulty === level
                                ? 'font-bold text-[#2d2d2d]'
                                : 'text-[#aaaaaa] hover:text-[#2d2d2d]'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>
    );
}
