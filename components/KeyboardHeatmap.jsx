'use client';
import { useMemo } from 'react';

const KEY_W = 38;
const KEY_H = 38;
const GAP = 5;
const STEP = KEY_W + GAP;

// Three letter rows of QWERTY + common punctuation.
// Each row has an offsetX (in px) for the standard keyboard stagger.
const KEYBOARD_ROWS = [
    {
        offsetX: Math.round(0.5 * STEP),
        keys: [
            ['q', 'Q'],
            ['w', 'W'],
            ['e', 'E'],
            ['r', 'R'],
            ['t', 'T'],
            ['y', 'Y'],
            ['u', 'U'],
            ['i', 'I'],
            ['o', 'O'],
            ['p', 'P'],
            ['[', '['],
            [']', ']'],
        ],
    },
    {
        offsetX: Math.round(0.9 * STEP),
        keys: [
            ['a', 'A'],
            ['s', 'S'],
            ['d', 'D'],
            ['f', 'F'],
            ['g', 'G'],
            ['h', 'H'],
            ['j', 'J'],
            ['k', 'K'],
            ['l', 'L'],
            [';', ';'],
            ["'", "'"],
        ],
    },
    {
        offsetX: Math.round(1.6 * STEP),
        keys: [
            ['z', 'Z'],
            ['x', 'X'],
            ['c', 'C'],
            ['v', 'V'],
            ['b', 'B'],
            ['n', 'N'],
            ['m', 'M'],
            [',', ','],
            ['.', '.'],
            ['/', '/'],
        ],
    },
];

const SVG_WIDTH = 580;
const SVG_HEIGHT = 190;
const SPACE_Y = 3 * (KEY_H + GAP);
const SPACE_X = Math.round(3.5 * STEP);
const SPACE_W = Math.round(6 * STEP - GAP);
const SPACE_H = KEY_H - 8;

/**
 * Linearly interpolates key fill color from green (0 errors) to red (max errors).
 *
 * @param {number} count - Error count for this key
 * @param {number} max - Maximum error count across all keys
 * @param {boolean} hasData - Whether any error data exists
 * @returns {string} HSL color string
 */
function keyColor(count, max, hasData) {
    if (!hasData) return 'hsl(210, 10%, 70%)';
    if (max === 0 || count === 0) return 'hsl(142, 58%, 42%)';
    const ratio = Math.min(1, count / max);
    const hue = Math.round(142 * (1 - ratio));
    return `hsl(${hue}, 65%, 44%)`;
}

/**
 * Renders a full SVG QWERTY keyboard heatmap colored by per-key error frequency.
 * Keys with no errors appear green; the most-errored key appears red.
 *
 * @param {Object} props
 * @param {Record<string, number>} props.keyErrorTotals - Cumulative error count per character
 */
export default function KeyboardHeatmap({ keyErrorTotals }) {
    const maxErrors = useMemo(() => {
        const values = Object.values(keyErrorTotals ?? {});
        return values.length === 0 ? 0 : Math.max(...values);
    }, [keyErrorTotals]);

    const hasData = maxErrors > 0;

    return (
        <div>
            <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width="100%"
                style={{ maxWidth: SVG_WIDTH, display: 'block' }}
                aria-label="Keyboard error heatmap"
            >
                {KEYBOARD_ROWS.map((row, rowIndex) =>
                    row.keys.map(([char, label], colIndex) => {
                        const x = row.offsetX + colIndex * STEP;
                        const y = rowIndex * (KEY_H + GAP);
                        const count = keyErrorTotals?.[char] ?? 0;
                        const fill = keyColor(count, maxErrors, hasData);

                        return (
                            <g key={char}>
                                <rect x={x} y={y} width={KEY_W} height={KEY_H} rx={4} fill={fill} />
                                <text
                                    x={x + KEY_W / 2}
                                    y={y + KEY_H / 2 - (count > 0 ? 5 : 0)}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={12}
                                    fontFamily="monospace"
                                    fill="#fff"
                                    fontWeight="600"
                                >
                                    {label}
                                </text>
                                {count > 0 && (
                                    <text
                                        x={x + KEY_W / 2}
                                        y={y + KEY_H / 2 + 9}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize={9}
                                        fontFamily="monospace"
                                        fill="rgba(255,255,255,0.85)"
                                    >
                                        {count}
                                    </text>
                                )}
                            </g>
                        );
                    }),
                )}

                {/* Space bar */}
                <rect
                    x={SPACE_X}
                    y={SPACE_Y}
                    width={SPACE_W}
                    height={SPACE_H}
                    rx={4}
                    fill={keyColor(keyErrorTotals?.[' '] ?? 0, maxErrors, hasData)}
                />
                <text
                    x={SPACE_X + SPACE_W / 2}
                    y={SPACE_Y + SPACE_H / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontFamily="monospace"
                    fill="#fff"
                    fontWeight="600"
                >
                    space
                </text>
            </svg>

            {/* Color legend */}
            <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-mono text-muted">no errors</span>
                <div
                    style={{
                        width: 80,
                        height: 8,
                        borderRadius: 4,
                        background:
                            'linear-gradient(to right, hsl(142, 58%, 42%), hsl(0, 65%, 44%))',
                    }}
                />
                <span className="text-xs font-mono text-muted">most errors</span>
            </div>

            {!hasData && (
                <p className="text-xs font-mono text-muted mt-2">
                    complete a test to populate heatmap
                </p>
            )}
        </div>
    );
}
