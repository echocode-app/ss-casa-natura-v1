import { Icon } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function Search({ className = '' }) {
  const t = useTranslations('header.icons');

  return (
    <span aria-label={t('search')} className={`block ${className}`}>
      <Icon id="search" className="w-full h-full" />
    </span>
  );
}
