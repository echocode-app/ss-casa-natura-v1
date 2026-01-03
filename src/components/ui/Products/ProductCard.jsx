'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { PrimaryButton, CartIcon } from '@/components/ui/Buttons';
import Spinner from '@/components/ui/Spinner/Spinner';

export default function ProductCard({
  title = 'Sgrassatore naturale Agrumi di Sicilia',
  volume,
  unit = 'ml',
  price,
  discountPrice,
  imageSrc = '/images/home/product.png',
  slug,
  onAddClick,
}) {
  const href = slug ? `/prodotti/${slug}` : '/prodotti';

  const [adding, setAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const handleAddClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const formattedVolume = volume ? `${unit} ${volume}` : '';
  const formattedPrice =
    discountPrice != null
      ? `€ ${Number(discountPrice).toFixed(2)}`
      : price != null
        ? `€ ${Number(price).toFixed(2)}`
        : '';

  return (
    <Link
      href={href}
      className={`
        group bg-white/90 rounded-[20px]
        flex flex-col h-full
        p-4 md:p-5 xl:p-6
        gap-3
        border border-bg-brand-soft md:border-none
        transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Image */}
      <div
        className="
          relative
          flex items-center justify-center
          rounded-[16px]
          overflow-hidden
          w-full
          aspect-[3/4]      /* mobile default */
          md:aspect-square  /* tablet */
          lg:aspect-[3/4]   /* desktop */
          xl:w-[230px] xl:h-[300px] xl:aspect-auto /* fix container size on xl */
        "
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" colorScheme="muted" />
          </div>
        )}

        <Image
          src={imageSrc}
          alt={title}
          fill
          className={`
            object-contain
            transition-transform duration-300 ease-out
            md:group-hover:scale-110
            ${imageLoading ? 'opacity-0' : 'opacity-100'}
          `}
          onLoad={handleImageLoaded}
          loading="eager"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 mt-2">
        {/* Title */}
        <h3
          className="
            font-semibold
            text-[clamp(20px,3vw,28px)]
            leading-[1.25]
            line-clamp-2
            mb-3
          "
          style={{
            minHeight: `calc(1.25em * 2)`,
          }}
          title={title}
        >
          {title}
        </h3>

        {/* Volume / Price / Buttons */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="flex flex-col gap-3">
            {formattedVolume && (
              <span className="tabular text-[clamp(14px,2vw,22px)]">{formattedVolume}</span>
            )}

            {formattedPrice && (
              <span className="tabular font-bold text-[clamp(16px,2vw,25px)]">
                {formattedPrice}
              </span>
            )}
          </div>

          {/* Mobile button (icon only, <500px) */}
          <div className="hidden max-[500px]:flex items-center">
            <PrimaryButton
              onClick={handleAddClick}
              disabled={adding}
              className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
            >
              {adding ? <Spinner size="sm" colorScheme="muted" /> : <CartIcon className="p-1" />}
            </PrimaryButton>
          </div>

          {/* Tablet button (text only, >=500px and <1024px) */}
          <div className="hidden min-[501px]:flex lg:hidden items-center">
            <PrimaryButton
              onClick={handleAddClick}
              disabled={adding}
              className="px-6 py-3 rounded-full text-sm"
            >
              {adding ? <Spinner size="sm" colorScheme="muted" /> : 'Aggiungi'}
            </PrimaryButton>
          </div>
        </div>

        {/* Desktop button */}
        <div className="mt-auto pt-4 hidden lg:block">
          <PrimaryButton
            onClick={handleAddClick}
            disabled={adding}
            className="w-full p-4 xl:px-8 xl:py-5 flex justify-center"
          >
            {adding ? <Spinner size="sm" colorScheme="muted" /> : 'Aggiungi'}
          </PrimaryButton>
        </div>
      </div>
    </Link>
  );
}
