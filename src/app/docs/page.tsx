'use client';

import { useTranslations } from 'next-intl';

export default function DocsPage() {
  const t = useTranslations('docs');
  const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deltagreen.it';
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold">{t('title')}</h1>
        <p className="mt-3 text-gray-600">{t('subtitle')}</p>
      </header>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">{t('sections.localAccess.title')}</h2>
        <p className="text-gray-700">{t('sections.localAccess.description')}</p>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`http://localhost:3000\nhttp://localhost:3000/admin\nhttp://localhost:3000/docs\nhttp://localhost:3000/docs/api\nhttp://localhost:3000/api/docs`}</code>
        </pre>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">{t('sections.prodAccess.title')}</h2>
        <p className="text-gray-700">{t('sections.prodAccess.description')}</p>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`${prodUrl}\n${prodUrl}/admin\n${prodUrl}/docs\n${prodUrl}/docs/api\n${prodUrl}/api/docs`}</code>
        </pre>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">{t('sections.env.title')}</h2>
        <p className="text-gray-700">{t('sections.env.description')}</p>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`# App
NEXT_PUBLIC_SITE_URL=
SITE_URL=

# MongoDB
MONGODB_URI=

# Auth
JWT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Mailchimp Marketing
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_LIST_ID=

# Mailchimp Transactional (Mandrill)
MAILCHIMP_TRANSACTIONAL_API_KEY=
MAILCHIMP_FROM_EMAIL=
`}</code>
        </pre>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">{t('sections.flows.title')}</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>{t('sections.flows.items.checkout')}</li>
          <li>{t('sections.flows.items.orders')}</li>
          <li>{t('sections.flows.items.promo')}</li>
          <li>{t('sections.flows.items.reset')}</li>
          <li>{t('sections.flows.items.admin')}</li>
          <li>{t('sections.flows.items.emailTemplates')}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('sections.diagnostics.title')}</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>{t('sections.diagnostics.items.permissions')}</li>
          <li>{t('sections.diagnostics.items.mailchimp')}</li>
          <li>{t('sections.diagnostics.items.stripe')}</li>
          <li>
            {t('sections.diagnostics.items.templates')} <code>{'{{name}}'}</code>,{' '}
            <code>{'{{orderId}}'}</code>, ecc.
          </li>
        </ul>
      </section>
    </main>
  );
}
