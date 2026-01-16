# Admin Panel — quick guide

## Access
- Login page: `/auth/login` (supports `?redirect=/admin/...`).
- Admin area: `/admin`.

## Roles
- **developer**, **superadmin** — full access.
- **admin** — limited access (depends on the section).

## Navigation
- **Dashboard** — high-level stats.
- **Ordini** — orders list and order details.
- **Prodotti** — catalog management.

## Typical flow
- Open `/admin` → if not logged in you’ll be redirected to `/auth/login?redirect=/admin`.
- After login, use the sidebar to navigate.

## Prodotti (catalog)
- **List**: search + (optional) include archived.
- **Create**: `/admin/products/new`.
- **Edit**: `/admin/products/[id]`.
- Required fields to save: **ID**, **Titolo**, **Slug**, **SKU**, **Descrizione**.
- **Archive**: soft delete (record stays in DB).

## Orders
- List + details (items, totals, statuses).

## Notes
- Storefront catalog: base = mock products, admin saves a **DB override** (DB overrides mock by the same `id`).
- If a product doesn’t show: check `archived`, `isAvailable` and `stock` (product and/or variants).
