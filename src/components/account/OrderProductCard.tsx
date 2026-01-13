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
  };
  quantity: number;
}

export default function OrderProductCard({ product, quantity }: OrderProductCardProps) {
  const t = useTranslations('user.account.orders');

  if (!product) {
    return (
      <div className="flex items-center gap-2 md:gap-3 border border-input rounded-input-sm md:rounded-input-xl px-3 py-2 bg-gray-50 opacity-60">
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
      className="flex items-center gap-2 md:gap-3 border border-input rounded-input-sm md:rounded-input-xl px-3 py-2 bg-white hover:bg-brand-light transition-colors duration-300"
    >
      <div className="relative w-12 h-16 flex-shrink-0">
        <Image src={imageSrc} alt={product.name} fill className="object-contain" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <span className="font-medium text-sm line-clamp-2">{product.name}</span>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            {t('quantity')}: {quantity}
          </span>
        </div>
        <span className="text-sm font-semibold">€ {product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
}
