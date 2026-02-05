'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CartEmpty({ onClose }) {
  const t = useTranslations('user.cart');

  return (
    <p
      className="
      text-text-gray
      text-[clamp(16px,2vw,22px)]
      leading-relaxed
      text-center justify-center
      p-6 py-10 md:p-16 lg:py-16
    "
    >
      {t('empty.text')}{' '}
      <Link href="/prodotti" onClick={onClose} className="underline hover:text-text-primary">
        {t('empty.link')}
      </Link>
    </p>
  );
}
