'use client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useSettings } from '@/context/SettingsContext';
import { getFontSizeClasses } from '@/utils/fontSizeClasses';
import KeyboardHeatmap from '@/components/KeyboardHeatmap';

/**
 * Renders the attempt history as a scrollable table.
 *
 * @param {Object} props
 * @param {Array}  props.attempts - Attempt records to display
 * @param {Object} props.sizes    - Font size class map from getFontSizeClasses
 */
function AttemptHistoryTable({ attempts, sizes }) {
    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <p className={`text-muted ${sizes.label} mb-3`}>
                showing last {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
            </p>
            <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse min-w-[560px]">
                    <thead>
                        <tr
                            className={`text-muted ${sizes.label} text-left border-b border-border`}
                        >
                            {[
                                '#',
                                'mode',
                                'difficulty',
                                'timer',
                                'wpm',
                                'accuracy',
                                'consistency',
                                'time',
                            ].map((h) => (
                                <th key={h} className="pb-2 pr-6 font-normal">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.map((a, i) => (
                            <tr
                                key={a.id}
                                className={`border-b border-border-subtle text-foreground ${sizes.data}`}
                                title={formatTime(a.timestamp)}
                            >
                                <td className="py-2 pr-6 text-muted">{i + 1}</td>
                                <td className="py-2 pr-6">{a.contentMode ?? 'quotes'}</td>
                                <td className="py-2 pr-6">{a.difficulty}</td>
                                <td className="py-2 pr-6">{a.timer}s</td>
                                <td className="py-2 pr-6 font-bold">{a.wpm}</td>
                                <td className="py-2 pr-6">{a.accuracy}%</td>
                                <td className="py-2 pr-6">{a.consistency}%</td>
                                <td className="py-2 pr-6">{a.timeElapsed}s</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

/**
 * Renders the keyboard heatmap section with its heading.
 *
 * @param {Object} props
 * @param {Object} props.keyErrorTotals - Cumulative per-key error counts
 * @param {Object} props.sizes          - Font size class map from getFontSizeClasses
 */
function KeyErrorSection({ keyErrorTotals, sizes }) {
    return (
        <div className="mb-8">
            <p className={`text-muted ${sizes.label} mb-3`}>key error heatmap</p>
            <KeyboardHeatmap keyErrorTotals={keyErrorTotals} />
        </div>
    );
}

/**
 * Analytics page displaying attempt history, WPM trend, personal bests,
 * and a keyboard heatmap showing cumulative per-key error frequency.
 * Data persists across sessions via localStorage through AnalyticsContext.
 */
export default function AnalyticsPage() {
    const { attempts, clearAttempts, keyErrorTotals, personalBests } = useAnalytics();
    const { fontSizeId } = useSettings();
    const sizes = getFontSizeClasses(fontSizeId);

    const hasAttempts = attempts.length > 0;
    const hasPersonalBests = Object.keys(personalBests).length > 0;

    if (!hasAttempts && !hasPersonalBests && Object.keys(keyErrorTotals).length === 0) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 w-full pb-16 font-mono pt-16">
                <p className={`text-muted ${sizes.data}`}>no attempts yet, run a test first</p>
            </main>
        );
    }

    const bestWpm = hasAttempts ? Math.max(...attempts.map((a) => a.wpm)) : 0;
    const avgWpm = hasAttempts
        ? Math.round(attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length)
        : 0;
    const avgAccuracy = hasAttempts
        ? Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length)
        : 0;

    const trendData = attempts.map((a, i) => ({
        i: i + 1,
        wpm: a.wpm,
        label: `${new Date(a.timestamp).toLocaleTimeString()} · ${a.difficulty}`,
    }));

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 w-full pb-16 font-mono">
            {/* Summary cards */}
            {hasAttempts && (
                <div className="flex flex-wrap gap-10 pt-12 pb-8">
                    {[
                        { label: 'best wpm', value: bestWpm },
                        { label: 'avg wpm', value: avgWpm },
                        { label: 'attempts', value: attempts.length },
                        { label: 'avg accuracy', value: `${avgAccuracy}%` },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div className={`text-muted ${sizes.label} mb-1`}>{label}</div>
                            <div className="text-4xl font-bold text-foreground">{value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Personal bests */}
            {hasPersonalBests && (
                <div className="mb-8">
                    <p className={`text-muted ${sizes.label} mb-3`}>personal bests</p>
                    <div className="flex flex-wrap gap-4">
                        {Object.entries(personalBests).map(([key, best]) => (
                            <div key={key} className="border border-border p-4 min-w-28">
                                <div className={`text-muted ${sizes.label} mb-1`}>{key}</div>
                                <div className="text-2xl font-bold text-foreground">
                                    {best.wpm}
                                    <span className={`text-muted ${sizes.label} ml-1 font-normal`}>
                                        wpm
                                    </span>
                                </div>
                                <div className={`text-muted ${sizes.label}`}>
                                    {best.accuracy}% acc
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* WPM trend chart */}
            {hasAttempts && (
                <div className="h-48 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={trendData}
                            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid
                                stroke="var(--border)"
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="i"
                                tick={{
                                    fill: 'var(--muted)',
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{
                                    fill: 'var(--muted)',
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--foreground)',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                }}
                                labelStyle={{ color: 'var(--muted)' }}
                                itemStyle={{ color: 'var(--background)' }}
                                labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                                formatter={(value) => [value, 'wpm']}
                            />
                            <Line
                                type="monotone"
                                dataKey="wpm"
                                stroke="var(--foreground)"
                                strokeWidth={2}
                                dot={{ r: 3, fill: 'var(--foreground)' }}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Keyboard heatmap */}
            <KeyErrorSection keyErrorTotals={keyErrorTotals} sizes={sizes} />

            {/* Attempts table */}
            {hasAttempts && <AttemptHistoryTable attempts={attempts} sizes={sizes} />}

            {/* Clear button */}
            {hasAttempts && (
                <button
                    onClick={clearAttempts}
                    className={`${sizes.data} text-muted border border-border px-4 py-2 hover:border-incorrect hover:text-incorrect transition-colors`}
                >
                    clear history
                </button>
            )}
        </main>
    );
}
