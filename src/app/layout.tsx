import '@/app/globals.css';
import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CASA NATURA',
  description: 'Cosmetics store', // Description for better SEO <====================
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={raleway.className}>{children}</body>
    </html>
  );
}
