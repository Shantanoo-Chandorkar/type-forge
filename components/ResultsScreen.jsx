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

/**
 * Displays the results of a completed typing test including a per-second
 * WPM/raw WPM chart and summary statistics.
 *
 * @param {Object} props
 * @param {Object} props.attempt - The completed attempt object from useTypingTest.
 * @param {Function} props.resetTest - Callback to start a new test.
 */
export default function ResultsScreen({ attempt, resetTest }) {
    const chartData = attempt.wpmTimeline.map((entry) => ({
        s: entry.second,
        wpm: entry.wpm,
        raw: entry.rawWpm,
        err: entry.errors,
    }));

    return (
        <div className="max-w-4xl mx-auto px-12 w-full pb-16 font-mono">
            {/* Primary stats */}
            <div className="flex gap-12 pt-12 pb-8">
                <div>
                    <div className="text-[#aaaaaa] text-sm mb-1">wpm</div>
                    <div className="text-6xl font-bold text-[#2d2d2d]">{attempt.wpm}</div>
                </div>
                <div>
                    <div className="text-[#aaaaaa] text-sm mb-1">accuracy</div>
                    <div className="text-6xl font-bold text-[#2d2d2d]">{attempt.accuracy}%</div>
                </div>
            </div>

            {/* WPM chart */}
            <div className="h-48 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="s"
                            tick={{ fill: '#aaaaaa', fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: 's',
                                position: 'insideBottomRight',
                                fill: '#aaaaaa',
                                fontSize: 11,
                            }}
                        />
                        <YAxis
                            tick={{ fill: '#aaaaaa', fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#2d2d2d',
                                border: 'none',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                                fontSize: 12,
                            }}
                            labelStyle={{ color: '#aaaaaa' }}
                            itemStyle={{ color: '#e8e8e8' }}
                            formatter={(value, name) => [value, name === 'raw' ? 'raw wpm' : name]}
                        />
                        <Legend
                            wrapperStyle={{
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: '#aaaaaa',
                            }}
                            formatter={(value) => (value === 'raw' ? 'raw wpm' : value)}
                        />
                        <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="#2d2d2d"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="raw"
                            stroke="#aaaaaa"
                            strokeWidth={2}
                            strokeDasharray="4 2"
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Secondary stats row */}
            <div className="flex flex-wrap gap-8 text-sm text-[#2d2d2d] border-t border-[#d0d0d0] pt-6 mb-8">
                <div>
                    <span className="text-[#aaaaaa]">raw </span>
                    {attempt.rawWpm}
                </div>
                <div>
                    <span className="text-[#aaaaaa]">chars </span>
                    <span className="text-[#4a4a4a]">{attempt.characters.correct}</span>
                    <span className="text-[#aaaaaa]">/</span>
                    <span className="text-[#c94040]">{attempt.characters.incorrect}</span>
                    <span className="text-[#aaaaaa]">/</span>
                    {attempt.characters.total}
                </div>
                <div>
                    <span className="text-[#aaaaaa]">consistency </span>
                    {attempt.consistency}%
                </div>
                <div>
                    <span className="text-[#aaaaaa]">time </span>
                    {attempt.timeElapsed}s
                </div>
                <div>
                    <span className="text-[#aaaaaa]">difficulty </span>
                    {attempt.difficulty}
                </div>
                <div>
                    <span className="text-[#aaaaaa]">
                        {attempt.completed ? 'completed' : 'time up'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-6 items-center">
                <button
                    onClick={resetTest}
                    className="text-sm text-[#2d2d2d] border border-[#2d2d2d] px-4 py-2 hover:bg-[#2d2d2d] hover:text-[#e8e8e8] transition-colors"
                >
                    next test
                </button>
                <Link
                    href="/analytics"
                    className="text-sm text-[#aaaaaa] hover:text-[#2d2d2d] transition-colors"
                >
                    view analytics →
                </Link>
            </div>
        </div>
    );
}
