'use client';

import Image from 'next/image';
import { useState } from 'react';
import Spinner from '@/components/ui/Spinner/Spinner';

export default function ProductImage({ src, alt, className = '' }) {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setVisible(true);
  };

  return (
    <div
      className={`relative w-full flex justify-center rounded-[16px] max-h-[600px] ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" colorScheme="muted" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={180}
        height={240}
        className={`object-contain transition-transform duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        onLoad={handleLoad}
      />
    </div>
  );
}
