'use client';
import { useSettings, FONT_OPTIONS, SIZE_OPTIONS } from '@/context/SettingsContext';

export default function SettingsPage() {
    const { fontFamilyId, fontSizeId, updateFontFamily, updateFontSize, mounted } = useSettings();

    // Defer render until localStorage has been read to avoid showing the wrong
    // active state on first paint.
    if (!mounted) return null;

    return (
        <main className="max-w-4xl mx-auto px-12 w-full pb-16">
            <div className="pt-16 flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <span className="text-xs font-mono text-muted uppercase tracking-widest">
                        font family
                    </span>
                    <div className="flex flex-wrap gap-4">
                        {FONT_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => updateFontFamily(option.id)}
                                className={`text-sm font-mono transition-colors ${
                                    fontFamilyId === option.id
                                        ? 'font-bold text-foreground'
                                        : 'text-muted hover:text-foreground'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p
                        className="text-sm font-mono text-muted mt-2"
                        style={{ fontFamily: 'var(--active-font, inherit)' }}
                    >
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <span className="text-xs font-mono text-muted uppercase tracking-widest">
                        font size
                    </span>
                    <div className="flex gap-4">
                        {SIZE_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => updateFontSize(option.id)}
                                className={`text-sm font-mono transition-colors ${
                                    fontSizeId === option.id
                                        ? 'font-bold text-foreground'
                                        : 'text-muted hover:text-foreground'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p
                        className="font-mono text-muted mt-2"
                        style={{ fontSize: 'var(--char-font-size, 1.25rem)' }}
                    >
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </div>
            </div>
        </main>
    );
}
