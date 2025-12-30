'use client';

import Image from 'next/image';
import { PrimaryButton, CartIcon } from '@/components/ui/Buttons';
import Spinner from '@/components/ui/Spinner/Spinner';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({
  title = 'Sgrassatore naturale Agrumi di Sicilia',
  volume = 'ml 750',
  price = '€ 10.00',
  imageSrc = '/images/home/product.png',
  onAddClick,
  href = '/',
}) {
  const [adding, setAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const handleAddClick = async (e) => {
    e.preventDefault();
    if (!onAddClick) return;
    setAdding(true);
    try {
      await onAddClick();
    } finally {
      setAdding(false);
    }
  };

  const handleImageLoaded = () => {
    setImageLoading(false);
    setVisible(true);
  };

  return (
    <Link
      href={href}
      className={`group bg-white/90 rounded-[20px] flex flex-col p-2 md:p-4 lg:p-5 xl:p-6 gap-1 md:gap-2 lg:gap-3 xl:gap-4 h-full border border-bg-brand-soft md:border-none transition-all duration-500
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Image */}
      <div className="w-full flex justify-center rounded-[16px] relative max-h-[600px]">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" colorScheme="muted" />
          </div>
        )}

        <Image
          src={imageSrc}
          alt={title}
          width={180}
          height={240}
          className={`object-contain w-auto h-auto transition-transform duration-300 ease-out md:group-hover:scale-110 ${imageLoading ? 'opacity-0' : ''}`}
          onLoad={handleImageLoaded}
        />
      </div>

      {/* Text info */}
      <div className="flex flex-col justify-between gap-[clamp(6px,2vw,10px)] flex-1 mt-2">
        <h3 className="font-semibold text-[clamp(12px,2vw,26px)]">{title}</h3>

        {/* Volume + Price + Button */}
        <div className="flex flex-col lg:flex-col gap-1 mt-2">
          <div className="flex justify-between lg:flex-col">
            {/* Volume + Price */}
            <div className="flex flex-col gap-2 justify-center">
              <span className="font-normal text-[clamp(12px,2vw,20px)]">{volume}</span>
              <span className="font-semibold text-[clamp(14px,2vw,22px)]">{price}</span>
            </div>

            {/* Button */}
            <div className="mt-0 lg:mt-3">
              <PrimaryButton
                onClick={handleAddClick}
                disabled={adding}
                className="w-full px-3 py-3 md:px-4 md:py-3 lg:px-6 xl:px-8 xl:py-5 text-center flex justify-center items-center gap-2"
              >
                <span className="md:hidden">
                  <CartIcon className="m-auto p-1" />
                </span>
                {adding ? (
                  <Spinner size="sm" colorScheme="muted" />
                ) : (
                  <span className="hidden md:inline">Aggiungi</span>
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
