'use client';

import Image from 'next/image';
import ProductCard from './ProductCard';
import { useTranslations } from 'next-intl';

const Leaf = '/images/home/leaf.png';
const LeafR = '/images/home/leaf-right.png';

export default function CategoriesSection() {
  const t = useTranslations('product-categories');

  const handleCategoryClick = () => {
    // Smooth scroll to products section
    setTimeout(() => {
      const productsSection = document.querySelector('main section:nth-of-type(2)');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <section className="py-8 xl:py-12 relative overflow-x-hidden">
      <div className="mx-auto max-w-[1570px] px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-[720px] mx-auto">
          <h2 className="heading-sm lg:heading-lg">{t('headerTitle')}</h2>
          <p className="text-[30px] lg:text-[40px] font-bold mt-1">{t('headerSubtitle')}</p>
        </div>

        {/* Cards */}
        <div className="lg:max-w-[1200px] mx-auto mt-6 md:mt-10 lg:mt-16 flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8 lg:grid lg:grid-cols-3 relative">
          <div className="relative snap-start shrink-0 lg:shrink">
            <Image
              src={Leaf}
              alt="Leaf"
              width={419}
              height={270}
              className="absolute top-2 right-28 lg:-top-4 lg:-left-40 xl:-top-6 xl:-left-48 z-0 overflow-x-hidden"
            />
            <ProductCard
              title={t('Pulizia')}
              href="/prodotti?category=pulizia"
              onClick={handleCategoryClick}
            />
          </div>

          <div className="relative snap-start shrink-0 lg:shrink mt-6 md:mt-0">
            <ProductCard
              title={t('Bucato')}
              href="/prodotti?category=bucato"
              onClick={handleCategoryClick}
            />
          </div>

          <div className="relative snap-start shrink-0 lg:shrink mt-6 md:mt-0">
            <Image
              src={LeafR}
              alt="Leaf-right"
              width={403}
              height={255}
              className="absolute top-2 -right-28 lg:-top-4 lg:-right-36 xl:-top-8 xl:-right-44 z-0 overflow-x-hidden"
            />
            <ProductCard
              title={t('Cucina')}
              href="/prodotti?category=cucina"
              onClick={handleCategoryClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
