import { Icon } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function Logout({ className = '' }) {
  const t = useTranslations('user.account');

  return (
    <span aria-label={t('actions.logout')} className={`block ${className}`}>
      <Icon id="logout" className="w-full h-full" />
    </span>
  );
}
