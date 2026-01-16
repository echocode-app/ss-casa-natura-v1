'use client';

import { useState, useEffect } from 'react';
import { getFirstPurchasableVariant, isProductAvailable } from '@/lib/utils/sortProducts';

export default function ProductVolumeSelector({ product, variants, onChange }) {
  const [selectedVariant, setSelectedVariant] = useState(
    () => getFirstPurchasableVariant(product) ?? variants[0],
  );

  useEffect(() => {
    const next = getFirstPurchasableVariant(product) ?? variants[0];
    setSelectedVariant(next);
  }, [product, variants]);

  useEffect(() => {
    onChange?.(selectedVariant);
  }, [selectedVariant, onChange]);

  return (
    <div className="tabular flex gap-6 mt-5">
      {variants.map((v) => {
        const isOutOfStock = !isProductAvailable(product, v.id);

        return (
          <button
            key={v.id}
            type="button"
            disabled={isOutOfStock}
            className={`tabular px-4 py-2 border border-transparent rounded-[25px] 
            text-[clamp(16px,5vw,22px)] transition-all duration-300
            ${selectedVariant.id === v.id ? 'bg-[#ECECEC]' : 'bg-transparent'}
            ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : 'md:hover:border-brand-soft md:focus:border-brand-soft'}`}
            onClick={() => !isOutOfStock && setSelectedVariant(v)}
          >
            {v.unit} {v.volume}
          </button>
        );
      })}
    </div>
  );
}
