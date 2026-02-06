# Casa Natura – Документація для розробників (UA)

## Стек
- Next.js App Router (Next 16)
- React 18
- MongoDB + Mongoose
- Stripe платежі
- Mailchimp Marketing + Transactional (Mandrill)
- Cloudinary для зображень
- Tailwind CSS

## Середовища
- Local: `http://localhost:3000`
- Admin: `/admin`
- Swagger JSON: `/api/docs`
- Swagger UI: `/docs/api`

## Швидкий старт
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Скрипти
- `npm run dev` – розробка
- `npm run check` – lint + typecheck + build
- `npm run build` – продакшен збірка

## Основні змінні середовища
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

## Структура проєкту
### Root
- `README.md` – швидкий старт
- `DEPLOYMENT.md` – продакшен чекліст
- `docs/` – бізнес та девелоперська документація
- `.env.example` – приклад env

### `src/app`
- App Router сторінки й layout’и
- `src/app/(public)` – публічні сторінки
- `src/app/(auth)` – сторінки авторизації
- `src/app/admin` – адмінка
- `src/app/docs` – документація
- `src/app/api` – API маршрути

### `src/app/api`
- Публічні API: продукти, кошик, checkout, доставка, контакти
- Адмін API: каталог, замовлення, банери, налаштування
- Webhooks: Stripe

### `src/components`
- UI компоненти, layout, секції, форми
- `sections/` – секції головної сторінки
- `layout/` – header/footer

### `src/config`
- Конфіг: категорії, лінійки, фільтри
- SEO конфіги

### `src/contexts`
- React контексти (cart, auth, UI)

### `src/helpers`
- Допоміжні утиліти

### `src/hooks`
- Кастомні React хуки

### `src/i18n`
- Локалізація

### `src/lib`
- `auth/` – JWT, cookies, доступи
- `db/` – Mongoose моделі
- `checkout/` – прайсинг, доставка, фіналізація
- `emailTemplates/` – листи
- `mailchimp/` – підписки + експорт
- `services/` – сервіси
- `utils/` – допоміжні функції

### `src/messages`
- JSON локалізації

### `src/types`
- Типи TS для API та UI

### `src/proxy.ts`
- Логіка proxy/middleware

## Ключова бізнес‑логіка
- **Каталог**: `CatalogProduct` – головне джерело даних.
- **Інвентар**: окрема колекція `Inventory` для stock.
- **Checkout**: cart → доставка → Stripe → order.
- **Доставка**: тариф за грам + фіксована сума, опційна recurring.
- **Промокоди**: після підписки, перевірка в checkout.

## Основні моделі
- `CatalogProduct`
- `Inventory`
- `Cart`
- `CheckoutDraft`
- `Order`
- `User`
- `HeroBanner`
- `SiteSettings`

## API Документація
- JSON: `/api/docs`
- UI: `/docs/api`

## Troubleshooting
- Немає замовлень → перевір Stripe webhook.
- Доставка = 0 → ваги або налаштування.
- Немає доступу в адмінці → роль/секції.
