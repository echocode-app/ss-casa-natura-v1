import '@/app/globals.css';
import Script from 'next/script';
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

  const iubendaEnabled = process.env.NEXT_PUBLIC_IUBENDA_ENABLED === 'true';
  const iubendaSiteId = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;
  const iubendaCookiePolicyId = process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID;

  const shouldLoadIubenda = Boolean(iubendaEnabled && iubendaSiteId && iubendaCookiePolicyId);

  return (
    <html lang={locale}>
      <body className={raleway.className}>
        {shouldLoadIubenda && (
          <>
            <Script id="iubenda-cs-init" strategy="beforeInteractive">
              {`window._iub = window._iub || [];
window._iub.csConfiguration = {
  siteId: ${JSON.stringify(iubendaSiteId)},
  cookiePolicyId: ${JSON.stringify(iubendaCookiePolicyId)},
  lang: ${JSON.stringify(locale)},
};`}
            </Script>
            <Script
              src="https://cdn.iubenda.com/cs/iubenda_cs.js"
              strategy="beforeInteractive"
              data-site-id={iubendaSiteId}
              data-cookie-policy-id={iubendaCookiePolicyId}
              data-lang={locale}
            />
          </>
        )}

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
