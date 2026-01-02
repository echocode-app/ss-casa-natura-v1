'use client';

import { useState, useEffect } from 'react';

export default function ProductVolumeSelector({ variants, onChange }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  useEffect(() => {
    onChange?.(selectedVariant);
  }, [selectedVariant, onChange]);

  return (
    <div className="flex gap-3 mt-4">
      {variants.map((v) => (
        <button
          key={v.id}
          type="button"
          className={`px-4 py-2 border rounded ${
            selectedVariant.id === v.id ? 'border-accent font-semibold' : 'border-gray-300'
          }`}
          onClick={() => setSelectedVariant(v)}
        >
          {v.volume} {v.unit}
        </button>
      ))}
    </div>
  );
}
