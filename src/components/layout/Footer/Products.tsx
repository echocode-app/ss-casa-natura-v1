import Link from 'next/link';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { useTranslations } from 'next-intl';

export default function Products() {
  const t = useTranslations('footer');

  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        {t('products')}
      </h4>

      <ul className="flex flex-col">
        {PRODUCT_FILTERS.map((filter) => (
          <li key={filter.id} className="mb-2">
            <Link
              href={`/prodotti?category=${filter.id}`}
              className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
            >
              {filter.title}
            </Link>
          </li>
        ))}

        <li className="mb-2">
          <Link
            href="/prodotti"
            className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
          >
            {t('links.productSheets')}
          </Link>
        </li>
      </ul>
    </div>
  );
}
