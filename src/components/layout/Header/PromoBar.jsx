'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PromoBar({
  isVisible = true,
  text,
  href = '/prodotti',
  bgColor = '#C3FF8A',
  textColor = '#000000',
}) {
  const t = useTranslations('promoBar');

  if (!isVisible) return null;

  const label = text || t('defaultText');

  return (
    <Link href={href} className="block w-full" aria-label={label}>
      <div
        className="group w-full py-2 flex justify-center transition-all duration-300"
        style={{ backgroundColor: bgColor }}
        role="region"
      >
        <div
          className="
            text-center font-raleway font-bold
            text-[clamp(10px,1.5vw,19px)]
            max-w-[500px] md:max-w-[700px]
            lg:max-w-[960px] xl:max-w-[1440px]
            px-4
            transition-all duration-300 md:group-hover:scale-105
          "
          style={{ color: textColor }}
        >
          {label}
        </div>
      </div>
    </Link>
  );
}
