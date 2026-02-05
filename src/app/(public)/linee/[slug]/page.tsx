import {
  LineDescriptionSection,
  LineProductsSection,
  OtherLinesSection,
} from '@/components/sections/LeLinee';
import { lineeConfig, LineConfigItem } from '@/lib/lineeConfig';
import { LineBannerSection } from '@/components/sections/BannerSection';
import LeLineeBreadcrumbs from '@/components/sections/LeLinee/LeLineeBreadcrumbs';
import { getSeoMeta, JsonLd, ClientSeoHead } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

interface LinePageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default async function LinePage({ params }: LinePageProps) {
  const resolvedParams =
    params && typeof (params as any).then === 'function' ? await (params as any) : params;
  const slug = resolvedParams?.slug;
  const line: LineConfigItem | null = slug ? (lineeConfig[slug] ?? null) : null;
  const t = await getTranslations('linee');

  if (!line) return <div>{t('lineNotFound')}</div>;

  const seo = getSeoMeta({
    type: 'line',
    slug: slug,
    title: line.title,
    image: line.heroImage,
    path: `/linee/${slug}`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Linee', href: '/linee' },
      { label: line.title, href: `/linee/${slug}` },
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
