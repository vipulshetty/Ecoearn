import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoEarn - Earn Rewards for Recycling',
  description: 'Join our community of eco-conscious individuals and earn rewards for your recycling efforts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50 pt-20">
            {children}
          </main>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
