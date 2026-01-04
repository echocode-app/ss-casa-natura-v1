import LeLineeItem from './LeLineeItem';
import { useTranslations } from 'next-intl';

export default function Lavanda({ variant }) {
  const t = useTranslations('linesSection');
  return (
    <LeLineeItem
      title={t('lines.lavanda.title')}
      imageAlt={t('lines.lavanda.imageAlt')}
      imageSrc="/images/home/lavanda.jpg"
      variant={variant}
      slug="lavanda"
    />
  );
}
