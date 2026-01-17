import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-inter',
});

export const metadata = {
    title: 'Quit-Together',
    description: 'A wellness platform to help overcome stress and addiction together',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="dark">
            <body className={`${inter.variable}`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
