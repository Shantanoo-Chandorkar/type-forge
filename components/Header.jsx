'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'home' },
    { href: '/settings', label: 'settings' },
];

/**
 * Application header with the app name and client-side navigation links.
 * Uses next/link for SPA-style navigation without full page reloads.
 * Active route is visually distinguished via usePathname.
 */
export default function Header() {
    const pathname = usePathname();

    return (
        <header className="flex items-center gap-8 px-12 py-6 w-full">
            <Link
                href="/"
                className="text-2xl font-bold font-mono tracking-tight text-[#2d2d2d] hover:opacity-80 transition-opacity"
            >
                type-forge
            </Link>
            <nav className="flex items-center gap-6 ml-4">
                {NAV_LINKS.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`text-sm font-mono transition-colors ${
                            pathname === href
                                ? 'font-bold text-[#2d2d2d]'
                                : 'text-[#aaaaaa] hover:text-[#2d2d2d]'
                        }`}
                    >
                        {label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
