'use client';

import { Header, PromoBar } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ScrollToTop } from '@/components/ui/Scroll';
import { useEffect, useState } from 'react';

type SiteSettingsPublic = {
  promoBar?: {
    enabled?: boolean;
    text?: string;
    href?: string;
    bgColor?: string;
    textColor?: string;
  };
  globalPromotion?: {
    bannerEnabled?: boolean;
    bannerText?: string;
    bannerBgColor?: string;
    bannerTextColor?: string;
  };
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsPublic | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/site-settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setSettings(data?.settings || null);
      })
      .catch(() => {
        if (!mounted) return;
        setSettings(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const promoFromGlobal = settings?.globalPromotion?.bannerEnabled
    ? {
        isVisible: true,
        text: settings?.globalPromotion?.bannerText,
        href: '/prodotti',
        bgColor: settings?.globalPromotion?.bannerBgColor,
        textColor: settings?.globalPromotion?.bannerTextColor,
      }
    : null;

  const promoFromPromoBar = settings?.promoBar?.enabled
    ? {
        isVisible: true,
        text: settings?.promoBar?.text,
        href: settings?.promoBar?.href || '/prodotti',
        bgColor: settings?.promoBar?.bgColor,
        textColor: settings?.promoBar?.textColor,
      }
    : null;

  return (
    <>
      <Header />
      {promoFromGlobal ? (
        <PromoBar {...promoFromGlobal} />
      ) : promoFromPromoBar ? (
        <PromoBar {...promoFromPromoBar} />
      ) : null}
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
      <ToastContainer />
    </>
  );
}
