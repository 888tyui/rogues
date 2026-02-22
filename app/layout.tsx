import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ROGUES — Enter the Shadows',
    description: 'A dark fantasy PvP dungeon crawler experience — Web3.',
    icons: {
        icon: '/favicon.png',
        apple: '/apple-touch-icon.png',
    },
    openGraph: {
        title: 'ROGUES — Enter the Shadows',
        description: 'A dark fantasy PvP dungeon crawler experience — Web3.',
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ROGUES — Enter the Shadows',
        description: 'A dark fantasy PvP dungeon crawler experience — Web3.',
        images: ['/og-image.png'],
    },
    themeColor: '#140a1e',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
