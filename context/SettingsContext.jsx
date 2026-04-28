'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export const FONT_OPTIONS = [
    { id: 'share-tech-mono', label: 'Share Tech Mono', cssVar: 'var(--font-share-tech-mono)' },
    { id: 'jetbrains-mono', label: 'JetBrains Mono', cssVar: 'var(--font-jetbrains-mono)' },
    { id: 'fira-code', label: 'Fira Code', cssVar: 'var(--font-fira-code)' },
    { id: 'courier-prime', label: 'Courier Prime', cssVar: 'var(--font-courier-prime)' },
];

export const SIZE_OPTIONS = [
    { id: 'small', label: 'small', value: '1rem' },
    { id: 'medium', label: 'medium', value: '1.25rem' },
    { id: 'large', label: 'large', value: '1.5rem' },
];

const STORAGE_KEYS = {
    fontFamily: 'tf-fontFamily',
    fontSize: 'tf-fontSize',
};

const DEFAULTS = {
    fontFamilyId: 'share-tech-mono',
    fontSizeId: 'medium',
};

const SettingsContext = createContext(null);

/**
 * Provides font family and font size settings to the component tree.
 * Persists selections to localStorage and applies them as CSS custom
 * properties on the document root so all components pick them up without
 * needing to consume the context directly.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function SettingsProvider({ children }) {
    const [fontFamilyId, setFontFamilyId] = useState(DEFAULTS.fontFamilyId);
    const [fontSizeId, setFontSizeId] = useState(DEFAULTS.fontSizeId);
    // Tracks whether localStorage has been read — prevents hydration mismatch
    // between the server-rendered defaults and the client-stored values.
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedFamily = localStorage.getItem(STORAGE_KEYS.fontFamily) ?? DEFAULTS.fontFamilyId;
        const savedSize = localStorage.getItem(STORAGE_KEYS.fontSize) ?? DEFAULTS.fontSizeId;
        setFontFamilyId(savedFamily);
        setFontSizeId(savedSize);
        setMounted(true);
    }, []);

    useEffect(() => {
        const option = FONT_OPTIONS.find((f) => f.id === fontFamilyId);
        if (option) {
            document.documentElement.style.setProperty('--active-font', option.cssVar);
        }
    }, [fontFamilyId]);

    useEffect(() => {
        const option = SIZE_OPTIONS.find((s) => s.id === fontSizeId);
        if (option) {
            document.documentElement.style.setProperty('--char-font-size', option.value);
        }
    }, [fontSizeId]);

    /**
     * Updates the active font family and persists the selection.
     * @param {string} id - One of the FONT_OPTIONS ids
     */
    const updateFontFamily = (id) => {
        setFontFamilyId(id);
        localStorage.setItem(STORAGE_KEYS.fontFamily, id);
    };

    /**
     * Updates the active font size and persists the selection.
     * @param {string} id - One of the SIZE_OPTIONS ids
     */
    const updateFontSize = (id) => {
        setFontSizeId(id);
        localStorage.setItem(STORAGE_KEYS.fontSize, id);
    };

    return (
        <SettingsContext.Provider
            value={{ fontFamilyId, fontSizeId, updateFontFamily, updateFontSize, mounted }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

/**
 * Consumes the SettingsContext. Must be used within SettingsProvider.
 * @returns {{ fontFamilyId: string, fontSizeId: string, updateFontFamily: Function, updateFontSize: Function, mounted: boolean }}
 */
export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}
