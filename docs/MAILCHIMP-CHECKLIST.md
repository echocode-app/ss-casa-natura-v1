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
1) Create an Audience for newsletter/marketing emails.
2) Copy Audience ID:
   - Audience → Settings → Audience name and defaults → Audience ID (`MAILCHIMP_LIST_ID`)
3) Enable double opt‑in if legally required for your region.
4) Add merge field `SOURCE` (Text):
   - Audience → Settings → Audience fields and *|MERGE|* tags → Add field
   - Field tag: `SOURCE`
5) Confirm API key has access to the correct account and audience.

## 3) Mailchimp Transactional (Mandrill)
1) Activate Mailchimp Transactional (Mandrill) and generate API key:
   - Transactional → Settings → API Keys → Create key (`MAILCHIMP_TRANSACTIONAL_API_KEY`)
2) Verify sending domain and sender address:
   - Transactional → Domains → Add domain
   - Transactional → Senders → Verify `MAILCHIMP_FROM_EMAIL`
3) Add SPF/DKIM DNS records from Mailchimp to your domain.
4) Send a test email from Transactional → Outbound → Senders to confirm delivery.

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
1) Register a new user → welcome email delivered.
2) Request promo code → promo email + code delivered.
3) Use “Forgot password” → reset email with link delivered.
4) Complete a test order → order confirmation delivered.
5) Confirm admin order notification delivered to superadmin + admins with Orders access.
