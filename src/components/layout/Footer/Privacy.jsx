import { useTranslations } from 'next-intl';

export default function Privacy() {
  const t = useTranslations('footer');

  return (
    <p className="text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] text-white break-words tabular">
      {t('copyright')} /{' '}
      <a href="#" className="hover:underline">
        {t('privacyLink')}
      </a>
    </p>
  );
}
