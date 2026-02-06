# Admin Panel Guide (EN)

## Overview
The Admin panel is the control center for Casa Natura. It is designed for daily operations: catalog, stock, orders, shipping rules, promotions, banners, and contact requests.

## Roles & Access
- **Developer**: Full access to all sections (same as Superadmin).
- **Superadmin**: Full access + can manage admin permissions.
- **Admin**: Access limited to assigned sections.

Notes:
- If you see “Access not available”, ask the Superadmin to grant access.
- After permissions change, refresh the page or re‑login.

## Dashboard
Shows operational KPIs:
- Users (total + last 7/30 days)
- Orders (total + pending; week/month based on paid orders)
- Contact requests (total + new)
- Newsletter promo requests
- Top products (last 30 days)
- Low stock (<= 5)
- Integrations health

Use this page for quick checks before daily operations.

## Orders
Path: **Admin → Orders**

What you can do:
- Search by email, name, checkout ID, or payment intent.
- Filter by status (pending, paid, shipped, canceled).
- Open any order to see items, customer data, shipping, totals.
- Update status (changes appear in user account history).

Best practice:
- Move from `pending` to `paid` only after payment confirmation.
- Use `shipped` only when courier tracking is created.

## Products (Catalog)
Path: **Admin → Products**

### Create/Edit Product
Required:
- Title
- Description
- Category
- At least 1 image
- At least 1 variant

Each variant requires:
- ID (unique per product)
- Label
- Volume + unit
- Price
- **Weight (grams)**
- Stock + availability

### Best Seller
- Mark at least one variant as **Best Seller** to show product in homepage “Top Products”.

### Archive
- Deleting a product archives it (it won’t show in the store).

## Inventory & Stock
Stock is checked at:
- Add to cart
- Cart update
- Checkout

Low stock warnings:
- Dashboard shows variants with stock <= 5.
- Product card shows red border when any variant <= 5.

## Shipping (Superadmin/Developer only)
Path: **Admin → Shipping**

### Shipping formula
- **Tariffa per grammi (EUR)** = price per gram
- **Costo fisso (EUR)** = fixed fee added to every order
- **Spedizioni ricorrenti (EUR)** = fixed fee for recurring shipping

Shipping total:
```
shipping = (totalWeightGrams * tariffaPerGrammo) + fixedFee
```
Recurring shipping uses the recurring fee instead of the standard shipping fee.

Important:
- If any product variant has missing weight, shipping will be wrong.
- Only Superadmin/Developer can update shipping values.

## Hero Banners
Path: **Admin → Banners**

- Manage up to 6 active banners.
- Each banner supports Italian + English texts.
- Order is controlled by sort order.

## Promotions (Promo Bar)
Path: **Admin → Promotions**

- Italian text is required to enable Promo Bar.
- Link must be one of the allowed internal pages.
- Use for seasonal offers or campaigns.

## Emails (Templates)
Path: **Admin → Emails**

- Edit **text-only** templates (welcome, promo code, password reset, order confirmation, admin order notification).
- Leave a field empty to use default template.
- Keep placeholders intact: `{{name}}`, `{{orderId}}`, `{{products}}`.

## Contact Submissions
Path: **Admin → Submissions**

- View all messages from `/contatti`.
- Filter by status: new / resolved / rejected.

## Access Management (Superadmin only)
Path: **Admin → Access**

- Assign admin sections to a user by email.
- Max 3 admins.
- Developer/Superadmin roles cannot be changed.

## Common Issues
- **Shipping = 0** → missing weights or shipping settings.
- **Product not visible** → archived or not available.
- **Top Products empty** → no variant marked Best Seller.
- **Admin can’t see section** → access not granted.
