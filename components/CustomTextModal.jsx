'use client';
import { useState } from 'react';

/**
 * Modal overlay for entering custom typing text.
 * Validates length constraints (20-2000 chars) and strips HTML tags before
 * confirming, preventing XSS if the text is ever rendered as markup.
 *
 * @param {Object} props
 * @param {Function} props.onConfirm - Called with sanitized plain-text string on confirm
 * @param {Function} props.onClose - Called when the modal is dismissed without confirming
 */
export default function CustomTextModal({ onConfirm, onClose }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    /**
     * Converts raw input to plain text using a temporary DOM node.
     * Setting textContent (not innerHTML) neutralizes any injected markup.
     *
     * @param {string} raw - Raw string from textarea
     * @returns {string} Plain text with HTML removed
     */
    function sanitize(raw) {
        const div = document.createElement('div');
        div.textContent = raw;
        return div.textContent;
    }

    function handleConfirm() {
        const sanitized = sanitize(input.trim());
        if (sanitized.length < 20) {
            setError('Text must be at least 20 characters.');
            return;
        }
        if (sanitized.length > 2000) {
            setError('Text must be under 2000 characters.');
            return;
        }
        onConfirm(sanitized);
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') onClose();
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            onKeyDown={handleKeyDown}
        >
            <div
                className="w-full max-w-lg mx-4 p-6 font-mono"
                style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                }}
            >
                <h2 className="text-sm uppercase tracking-widest text-muted mb-4">custom text</h2>
                <textarea
                    className="w-full h-40 resize-none text-sm p-3 mb-1 outline-none font-mono"
                    style={{
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                    }}
                    placeholder="Paste your text here..."
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setError('');
                    }}
                    autoFocus
                />
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-muted">{input.length} / 2000 chars</span>
                    {error && <span className="text-xs text-incorrect">{error}</span>}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleConfirm}
                        className="text-sm px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                        start typing
                    </button>
                    <button
                        onClick={onClose}
                        className="text-sm px-4 py-2 text-muted hover:text-foreground transition-colors"
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
