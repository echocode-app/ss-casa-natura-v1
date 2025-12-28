import { GreenBackground } from '@/components/ui/Parts';
import Mission from './Mission';

export default function MissionSection() {
  return (
    <section className="py-16 xl:py-20 relative overflow-x-hidden">
      <GreenBackground />
      <div className="relative z-10 mx-auto max-w-[1570px] px-6 md:px-10 xl:px-12">
        <Mission />
      </div>
    </section>
  );
}
