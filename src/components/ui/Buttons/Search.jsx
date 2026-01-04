import { Icon } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function CartIcons() {
  const t = useTranslations('header.icons');

  return (
    <button
      aria-label={t('search')}
      className="hover:scale-105 focus:scale-105 transition-transform duration-400
      my-auto px-2 py-6
      "
    >
      <Icon id="search" className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}
