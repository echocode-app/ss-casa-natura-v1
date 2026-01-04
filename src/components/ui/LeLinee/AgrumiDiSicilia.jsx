// Agrumi di Sicilia - 3
import LeLineeItem from './LeLineeItem';
import { useTranslations } from 'next-intl';

export default function AgrumiDiSicilia({ variant }) {
  const t = useTranslations('linesSection');
  return (
    <LeLineeItem
      title={t('lines.agrumi-di-sicilia.title')}
      imageAlt={t('lines.agrumi-di-sicilia.imageAlt')}
      imageSrc="/images/home/agrumi-di-sicilia.jpg"
      variant={variant}
      slug="agrumi-di-sicilia"
    />
  );
}
