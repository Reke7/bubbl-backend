import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// 1. Import Clerk
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bubbl - Video Messaging',
  description: 'Share personal videos instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. Wrap the entire app
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}