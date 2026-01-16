# Pannello Admin — guida rapida

## Accesso
- Pagina di login: `/auth/login` (supporta `?redirect=/admin/...`).
- Area admin: `/admin`.

## Ruoli
- **developer**, **superadmin** — accesso completo.
- **admin** — accesso limitato (dipende dalla sezione).

## Navigazione
- **Dashboard** — statistiche generali.
- **Ordini** — elenco ordini e dettaglio ordine.
- **Prodotti** — gestione catalogo.

## Flusso tipico
- Apri `/admin` → se non sei loggato, verrai reindirizzato a `/auth/login?redirect=/admin`.
- Dopo l’accesso, usa la sidebar per navigare.

## Prodotti (catalogo)
- **Elenco**: ricerca + (opzionale) includi archiviati.
- **Crea**: `/admin/products/new`.
- **Modifica**: `/admin/products/[id]`.
- Campi obbligatori per salvare: **ID**, **Titolo**, **Slug**, **SKU**, **Descrizione**.
- **Archiviazione**: soft delete (il record resta in DB).

## Ordini
- Elenco + dettagli (articoli, totali, stati).

## Note
- Catalogo vetrina: base = prodotti mock, l’admin salva un **DB override** (DB sovrascrive i mock sullo stesso `id`).
- Se un prodotto non appare: verifica `archived`, `isAvailable` e `stock` (prodotto e/o varianti).
