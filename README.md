# Casa Natura – Quick Start (Technical)

## Requirements
- Node.js 18+
- MongoDB

## Tech Stack
- Next.js 16 (App Router)
- React 18
- TypeScript
- MongoDB + Mongoose
- Stripe Payments
- Mailchimp (Marketing + Transactional)
- Cloudinary (media)
- Tailwind CSS

## Key Libraries
- `next`, `react`, `react-dom`
- `mongoose`
- `stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`
- `@mailchimp/mailchimp_marketing`, `@mailchimp/mailchimp_transactional`
- `cloudinary`, `next-cloudinary`
- `next-intl`
- `zod`
- `framer-motion`
- `swiper`
- `react-toastify`
- `swagger-jsdoc`, `swagger-ui-react` (Swagger UI via `swagger-ui-dist`)
- `jose`, `jsonwebtoken`, `cookie`

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Main URLs

- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Swagger JSON: `http://localhost:3000/api/docs`
- Swagger UI: `http://localhost:3000/docs/api`

- Production App: `https://www.deltagreen.it`
- Production Admin: `https://www.deltagreen.it/admin`
- Production Swagger JSON: `https://www.deltagreen.it/api/docs`
- Production Swagger UI: `https://www.deltagreen.it/docs/api`

## Build & Check
```bash
npm run check
```
