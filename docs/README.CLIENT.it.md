# Casa Natura – Guida Cliente (IT)

Questa guida spiega come gestire lo store Casa Natura dal punto di vista business.

## Operazioni quotidiane
- Creare/modificare prodotti e varianti
- Aggiornare stock e disponibilità
- Monitorare ordini e costi di spedizione
- Gestire messaggi di contatto
- Aggiornare banner hero e testo promo

## Prodotti & Varianti
### Dati richiesti
- Titolo
- Descrizione
- Categoria
- Almeno 1 immagine
- Almeno 1 variante

Ogni variante richiede:
- Etichetta
- Volume + unità
- Prezzo
- **Peso (grammi)**
- Stock + disponibilità

### Best Seller
- Marca **almeno una variante** come Best Seller per mostrare il prodotto in “Top Products” in homepage.

### Archivio
- I prodotti archiviati non appaiono nello shop.

## Spedizione (Admin → Spedizione)
Valori usati in checkout e preventivo.
- **Tariffa per grammi (EUR)**: prezzo per grammo
- **Costo fisso (EUR)**: quota fissa per ordine
- **Spedizioni ricorrenti (EUR)**: quota fissa per spedizione ricorrente

Formula:
```
spedizione = (pesoTotaleGrammi * tariffaPerGrammo) + costoFisso
```

Se manca il peso, la spedizione sarà errata.

## Checkout & Ordini
- Utente aggiunge prodotti → calcolo spedizione → pagamento Stripe.
- Dopo il pagamento, l’ordine appare in Admin e nell’account utente.
- L’admin può cambiare stato (pending, paid, shipped, canceled).

## Promo Code
- L’utente riceve un promo code dopo iscrizione newsletter.
- Codici monouso, validati in checkout.

## Contatti
- I messaggi del form contatti appaiono in **Admin → Submissions**.
- Stato: new / resolved / rejected.

## Template Email
- Solo testo, modificabili in **Admin → Emails**.
- Mantieni i placeholder: `{{name}}`, `{{orderId}}`, `{{products}}`.

## Problemi comuni
- **Spedizione = 0** → peso mancante o tariffe non impostate.
- **Top Products vuoto** → nessuna variante Best Seller.
- **Prodotto non visibile** → archivio o non disponibile.

Per nuove funzionalità o modifiche, contatta il team di sviluppo.
