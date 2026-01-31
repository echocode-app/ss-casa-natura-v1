/**
 * SEO Engine for Casa Natura
 *
 * Central module for managing all SEO metadata across the site.
 * Reads from seo-content.json and provides typed helpers for pages.
 */

import seoConfigData from '@/config/seo/seo-content.json';
import type {
  SeoMetadata,
  GetSeoMetaOptions,
  SeoConfigData,
  BreadcrumbItem,
  SeoContent,
} from './types';

const seoConfig = seoConfigData as SeoConfigData;

const DEFAULT_IMAGE = '/images/home/hero.jpg';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deltagreen.it';

/**
 * Truncate text to max length while preserving word boundaries
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Get SEO content from config by type and slug
 */
function getSeoContent(type: string, slug?: string): SeoContent | null {
  switch (type) {
    case 'homepage':
      return seoConfig.homepage;

    case 'brand':
      return seoConfig.brand;

    case 'category':
      return slug ? seoConfig.categories[slug] || null : null;

    case 'subcategory':
      return slug ? seoConfig.subcategories[slug] || null : null;

    case 'line':
      return slug ? seoConfig.lines[slug] || null : null;

    default:
      return null;
  }
}

/**
 * Get template content and replace placeholders
 */
function getTemplateContent(type: 'category' | 'subcategory' | 'line', name: string): SeoContent {
  const template = seoConfig.templates[type];
  const placeholder =
    type === 'category'
      ? '{{categoryName}}'
      : type === 'subcategory'
        ? '{{subcategoryName}}'
        : '{{lineName}}';

  return {
    title: template.title.replace(placeholder, name),
    description: template.description.replace(placeholder, name),
    h1: template.h1?.replace(placeholder, name) || name,
    intro: template.intro?.replace(placeholder, name) || '',
  };
}

/**
 * Get fallback content
 */
function getFallbackContent(options: GetSeoMetaOptions): SeoContent {
  const { type, title } = options;

  // Try template if we have a name
  if (title && (type === 'category' || type === 'subcategory' || type === 'line')) {
    return getTemplateContent(type, title);
  }

  // Generic fallback
  return {
    title: `${title || 'Casa Natura'} - Prodotti Ecologici per la Casa`,
    description:
      "Scopri i prodotti ecologici Casa Natura: detersivi naturali e detergenti bio. Rispetta l'ambiente con ingredienti naturali.",
    h1: title || 'Casa Natura',
    intro: 'Prodotti ecologici per la pulizia della casa, formulati con ingredienti naturali.',
  };
}

/**
 * Generate structured data (JSON-LD)
 */
function generateStructuredData(
  type: string,
  content: SeoContent,
  options: GetSeoMetaOptions,
): Record<string, any> | undefined {
  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL;

  if (type === 'homepage') {
    return seoConfig.structured_data.organization;
  }

  // Breadcrumbs structured data
  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: options.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: crumb.href.startsWith('http') ? crumb.href : `${SITE_URL}${crumb.href}`,
      })),
    };
  }

  // Generic WebPage
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.title,
    description: content.description,
    url,
  };
}

/**
 * Main function to get complete SEO metadata for a page
 */
export function getSeoMeta(options: GetSeoMetaOptions): SeoMetadata {
  const { type, slug, image, breadcrumbs, path } = options;

  // Get content from config or fallback
  let content = getSeoContent(type, slug);
  if (!content) {
    content = getFallbackContent(options);
  }

  // Ensure title and description fit limits
  const title = truncate(content.title, 60);
  const description = truncate(content.description, 155);
  const h1 = content.h1 || title;
  const intro = content.intro || description;

  // Get keywords
  const keywords = [...seoConfig.keywords.primary, ...seoConfig.keywords.secondary.slice(0, 3)];

  // Determine image
  const ogImage = image || DEFAULT_IMAGE;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  // Canonical URL
  const canonical = path ? `${SITE_URL}${path}` : undefined;

  // Generate structured data
  const structuredData = generateStructuredData(type, content, options);

  return {
    title,
    description,
    h1,
    intro,
    keywords,
    canonical,
    openGraph: {
      title,
      description,
      image: fullImageUrl,
      url: canonical,
      type: type === 'product' ? 'product' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: fullImageUrl,
    },
    structuredData,
    breadcrumbs,
  };
}

/**
 * Get breadcrumb labels from config
 */
export function getBreadcrumbLabel(key: string): string {
  return seoConfig.breadcrumb_labels[key] || key;
}

/**
 * Build breadcrumbs for a page
 */
export function buildBreadcrumbs(
  segments: Array<{ label: string; href: string }>,
): BreadcrumbItem[] {
  const home: BreadcrumbItem = {
    label: getBreadcrumbLabel('home'),
    href: '/',
  };

  return [home, ...segments];
}

/**
 * Get keywords for meta tag
 */
export function getKeywords(_type?: string): string[] {
  return [...seoConfig.keywords.primary, ...seoConfig.keywords.secondary];
}

/**
 * Export config for direct access if needed
 */
export { seoConfig };
