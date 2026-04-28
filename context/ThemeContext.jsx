'use client';
import { createContext, useContext, useState, useEffect, startTransition } from 'react';

const ThemeContext = createContext(null);

/**
 * Provides dark/light theme state with localStorage persistence.
 * Applies a data-theme attribute to document root so all CSS vars switch globally.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    // Hydrate from localStorage and apply on mount to avoid flash.
    useEffect(() => {
        try {
            const saved = localStorage.getItem('tf-theme') ?? 'light';
            startTransition(() => setTheme(saved));
            document.documentElement.setAttribute('data-theme', saved);
        } catch {
            // localStorage unavailable (private browsing), default to light.
        }
    }, []);

    /**
     * Toggles between light and dark themes and persists the choice.
     */
    function toggleTheme() {
        setTheme((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            try {
                localStorage.setItem('tf-theme', next);
            } catch {
                // best-effort persistence
            }
            document.documentElement.setAttribute('data-theme', next);
            return next;
        });
    }

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

/**
 * Consumes the ThemeContext. Must be used inside ThemeProvider.
 *
 * @returns {{ theme: string, toggleTheme: Function }}
 */
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
