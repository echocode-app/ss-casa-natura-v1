'use client';

import dynamic from 'next/dynamic';

const GreenProductionSection = dynamic(
  () => import('@/components/sections/GreenProduction').then((m) => m.GreenProductionSection),
  { ssr: false, loading: () => null },
);
const MissionSection = dynamic(
  () => import('@/components/sections/Mission').then((m) => m.MissionSection),
  { ssr: false, loading: () => null },
);
const PromocodeSection = dynamic(
  () => import('@/components/sections/Promocode').then((m) => m.PromocodeSection),
  { ssr: false, loading: () => null },
);

export default function HomeLazySections() {
  return (
    <>
      <GreenProductionSection />
      <MissionSection />
      <PromocodeSection />
    </>
  );
}
