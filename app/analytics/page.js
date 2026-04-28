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

/**
 * Analytics page displaying attempt history and WPM trend for the current session.
 * Data is sourced from sessionStorage via AnalyticsContext and clears on tab close.
 */
export default function AnalyticsPage() {
    const { attempts, clearAttempts } = useAnalytics();

    if (attempts.length === 0) {
        return (
            <main className="max-w-4xl mx-auto px-12 w-full pb-16 font-mono pt-16">
                <p className="text-[#aaaaaa] text-sm">
                    no attempts yet — run a test first
                </p>
            </main>
        );
    }

    const bestWpm = Math.max(...attempts.map((a) => a.wpm));
    const avgWpm = Math.round(attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length);
    const avgAccuracy = Math.round(
        attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length,
    );

    const trendData = attempts.map((a, i) => ({
        i: i + 1,
        wpm: a.wpm,
        label: `${new Date(a.timestamp).toLocaleTimeString()} · ${a.difficulty}`,
    }));

    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <main className="max-w-4xl mx-auto px-12 w-full pb-16 font-mono">
            {/* Summary cards */}
            <div className="flex flex-wrap gap-10 pt-12 pb-8">
                {[
                    { label: 'best wpm', value: bestWpm },
                    { label: 'avg wpm', value: avgWpm },
                    { label: 'attempts', value: attempts.length },
                    { label: 'avg accuracy', value: `${avgAccuracy}%` },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <div className="text-[#aaaaaa] text-xs mb-1">{label}</div>
                        <div className="text-4xl font-bold text-[#2d2d2d]">{value}</div>
                    </div>
                ))}
            </div>

            {/* WPM trend chart */}
            <div className="h-48 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={trendData}
                        margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="i"
                            tick={{ fill: '#aaaaaa', fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={false}
                            axisLine={false}
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
                            labelFormatter={(_, payload) =>
                                payload?.[0]?.payload?.label ?? ''
                            }
                            formatter={(value) => [value, 'wpm']}
                        />
                        <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="#2d2d2d"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#2d2d2d' }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Attempts table */}
            <table className="w-full text-sm border-collapse mb-8">
                <thead>
                    <tr className="text-[#aaaaaa] text-left border-b border-[#d0d0d0]">
                        {['#', 'difficulty', 'timer', 'wpm', 'accuracy', 'consistency', 'time'].map(
                            (h) => (
                                <th key={h} className="pb-2 pr-6 font-normal">
                                    {h}
                                </th>
                            ),
                        )}
                    </tr>
                </thead>
                <tbody>
                    {attempts.map((a, i) => (
                        <tr
                            key={a.id}
                            className="border-b border-[#ebebeb] text-[#2d2d2d]"
                            title={formatTime(a.timestamp)}
                        >
                            <td className="py-2 pr-6 text-[#aaaaaa]">{i + 1}</td>
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

            {/* Clear button */}
            <button
                onClick={clearAttempts}
                className="text-sm text-[#aaaaaa] border border-[#d0d0d0] px-4 py-2 hover:border-[#c94040] hover:text-[#c94040] transition-colors"
            >
                clear session
            </button>
        </main>
    );
}
