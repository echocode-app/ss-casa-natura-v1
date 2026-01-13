'use client';

import { useEffect } from 'react';
import type { SeoMetadata } from './types';

/**
 * Client-side SEO Head component for updating document metadata
 * Use this in client components where Next.js Metadata API is not available
 */
export function ClientSeoHead({ seo }: { seo: SeoMetadata }) {
  useEffect(() => {
    // Update document title
    document.title = seo.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seo.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seo.description;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seo.keywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = seo.keywords.join(', ');
      document.head.appendChild(meta);
    }

    // Update Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: seo.openGraph.title },
      { property: 'og:description', content: seo.openGraph.description },
      { property: 'og:image', content: seo.openGraph.image },
      { property: 'og:type', content: seo.openGraph.type },
      { property: 'og:url', content: seo.openGraph.url || '' },
    ];

    ogTags.forEach(({ property, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    });

    // Update Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: seo.twitter.card },
      { name: 'twitter:title', content: seo.twitter.title },
      { name: 'twitter:description', content: seo.twitter.description },
      { name: 'twitter:image', content: seo.twitter.image },
    ];

    twitterTags.forEach(({ name, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    });

    // Update canonical link
    if (seo.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (link) {
        link.href = seo.canonical;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = seo.canonical;
        document.head.appendChild(link);
      }
    }
  }, [seo]);

  return null;
}
