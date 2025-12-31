import { CategoriesSection } from '@/components/sections/Categories';
import { GreenProductionSection } from '@/components/sections/GreenProduction';
import { HeroSection } from '@/components/sections/Hero';
import { LeLineSectionon } from '@/components/sections/LeLinee';
import { MissionSection } from '@/components/sections/Mission';
import { PromocodeSection } from '@/components/sections/Promocode';
import { TopProductsSection } from '@/components/sections/TopProducts';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

export default function Page() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <LeLineSectionon />
      <TopProductsSection products={PRODUCTS_MOCK} />
      <GreenProductionSection />
      <MissionSection />
      <PromocodeSection />
    </main>
  );
}
