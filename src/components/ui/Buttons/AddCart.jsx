import { Icon } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function AddCart({ className = '' }) {
  const t = useTranslations('header.icons');

  return (
    <span aria-label={t('cart')} className={`block ${className}`}>
      <Icon id="add-cart" className="w-full h-full" />
    </span>
  );
}
