'use client';

import Image from 'next/image';
import Link from 'next/link';
import Delite from '@/components/ui/Buttons/Delite';
import Spinner from '@/components/ui/Spinner/Spinner';
import { CartItemUI } from '@/types/cart';

interface CartItemProps {
  item: CartItemUI;
  isUpdating?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  isUpdating,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const { title, imageSrc, price, volume, unit, quantity } = item;

  return (
    <div
      className={`
        grid grid-cols-[80px_1fr_auto]
        px-2 py-1 md:px-3 lg:px-4
        bg-background-secondary
        rounded-input-xl
        ${isUpdating ? 'opacity-60' : ''}
      `}
    >
      <Link href={`/prodotti/${item.slug}`} className="contents">
        {/* Image */}
        <div className="relative w-[70px] h-auto md:w-[93px] md:h-[120px]">
          <Image
            src={imageSrc || '/images/home/product.png'}
            alt={title}
            fill
            className="object-contain"
          />
        </div>

        {/* Info */}
        <div
          className="flex flex-col justify-center gap-2 text-text-soft
        ml-1 md:ml-8"
        >
          <span className="font-semibold text-[clamp(12px,3vw,18px)] lg:max-w-48 line-clamp-2">
            {title}
          </span>

          {volume && (
            <span className="text-[clamp(10px,3vw,15px)] md:mt-2">
              {unit} {volume}
            </span>
          )}

          <span className="font-semibold text-[clamp(12px,3vw,18px)] md:mt-1">
            € {price.toFixed(2)}
          </span>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex flex-col items-end justify-between pt-2 pl-3 md:pt-3 md:pl-6">
        <button
          onClick={onRemove}
          disabled={isUpdating}
          className="bg-background-primary rounded-input-sm items-center p-2 lg:p-3
          transition-transform duration-200 ease-out will-change-transform md:hover:scale-105 md:focus-visible:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? <Spinner size="sm" colorScheme="muted" /> : <Delite />}
        </button>

        <div className="flex items-center gap-2 pl-3 pb-2 md:pl-6">
          <button
            onClick={onDecrease}
            disabled={isUpdating || quantity <= 1}
            className="bg-background-primary text-text-soft text-[clamp(16px,3vw,25px)] rounded-input-sm justify-center items-center p-2 lg:px-3
          transition-all duration-200 ease-out
          will-change-transform
          md:hover:scale-105
          md:focus-visible:scale-105
          md:hover:bg-brand-light
          md:focus-visible:bg-brand-light
          disabled:opacity-50 disabled:cursor-not-allowed"
          >
            –
          </button>

          <span>{quantity}</span>

          <button
            onClick={onIncrease}
            disabled={isUpdating}
            className="bg-background-primary text-text-soft text-[clamp(16px,3vw,25px)] rounded-input-sm justify-center items-center p-2 lg:px-3
          transition-all duration-200 ease-out
          will-change-transform
          md:hover:scale-105
          md:focus-visible:scale-105
          md:hover:bg-brand-light
          md:focus-visible:bg-brand-light
          disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
