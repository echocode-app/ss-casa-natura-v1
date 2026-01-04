'use client';

import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export default function DropdownCategories({ parentRef, isOpen, onClose }) {
  const t = useTranslations('categories');
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  useState(() => setMounted(true));

  useLayoutEffect(() => {
    if (!parentRef?.current) return;

    const updatePosition = () => {
      const rect = parentRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [parentRef, isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed z-[9999] lg:flex justify-center transition-opacity duration-300`}
      style={{
        top: coords.top,
        left: 0,
        width: '100%',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
      }}
      onMouseLeave={onClose}
      onMouseEnter={() => {}}
    >
      <div
        className="bg-[#FFFEEB] lg:p-4 lg:gap-4 xl:p-6 xl:gap-6 flex flex-wrap justify-center max-w-[max(900px,80vw)]"
        style={{ boxShadow: 'inset 0 5px 5.2px -3px rgba(0,0,0,0.25)' }}
      >
        {PRODUCT_CATEGORIES.map((category) => {
          const label = t.has(category.title) ? t(category.title) : category.title;
          return (
            <Link
              key={category.id}
              href={`/prodotti?subcategory=${category.id}`}
              onClick={onClose}
              className="group flex flex-col items-center gap-2 focus:outline-none lg:max-w-[100px] xl:max-w-[130px]"
            >
              <div className="bg-brand-accent rounded-full flex items-center justify-center lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] transition-all duration-300 md:group-hover:shadow-header">
                <img
                  src={category.image}
                  alt={label}
                  className="max-w-[80%] max-h-[80%] object-contain"
                />
              </div>
              <span className="text-[clamp(12px,2vw,15px)] text-center capitalize">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
