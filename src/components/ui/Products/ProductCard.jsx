'use client';

import Image from 'next/image';
import { PrimaryButton, CartIcon } from '@/components/ui/Buttons';
import Spinner from '@/components/ui/Spinner/Spinner';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({
  title = 'Sgrassatore naturale Agrumi di Sicilia',
  volume = '750',
  price,
  imageSrc = '/images/home/product.png',
  onAddClick,
  slug,
}) {
  const href = slug ? `/prodotti/${slug}` : '/';

  const [adding, setAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const MAX_TITLE_LENGTH = 18;

  const truncatedTitle =
    title.length > MAX_TITLE_LENGTH ? title.slice(0, MAX_TITLE_LENGTH).trim() + '…' : title;

  const isTruncated = truncatedTitle !== title;

  const handleAddClick = async (e) => {
    e.stopPropagation();
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

  const formattedVolume = volume ? `ml ${volume}` : '';
  const formattedPrice = price !== undefined && price !== null ? Number(price).toFixed(2) : '';

  return (
    <Link
      href={href}
      className={`group bg-white/90 rounded-[20px] flex flex-col p-4 md:p-5 xl:p-6 gap-1 md:gap-2 lg:gap-3 xl:gap-4 md:max-h-[440px] lg:max-h-[520px] border border-bg-brand-soft md:border-none transition-all duration-500
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
          className={`object-contain w-auto h-auto transition-transform duration-300 ease-out md:group-hover:scale-110 ${
            imageLoading ? 'opacity-0' : ''
          }`}
          onLoad={handleImageLoaded}
        />
      </div>

      {/* Text info */}
      <div className="flex flex-col justify-between gap-[clamp(6px,2vw,10px)] flex-1 mt-2">
        {/* Title */}
        <h3
          className="font-semibold text-[clamp(16px,4vw,26px)]"
          aria-label={title}
          title={isTruncated ? title : undefined}
        >
          {truncatedTitle}
        </h3>

        {/* Volume + Price + Button */}
        <div className="flex flex-col lg:flex-col gap-1 mt-2">
          <div className="flex justify-between lg:flex-col">
            <div className="flex flex-col gap-2 justify-center">
              <span className="font-normal text-[clamp(12px,4vw,22px)]">{formattedVolume}</span>

              {formattedPrice && (
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-[clamp(16px,4vw,23px)]">€</span>
                  <span className="font-bold text-[clamp(16px,4vw,23px)]">{formattedPrice}</span>
                </div>
              )}
            </div>

            <div className="mt-0 lg:mt-4 md:my-auto lg:my-0">
              <PrimaryButton
                onClick={handleAddClick}
                disabled={adding}
                className="w-full p-4 lg:px-6 xl:px-8 xl:py-5 text-center flex justify-center items-center gap-2"
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
