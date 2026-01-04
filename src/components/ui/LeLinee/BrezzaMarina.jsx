// Brezza marina - 2
import LeLineeItem from './LeLineeItem';
import { useTranslations } from 'next-intl';

export default function BrezzaMarina({ variant }) {
  const t = useTranslations('linesSection');
  return (
    <LeLineeItem
      title={t('lines.brezza-marina.title')}
      imageAlt={t('lines.brezza-marina.imageAlt')}
      imageSrc="/images/home/brezza-marina.jpg"
      variant={variant}
      loading="eager"
      slug="brezza-marina"
    />
  );
}
