# Admin Panel Guide (EN)

## Overview
The admin panel allows authorized roles (developer, superadmin, admin) to manage content, orders, products, promotions, and system settings. Access to each section is role-based and can be restricted per admin.

## Roles
- **Developer**: Full access to all admin sections.
- **Superadmin**: Full access to all admin sections and can manage admin access rights.
- **Admin**: Access is limited to the sections assigned by the superadmin.

## Sections

### Dashboard
- Quick statistics: users, orders, top products, low stock, newsletter emails.
- Links to orders and products (visible only if access is granted).

### Emails
- Preview and edit **text only** for transactional emails.
- Each template is saved separately.
- Use placeholders like `{{name}}`, `{{orderId}}`, `{{products}}` in the text.
- Admin order notification template is also editable here.

### Orders
- View and manage orders.
- Search by email, name, checkout ID, or payment intent.
- Open a specific order to see full details.

### Products
- Create and edit products.
- Manage variants, prices, and stock.
- Validation is applied in real-time and on save.

### Hero Banners
- Manage main hero banners for the website.
- Upload images and set text/CTA.

### Promotions
- Configure the PromoBar (text, colors, link).
- Italian text is mandatory to enable the PromoBar.

### Contact Submissions
- Review contact form messages.

### Access Management
- Only **superadmin** can add or remove admin access.
- Maximum 3 admins.
- Developer and superadmin roles cannot be changed.
- Admin access is assigned by selecting allowed sections.

## Email Notifications
- Customers receive emails for registration, promo code, password reset, and order confirmation.
- Admin order notification email is sent to superadmin and admins with access to **Orders**.

## Email Template Editing
- Open **Admin → Email** to edit templates.
- Click the preview to start editing.
- Leave a field empty to use the default text from code.
- Placeholders must be kept exactly as shown (e.g. `{{name}}`).

## Notes
- If an admin sees “Access not available”, contact superadmin to assign sections.
- Changes to access permissions require the admin to refresh or re-login.
