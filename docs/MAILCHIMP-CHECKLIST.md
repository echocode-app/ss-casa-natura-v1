# Mailchimp Checklist (Casa Natura)

This checklist covers both Marketing (Audience) and Transactional (Mandrill) setup.

## 1) Environment Variables
Required in production:
- `MAILCHIMP_API_KEY` (Marketing)
- `MAILCHIMP_SERVER_PREFIX` (e.g. `us6`)
- `MAILCHIMP_LIST_ID` (Audience ID)
- `MAILCHIMP_TRANSACTIONAL_API_KEY` (Mandrill)
- `MAILCHIMP_FROM_EMAIL` (verified sender)
- `NEXT_PUBLIC_SITE_URL` (reset links)
- `SITE_URL` (fallback)
- `API_SECRET_KEY` (server-to-server for export + stats)

Optional:
- `CONTACT_EMAIL` (recipient for contact form emails)

## 2) Mailchimp Marketing (Audience)
1. Create an Audience.
2. Copy **Audience ID** → `MAILCHIMP_LIST_ID`.
3. Add Merge Field `SOURCE` (Text):
   - Audience → Settings → Audience fields and *|MERGE|* tags → Add field
   - Field tag: `SOURCE`
4. Enable Double Opt-In if required in your region.
5. Ensure API key is linked to the same account.

## 3) Mailchimp Transactional (Mandrill)
1. Activate Transactional and generate API key → `MAILCHIMP_TRANSACTIONAL_API_KEY`.
2. Verify sender domain + email:
   - Transactional → Domains (add domain)
   - Transactional → Senders (verify `MAILCHIMP_FROM_EMAIL`)
3. Add SPF/DKIM DNS records.
4. Send a test email from Mandrill UI.

## 4) Transactional Emails in the App
These are sent by the app (not by Mailchimp templates):
- Welcome email
- Promo code email
- Password reset
- Order confirmation
- Admin order notification

Text can be overridden in **Admin → Emails**.

## 5) Promo Code Workflow (Newsletter)
1. User requests promo code.
2. App subscribes to Mailchimp + stores email in DB.
3. App generates single‑use promo code.
4. Promo code is consumed after successful payment.

## 6) Export to Mailchimp (Admin)
Endpoints:
- `GET /api/mailchimp/stats` (Admin or Bearer `API_SECRET_KEY`)
- `POST /api/mailchimp/export` (Admin or Bearer `API_SECRET_KEY`)

Use case:
- Export DB emails to Mailchimp Audience in batch.

## 7) Quick Smoke Test
- Register → welcome email
- Request promo → promo email received
- Forgot password → reset link delivered
- Complete paid order → order confirmation
- Admin gets order notification

## 8) Troubleshooting
- **No emails sent** → check `MAILCHIMP_TRANSACTIONAL_API_KEY` + verified sender.
- **Export fails** → check `API_SECRET_KEY`, `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`.
- **Reset links wrong** → check `NEXT_PUBLIC_SITE_URL` / `SITE_URL`.
