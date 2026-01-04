import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Raleway } from 'next/font/google';
import ClientLoader from '@/components/layout/ClientLoader';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={raleway.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLoader>{children}</ClientLoader>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
