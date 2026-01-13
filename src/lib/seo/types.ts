/**
 * SEO Types for Casa Natura
 *
 * Type definitions for the centralized SEO system
 */

export interface SeoContent {
  title: string;
  description: string;
  h1?: string;
  intro?: string;
  paragraphs?: string[];
}

export interface SeoMetadata {
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
  canonical?: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url?: string;
    type: 'website' | 'product' | 'article';
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  structuredData?: Record<string, any>;
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export type SeoPageType =
  | 'homepage'
  | 'category'
  | 'subcategory'
  | 'line'
  | 'product'
  | 'brand'
  | 'generic';

export interface GetSeoMetaOptions {
  type: SeoPageType;
  slug?: string;
  title?: string;
  description?: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
  path?: string;
}

export interface SeoConfigData {
  homepage: SeoContent;
  brand: SeoContent & { paragraphs: string[] };
  categories: Record<string, SeoContent>;
  subcategories: Record<string, SeoContent>;
  lines: Record<string, SeoContent>;
  templates: {
    category: SeoContent;
    subcategory: SeoContent;
    line: SeoContent;
  };
  keywords: {
    primary: string[];
    secondary: string[];
    long_tail: string[];
  };
  breadcrumb_labels: Record<string, string>;
  structured_data: {
    organization: Record<string, any>;
    product_template: Record<string, any>;
  };
}
