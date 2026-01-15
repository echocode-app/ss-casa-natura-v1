'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import CartItem from '@/components/ui/Сart/CartItem';
import AddCart from '@/components/ui/Buttons/AddCart';
import RemoveCart from '@/components/ui/Buttons/RemoveCart';
import type { CartItemUI } from '@/types/cart';

export type UpdateResult = { ok: true } | { ok: false; errorCode: string; details?: unknown };

type Props = {
  items: CartItemUI[];
  activeItemId: string | null;
  showActionSpinner: boolean;
  onIncrease: (itemId: string, currentQuantity: number) => Promise<void>;
  onDecrease: (itemId: string, currentQuantity: number) => Promise<void>;
  onSetQuantity: (itemId: string, quantity: number) => Promise<UpdateResult>;
  onRemove: (itemId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
};

export function CartItemsPanel({
  items,
  activeItemId,
  showActionSpinner,
  onIncrease,
  onDecrease,
  onSetQuantity,
  onRemove,
  onClearCart,
}: Props) {
  const t = useTranslations('user.cart');

  return (
    <div className="flex-1 w-full md:max-w-[55%] xl:max-w-[60%] flex flex-col-reverse md:block">
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            isUpdating={activeItemId === item.id}
            onIncrease={() => onIncrease(item.id, item.quantity)}
            onDecrease={() => onDecrease(item.id, item.quantity)}
            enableManualQuantity
            onSetQuantity={(quantity) => onSetQuantity(item.id, quantity)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <button
          onClick={onClearCart}
          className="group text-[8px] md:text-sm inline-flex items-center gap-1 p-1 md:p-3
                text-red-500/95 md:text-text-gray duration-300 transition-all 
                hover:underline md:hover:text-red-500/95"
          disabled={items.length === 0 || showActionSpinner}
        >
          <RemoveCart className="w-4 h-4 fill-current transition-colors duration-300" />
          {t('clearCart')}
        </button>

        <Link
          href="/prodotti"
          className="hidden md:inline-flex group font-semibold text-xl p-3 md:pr-6 md:pb-6
                 items-center gap-2
                text-text-gray duration-300 transition-all 
                hover:underline group-hover:text-text-extrablack group-focus:text-text-extrablack"
        >
          {t('continueShopping')}
          <AddCart className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110" />
        </Link>
      </div>
    </div>
  );
}
