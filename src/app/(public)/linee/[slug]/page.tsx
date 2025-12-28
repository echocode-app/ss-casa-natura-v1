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
import LeLineeNav from '@/components/sections/LeLinee/LeLineeNav';

interface LinePageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default function LinePage({ params }: LinePageProps) {
  const [line, setLine] = useState<LineConfigItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (!line) return <div>Linea non trovata</div>;

  return (
    <>
      <LineBannerSection title={line.title} backgroundSrc={line.heroImage} />

      <LeLineeNav currentLine={line.title} />

      <LineDescriptionSection
        imageSrc={line.productsImage}
        title={line.subtitle}
        subtitle={line.description || ''}
      />

      <LineProductsSection categoryId={line.categoryId} bgColor={line.bgColor} />

      <OtherLinesSection currentSlug={line.slug} />
    </>
  );
}
