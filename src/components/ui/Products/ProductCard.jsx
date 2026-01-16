'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

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
  isAvailable = true,
  stock,
}) {
  const href = slug ? `/prodotti/${slug}` : '/prodotti';

  const [adding, setAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const t = useTranslations('topProductsSection');

  const productAvailable = isAvailable && (stock === undefined || stock > 0);
  const isLowStock = stock !== undefined && stock > 0 && stock <= 5;
  const isOutOfStock = !productAvailable;

  const DisabledBuy = ({ children, className = '' }) => (
    <div
      role="button"
      aria-disabled="true"
      tabIndex={-1}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`relative bg-brand-accent text-black font-semibold text-[clamp(14px,2vw,22px)] text-center rounded-[25px] transition-all duration-300 opacity-50 cursor-not-allowed select-none ${className}`}
      title={t('outOfStock')}
    >
      <span className="inline-flex w-full h-full items-center justify-center">{children}</span>
    </div>
  );

  const handleAddClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onAddClick || isOutOfStock) return;

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
        ${isOutOfStock ? 'opacity-60' : ''}
      `}
    >
      {/* Image */}
      <div
        className="
          relative flex items-center justify-center
          rounded-[16px]
          overflow-hidden
          w-full m-auto
          aspect-[3/4]      /* mobile default */
          md:aspect-square  /* tablet */
          lg:aspect-[3/4] lg:max-w-[230px] lg:max-h-[300px]  /* desktop */
          xl:w-[230px] xl:h-[300px]  /* fix XL */
        "
      >
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="bg-white/95 px-4 py-2 rounded-full text-sm font-semibold text-gray-800">
              {t('outOfStock')}
            </span>
          </div>
        )}

        {/* Low Stock Badge */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {t('lowStock')}
            </span>
          </div>
        )}

        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="
            (max-width: 500px) 100vw,
            (max-width: 1024px) 50vw,
            (max-width: 1280px) 33vw,
            230px
          "
          className={`
            object-contain
            max-h-[300px] m-auto
            transition-transform duration-300 ease-out
            md:group-hover:scale-110
            ${imageLoading ? 'opacity-0' : 'opacity-100'}
            ${isOutOfStock ? 'grayscale' : ''}
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
            {isOutOfStock ? (
              <DisabledBuy className="w-10 h-10 rounded-full p-0 flex items-center justify-center">
                <CartIcon />
              </DisabledBuy>
            ) : (
              <PrimaryButton
                onClick={handleAddClick}
                disabled={adding}
                className="w-10 h-10 rounded-full p-0 flex items-center justify-center max-[500px]:[&>span]:flex max-[500px]:[&>span]:w-full max-[500px]:[&>span]:h-full max-[500px]:[&>span]:items-center max-[500px]:[&>span]:justify-center"
              >
                {adding ? <Spinner size="sm" colorScheme="muted" /> : <CartIcon />}
              </PrimaryButton>
            )}
          </div>

          {/* Tablet button (text only, >=500px and <1024px) */}
          <div className="hidden min-[501px]:flex lg:hidden items-center">
            {isOutOfStock ? (
              <DisabledBuy className="px-6 py-3 rounded-full text-sm">
                {t('outOfStock')}
              </DisabledBuy>
            ) : (
              <PrimaryButton
                onClick={handleAddClick}
                disabled={adding}
                className="px-6 py-3 rounded-full text-sm"
              >
                {adding ? <Spinner size="sm" colorScheme="muted" /> : t('button')}
              </PrimaryButton>
            )}
          </div>
        </div>

        {/* Desktop button */}
        <div className="mt-auto pt-4 hidden lg:block">
          {isOutOfStock ? (
            <DisabledBuy className="w-full p-4 xl:px-8 xl:py-5 flex justify-center">
              {t('outOfStock')}
            </DisabledBuy>
          ) : (
            <PrimaryButton
              onClick={handleAddClick}
              disabled={adding}
              className="w-full p-4 xl:px-8 xl:py-5 flex justify-center"
            >
              {adding ? <Spinner size="sm" colorScheme="muted" /> : t('button')}
            </PrimaryButton>
          )}
        </div>
      </div>
    </Link>
  );
}
