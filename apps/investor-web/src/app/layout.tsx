import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FarmVest — Agricultural Investment Platform',
  description: 'Discover and invest in Egypt\'s best agricultural opportunities. AI-powered farm matching, deal structuring, and portfolio insights.',
  keywords: 'agricultural investment, Egypt farming, farm investment, fractional investing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
