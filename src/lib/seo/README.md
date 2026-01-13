# SEO System Documentation - Casa Natura

## Overview

The SEO system for Casa Natura is a centralized, production-grade solution that manages all SEO metadata across the site. It reads from `src/config/seo/seo-content.json` and provides typed helpers for automatic SEO metadata generation.

## Architecture

```
src/lib/seo/
├── index.ts              # Main export point
├── types.ts              # TypeScript type definitions
├── engine.ts             # Core SEO logic and helpers
├── components.tsx        # React components for SEO
└── ClientSeoHead.tsx     # Client-side metadata updater
```

## Key Features

✅ **Centralized Content**: All SEO strings in `seo-content.json`
✅ **Type Safety**: Full TypeScript support
✅ **Automatic Metadata**: Title, description, OG, Twitter cards
✅ **JSON-LD Support**: Structured data for search engines
✅ **Fallback System**: Template → specific → generic
✅ **Character Limits**: Auto-truncate titles (≤60) and descriptions (≤155)
✅ **Client & Server**: Works in both Next.js environments

## Usage

### Server Components (Recommended)

```tsx
import { getSeoMeta, generateMetadata, JsonLd } from '@/lib/seo';
import type { Metadata } from 'next';

// Generate Next.js Metadata
export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMeta({
    type: 'homepage',
    path: '/',
  });

  return generateMetadata(seo);
}

// In component
export default function Page() {
  const seo = getSeoMeta({
    type: 'homepage',
    path: '/',
  });

  return (
    <>
      <JsonLd data={seo.structuredData} />
      <main>
        {/* Your content */}
      </main>
    </>
  );
}
```

### Client Components

```tsx
'use client';

import { getSeoMeta, JsonLd, ClientSeoHead } from '@/lib/seo';

export default function ClientPage() {
  const seo = getSeoMeta({
    type: 'category',
    slug: 'bucato',
    path: '/prodotti?category=bucato',
  });

  return (
    <>
      <ClientSeoHead seo={seo} />
      <JsonLd data={seo.structuredData} />
      <main>
        {/* Your content */}
      </main>
    </>
  );
}
```

## API Reference

### `getSeoMeta(options)`

Main function to get SEO metadata for a page.

**Parameters:**

```typescript
interface GetSeoMetaOptions {
  type: 'homepage' | 'category' | 'subcategory' | 'line' | 'product' | 'brand' | 'generic';
  slug?: string;              // Entity slug (e.g., 'bucato', 'lavanda')
  title?: string;             // Custom title override
  description?: string;       // Custom description override
  image?: string;             // Custom OG image
  breadcrumbs?: BreadcrumbItem[];
  path?: string;              // Current page path for canonical URL
}
```

**Returns:**

```typescript
interface SeoMetadata {
  title: string;              // Page title (≤60 chars)
  description: string;        // Meta description (≤155 chars)
  h1: string;                 // Main heading
  intro: string;              // Intro paragraph
  keywords: string[];         // Meta keywords
  canonical?: string;         // Canonical URL
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
  structuredData?: object;    // JSON-LD structured data
  breadcrumbs?: BreadcrumbItem[];
}
```

### `buildBreadcrumbs(segments)`

Build breadcrumb trail with home link.

```typescript
const breadcrumbs = buildBreadcrumbs([
  { label: 'Prodotti', href: '/prodotti' },
  { label: 'Bucato', href: '/prodotti?category=bucato' },
]);
```

### Components

#### `<JsonLd data={structuredData} />`

Renders JSON-LD structured data for search engines.

```tsx
<JsonLd data={seo.structuredData} />
```

#### `<ClientSeoHead seo={seo} />`

Client-side component that updates document metadata (title, meta tags, OG tags).

```tsx
<ClientSeoHead seo={seo} />
```

#### `<SeoIntro text={seo.intro} />`

Renders SEO intro text with proper styling.

```tsx
<SeoIntro text={seo.intro} className="mb-8" />
```

#### `<SeoH1>{seo.h1}</SeoH1>`

Renders H1 with SEO considerations.

```tsx
<SeoH1 className="text-4xl">{seo.h1}</SeoH1>
```

## Page Type Examples

### Homepage

```tsx
const seo = getSeoMeta({
  type: 'homepage',
  path: '/',
});
```

### Category Page

```tsx
const seo = getSeoMeta({
  type: 'category',
  slug: 'bucato',  // or 'cucina', 'pulizia'
  path: '/prodotti?category=bucato',
});
```

### Subcategory Page

```tsx
const seo = getSeoMeta({
  type: 'subcategory',
  slug: 'detersivi-piatti',
  path: '/prodotti?subcategory=detersivi-piatti',
});
```

### Product Line Page

```tsx
const seo = getSeoMeta({
  type: 'line',
  slug: 'lavanda',  // or 'brezza-marina', 'agrumi-di-sicilia', etc.
  title: 'Lavanda',
  image: '/images/lines/lavanda.jpg',
  path: '/linee/lavanda',
  breadcrumbs: buildBreadcrumbs([
    { label: 'Linee', href: '/linee' },
    { label: 'Lavanda', href: '/linee/lavanda' },
  ]),
});
```

### Brand Page

```tsx
const seo = getSeoMeta({
  type: 'brand',
  path: '/mission',
});
```

## Fallback System

The SEO engine has a 3-level fallback system:

1. **Specific Content**: Exact match in `seo-content.json` (e.g., `categories.bucato`)
2. **Template**: Uses template with name replacement (e.g., `templates.category`)
3. **Generic**: Falls back to generic Casa Natura content

Example:

```typescript
// 1. Tries: seoConfig.categories['bucato']
// 2. Falls back to: template.category with 'Bucato' replacement
// 3. Falls back to: generic homepage content

getSeoMeta({ type: 'category', slug: 'bucato', title: 'Bucato' });
```

## Adding New Content

### Add a New Category

Edit `src/config/seo/seo-content.json`:

```json
{
  "categories": {
    "new-category": {
      "title": "New Category | Casa Natura",
      "description": "Description for new category...",
      "h1": "New Category Products",
      "intro": "Introduction text..."
    }
  }
}
```

### Add a New Line

```json
{
  "lines": {
    "new-line": {
      "title": "Linea New Line | Casa Natura",
      "description": "Description for new line...",
      "h1": "New Line - Natural Fragrance",
      "intro": "Introduction for new line..."
    }
  }
}
```

## Environment Variables

Set in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://casanatura.it
```

## Best Practices

1. **Always use `getSeoMeta()`** - Never hardcode SEO strings in components
2. **Include breadcrumbs** for better UX and SEO
3. **Use canonical URLs** to avoid duplicate content
4. **Add JSON-LD** on all public pages
5. **Test OG tags** with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
6. **Test Twitter cards** with [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Validation

All titles and descriptions are automatically validated:

- **Titles**: Max 60 characters (truncated with "..." if longer)
- **Descriptions**: Max 155 characters (truncated with "..." if longer)

## Future Enhancements

- [ ] Multi-language support (en, de, fr)
- [ ] Product-level SEO metadata
- [ ] Dynamic OG image generation
- [ ] Sitemap generation
- [ ] robots.txt automation
- [ ] Schema.org Product markup for individual products
- [ ] FAQ schema for category pages
- [ ] Review schema integration

## Troubleshooting

### "Cannot read properties of undefined"

Make sure the slug exists in `seo-content.json` or provide a fallback `title`:

```tsx
getSeoMeta({ type: 'category', slug: 'unknown', title: 'Fallback Name' });
```

### SEO metadata not updating in browser

For client components, ensure `<ClientSeoHead />` is rendered:

```tsx
<ClientSeoHead seo={seo} />
```

### JSON-LD not showing in Google Search Console

1. Verify JSON is valid using [Schema Validator](https://validator.schema.org/)
2. Check `<JsonLd />` component is rendered
3. Wait 24-48h for Google to re-crawl

## Support

For issues or questions, check:
- `src/lib/seo/README.md` (this file)
- `src/config/seo/seo-content.json` (content source)
- Next.js Metadata API docs: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
