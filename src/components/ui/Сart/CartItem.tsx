'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Delite from '@/components/ui/Buttons/Delite';
import Spinner from '@/components/ui/Spinner/Spinner';
import { CartItemUI } from '@/types/cart';

interface CartItemProps {
  item: CartItemUI;
  isUpdating?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  enableManualQuantity?: boolean;
  onSetQuantity?: (
    quantity: number,
  ) => Promise<{ ok: true } | { ok: false; errorCode: string; details?: unknown }>;
  onRemove: () => void;
}

export default function CartItem({
  item,
  isUpdating,
  onIncrease,
  onDecrease,
  enableManualQuantity,
  onSetQuantity,
  onRemove,
}: CartItemProps) {
  const t = useTranslations('user.cart');
  const { title, imageSrc, price, volume, unit, quantity } = item;

  const [draftQuantity, setDraftQuantity] = useState(String(quantity));
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditingQuantity) {
      setDraftQuantity(String(quantity));
    }
  }, [quantity, isEditingQuantity]);

  const setQuantityFromDraft = async () => {
    if (!onSetQuantity) {
      setQuantityError(
        t('quantity.errors.updateFailed', {
          defaultValue: 'Could not update quantity. Please try again.',
        }),
      );
      setDraftQuantity(String(quantity));
      return;
    }

    const raw = draftQuantity.trim();
    if (!raw) {
      setDraftQuantity(String(quantity));
      setQuantityError(null);
      return;
    }

    if (!/^[0-9]+$/.test(raw)) {
      setQuantityError(t('quantity.errors.invalid', { defaultValue: 'Invalid quantity.' }));
      setDraftQuantity(String(quantity));
      return;
    }

    const nextQty = Number(raw);
    if (!Number.isFinite(nextQty) || !Number.isSafeInteger(nextQty)) {
      setQuantityError(t('quantity.errors.invalid', { defaultValue: 'Invalid quantity.' }));
      setDraftQuantity(String(quantity));
      return;
    }

    if (nextQty < 1) {
      setQuantityError(t('quantity.errors.min', { defaultValue: 'Quantity must be at least 1.' }));
      setDraftQuantity(String(quantity));
      return;
    }

    if (nextQty === quantity) {
      setQuantityError(null);
      return;
    }

    const result = await onSetQuantity(nextQty);
    if (result.ok) {
      setQuantityError(null);
      return;
    }

    const details = (result as any)?.details as any;
    const available = typeof details?.available === 'number' ? details.available : undefined;

    if (result.errorCode === 'OUT_OF_STOCK') {
      setQuantityError(t('toasts.outOfStock'));
    } else if (result.errorCode === 'INSUFFICIENT_STOCK') {
      if (available !== undefined && Number.isSafeInteger(available) && available >= 1) {
        setQuantityError(
          t('quantity.errors.onlyAvailable', {
            available,
            defaultValue: `Only ${available} available.`,
          }),
        );

        // UX: auto-clamp to max available.
        setDraftQuantity(String(available));

        if (available !== quantity) {
          const clamped = await onSetQuantity(available);
          if (clamped.ok) {
            setQuantityError(null);
            return;
          }
        }
      } else {
        setQuantityError(t('toasts.insufficientStock'));
      }
    } else {
      setQuantityError(
        t('quantity.errors.updateFailed', {
          defaultValue: 'Could not update quantity. Please try again.',
        }),
      );
    }

    // Revert UI back to the last confirmed quantity.
    setDraftQuantity(String(quantity));
  };

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
      <div className="flex flex-col items-end justify-between pt-2 pl-1 lg:pt-3 lg:pl-6">
        <button
          onClick={onRemove}
          disabled={isUpdating}
          className="bg-background-primary rounded-input-sm items-center p-2 lg:p-3
          transition-transform duration-200 ease-out will-change-transform md:hover:scale-105 md:focus-visible:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? <Spinner size="sm" colorScheme="muted" /> : <Delite />}
        </button>

        <div className="flex flex-col items-end mt-2 pl-1 pb-2 md:pl-6">
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrease}
              disabled={isUpdating || quantity <= 1}
              className="bg-background-primary text-text-soft text-[clamp(16px,3vw,20px)] rounded-input-sm justify-center items-center p-2 md:px-3
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

            {enableManualQuantity ? (
              <input
                value={draftQuantity}
                onChange={(e) => {
                  setQuantityError(null);
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                  setDraftQuantity(digitsOnly);
                }}
                onFocus={() => setIsEditingQuantity(true)}
                onBlur={async () => {
                  setIsEditingQuantity(false);
                  if (!isUpdating) await setQuantityFromDraft();
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }

                  if (e.key === 'Escape') {
                    setDraftQuantity(String(quantity));
                    setQuantityError(null);
                    e.currentTarget.blur();
                  }
                }}
                disabled={isUpdating}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={t('quantity.label', { defaultValue: 'Quantity' })}
                className="w-10 h-8 md:h-10 lg:w-16
                bg-background-primary text-text-soft text-[clamp(8px,3vw,16px)] 
                rounded-input-sm justify-center items-center p-2 md:px-3
                transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : (
              <span className="text-[clamp(8px,3vw,14px)]">{quantity}</span>
            )}

            <button
              onClick={onIncrease}
              disabled={isUpdating}
              className="bg-background-primary text-text-soft text-[clamp(16px,3vw,20px)] rounded-input-sm justify-center items-center p-2 md:px-3
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

          {enableManualQuantity && !!quantityError && (
            <div
              className="mt-1 max-w-[180px] text-right text-[clamp(10px,3vw,12px)] text-red-600"
              role="alert"
            >
              {quantityError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
