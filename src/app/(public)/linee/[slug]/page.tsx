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
import { useSmoothLoading } from '@/hooks/useSmoothLoading';
import { getSeoMeta, JsonLd, ClientSeoHead } from '@/lib/seo';

interface LinePageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default function LinePage({ params }: LinePageProps) {
  const [line, setLine] = useState<LineConfigItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedSlug, setResolvedSlug] = useState<string>('');
  const t = useTranslations('linee');
  const showSpinner = useSmoothLoading(loading, 150, 280);

  useEffect(() => {
    async function loadLine() {
      const resolvedParams = await Promise.resolve(params);
      const { slug } = resolvedParams;
      setResolvedSlug(slug);

      const foundLine = lineeConfig[slug] ?? null;
      setLine(foundLine);
      setLoading(false);
    }

    loadLine();
  }, [params]);

  if (showSpinner) return <FullscreenSpinner />;

  if (!line) return <div>{t('lineNotFound')}</div>;

  const seo = getSeoMeta({
    type: 'line',
    slug: resolvedSlug,
    title: line.title,
    image: line.heroImage,
    path: `/linee/${resolvedSlug}`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Linee', href: '/linee' },
      { label: line.title, href: `/linee/${resolvedSlug}` },
    ],
  });

  return (
    <>
      <ClientSeoHead seo={seo} />
      <JsonLd data={seo.structuredData} />
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
