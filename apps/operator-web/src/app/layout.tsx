import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FarmVest Operator - Submit & Manage Your Farm',
  description: 'Onboard your farm, submit yield reports, and attract agricultural investors through the FarmVest platform.',
};

export default function OperatorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
