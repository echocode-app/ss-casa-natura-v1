// Fiore di Loto - 4

import LeLineeItem from './LeLineeItem';
import { useTranslations } from 'next-intl';

export default function FioreDiLoto({ variant }) {
  const t = useTranslations('linesSection');
  return (
    <LeLineeItem
      title={t('lines.fiore-di-loto.title')}
      imageAlt={t('lines.fiore-di-loto.imageAlt')}
      imageSrc="/images/home/fiore-di-loto.jpg"
      variant={variant}
      slug="fiore-di-loto"
    />
  );
}
