'use client';

import {
  Lavanda,
  BrezzaMarina,
  AgrumiDiSicilia,
  FioreDiLoto,
  Marsiglia,
  Neutro,
} from '@/components/ui/LeLinee';
import { useTranslations } from 'next-intl';

export default function LeLineeSection({ variant = 'slider' }) {
  const t = useTranslations('linesSection');
  const isPage = variant === 'page';

  const lines = [
    { component: Lavanda, slug: 'lavanda' },
    { component: BrezzaMarina, slug: 'brezza-marina' },
    { component: AgrumiDiSicilia, slug: 'agrumi-di-sicilia' },
    { component: FioreDiLoto, slug: 'fiore-di-loto' },
    { component: Marsiglia, slug: 'marsiglia' },
    { component: Neutro, slug: 'neutro' },
  ];

  return (
    <section className="py-4 lg:py-6 pb-4 md:pb-6 xl:pb-12">
      <div
        className={`
          mx-auto
          md:max-w-[1570px]
          ${isPage ? 'px-1' : 'px-0'}
          md:px-8 lg:px-10 xl:px-12
        `}
      >
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-6 xl:mb-[50px]">{t('title')}</h2>

        <div
          className={
            isPage
              ? `
                grid grid-cols-2 gap-2
                md:gap-6
                lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6
              `
              : `
                grid grid-flow-col auto-cols-max gap-4
                overflow-x-auto pb-6
                md:grid-flow-row md:grid-cols-2 md:gap-6 md:overflow-visible
                lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6
              `
          }
        >
          {lines.map(({ component: LineComponent, slug }) => (
            <LineComponent key={slug} variant={variant} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
