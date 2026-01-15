import { Icon } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function RemoveCart({ className = '' }) {
  const t = useTranslations('header.icons');

  return (
    <span aria-label={t('cart')} className={`block ${className}`}>
      <Icon id="remove-cart" className="w-full h-full" />
    </span>
  );
}
