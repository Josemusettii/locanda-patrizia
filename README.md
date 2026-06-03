# Locanda Patrizia

Sito React/Vite della Locanda Patrizia con menu centrale collegato a Supabase.

## Menu Centrale

Il menu è pensato come unica sorgente dati:

```text
Supabase menu -> /menu pubblico -> /admin/menu-stampa PDF
```

In futuro il flusso potrà diventare:

```text
WhatsApp -> automazione/API -> Supabase menu -> sito + stampa PDF aggiornati
```

Per ora WhatsApp, Twilio e Make non sono implementati. Il codice però è già diviso in servizi e componenti per poterli aggiungere senza rifare il sito.

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

Per arrivare ai comandi tipo:

```text
aggiungi Vermentino 22 ai vini
nascondi Polpo
cambia prezzo Ravioli 16
```

servirà un livello server/automazione:

1. WhatsApp Business, Twilio o Make riceve il messaggio.
2. Un parser trasforma il testo in un comando strutturato.
3. Una API server aggiorna Supabase usando una service role key.
4. Il sito e la pagina stampa leggono la tabella aggiornata.
5. Eventualmente Supabase Realtime notifica il frontend.

Importante: la service role key non deve mai stare nel frontend.

## Comandi

```bash
npm install
npm run dev
npm run build
```

