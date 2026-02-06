import { CategoriesSection } from '@/components/sections/Categories';
import { HeroSection } from '@/components/sections/Hero';
import { LeLineSectionon } from '@/components/sections/LeLinee';
import { TopProductsSection } from '@/components/sections/TopProducts';
import { fetchProducts } from '@/lib/utils/fetchProducts';
import { getSeoMeta, generateMetadata as generateSeoMetadata, JsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import HomeLazySections from '@/components/sections/HomeLazySections';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMeta({
    type: 'homepage',
    path: '/',
  });

  return generateSeoMetadata(seo);
}

async function getServerBaseUrl(): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
  } catch {
    // ignore
  }

  return 'http://localhost:3000';
}

async function fetchHeroSlides(locale: string, tHero: (key: string) => string) {
  try {
    const baseUrl = await getServerBaseUrl();
    const res = await fetch(`${baseUrl}/api/hero-banners`, { cache: 'no-store' });
    const data = await res.json();
    const banners = Array.isArray(data?.banners) ? data.banners : [];
    if (!banners.length) return [];

    return banners.map((b: any) => ({
      id: b._id,
      image: b.image,
      title:
        locale === 'en' ? b.titleEn || b.title || b.titleIt : b.titleIt || b.title || b.titleEn,
      subtitle:
        locale === 'en'
          ? b.subtitleEn || b.text || b.subtitleIt
          : b.subtitleIt || b.text || b.subtitleEn,
      href: b.href,
      cta: locale === 'en' ? b.ctaEn || b.cta || tHero('cta') : b.ctaIt || b.cta || tHero('cta'),
    }));
  } catch {
    return [];
  }
}

export default async function Page() {
  const seo = getSeoMeta({
    type: 'homepage',
    path: '/',
  });

  const products = await fetchProducts();
  const locale = await getLocale();
  const tHero = await getTranslations('hero');
  const heroSlides = await fetchHeroSlides(locale, tHero);

  return (
    <>
      <JsonLd data={seo.structuredData} />
      <main>
        <HeroSection initialSlides={heroSlides} initialLocale={locale} />
        <CategoriesSection />
        <LeLineSectionon />
        <TopProductsSection products={products} />
        <HomeLazySections />
      </main>
    </>
  );
}
