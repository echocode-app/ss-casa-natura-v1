import Link from 'next/link';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';

export default function Products() {
  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        Prodotti
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
            Schede prodotti
          </Link>
        </li>
      </ul>
    </div>
  );
}
