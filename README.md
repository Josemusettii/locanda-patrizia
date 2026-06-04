# Locanda Patrizia

Sito React/Vite della Locanda Patrizia con menu centrale collegato a Supabase.

## Menu Centrale

Il menu è pensato come unica sorgente dati:

```text
Supabase menu -> /menu pubblico -> /admin/menu-stampa PDF
```

In futuro il flusso potrà diventare:

```text
WhatsApp -> Supabase Edge Function -> Supabase menu -> sito + stampa PDF aggiornati
```

L'automazione WhatsApp è gestita dalla funzione Supabase `menu-whatsapp`.

## Variabili Ambiente

Crea un file `.env` locale e aggiungi:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_MENU_PASSWORD=
```

Su Vercel inserisci le stesse variabili in:

```text
Project Settings -> Environment Variables
```

## Supabase

1. Crea un progetto Supabase.
2. Apri SQL Editor.
3. Esegui il file:

```text
supabase/menu.sql
```

La tabella creata è `public.menu`:

```text
id uuid
categoria text
nome text
descrizione text
prezzo numeric
disponibile boolean
ordine integer
created_at timestamptz
```

Categorie previste:

```text
antipasti
primi
secondi
dolci
vini
```

Il sito mostra solo le righe con `disponibile = true`.

## Pagine

`/menu`

Pagina pubblica per i clienti. Mostra il menu online, senza pulsante stampa/PDF.

`/admin/menu-stampa`

Pagina privata per il titolare. Chiede la password impostata in `VITE_ADMIN_MENU_PASSWORD` e poi mostra il menu A4 con pulsante `Stampa / Salva PDF`.

## Fallback

Se Supabase non è configurato, il sito usa un menu locale di fallback in:

```text
src/lib/fallbackMenu.js
```

Questo evita che `/menu` risulti vuota durante sviluppo o prima della configurazione Supabase.

## Struttura Menu

```text
src/lib/supabaseClient.js
src/lib/menuService.js
src/lib/menuConfig.js
src/lib/fallbackMenu.js
src/hooks/useMenuItems.js
src/components/menu/MenuCard.jsx
src/components/menu/MenuSection.jsx
src/components/menu/MenuStatus.jsx
src/pages/MenuPrintPage.jsx
```

`menuService.js` è il punto centrale per leggere il database. In futuro qui si potrà aggiungere realtime Supabase.

## Futuro WhatsApp

La funzione `menu-whatsapp` accetta comandi tipo:

```text
aggiungi Vermentino 22 ai vini
nascondi Polpo
cambia prezzo Ravioli 16
mostra Polpo
aggiungi Lingua 18 agli antipasti descrizione: Con salsa verde
```

La funzione aggiorna direttamente la tabella `public.menu`, quindi `/menu` e `/admin/menu-stampa` leggono sempre il menu aggiornato.

### Setup Supabase WhatsApp

Esegui anche:

```text
supabase/whatsapp-menu-automation.sql
```

Serve per creare `public.menu_command_log`, cioè lo storico dei messaggi ricevuti e delle modifiche fatte.

La funzione Supabase è in:

```text
supabase/functions/menu-whatsapp/index.ts
```

Segreti server da configurare su Supabase:

```env
MENU_WEBHOOK_SECRET=
WHATSAPP_VERIFY_TOKEN=
```

`MENU_WEBHOOK_SECRET` protegge il webhook. Non metterlo nel frontend e non committarlo.

Endpoint:

```text
https://ubrhytaogxwtetihrlyl.supabase.co/functions/v1/menu-whatsapp?secret=IL_TUO_SECRET
```

Test veloce:

```bash
curl -X POST "https://ubrhytaogxwtetihrlyl.supabase.co/functions/v1/menu-whatsapp?secret=IL_TUO_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"message":"cambia prezzo Uovo al Purgatorio 12","from":"test"}'
```

### Collegamento WhatsApp

Con Twilio WhatsApp:

1. Apri il numero WhatsApp/Sandbox Twilio.
2. In `When a message comes in`, inserisci l'endpoint della funzione.
3. Metodo: `POST`.
4. Twilio invierà `Body` con il testo del messaggio.
5. La funzione risponde automaticamente con un messaggio WhatsApp di conferma.

Con Make o automazioni simili:

1. Ricevi il messaggio WhatsApp.
2. Fai una richiesta `POST` all'endpoint.
3. Invia JSON tipo:

```json
{
  "message": "aggiungi Vermentino 22 ai vini",
  "from": "whatsapp:+39..."
}
```

### Architettura futura

Il flusso resta:

1. WhatsApp Business, Twilio o Make riceve il messaggio.
2. Un parser trasforma il testo in un comando strutturato.
3. La Supabase Edge Function aggiorna Supabase usando la service role key server.
4. Il sito e la pagina stampa leggono la tabella aggiornata.
5. Eventualmente Supabase Realtime notifica il frontend.

Importante: la service role key non deve mai stare nel frontend.

## Comandi

```bash
npm install
npm run dev
npm run build
```
