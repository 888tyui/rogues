import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ROGUES — Enter the Shadows',
    description: 'A dark fantasy action RPG. Master the blade, embrace the night.',
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
