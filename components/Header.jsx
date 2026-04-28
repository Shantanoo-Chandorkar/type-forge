/**
 * Application header displaying the app name and navigation placeholder links.
 */
export default function Header() {
    return (
        <header className="flex items-center gap-8 px-12 py-6 w-full">
            <span className="text-2xl font-bold font-mono tracking-tight text-[#2d2d2d]">
                type-forge
            </span>
            <nav className="flex items-center gap-6 ml-4">
                <a
                    href="/"
                    className="text-sm font-mono text-[#aaaaaa] hover:text-[#2d2d2d] transition-colors"
                >
                    home
                </a>
                <a
                    href="#"
                    className="text-sm font-mono text-[#aaaaaa] hover:text-[#2d2d2d] transition-colors"
                >
                    settings
                </a>
            </nav>
        </header>
    );
}