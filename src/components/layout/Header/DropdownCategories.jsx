'use client';

import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function DropdownCategories({ parentRef, isHovered }) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!parentRef?.current) return;

    const updatePosition = () => {
      const rect = parentRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [parentRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="hidden lg:flex fixed z-[9999] justify-center"
      style={{
        top: coords.top,
        left: 0,
        width: '100%',
        pointerEvents: isHovered ? 'auto' : 'none',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        className="bg-[#FFFEEB] p-6 gap-6 flex-wrap justify-center flex max-w-[max(800px,80vw)]"
        style={{
          boxShadow: 'inset 0 5px 5.2px -3px rgba(0,0,0,0.25)',
        }}
      >
        {PRODUCT_CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/prodotti?subcategory=${category.id}`}
            className="flex flex-col items-center gap-2 focus:outline-none"
          >
            <div
              className="
                bg-brand-accent rounded-full flex items-center justify-center 
                lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] 
                transition-all duration-300 hover:shadow-lg
              "
            >
              <img
                src={category.image}
                alt={category.title}
                className="max-w-[80%] max-h-[80%] object-contain"
              />
            </div>
            <span className="text-[clamp(12px,2vw,15px)] text-center capitalize">
              {category.title}
            </span>
          </Link>
        ))}
      </div>
    </div>,
    document.body,
  );
}
