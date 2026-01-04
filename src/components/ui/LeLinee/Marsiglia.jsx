// Marsiglia - 5

import LeLineeItem from './LeLineeItem';
import { useTranslations } from 'next-intl';

export default function Marsiglia({ variant }) {
  const t = useTranslations('linesSection');
  return (
    <LeLineeItem
      title={t('lines.marsiglia.title')}
      imageAlt={t('lines.marsiglia.imageAlt')}
      imageSrc="/images/home/marsiglia.jpg"
      variant={variant}
      slug="marsiglia"
    />
  );
}
