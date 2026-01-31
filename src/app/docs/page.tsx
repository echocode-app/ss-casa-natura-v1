'use client';

export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold">Documentazione progetto</h1>
        <p className="mt-3 text-gray-600">
          Guida rapida per avvio locale, produzione e ambienti principali del progetto.
        </p>
      </header>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">Accesso locale</h2>
        <p className="text-gray-700">
          Avvia il progetto in locale con le variabili d’ambiente corrette e poi visita:
        </p>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`http://localhost:3000\nhttp://localhost:3000/admin\nhttp://localhost:3000/docs\nhttp://localhost:3000/api/docs`}</code>
        </pre>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">Accesso produzione</h2>
        <p className="text-gray-700">
          URL di produzione principali del progetto (sito e pannello admin):
        </p>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`https://www.deltagreen.it\nhttps://www.deltagreen.it/admin\nhttps://www.deltagreen.it/docs\nhttps://www.deltagreen.it/api/docs`}</code>
        </pre>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold">Ambiente e variabili richieste</h2>
        <p className="text-gray-700">
          Configura queste variabili per far funzionare tutte le feature principali.
        </p>
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
        <h2 className="text-xl font-semibold">Flussi principali</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Checkout con Stripe + webhook di pagamento.</li>
          <li>Ordini finalizzati via webhook e mail di conferma ordine.</li>
          <li>Promo code per iscrizione newsletter + mail con codice.</li>
          <li>Reset password: email con link e form di nuovo password su /account.</li>
          <li>Admin panel con accesso per ruolo e sezioni assegnate.</li>
          <li>Template email modificabili da Admin → Email (solo testo).</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Diagnostica rapida</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Se l’admin resta su spinner, controlla i permessi assegnati e ricarica sessione.</li>
          <li>Per email mancanti, verifica le variabili Mailchimp e il sender verificato.</li>
          <li>Per pagamenti, controlla i webhook Stripe e i log del server.</li>
          <li>
            Per modificare i testi email: usare Admin → Email e mantenere i placeholder{' '}
            <code>{'{{name}}'}</code>, <code>{'{{orderId}}'}</code>, ecc.
          </li>
        </ul>
      </section>
    </main>
  );
}
