import { useTranslations } from 'next-intl';
import IubendaPolicyEmbed from '@/components/legal/IubendaPolicyEmbed';

export default function Privacy() {
  const t = useTranslations('footer');

  return (
    <p className="text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] text-white break-words tabular">
      {t('copyright')} /{' '}
      <IubendaPolicyEmbed kind="privacy" className="text-white hover:underline">
        {t('privacyLink')}
      </IubendaPolicyEmbed>
    </p>
  );
}
