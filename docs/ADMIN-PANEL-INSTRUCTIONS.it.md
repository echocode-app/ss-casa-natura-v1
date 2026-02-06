# Guida Pannello Admin (IT)

## Panoramica
Il pannello Admin è il centro operativo di Casa Natura. Serve per catalogo, stock, ordini, regole di spedizione, promozioni, banner e richieste contatto.

## Ruoli & Accesso
- **Developer**: accesso completo a tutte le sezioni.
- **Superadmin**: accesso completo + gestione permessi admin.
- **Admin**: accesso limitato alle sezioni assegnate.

Note:
- Se compare “Accesso non disponibile”, chiedere al Superadmin.
- Dopo una modifica permessi, ricaricare o rifare login.

## Dashboard
Mostra KPI operativi:
- Utenti (totale + ultimi 7/30 giorni)
- Ordini (totale + pending; settimana/mese basati su ordini pagati)
- Richieste contatto (totali + nuove)
- Richieste promo newsletter
- Top prodotti (ultimi 30 giorni)
- Scorte basse (<= 5)
- Stato integrazioni

## Ordini
Percorso: **Admin → Ordini**

Cosa puoi fare:
- Cercare per email, nome, checkout ID o payment intent.
- Filtrare per stato (pending, paid, shipped, canceled).
- Aprire un ordine per dettagli completi.
- Aggiornare stato (visibile all’utente).

Best practice:
- `pending` → `paid` solo dopo conferma pagamento.
- `shipped` solo quando il corriere è attivo.

## Prodotti (Catalogo)
Percorso: **Admin → Prodotti**

### Creazione/Modifica
Obbligatori:
- Titolo
- Descrizione
- Categoria
- Almeno 1 immagine
- Almeno 1 variante

Ogni variante richiede:
- ID (unico per prodotto)
- Etichetta
- Volume + unità
- Prezzo
- **Peso (grammi)**
- Stock + disponibilità

### Best Seller
- Seleziona almeno una variante come **Best Seller** per mostrare il prodotto in homepage “Top Products”.

### Archivio
- Eliminare un prodotto lo archivia (non visibile nello shop).

## Inventario & Stock
Lo stock viene verificato in:
- Aggiunta al carrello
- Aggiornamento carrello
- Checkout

Avvisi scorte basse:
- Dashboard mostra varianti con stock <= 5.
- Card prodotto evidenzia in rosso se qualche variante <= 5.

## Spedizione (solo Superadmin/Developer)
Percorso: **Admin → Spedizione**

### Formula
- **Tariffa per grammi (EUR)** = prezzo per grammo
- **Costo fisso (EUR)** = quota fissa per ogni ordine
- **Spedizioni ricorrenti (EUR)** = quota fissa per spedizione ricorrente

Totale spedizione:
```
spedizione = (pesoTotaleGrammi * tariffaPerGrammo) + costoFisso
```
La spedizione ricorrente usa la sua quota fissa.

Importante:
- Se manca il peso in una variante, il calcolo sarà errato.
- Solo Superadmin/Developer possono modificare le tariffe.

## Banner Hero
Percorso: **Admin → Banners**

- Gestione fino a 6 banner attivi.
- Testi Italiano + Inglese.
- Ordinamento tramite “sort order”.

## Promozioni (Promo Bar)
Percorso: **Admin → Promozioni**

- Il testo italiano è obbligatorio per attivare la Promo Bar.
- Il link deve essere interno e tra quelli consentiti.

## Email (Template)
Percorso: **Admin → Email**

- Modifica **solo testo** dei template (welcome, promo code, reset password, conferma ordine, notifica ordine admin).
- Campo vuoto = usa testo di default.
- Mantieni i placeholder: `{{name}}`, `{{orderId}}`, `{{products}}`.

## Richieste Contatto
Percorso: **Admin → Submissions**

- Visualizza tutti i messaggi da `/contatti`.
- Filtra per stato: new / resolved / rejected.

## Gestione Accessi (solo Superadmin)
Percorso: **Admin → Access**

- Assegna sezioni admin a un utente tramite email.
- Massimo 3 admin.
- Ruoli Developer/Superadmin non modificabili.

## Problemi Comuni
- **Spedizione = 0** → pesi mancanti o tariffe non impostate.
- **Prodotto non visibile** → archivio o non disponibile.
- **Top Products vuoto** → nessuna variante Best Seller.
- **Admin senza sezione** → permessi non assegnati.
