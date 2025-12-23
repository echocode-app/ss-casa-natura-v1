import LeLineeSection from '@/components/sections/LeLinee/LeLineeSection';
import MissionSection from '@/components/sections/Mission/MissionSection';

export default function LineePage() {
  return (
    <div className="pt-10 lg:pt-16">
      <h1 className="hidden">Le Linee</h1>
      <LeLineeSection variant="page" />
      <MissionSection />
    </div>
  );
}
