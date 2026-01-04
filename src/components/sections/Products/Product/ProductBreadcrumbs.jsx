'use client';

import Link from 'next/link';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { useTranslations } from 'next-intl';

export default function ProductBreadcrumbs({ product }) {
  const categoryFilter = PRODUCT_FILTERS.find((filter) =>
    filter.categoryIds?.some((id) => product.categoryIds.includes(id)),
  );

  const categoryName = categoryFilter?.title || '';
  const categoryId = categoryFilter?.id || '';
  const t = useTranslations('prodotti.related');

  return (
    <nav className="py-6 lg:py-9 text-[clamp(14px,2vw,17px)]">
      <div
        className="flex flex-wrap gap-2 items-center max-w-[1570px] 
      mx-auto px-4 md:px-8 lg:px-10 xl:px-12 
      text-text-primary"
      >
        <span className="flex items-center gap-2">
          <Link href="/" className="transition-all duration-300 hover:underline">
            {t('home')}
          </Link>
          <span>|</span>
        </span>

        {categoryName && categoryId && (
          <span className="flex items-center gap-2">
            <Link href={`/prodotti?category=${categoryId}`} className="hover:underline">
              {categoryName}
            </Link>
            <span>|</span>
          </span>
        )}

        <span className="text-[#545454] underline">{product.title}</span>
      </div>
    </nav>
  );
}
