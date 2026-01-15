'use client';

import { Icon } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function User({ className = '' }) {
  const t = useTranslations('header.icons');

  return (
    <span aria-label={t('user')} className={`block ${className}`}>
      <Icon id="user" className="w-full h-full" />
    </span>
  );
}
