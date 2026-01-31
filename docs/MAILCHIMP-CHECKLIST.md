# Mailchimp Checklist

## 1) Environment variables
- `MAILCHIMP_API_KEY` (Marketing API key)
- `MAILCHIMP_SERVER_PREFIX` (e.g. `us6`)
- `MAILCHIMP_LIST_ID` (Audience ID)
- `MAILCHIMP_TRANSACTIONAL_API_KEY` (Mailchimp Transactional / Mandrill key)
- `MAILCHIMP_FROM_EMAIL` (verified sender address)
- `NEXT_PUBLIC_SITE_URL` (base URL used in reset password links)
 - `SITE_URL` (fallback base URL if needed)

## 2) Mailchimp Marketing (Audience)
- Create an Audience for newsletter/marketing emails.
- Enable double opt‑in if legally required for your region.
- Add merge field `SOURCE` (text) if you want to track `register / checkout / promocode` sources.
- Confirm API key has access to the correct account and audience.

## 3) Mailchimp Transactional (Mandrill)
- Activate Mailchimp Transactional and generate the API key.
- Verify the sending domain and the `MAILCHIMP_FROM_EMAIL` address.
- Ensure SPF/DKIM records are added for your domain.

## 4) Transactional emails handled by code
These are sent directly by the app (no Mailchimp templates needed):
- Welcome email (registration)
- Promo code email (after promo code issued)
- Password reset email (forgot password flow)
- Order confirmation email (after successful checkout)
 - Admin order notification email (superadmin + admins with Orders access)

Note: text of these emails can be edited in **Admin → Email**, but dynamic variables stay in code.

## 5) Optional: Marketing automation in Mailchimp
- Create automations / campaigns inside Mailchimp for newsletters.
- Filter contacts by the `SOURCE` merge field if needed.
- The app only subscribes users; marketing content is managed in Mailchimp.

## 6) Quick smoke test
- Register a new user and confirm welcome email is delivered.
- Request promo code and confirm promo email + code is delivered.
- Use “Forgot password” and confirm reset link works.
- Complete a test order and confirm order confirmation email is delivered.
 - Confirm admin order notification is delivered to the correct roles.
