import { Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const shareTechMono = Share_Tech_Mono({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-share-tech-mono',
});

export const metadata = {
    title: 'Type Forge',
    description:
        'A minimalist typing speed test. Measure your WPM, track your errors, and improve your accuracy.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${shareTechMono.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
