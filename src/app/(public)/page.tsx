import { CategoriesSection } from '@/components/sections/Categories';
import { HeroSection } from '@/components/sections/Hero';
import { LeLineSectionon } from '@/components/sections/LeLinee';
import { TopProductsSection } from '@/components/sections/TopProducts';

export default function Page() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <LeLineSectionon />
      <TopProductsSection />
    </main>
  );
}
