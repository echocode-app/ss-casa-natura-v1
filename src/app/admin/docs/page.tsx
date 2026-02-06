'use client';

import AdminCard from '@/components/admin/AdminCard';

export default function AdminDocsPage() {
  const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deltagreen.it';
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Documentazione</h1>
        <p className="text-gray-600 mt-1">Sezione riservata a superadmin e developer.</p>
      </div>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Link documentazione progetto</h2>
        <div className="text-sm text-gray-700">Produzione:</div>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`${prodUrl}/docs`}</code>
        </pre>
        <div className="text-sm text-gray-700">Swagger API:</div>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`${prodUrl}/api/docs`}</code>
        </pre>
        <div className="text-sm text-gray-700">Swagger UI:</div>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`${prodUrl}/docs/api`}</code>
        </pre>
      </AdminCard>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Panoramica progetto</h2>
        <p className="text-gray-700 leading-relaxed">
          Il progetto gestisce un e-commerce con checkout Stripe, gestione ordini, promozioni e
          contenuti aggiornabili da admin. La maggior parte dei contenuti (banner, promozioni, testi
          email) è configurabile dal pannello admin.
        </p>
        <p className="text-gray-700 leading-relaxed">
          I dati prodotti, stock e ordini sono in MongoDB. Le email transazionali sono inviate via
          Mailchimp Transactional. Le iscrizioni marketing vengono sincronizzate con Mailchimp
          Marketing.
        </p>
      </AdminCard>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Guida uso admin panel</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>
            <strong>Dashboard:</strong> statistiche principali e accessi rapidi a ordini/prodotti.
          </li>
          <li>
            <strong>Ordini:</strong> elenco completo, ricerca e dettaglio ordine.
          </li>
          <li>
            <strong>Prodotti:</strong> crea/modifica prodotti, varianti, stock e visibilità.
          </li>
          <li>
            <strong>Banner Hero:</strong> aggiorna i banner della home e delle sezioni.
          </li>
          <li>
            <strong>Promozioni:</strong> configura PromoBar e testi promozionali.
          </li>
          <li>
            <strong>Email:</strong> modifica i testi delle email transazionali (solo testo) usando i
            placeholder tipo <code>{`{{name}}`}</code>.
          </li>
          <li>
            <strong>Richieste contatto:</strong> messaggi ricevuti dal form contatti.
          </li>
          <li>
            <strong>Gestione accessi:</strong> superadmin assegna le sezioni accessibili agli admin.
          </li>
        </ul>
      </AdminCard>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Come si aggiorna il contenuto</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Banner: caricamento immagini e testi in “Banner Hero”.</li>
          <li>Promozioni: testi/colore/link nella sezione “Promozioni”.</li>
          <li>Email: testi in “Email”, con salvataggio per singolo template.</li>
          <li>Prodotti: catalogo e scorte in “Prodotti”.</li>
        </ul>
      </AdminCard>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Spedizione: guida e verifica</h2>
        <p className="text-gray-700 leading-relaxed">
          La spedizione è calcolata automaticamente in base al peso totale delle varianti nel
          carrello e ai parametri configurati in Admin &gt; Spedizione. La formula resta interna e
          non è mostrata ai clienti.
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>
            Imposta “Tariffa per grammi (EUR)” per definire il costo per ogni grammo di peso totale.
          </li>
          <li>
            Imposta “Costo fisso (EUR)” per una quota fissa per ordine (attualmente può restare 0).
          </li>
          <li>
            Imposta “Spedizioni ricorrenti (EUR)” per il costo fisso della spedizione ricorrente.
          </li>
          <li>
            Verifica che ogni variante prodotto abbia un peso corretto in grammi: è usato per il
            calcolo.
          </li>
          <li>Salva e ricarica la pagina per confermare che i valori siano persistenti.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          Verifica rapida: aggiungi prodotti al carrello, vai al checkout e controlla che il totale
          di spedizione cambi in modo coerente al variare del peso complessivo.
        </p>
      </AdminCard>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Possibili problemi</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Se un admin vede “Accesso non disponibile”, mancano permessi assegnati.</li>
          <li>Se le email non arrivano, controllare variabili Mailchimp e sender verificato.</li>
          <li>Se il checkout non conferma ordini, verificare webhook Stripe.</li>
          <li>Se il contenuto non si aggiorna, ricaricare la pagina o rifare login.</li>
        </ul>
      </AdminCard>

      <AdminCard className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Contatti</h2>
        <p className="text-gray-700 leading-relaxed">
          Per qualsiasi domanda tecnica o supporto, contatta la developer su Telegram:
        </p>
        <pre className="rounded-xl bg-black/90 p-4 text-sm text-white overflow-auto">
          <code>{`https://t.me/anna_kotli`}</code>
        </pre>
      </AdminCard>
    </div>
  );
}
