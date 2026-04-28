'use client';
import Link from 'next/link';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { getDrillRecommendation } from '@/utils/drillRecommendation';

/**
 * Displays the results of a completed typing test including a per-second
 * WPM/raw WPM chart, summary statistics, personal best comparison,
 * per-key weakness analysis, and a drill recommendation.
 *
 * @param {Object} props
 * @param {Object} props.attempt - The completed attempt object from useTypingTest.
 * @param {Function} props.resetTest - Callback to start a new test.
 * @param {{ wpm: number, accuracy: number, date: number } | null} props.prevBest
 *   Personal best recorded before this attempt, for comparison display.
 * @param {Function} props.onStartDrill - Callback receiving { contentMode, difficulty }
 *   when the user clicks "Start drill".
 */
export default function ResultsScreen({ attempt, resetTest, prevBest, onStartDrill }) {
    const chartData = attempt.wpmTimeline.map((entry) => ({
        s: entry.second,
        wpm: entry.wpm,
        raw: entry.rawWpm,
        err: entry.errors,
    }));

    const isNewBest = prevBest === null || attempt.wpm > prevBest.wpm;
    const deltaToBest = prevBest ? prevBest.wpm - attempt.wpm : null;

    // Top 3 most-errored keys this test, sorted descending.
    const topErrorKeys = Object.entries(attempt.keyErrors ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const drillRec = getDrillRecommendation(attempt.keyErrors, attempt.wpm);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 w-full pb-16 font-mono">
            {/* Primary stats */}
            <div className="flex gap-12 pt-12 pb-8 items-end">
                <div>
                    <div className="text-muted text-sm mb-1">wpm</div>
                    <div className="text-6xl font-bold text-foreground">{attempt.wpm}</div>
                    {prevBest !== null && isNewBest && (
                        <div className="text-xs mt-1" style={{ color: 'hsl(142, 58%, 42%)' }}>
                            new personal best!
                        </div>
                    )}
                    {prevBest !== null && !isNewBest && deltaToBest > 0 && (
                        <div className="text-xs text-muted mt-1">{deltaToBest} wpm from best</div>
                    )}
                </div>
                <div>
                    <div className="text-muted text-sm mb-1">accuracy</div>
                    <div className="text-6xl font-bold text-foreground">{attempt.accuracy}%</div>
                </div>
            </div>

            {/* WPM chart */}
            <div className="h-48 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid
                            stroke="var(--border)"
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="s"
                            tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: 's',
                                position: 'insideBottomRight',
                                fill: 'var(--muted)',
                                fontSize: 11,
                            }}
                        />
                        <YAxis
                            tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}
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
                            formatter={(value, name) => [value, name === 'raw' ? 'raw wpm' : name]}
                        />
                        <Legend
                            wrapperStyle={{
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: 'var(--muted)',
                            }}
                            formatter={(value) => (value === 'raw' ? 'raw wpm' : value)}
                        />
                        <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="var(--foreground)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="raw"
                            stroke="var(--muted)"
                            strokeWidth={2}
                            strokeDasharray="4 2"
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Secondary stats row */}
            <div className="flex flex-wrap gap-8 text-sm text-foreground border-t border-border pt-6 mb-6">
                <div>
                    <span className="text-muted">raw </span>
                    {attempt.rawWpm}
                </div>
                <div>
                    <span className="text-muted">chars </span>
                    <span className="text-correct">{attempt.characters.correct}</span>
                    <span className="text-muted">/</span>
                    <span className="text-incorrect">{attempt.characters.incorrect}</span>
                    <span className="text-muted">/</span>
                    {attempt.characters.total}
                </div>
                <div>
                    <span className="text-muted">consistency </span>
                    {attempt.consistency}%
                </div>
                <div>
                    <span className="text-muted">time </span>
                    {attempt.timeElapsed}s
                </div>
                <div>
                    <span className="text-muted">mode </span>
                    {attempt.contentMode ?? attempt.difficulty}
                </div>
                <div>
                    <span className="text-muted">
                        {attempt.completed ? 'completed' : 'time up'}
                    </span>
                </div>
            </div>

            {/* Weakness analysis + drill recommendation */}
            {topErrorKeys.length > 0 && (
                <div className="border border-border p-5 mb-6">
                    <p className="text-xs text-muted uppercase tracking-widest mb-3">
                        weakness analysis
                    </p>
                    <div className="flex gap-6 mb-4">
                        {topErrorKeys.map(([key, count]) => (
                            <div key={key} className="text-center">
                                <div className="text-2xl font-bold text-incorrect">
                                    {key === ' ' ? '␣' : key}
                                </div>
                                <div className="text-xs text-muted">{count} errors</div>
                            </div>
                        ))}
                    </div>
                    {drillRec && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted">
                                recommended:{' '}
                                <span className="text-foreground">{drillRec.label}</span>
                            </span>
                            <button
                                onClick={() =>
                                    onStartDrill({
                                        contentMode: drillRec.contentMode,
                                        difficulty: drillRec.difficulty,
                                    })
                                }
                                className="text-xs px-3 py-1 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                            >
                                start drill
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-6 items-center">
                <button
                    onClick={resetTest}
                    className="text-sm text-foreground border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                >
                    next test
                </button>
                <Link
                    href="/analytics"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    view analytics →
                </Link>
            </div>
        </div>
    );
}
