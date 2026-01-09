import '@/app/globals.css';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { Raleway } from 'next/font/google';
import ClientLoader from '@/components/layout/ClientLoader';
import { AuthProvider } from '@/components/layout/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className={raleway.className}>
        {process.env.NEXT_PUBLIC_IUBENDA_ENABLED === 'true' && (
          <Script
            src="https://cdn.iubenda.com/cs/iubenda_cs.js"
            strategy="beforeInteractive"
            data-site-id="__IUBENDA_SITE_ID__"
            data-cookie-policy-id="__IUBENDA_POLICY_ID__"
          />
        )}

        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <CartProvider>
              <ClientLoader>{children}</ClientLoader>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
