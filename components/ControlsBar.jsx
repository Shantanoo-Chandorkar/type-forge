'use client';
import { useSettings } from '@/context/SettingsContext';
import { getFontSizeClasses } from '@/utils/fontSizeClasses';

const TIMER_VALUES = [15, 30, 60, 90, 120];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'ultimate'];

const CONTENT_MODES = [
    { id: 'quotes', label: 'quotes' },
    { id: 'common-words', label: 'words' },
    { id: 'punctuation', label: 'punctuation' },
    { id: 'code', label: 'code' },
    { id: 'academic', label: 'academic' },
    { id: 'custom', label: 'custom' },
];

// When content mode is 'code', difficulty buttons are replaced with language selectors.
// The difficulty value still uses easy/medium/hard/ultimate; labels show the language name.
const CODE_LANGUAGES = [
    { difficulty: 'easy', label: 'js' },
    { difficulty: 'medium', label: 'python' },
    { difficulty: 'hard', label: 'sql' },
    { difficulty: 'ultimate', label: 'c++' },
];

/**
 * Inline selector bar for content mode, timer, and difficulty settings.
 * Rendered as plain text buttons, disabled while a test is in progress.
 * Text size scales with the active font size setting.
 * When content mode is 'code', the difficulty row shows JS/Python/SQL instead.
 *
 * @param {Object} props
 * @param {number} props.timer - Currently selected timer value in seconds
 * @param {string} props.difficulty - Currently selected difficulty level
 * @param {string} props.contentMode - Currently selected content mode
 * @param {Function} props.onTimerChange - Callback receiving the new timer value (number)
 * @param {Function} props.onDifficultyChange - Callback receiving the new difficulty string
 * @param {Function} props.onContentModeChange - Callback receiving the new content mode string
 * @param {boolean} props.isActive - Whether a test is currently running
 */
export default function ControlsBar({
    timer,
    difficulty,
    contentMode,
    onTimerChange,
    onDifficultyChange,
    onContentModeChange,
    isActive,
}) {
    const { fontSizeId } = useSettings();
    const sizes = getFontSizeClasses(fontSizeId);

    const difficultyRow =
        contentMode === 'code' ? (
            <div className="flex items-center gap-3">
                <span className={`${sizes.label} font-mono text-muted uppercase tracking-widest`}>
                    lang
                </span>
                {CODE_LANGUAGES.map(({ difficulty: d, label }) => (
                    <button
                        key={d}
                        onClick={() => onDifficultyChange(d)}
                        className={`${sizes.data} font-mono transition-colors ${
                            difficulty === d
                                ? 'font-bold text-foreground'
                                : 'text-muted hover:text-foreground'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        ) : (
            <div className="flex items-center gap-3">
                <span className={`${sizes.label} font-mono text-muted uppercase tracking-widest`}>
                    difficulty
                </span>
                {DIFFICULTY_LEVELS.map((level) => (
                    <button
                        key={level}
                        onClick={() => onDifficultyChange(level)}
                        className={`${sizes.data} font-mono transition-colors ${
                            difficulty === level
                                ? 'font-bold text-foreground'
                                : 'text-muted hover:text-foreground'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        );

    return (
        <div className={`flex flex-col gap-3 ${isActive ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Content mode row */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className={`${sizes.label} font-mono text-muted uppercase tracking-widest`}>
                    mode
                </span>
                {CONTENT_MODES.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => onContentModeChange(id)}
                        className={`${sizes.data} font-mono transition-colors ${
                            contentMode === id
                                ? 'font-bold text-foreground'
                                : 'text-muted hover:text-foreground'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Timer and difficulty row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                    <span
                        className={`${sizes.label} font-mono text-muted uppercase tracking-widest`}
                    >
                        time
                    </span>
                    {TIMER_VALUES.map((value) => (
                        <button
                            key={value}
                            onClick={() => onTimerChange(value)}
                            className={`${sizes.data} font-mono transition-colors ${
                                timer === value
                                    ? 'font-bold text-foreground'
                                    : 'text-muted hover:text-foreground'
                            }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>
                {difficultyRow}
            </div>
        </div>
    );
}
