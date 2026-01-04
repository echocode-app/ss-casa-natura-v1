import LeLineeSection from '@/components/sections/LeLinee/LeLineeSection';
import MissionSection from '@/components/sections/Mission/MissionSection';
import { useTranslations } from 'next-intl';

export default function LineePage() {
  const t = useTranslations('linee');
  return (
    <div className="pt-10 lg:pt-16">
      <h1 className="sr-only">{t('linesSection.title')}</h1>
      <LeLineeSection variant="page" />
      <MissionSection />
    </div>
  );
}
