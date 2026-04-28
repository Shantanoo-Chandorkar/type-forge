'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'tf-attempts';

const AnalyticsContext = createContext(null);

/**
 * Provides attempt history stored in sessionStorage so data survives
 * page refreshes but clears when the tab closes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AnalyticsProvider({ children }) {
    const [attempts, setAttempts] = useState([]);

    // Hydrate from sessionStorage on mount.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) setAttempts(JSON.parse(raw));
        } catch {
            // Corrupt data, start fresh.
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    /**
     * Appends a completed attempt to history and persists to sessionStorage.
     *
     * @param {Object} attempt - The attempt object matching the storage schema.
     */
    function addAttempt(attempt) {
        setAttempts((prev) => {
            const next = [...prev, attempt];
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // sessionStorage full, persist best-effort.
            }
            return next;
        });
    }

    /**
     * Clears all attempt history from state and sessionStorage.
     */
    function clearAttempts() {
        setAttempts([]);
        sessionStorage.removeItem(STORAGE_KEY);
    }

    return (
        <AnalyticsContext.Provider value={{ attempts, addAttempt, clearAttempts }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

/**
 * Consumes the AnalyticsContext. Must be used inside AnalyticsProvider.
 *
 * @returns {{ attempts: Object[], addAttempt: Function, clearAttempts: Function }}
 */
export function useAnalytics() {
    const ctx = useContext(AnalyticsContext);
    if (!ctx) throw new Error('useAnalytics must be used inside AnalyticsProvider');
    return ctx;
}
