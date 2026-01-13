'use client';

import { useState, useEffect } from 'react';

export default function ProductVolumeSelector({ variants, onChange }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  useEffect(() => {
    onChange?.(selectedVariant);
  }, [selectedVariant, onChange]);

  return (
    <div className="tabular flex gap-6 mt-5">
      {variants.map((v) => {
        const isAvailable = v.isAvailable ?? (v.stock === undefined || v.stock > 0);
        const isOutOfStock = !isAvailable;

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
