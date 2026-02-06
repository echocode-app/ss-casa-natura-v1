# Casa Natura – Client Guide (EN)

This guide explains how to operate the Casa Natura store from a business perspective.

## Daily Operations
- Add/edit products and variants
- Update stock and availability
- Monitor orders and shipping costs
- Review contact messages
- Manage hero banners and promo text

## Products & Variants
### Required data
- Title
- Description
- Category
- At least 1 image
- At least 1 variant

Each variant requires:
- Label
- Volume + unit
- Price
- **Weight (grams)**
- Stock + availability

### Best Seller
- Mark **at least one variant** as Best Seller to show the product in “Top Products” on the homepage.

### Archive
- Archived products are hidden in the shop.

## Shipping (Admin → Shipping)
Values are used in checkout and shipping quote.
- **Tariffa per grammi (EUR)**: price per gram
- **Costo fisso (EUR)**: fixed fee added to every order
- **Spedizioni ricorrenti (EUR)**: fixed fee for recurring shipping

Formula:
```
shipping = (totalWeightGrams * tariffaPerGrammo) + fixedFee
```

If weight is missing, shipping will be incorrect.

## Checkout & Orders
- User adds items → shipping is calculated → payment with Stripe.
- After payment, order appears in Admin and in user account.
- Admin can update status (pending, paid, shipped, canceled).

## Promo Codes
- Users can request a promo code after newsletter subscription.
- Codes are single‑use and validated at checkout.

## Contact Messages
- Form submissions appear in **Admin → Submissions**.
- Status can be set to new/resolved/rejected.

## Email Templates
- Text only, editable in **Admin → Emails**.
- Keep placeholders: `{{name}}`, `{{orderId}}`, `{{products}}`.

## Common Issues
- **Shipping = 0** → missing weight or settings.
- **Top Products empty** → no Best Seller variant.
- **Product not visible** → archived or not available.

For new features or changes, contact your developer team.
