'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Logo({ className = '' }) {
  const t = useTranslations('header.actions');
  return (
    <Link
      href="/"
      aria-label={t('home')}
      className={`
        relative
        w-[clamp(100px,15vw,230px)]
        h-[clamp(70px,10.4vw,160px)]
        ${className}
      `}
    >
      <Image
        src="/images/parts/logo.svg"
        alt="CASA NATURA"
        fill
        className="object-contain"
        priority
      />
    </Link>
  );
}
