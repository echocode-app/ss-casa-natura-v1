# Casa Natura – Developer Documentation (EN)

## Stack
- Next.js App Router (Next 16)
- React 18
- MongoDB + Mongoose
- Stripe payments
- Mailchimp Marketing + Transactional (Mandrill)
- Cloudinary for images
- Tailwind CSS

## Environments
- Local: `http://localhost:3000`
- Admin: `/admin`
- Swagger JSON: `/api/docs`
- Swagger UI: `/docs/api`

## Quick Start
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts
- `npm run dev` – local dev
- `npm run check` – lint + typecheck + build
- `npm run build` – production build

## Required Environment Variables (core)
```
NEXT_PUBLIC_SITE_URL=
SITE_URL=
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_LIST_ID=
MAILCHIMP_TRANSACTIONAL_API_KEY=
MAILCHIMP_FROM_EMAIL=
```

## Project Structure
### Root
- `README.md` – quick start
- `DEPLOYMENT.md` – production checklist
- `docs/` – business and developer docs
- `.env.example` – reference env vars

### `src/app`
- App Router pages and layouts
- `src/app/(public)` – public pages (home, prodotti, linee, contatti, mission, policy)
- `src/app/(auth)` – auth pages
- `src/app/admin` – admin UI
- `src/app/docs` – documentation UI
- `src/app/api` – API routes (REST)

### `src/app/api`
- Public endpoints: products, cart, checkout, shipping, contact, promos
- Admin endpoints: catalog, orders, banners, settings, submissions
- Webhooks: Stripe

### `src/components`
- UI primitives, layout, sections, forms, admin widgets
- `sections/` contains homepage and product sections
- `layout/` contains header/footer

### `src/config`
- Static configuration: products, categories, filters, lines
- SEO configuration

### `src/contexts`
- React context providers (cart, auth, UI state)

### `src/helpers`
- Small helper utilities

### `src/hooks`
- Custom React hooks

### `src/i18n`
- Localization setup

### `src/lib`
- `auth/` – JWT, cookies, access control
- `db/` – Mongoose models
- `checkout/` – pricing, shipping, finalization
- `emailTemplates/` – transactional templates
- `mailchimp/` – subscribe + export
- `services/` – product service helpers
- `utils/` – shared helpers, validation, rate limit, logging

### `src/messages`
- Translation JSON files per locale

### `src/types`
- Shared TS types for API + UI

### `src/proxy.ts`
- Proxy/middleware compatibility logic (if used)

## Business Logic Summary
- **Catalog**: `CatalogProduct` is the source of truth.
- **Inventory**: per‑variant stock in `Inventory` with fallback to catalog stock.
- **Checkout**: cart → shipping quote → Stripe PaymentIntent → order record.
- **Shipping**: weight‑based per gram + fixed fee; recurring fee optional.
- **Promo codes**: issued after newsletter subscription; validated at checkout.

## Key Data Models
- `CatalogProduct`
- `Inventory`
- `Cart`
- `CheckoutDraft`
- `Order`
- `User`
- `HeroBanner`
- `SiteSettings`

## API Documentation
- JSON: `/api/docs`
- UI: `/docs/api`

## Troubleshooting
- Orders not visible → check Stripe webhook + order status.
- Shipping = 0 → missing weights or shipping settings.
- Admin access missing → role/sections not granted.
