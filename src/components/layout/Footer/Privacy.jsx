import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Privacy() {
  const t = useTranslations('footer');

  return (
    <p className="text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] text-white break-words tabular">
      {t('copyright')} /{' '}
      <Link href="/privacy-policy" className="hover:underline">
        {t('privacyLink')}
      </Link>
    </p>
  );
}
