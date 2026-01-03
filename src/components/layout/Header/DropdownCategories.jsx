'use client';

import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';

export default function DropdownCategories() {
  return (
    <div
      className="
        hidden lg:flex
        absolute top-full left-1/2 -translate-x-1/2
        bg-[#FFFEEB] p-6
        gap-6 flex-wrap justify-center
        w-[max(800px,70vw)]
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        transition-opacity duration-500
        z-20
      "
    >
      {PRODUCT_CATEGORIES.map((category) => (
        <Link
          key={category.id}
          href={`/prodotti?subcategory=${category.id}`}
          className="flex flex-col items-center gap-2 focus:outline-none"
        >
          <div className="bg-brand-accent rounded-full flex items-center justify-center w-[100px] h-[100px] transition-all duration-300 hover:shadow-lg">
            <img
              src={category.image}
              alt={category.title}
              className="max-w-[80%] max-h-[80%] object-contain"
            />
          </div>
          <span className="text-[clamp(12px,2vw,15px)] text-center capitalize">{category.title}</span>
        </Link>
      ))}
    </div>
  );
}
