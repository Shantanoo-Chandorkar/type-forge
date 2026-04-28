'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const NAV_LINKS = [
    { href: '/', label: 'home' },
    { href: '/analytics', label: 'analytics' },
    { href: '/settings', label: 'settings' },
];

/**
 * Application header with the app name, client-side navigation links,
 * and a dark/light theme toggle button.
 *
 * On mobile (<sm): logo + theme toggle + hamburger button in one row.
 * Hamburger opens a dropdown nav below the bar.
 * On desktop (sm+): logo + inline nav + theme toggle, hamburger hidden.
 *
 * Uses next/link for SPA-style navigation without full page reloads.
 * Active route is visually distinguished via usePathname.
 */
export default function Header() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    /** Shared nav link class builder */
    function navLinkClass(href) {
        return `text-sm font-mono transition-colors ${
            pathname === href ? 'font-bold text-foreground' : 'text-muted hover:text-foreground'
        }`;
    }

    return (
        <header className="w-full">
            {/* Top bar */}
            <div className="flex items-center px-4 sm:px-12 py-6 w-full">
                <Link
                    href="/"
                    className="text-2xl font-bold font-mono tracking-tight text-foreground hover:opacity-80 transition-opacity shrink-0"
                >
                    type-forge
                </Link>

                {/* Desktop inline nav */}
                <nav className="hidden sm:flex items-center gap-6 ml-4">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link key={href} href={href} className={navLinkClass(href)}>
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Theme toggle — always visible */}
                <button
                    onClick={toggleTheme}
                    className="ml-auto text-muted hover:text-foreground transition-colors"
                    aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                    {theme === 'light' ? (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                    ) : (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>

                {/* Hamburger — mobile only */}
                <button
                    onClick={() => setMenuOpen((open) => !open)}
                    className="sm:hidden ml-3 text-muted hover:text-foreground transition-colors"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? (
                        /* X icon */
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    ) : (
                        /* Hamburger icon */
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile dropdown nav */}
            {menuOpen && (
                <nav className="sm:hidden flex flex-col gap-4 px-4 pb-5 border-t border-border-subtle">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${navLinkClass(href)} pt-4`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
