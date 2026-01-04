import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Raleway } from 'next/font/google';
import ClientLoader from '@/components/layout/ClientLoader';

import { NextIntlClientProvider } from 'next-intl';
import itMessages from '@/messages/it.json';
import enMessages from '@/messages/en.json';

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
  // const locale = 'en';
  // const messages = locale === 'en' ? enMessages : itMessages;
  const locale = 'it';
  const messages = locale === 'it' ? itMessages : enMessages;

  return (
    <html lang={locale}>
      <body className={raleway.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ClientLoader>{children}</ClientLoader>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
