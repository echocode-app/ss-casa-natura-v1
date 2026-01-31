# Guida Pannello Admin (IT)

## Panoramica
Il pannello admin permette ai ruoli autorizzati (developer, superadmin, admin) di gestire contenuti, ordini, prodotti, promozioni e impostazioni di sistema. L’accesso alle sezioni è basato sui ruoli ed è limitabile per ogni admin.

## Ruoli
- **Developer**: Accesso completo a tutte le sezioni.
- **Superadmin**: Accesso completo e gestione dei permessi admin.
- **Admin**: Accesso solo alle sezioni assegnate dal superadmin.

## Sezioni

### Dashboard
- Statistiche rapide: utenti, ordini, top prodotti, scorte basse, email newsletter.
- Link a ordini e prodotti visibili solo se l’accesso è consentito.

### Email
- Anteprima e modifica **solo testo** delle email transazionali.
- Ogni template viene salvato separatamente.
- Usa placeholder come `{{name}}`, `{{orderId}}`, `{{products}}` nel testo.
- È editabile anche il template della notifica ordine admin.

### Ordini
- Visualizzazione e gestione ordini.
- Ricerca per email, nome, checkout ID o payment intent.
- Dettaglio completo dell’ordine.

### Prodotti
- Creazione e modifica prodotti.
- Gestione varianti, prezzi e stock.
- Validazione in tempo reale e al salvataggio.

### Banner Hero
- Gestione dei banner principali del sito.
- Upload immagini e testo/CTA.

### Promozioni
- Configurazione PromoBar (testo, colori, link).
- Il testo italiano è obbligatorio per l’attivazione.

### Richieste contatto
- Lettura dei messaggi inviati dal form contatto.

### Gestione accessi
- Solo **superadmin** può assegnare o revocare accessi admin.
- Massimo 3 admin.
- I ruoli developer e superadmin non sono modificabili.
- I permessi admin sono assegnati selezionando le sezioni consentite.

## Notifiche email
- I clienti ricevono email per registrazione, promo code, reset password e conferma ordine.
- L’email di notifica ordine admin viene inviata al superadmin e agli admin con accesso alla sezione **Ordini**.

## Modifica template email
- Apri **Admin → Email** per modificare i template.
- Clicca sull’anteprima per iniziare a modificare.
- Se un campo è vuoto viene usato il testo di default.
- I placeholder devono restare uguali (es. `{{name}}`).

## Note
- Se un admin vede “Accesso non disponibile”, deve chiedere al superadmin di assegnare le sezioni.
- Dopo la modifica dei permessi, è necessario ricaricare o rifare login.
