import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Raleway } from 'next/font/google';
import ClientLoader from '@/components/layout/ClientLoader';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CASA NATURA',
  description: 'Cosmetics store',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={raleway.className}>
        <ClientLoader>{children}</ClientLoader>
      </body>
    </html>
  );
}
