// Neutro - 6

import LeLineeItem from './LeLineeItem';
import { useTranslations } from 'next-intl';

export default function Neutro({ variant }) {
  const t = useTranslations('linesSection');
  return (
    <LeLineeItem
      title={t('lines.neutro.title')}
      imageAlt={t('lines.neutro.imageAlt')}
      imageSrc="/images/home/neutro.jpg"
      variant={variant}
      slug="neutro"
    />
  );
}
