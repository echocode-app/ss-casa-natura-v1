'use client';

import { useEffect, useState } from 'react';
import {
  LineDescriptionSection,
  LineProductsSection,
  OtherLinesSection,
} from '@/components/sections/LeLinee';
import { lineeConfig, LineConfigItem } from '@/lib/lineeConfig';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { LineBannerSection } from '@/components/sections/BannerSection';
import LeLineeBreadcrumbs from '@/components/sections/LeLinee/LeLineeBreadcrumbs';
import { useTranslations } from 'next-intl';

interface LinePageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default function LinePage({ params }: LinePageProps) {
  const [line, setLine] = useState<LineConfigItem | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('linee');

  useEffect(() => {
    async function loadLine() {
      const resolvedParams = await Promise.resolve(params);
      const { slug } = resolvedParams;

      const foundLine = lineeConfig[slug] ?? null;
      setLine(foundLine);
      setLoading(false);
    }

    loadLine();
  }, [params]);

  if (loading) return <FullscreenSpinner />;

  if (!line) return <div>{t('lineNotFound')}</div>;

  return (
    <>
      <LineBannerSection slug={line.slug} backgroundSrc={line.heroImage} />

      <LeLineeBreadcrumbs currentLine={line.title} />

      <LineDescriptionSection
        imageSrc={line.productsImage}
        title={line.subtitle}
        subtitle={line.description || ''}
      />

      <LineProductsSection lineSlug={line.slug} bgColor={line.bgColor} />

      <OtherLinesSection currentSlug={line.slug} />
    </>
  );
}
