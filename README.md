# ss-casa-natura-v1

Full-stack ecommerce project with public storefront and admin panel.  
Includes Stripe checkout + webhooks, Mailchimp Marketing + Transactional emails, JWT auth, and MongoDB storage.

## Key Features

- Product catalog with categories, subcategories, variants, stock and availability  
- Filtering, sorting, related + upsell products  
- Cart sync (guest → user), promo codes, shipping calculation  
- Stripe checkout + webhook order finalization  
- Transactional emails (welcome, promo code, reset password, order confirmation, admin order notice)  
- Admin panel: products, orders, banners, promotions, email templates, access management  
- Role-based access with per-section permissions  
- Contact form submissions + marketing opt‑ins (Mailchimp Marketing)  

## API (core)

### Products

- `GET /api/products` – get a list of products with optional category filter and sorting (`popularity` or `price`)  
- `GET /api/products/[slug]` – get a single product’s details, including promo/discounts, related products, and upsell products  
- `GET /api/products/[slug]/related` – get related products for a specific product  
- `GET /api/products/[slug]/upsell` – get products often bought together with the selected product  

### Orders & Checkout

- `POST /api/checkout/create` – create checkout + Stripe PaymentIntent  
- `POST /api/orders/webhook` – Stripe webhook finalize order  
- `GET /api/users/me/orders` – user order history

### Contact & Marketing

- `POST /api/contact` – send contact form submissions via Mailchimp  
- `POST /api/promocode/claim` – newsletter promo code flow  

### Admin Panel (protected)

- `GET /api/admin/*` – products, orders, banners, promotions, emails, access  
- `PUT /api/admin/site-settings` – PromoBar settings  
- `PUT /api/admin/email-templates` – save email texts

### User Account

- `POST /api/auth/register` – register a new user  
- `POST /api/auth/login` – login (JWT and cookie-based)  
- `POST /api/auth/forgot` – request reset password  
- `POST /api/auth/reset-password` – set new password  
- `GET /api/users/me` – get user profile  
- `PUT /api/users/me` – update profile  
- `POST /api/users/me/password` – change password  

## Product Features

- SEO: title, description, og:image  
- Price: original, promo, seasonal, fixed  
- Category + subcategory  
- Properties: weight, volume, color, composition  
- Availability / SKU  
- Popularity → sorting by sales  
- Recommendations: relatedProducts + upsellProducts  

## Technologies

- Next.js (App Router, Route Handlers)  
- MongoDB + Mongoose  
- Stripe (payments)  
- Mailchimp Marketing + Transactional (emails)  
- JWT & cookies for authentication  
- TypeScript  
- TailwindCSS for frontend  

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.*` based on `.env.example`.

3. Run the local development server:
```bash
npm run dev
```

4. Swagger API documentation:
```
http://localhost:3000/docs
http://localhost:3000/api/docs
```

## Pre-Deployment Checklist

### Code/Build
- Run `npm run typecheck`
- Run `npm run lint`
- Run `npm run build` (requires network access for Google Fonts)

### Core Flows
- Auth: register/login/logout, password reset flow
- Cart sync: guest → login/checkout
- Checkout + Stripe webhook finalizes orders
- Order confirmation email sent
- Admin order notification sent to superadmin + admins with Orders access
- Promo code flow (claim + apply)
- Admin access permissions per section (UI + API)

### Admin Content
- Banner Hero updates
- Promotions (PromoBar requires Italian text)
- Email templates editable (placeholders kept)

### External Services
- Stripe live keys + webhook secret in production
- Mailchimp Marketing + Transactional keys verified

### Production URLs
- https://www.deltagreen.it
- https://www.deltagreen.it/docs
- https://www.deltagreen.it/api/docs
