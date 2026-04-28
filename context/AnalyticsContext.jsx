'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'tf-attempts';
const KEY_ERRORS_KEY = 'tf-key-errors';
const PERSONAL_BEST_KEY = 'tf-personal-best';
const FIFO_CAP = 50;

const AnalyticsContext = createContext(null);

/**
 * Merges a new per-key error map into the cumulative running totals.
 *
 * @param {Record<string, number>} existing - Running totals from localStorage
 * @param {Record<string, number>} incoming - Error map from a single completed attempt
 * @returns {Record<string, number>} Merged totals
 */
function mergeKeyErrors(existing, incoming) {
    const merged = { ...existing };
    for (const [key, count] of Object.entries(incoming)) {
        merged[key] = (merged[key] ?? 0) + count;
    }
    return merged;
}

/**
 * Safely reads a JSON value from localStorage.
 * Returns null on any parse or access error so callers get a clean default.
 *
 * @param {string} key - localStorage key
 * @returns {any | null}
 */
function readStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Safely writes a JSON value to localStorage.
 * Silently swallows errors (e.g. storage full, private browsing).
 *
 * @param {string} key - localStorage key
 * @param {any} value - Value to serialise and store
 */
function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // best-effort
    }
}

/**
 * Provides attempt history, cumulative key-error totals, and personal bests
 * stored in localStorage so data persists across sessions.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AnalyticsProvider({ children }) {
    const [attempts, setAttempts] = useState([]);
    const [keyErrorTotals, setKeyErrorTotals] = useState({});
    const [personalBests, setPersonalBests] = useState({});

    // Hydrate all three stores from localStorage on mount.
    useEffect(() => {
        setAttempts(readStorage(STORAGE_KEY) ?? []);
        setKeyErrorTotals(readStorage(KEY_ERRORS_KEY) ?? {});
        setPersonalBests(readStorage(PERSONAL_BEST_KEY) ?? {});
    }, []);

    /**
     * Appends a completed attempt to history, updates cumulative key-error totals,
     * and updates the personal best for the attempt's difficulty+timer combination.
     *
     * @param {Object} attempt - Completed attempt object matching the storage schema.
     */
    function addAttempt(attempt) {
        // Attempt history — FIFO cap
        setAttempts((prev) => {
            const next = [...prev, attempt].slice(-FIFO_CAP);
            writeStorage(STORAGE_KEY, next);
            return next;
        });

        // Cumulative key errors
        if (attempt.keyErrors && Object.keys(attempt.keyErrors).length > 0) {
            setKeyErrorTotals((prev) => {
                const next = mergeKeyErrors(prev, attempt.keyErrors);
                writeStorage(KEY_ERRORS_KEY, next);
                return next;
            });
        }

        // Personal best — keyed by "difficulty-timer"
        const bestKey = `${attempt.difficulty}-${attempt.timer}`;
        setPersonalBests((prev) => {
            const current = prev[bestKey];
            if (!current || attempt.wpm > current.wpm) {
                const next = {
                    ...prev,
                    [bestKey]: {
                        wpm: attempt.wpm,
                        accuracy: attempt.accuracy,
                        date: attempt.timestamp,
                    },
                };
                writeStorage(PERSONAL_BEST_KEY, next);
                return next;
            }
            return prev;
        });
    }

    /**
     * Clears all attempt history from state and localStorage.
     * Key-error totals and personal bests are preserved.
     */
    function clearAttempts() {
        setAttempts([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // best-effort
        }
    }

    /**
     * Returns the stored personal best for a given difficulty and timer combo,
     * or null if none has been recorded yet.
     *
     * @param {string} difficulty - e.g. 'easy' | 'medium' | 'hard'
     * @param {number} timer - Timer duration in seconds
     * @returns {{ wpm: number, accuracy: number, date: number } | null}
     */
    function getPersonalBest(difficulty, timer) {
        return personalBests[`${difficulty}-${timer}`] ?? null;
    }

    return (
        <AnalyticsContext.Provider
            value={{
                attempts,
                addAttempt,
                clearAttempts,
                keyErrorTotals,
                personalBests,
                getPersonalBest,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
}

/**
 * Consumes the AnalyticsContext. Must be used inside AnalyticsProvider.
 *
 * @returns {{
 *   attempts: Object[],
 *   addAttempt: Function,
 *   clearAttempts: Function,
 *   keyErrorTotals: Record<string, number>,
 *   personalBests: Record<string, Object>,
 *   getPersonalBest: Function,
 * }}
 */
export function useAnalytics() {
    const ctx = useContext(AnalyticsContext);
    if (!ctx) throw new Error('useAnalytics must be used inside AnalyticsProvider');
    return ctx;
}
