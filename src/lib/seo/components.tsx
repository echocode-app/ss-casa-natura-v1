/**
 * SEO Components for Casa Natura
 *
 * React components for rendering SEO metadata
 */

import { Metadata } from 'next';
import { SeoMetadata } from './types';

/**
 * Generate Next.js Metadata object from SeoMetadata
 */
export function generateMetadata(seo: SeoMetadata): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      images: [{ url: seo.openGraph.image }],
      url: seo.openGraph.url,
      type: seo.openGraph.type as 'website',
      siteName: 'Casa Natura',
      locale: 'it_IT',
    },
    twitter: {
      card: seo.twitter.card,
      title: seo.twitter.title,
      description: seo.twitter.description,
      images: [seo.twitter.image],
    },
    alternates: {
      canonical: seo.canonical,
    },
  };
}

/**
 * Component for rendering JSON-LD structured data
 */
export function JsonLd({ data }: { data: Record<string, any> | undefined }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

/**
 * Component for rendering SEO intro text
 */
export function SeoIntro({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  return (
    <div className={`seo-intro text-lg text-gray-700 leading-relaxed ${className}`}>
      <p>{text}</p>
    </div>
  );
}

/**
 * Component for rendering H1 with SEO considerations
 */
export function SeoH1({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h1 className={`seo-h1 ${className}`}>{children}</h1>;
}
