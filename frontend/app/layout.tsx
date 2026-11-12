import type { Metadata } from 'next';
import { Providers } from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Mobiloitte | KAIRA Enterprise AI Assistant',
  description: 'KAIRA – Mobiloitte\'s intelligent enterprise AI assistant for services, technology, careers, and global office information.',
  keywords: ['Mobiloitte', 'KAIRA', 'Enterprise AI', 'AI Assistant', 'Blockchain', 'Mobile Development', 'AI Solutions'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen kaira-bg kaira-text antialiased overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
