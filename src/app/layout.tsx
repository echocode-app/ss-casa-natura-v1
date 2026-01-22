import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Raleway } from 'next/font/google';
import ClientLoader from '@/components/layout/ClientLoader';
import { AuthProvider } from '@/components/layout/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import CsrfBootstrap from '@/components/security/CsrfBootstrap';

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={raleway.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <CartProvider>
              <ClientLoader>{children}</ClientLoader>
              <CsrfBootstrap />
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
