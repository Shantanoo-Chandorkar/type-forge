import { Share_Tech_Mono, JetBrains_Mono, Fira_Code, Courier_Prime } from 'next/font/google';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import './globals.css';

const shareTechMono = Share_Tech_Mono({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-share-tech-mono',
});

const jetbrainsMono = JetBrains_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
});

const firaCode = Fira_Code({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-fira-code',
});

const courierPrime = Courier_Prime({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-courier-prime',
});

export const metadata = {
    title: 'Type Forge',
    description:
        'A minimalist typing speed test. Measure your WPM, track your errors, and improve your accuracy.',
};

// Runs before first paint so a saved light theme never flashes dark
const themeInitScript = `try{if(localStorage.getItem('tf-theme')==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}`;

export default function RootLayout({ children }) {
    const fontVars = [
        shareTechMono.variable,
        jetbrainsMono.variable,
        firaCode.variable,
        courierPrime.variable,
    ].join(' ');

    return (
        <html
            lang="en"
            data-theme="dark"
            suppressHydrationWarning
            className={`${fontVars} h-full antialiased`}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className="min-h-full flex flex-col">
                <ThemeProvider>
                    <AnalyticsProvider>
                        <SettingsProvider>
                            <Header />
                            {children}
                        </SettingsProvider>
                    </AnalyticsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
