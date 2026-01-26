import { CategoriesSection } from '@/components/sections/Categories';
import { GreenProductionSection } from '@/components/sections/GreenProduction';
import { HeroSection } from '@/components/sections/Hero';
import { LeLineSectionon } from '@/components/sections/LeLinee';
import { MissionSection } from '@/components/sections/Mission';
import { PromocodeSection } from '@/components/sections/Promocode';
import { TopProductsSection } from '@/components/sections/TopProducts';
import { fetchProducts } from '@/lib/utils/fetchProducts';
import { getSeoMeta, generateMetadata as generateSeoMetadata, JsonLd } from '@/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMeta({
    type: 'homepage',
    path: '/',
  });

  return generateSeoMetadata(seo);
}

export default async function Page() {
  const seo = getSeoMeta({
    type: 'homepage',
    path: '/',
  });

  const products = await fetchProducts();

  return (
    <>
      <JsonLd data={seo.structuredData} />
      <main>
        <HeroSection />
        <CategoriesSection />
        <LeLineSectionon />
        <TopProductsSection products={products} />
        <GreenProductionSection />
        <MissionSection />
        <PromocodeSection />
      </main>
    </>
  );
}
