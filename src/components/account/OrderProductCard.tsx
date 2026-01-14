'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const DEFAULT_IMAGE = '/images/home/product.png';

interface OrderProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
    volume?: number;
    unit?: string;
  };
  quantity: number;
}

export default function OrderProductCard({ product, quantity }: OrderProductCardProps) {
  const t = useTranslations('user.account.orders');

  if (!product) {
    return (
      <div className="flex items-center gap-2 md:gap-3 rounded-input-xl px-3 py-2 bg-background-secondary">
        <div className="w-12 h-16 bg-gray-200 flex-shrink-0 rounded" />
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">{t('productUnavailable')}</span>
        </div>
      </div>
    );
  }

  const imageSrc = product.images?.[0] || DEFAULT_IMAGE;

  return (
    <Link
      href={`/prodotti/${product.slug}`}
      className="flex items-center gap-3 lg:gap-5 bg-background-secondary rounded-input-xl px-3 lg:px-5 py-2"
    >
      <div className="relative w-12 h-16 md:w-24 md:h-32 flex-shrink-0">
        <Image src={imageSrc} alt={product.name} fill className="object-contain" />
      </div>

      <div className="flex flex-1 justify-between">
        <div className="flex flex-col gap-2 lg:gap-3 justify-between">
          <span className="font-semibold text-[clamp(10px,2vw,18px)] text-text-soft">
            {product.name}
          </span>

          {product.volume && (
            <span className="text-[clamp(9px,2vw,15px)] mt-1">
              {product.unit} {product.volume}
            </span>
          )}

          <span className="font-semibold text-[clamp(10px,2vw,18px)] text-text-soft">
            € {product.price.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[clamp(10px,2vw,15px)] text-text-soft ml-auto">
          <span>
            {t('quantity')}: {quantity}
          </span>
        </div>
      </div>
    </Link>
  );
}
