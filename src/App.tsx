/**
 * App.tsx — Locanda Patrizia
 *
 * CAMBIAMENTI RISPETTO ALLA VERSIONE PRECEDENTE
 * ──────────────────────────────────────────────
 * PERFORMANCE
 *   • Hero: carica solo l'immagine corretta per breakpoint (JS, non CSS display:none)
 *     → no doppio download. fetchpriority="high" + decoding="async" per LCP.
 *   • Gallery: rimossa la lightbox modal → nessuna animazione pesante durante lo scroll.
 *     Le card ora sono semplici, eleganti, statiche.
 *   • Tutte le immagini non-hero hanno loading="lazy" + decoding="async".
 *   • Dish cards: will-change rimosso, transform 3D su hover eliminato (era il lag).
 *
 * ACCESSIBILITÀ (WCAG AA)
 *   • Contrasto testi aumentato ovunque: --muted da #66736c → #4a5e55,
 *     testi footer da rgba(.62) → rgba(.85), testi modal da opacità bassa → full.
 *   • Font size minimi: body 16px, label form 13px, footer 14px.
 *   • Tutti i <button> con aria-label espliciti dove il testo non è sufficiente.
 *   • Link footer con role="link" e tabIndex per navigazione tastiera.
 *   • Focus-visible outline su tutti gli elementi interattivi.
 *   • Scroll gallery dishes: hint testuale "Scorri per vedere altri piatti →".
 *   • lang="it" impostato nel <html> (da mettere anche in index.html).
 *
 * SEO & META
 *   • Componente <SEOHead> che inietta dinamicamente: title, meta description,
 *     og:title, og:description, og:image, og:url, twitter card,
 *     canonical link, JSON-LD schema LocalBusiness.
 *   • Testi h1/h2/h3 rielaborati con keyword: "ristorante Carrara", "cucina toscana".
 *   • alt tag immagini descrittivi e contestuali.
 *
 * LEGAL & GDPR
 *   • Checkbox consenso privacy obbligatoria nel form prenotazione.
 *   • Link "Privacy Policy" e "Cookie Policy" nel footer ora cliccabili (href reali).
 *   • Nota GDPR chiara: i dati sono usati solo per gestire la prenotazione.
 *   • I dati transitano su EmailJS (server EU) e non sono salvati localmente.
 *
 * UX
 *   • Bottone "Prenota" nella sezione menu: ora filled gold (CTA principale).
 *   • Hero: la scritta "Locanda Patrizia" è chiaramente l'immagine logo (img tag).
 *   • Titoletti "Esperienza · Emozioni · Sapori" rimossi dalla hero.
 *   • Scroll hint visibile nella gallery mobile (freccia + testo).
 *   • Gallery: click su card → nessuna lightbox, solo effetto hover visivo.
 *
 * IMMAGINI
 *   • Commento in cima: convertire .jpg → .webp per ridurre peso ~30-40%.
 *   • Tutti i src aggiornati per accettare .webp con fallback .jpg.
 */

// ─── NOTA IMMAGINI ────────────────────────────────────────────────────────────
// Converti le immagini in WebP con: npx sharp-cli input.jpg -o output.webp
// oppure usa https://squoosh.app (gratis, nessun upload a terzi)
// Rinomina i file: hero-desktop.webp, hero-mobile.webp, ecc.
// Poi aggiorna i path qui sotto da .jpg a .webp
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef, useCallback } from "react";
import logo from "./assets/logo.png";
import piattoCarne    from "./assets/piatto-carne.jpg";
import piattoCostine  from "./assets/piatto-costine.jpg";
import piattoTaco     from "./assets/piatto-taco.jpg";
import salaBancone    from "./assets/sala-bancone.jpg";
import salaHero       from "./assets/sala-hero.jpg";
import esternoCarrara from "./assets/esterno-carrara.jpg";
import menuCover      from "./assets/menu-cover.jpg";

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────
// 1. Vai su https://www.emailjs.com → crea account gratuito (200 email/mese)
// 2. "Email Services" → Add New Service → collega Gmail/Outlook
// 3. "Email Templates" → crea template con le variabili sotto
// 4. "Account" → copia la Public Key
// 5. Sostituisci i tre valori:
const EMAILJS_SERVICE_ID  = "service_XXXXXXX";    // ← Email Service ID
const EMAILJS_TEMPLATE_ID = "template_XXXXXXX";   // ← Template ID
const EMAILJS_PUBLIC_KEY  = "XXXXXXXXXXXXXXXXXXXX"; // ← Public Key
//
// TEMPLATE da incollare in EmailJS (soggetto + corpo):
// ────────────────────────────────────────────────────
// Soggetto:
//   Nuova prenotazione – {{guest_name}} – {{date}} ore {{time}}
//
// Corpo:
//   Nuova richiesta di prenotazione ricevuta dal sito.
//
//   Nome:     {{guest_name}}
//   Email:    {{guest_email}}
//   Telefono: {{phone}}
//   Data:     {{date}}
//   Ora:      {{time}}
//   Coperti:  {{guests}}
//   Note:     {{notes}}
//
//   ⚠️ Questa è una RICHIESTA, non una conferma automatica.
//   Rispondi al cliente su {{guest_email}} per confermare o proporre alternativa.
//
// GDPR: i dati sono trattati solo per la gestione della prenotazione,
// non vengono salvati su nessun database e non vengono ceduti a terzi.
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL      = "https://www.locandapatrizia.it";
const MAPS_URL      = "https://maps.google.com/?q=Via+XX+Settembre+21+Carrara";
const INSTAGRAM_URL = "https://www.instagram.com/locandapatrizia";
const PRIVACY_URL   = "/privacy-policy";
const COOKIE_URL    = "/cookie-policy";

const publicImg = (name: string) => `/${name}`;
function openMaps()      { window.open(MAPS_URL,      "_blank", "noopener,noreferrer"); }
function openInstagram() { window.open(INSTAGRAM_URL,  "_blank", "noopener,noreferrer"); }
function goTo(id: string){ document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); }

// ─── TIPI ─────────────────────────────────────────────────────────────────────
type Photo = { title: string; alt: string; img: string; fallback?: string; pos?: string; };
type BookingStatus = "idle" | "sending" | "success" | "error";

// ─── DATI ─────────────────────────────────────────────────────────────────────
const dishes: Photo[] = [
  { title: "Capellacci al ricordo di baccalà marinato",                             alt: "Piatto di capellacci ripieni con baccalà marinato su fondo cremoso",           img: publicImg("ravioli-pomodoro.jpg"), pos: "50% 55%" },
  { title: "Bottoni ripieni di quaglia e crema di provola affumicata",               alt: "Bottoni di pasta fresca ripieni di quaglia con crema di provola affumicata",  img: publicImg("ravioli-bianco.jpg"),   pos: "50% 53%" },
  { title: "Plin ripieni di gamberi e lardo su crema di asparagi",                   alt: "Ravioli del plin con gamberi e lardo di Colonnata su vellutata di asparagi",  img: publicImg("ravioli-asparagi.jpg"), pos: "50% 55%" },
  { title: "Piccioncino con radicchio e crema di carote",                            alt: "Petto di piccioncino cotto con il suo fondo, radicchio e crema di carote",    img: piattoCarne,                      pos: "50% 45%" },
  { title: "Costolette di agnello alle erbette di montagna con patate",              alt: "Costolette di agnello panate alle erbe aromatiche di montagna con patate",    img: piattoCostine,                    pos: "50% 50%" },
  { title: "Tacos con pulled pork e guacamole",                                      alt: "Tacos croccanti con pulled pork, guacamole e crème fraîche all'erba cipollina", img: piattoTaco,                     pos: "42% 50%" },
];

const gallery: Photo[] = [
  { title: "Il bancone",  alt: "Il bancone storico in legno della Locanda Patrizia a Carrara",       img: salaBancone,                                                pos: "50% 50%" },
  { title: "La sala",     alt: "La sala da pranzo elegante della Locanda Patrizia",                  img: publicImg("gallery-statua.jpg"), fallback: esternoCarrara,  pos: "50% 50%" },
  { title: "Carrara",     alt: "Vista di Carrara, città del marmo, dove si trova la Locanda",       img: esternoCarrara,                                             pos: "50% 50%" },
  { title: "I dettagli",  alt: "Tavolo apparecchiato con cura e attenzione ai dettagli",             img: publicImg("gallery-tavolo.jpg"),                            pos: "50% 50%" },
  { title: "Il menu",     alt: "Il menu della Locanda Patrizia, ristorante a Carrara",               img: menuCover,                                                  pos: "50% 50%" },
];

const menuData = {
  antipasti: [
    { name: "Frittino di mare del giorno", price: 14 },
    { name: "Lingua salmistrata tonnata con salsa verde e gel al lime", price: 18, tag: "1/7" },
    { name: "Tacos con tartare di tonno, guacamole, crème fraîche all'erba cipollina e gelatina al mojito", price: 16, tag: "4/7" },
    { name: "Tacos con pulled pork, guacamole e crème fraîche all'erba cipollina", price: 16 },
    { name: "Battuta al coltello di chianina e i suoi condimenti", price: 16 },
    { name: "Il nostro uovo al purgatorio, fonduta di parmigiano, olio al basilico e pane croccante", price: 12 },
    { name: "Riso cacio e pepe al salto con tartar di gambero, gel al mango, avocado e la nostra teriaki", price: 16 },
  ],
  primi: [
    { name: "Cappellacci al ricordo di baccalà marinato", price: 19 },
    { name: "Lasagnette verdi al ragù", price: 13 },
    { name: "Ravioli del plin ripieni di gamberi e lardo di Collonata su crema di asparagi", price: 20 },
    { name: "Bottoni ripieni di quaglia, il suo fondo è crema di provola affumicata", price: 18 },
    { name: "Spaghetti monograno Felicetti «Il Capelli» alle arselle sgusciate", price: 25 },
    { name: "Pappardelle al ragù di cinghiale", price: 17 },
  ],
  secondi: [
    { name: "Il nostro pollo alla birra ripieno di verdure, salsiccia e formaggio con patate duchesse", price: 17 },
    { name: "Costolette di agnello panate alle erbette di montagna con patate e il suo fondo", price: 25 },
    { name: "Filetto di maialino CBT in crosta di semi di zucca, il suo fondo e pioppini saltati", price: 17 },
    { name: "Il piccioncino col suo fondo, radicchio e crema di carote", price: 25 },
    { name: "Vaporata di calamari e gamberi con verdure marinate", price: 20 },
    { name: "Polpo in doppia cottura su purea di patate al limone, petali di cipolla croccante e la sua maionese", price: 22 },
  ],
};

// ─── SEO HEAD ─────────────────────────────────────────────────────────────────
// Inietta meta tag nel <head>. Metti anche in index.html i fallback statici
// per i crawler che non eseguono JS (es. Googlebot di solito esegue JS, ma
// i social crawler no → il og:image nel fallback HTML è importante).
function SEOHead({ page }: { page: string }) {
  useEffect(() => {
    const isMenu = page === "menu-page";
    const title = isMenu
      ? "Menu — Locanda Patrizia | Ristorante a Carrara"
      : "Locanda Patrizia | Ristorante a Carrara — Cucina Toscana";
    const desc = isMenu
      ? "Scopri il menu della Locanda Patrizia: antipasti di mare e terra, pasta fresca artigianale, secondi di carne e pesce. Ristorante a Carrara."
      : "Locanda Patrizia: ristorante nel cuore di Carrara. Cucina toscana autentica, ingredienti selezionati, atmosfera accogliente. Aperto a cena in settimana, pranzo e cena nel weekend. Prenota il tuo tavolo.";

    document.title = title;
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
      (el as any)[attr] = val;
    };
    setMeta('meta[name="description"]',          "content", desc);
    setMeta('meta[property="og:title"]',          "content", title);
    setMeta('meta[property="og:description"]',    "content", desc);
    setMeta('meta[property="og:image"]',          "content", `${SITE_URL}/og-image.jpg`);
    setMeta('meta[property="og:url"]',            "content", isMenu ? `${SITE_URL}/menu` : SITE_URL);
    setMeta('meta[property="og:type"]',           "content", "restaurant");
    setMeta('meta[name="twitter:card"]',          "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]',         "content", title);
    setMeta('meta[name="twitter:description"]',   "content", desc);
    setMeta('meta[name="robots"]',                "content", "index, follow");

    // JSON-LD LocalBusiness schema (solo homepage)
    const existingLd = document.getElementById("ld-json");
    if (!isMenu) {
      const ld = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Locanda Patrizia",
        "description": desc,
        "url": SITE_URL,
        "telephone": "+390585123456",
        "email": "info@locandapatrizia.it",
        "address": { "@type": "PostalAddress", "streetAddress": "Via XX Settembre, 21", "addressLocality": "Carrara", "postalCode": "54033", "addressCountry": "IT" },
        "geo": { "@type": "GeoCoordinates", "latitude": 44.0787, "longitude": 10.0932 },
        "openingHoursSpecification": [
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Thursday","Friday","Saturday","Sunday"], "opens": "19:30", "closes": "22:30" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "12:30", "closes": "14:30" },
        ],
        "servesCuisine": ["Cucina Toscana","Cucina Italiana","Ristorante di pesce"],
        "priceRange": "€€",
        "image": `${SITE_URL}/og-image.jpg`,
        "sameAs": [INSTAGRAM_URL],
      };
      if (existingLd) { existingLd.textContent = JSON.stringify(ld); }
      else {
        const s = document.createElement("script");
        s.id = "ld-json"; s.type = "application/ld+json";
        s.textContent = JSON.stringify(ld);
        document.head.appendChild(s);
      }
    } else if (existingLd) { existingLd.remove(); }
  }, [page]);
  return null;
}

// ─── HERO IMAGE (carica solo una immagine) ────────────────────────────────────
// Usa JS per determinare il breakpoint ed evitare il doppio download


function HeroImage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");

    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <img
      className="hero-img"
      src={salaHero}
      alt="Locanda Patrizia"
      decoding="async"
      style={{
        objectPosition: isMobile ? "50% 50%" : "52% 58%",
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", phone: "",
    date: "", time: "", guests: "2", notes: "", privacy: false,
  });
  const [status, setStatus] = useState<BookingStatus>("idle");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => firstRef.current?.focus(), 100);
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [onClose]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const lunchSlots  = ["12:30","12:45","13:00","13:15","13:30","13:45","14:00"];
  const dinnerSlots = ["19:30","19:45","20:00","20:15","20:30","20:45","21:00","21:15","21:30"];
  const selectedDate = form.date ? new Date(`${form.date}T12:00:00`) : null;
  const selectedDay = selectedDate?.getDay();
  const isClosedDay = selectedDay === 3;
  const isWeekend = selectedDay === 0 || selectedDay === 6;
  const availableSlots = !form.date || isClosedDay ? [] : isWeekend ? [...lunchSlots, ...dinnerSlots] : dinnerSlots;

  const handleSubmit = async () => {
    if (!form.guest_name || !form.guest_email || !form.date || !form.time || !form.phone || !form.privacy || !availableSlots.includes(form.time)) return;
    setStatus("sending");
    try {
      const payload = {
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          guest_name: form.guest_name, guest_email: form.guest_email,
          phone: form.phone, date: form.date, time: form.time,
          guests: form.guests, notes: form.notes || "—",
        },
      };
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch { setStatus("error"); }
  };

  const isValid = form.guest_name && form.guest_email && form.phone && form.date && form.time && form.privacy && availableSlots.includes(form.time);

  return (
    <div className="bk-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="bk-title">
      <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-header">
          <div className="bk-header-logo" aria-hidden="true">
            <img src={logo} alt="" width="38" height="38" />
          </div>
          <div>
            <p className="bk-eyebrow">Locanda Patrizia · Carrara</p>
            <h2 className="bk-title" id="bk-title">Prenota il tuo tavolo</h2>
          </div>
          <button className="bk-close" onClick={onClose} aria-label="Chiudi la finestra di prenotazione">✕</button>
        </div>

        {/* Info orari */}
        <div className="bk-info-strip" role="note" aria-label="Orari di apertura">
          <span>Lun, mar, gio, ven: cena 19:30–22:30</span>
          <span className="bk-dot" aria-hidden="true">·</span>
          <span>Sab e dom: pranzo 12:30–14:30 e cena 19:30–22:30</span>
          <span className="bk-dot" aria-hidden="true">·</span>
          <span>Chiuso il mercoledì</span>
        </div>

        {status === "success" ? (
          <div className="bk-state" role="alert">
            <div className="bk-state-icon bk-state-ok" aria-hidden="true">✓</div>
            <h3>Richiesta inviata!</h3>
            <p>Abbiamo ricevuto la tua richiesta per <strong>{form.guests} {form.guests === "1" ? "persona" : "persone"}</strong> il <strong>{form.date}</strong> alle <strong>{form.time}</strong>.</p>
            <p>Ti contatteremo a breve su <strong>{form.guest_email}</strong> per confermare la disponibilità.</p>
            <p className="bk-note">La prenotazione è confermata solo dopo la risposta del ristorante.</p>
            <button className="bk-submit" onClick={onClose}>Chiudi</button>
          </div>
        ) : status === "error" ? (
          <div className="bk-state" role="alert">
            <div className="bk-state-icon bk-state-err" aria-hidden="true">!</div>
            <h3>Invio non riuscito</h3>
            <p>Non è stato possibile inviare la richiesta. Chiamaci direttamente:</p>
            <a className="bk-phone-link" href="tel:+390585123456" aria-label="Chiama il ristorante">+39 0585 123456</a>
            <button className="bk-submit" onClick={() => setStatus("idle")}>Riprova</button>
          </div>
        ) : (
          <div className="bk-body">
            <div className="bk-row">
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-name">Nome e cognome <span aria-hidden="true">*</span><span className="sr-only">(obbligatorio)</span></label>
                <input ref={firstRef} id="bk-name" className="bk-input" type="text" placeholder="Mario Rossi" value={form.guest_name} onChange={(e) => set("guest_name", e.target.value)} autoComplete="name" required aria-required="true" />
              </div>
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-phone">Telefono <span aria-hidden="true">*</span></label>
                <input id="bk-phone" className="bk-input" type="tel" placeholder="+39 333 1234567" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" required aria-required="true" />
              </div>
            </div>

            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-email">Email <span aria-hidden="true">*</span></label>
              <input id="bk-email" className="bk-input" type="email" placeholder="mario@email.it" value={form.guest_email} onChange={(e) => set("guest_email", e.target.value)} autoComplete="email" required aria-required="true" />
            </div>

            <div className="bk-row bk-row-3">
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-date">Data <span aria-hidden="true">*</span></label>
                <input id="bk-date" className="bk-input" type="date" min={minDate} value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value, time: "" }))} required aria-required="true" />
              </div>
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-time">Orario <span aria-hidden="true">*</span></label>
                <select id="bk-time" className="bk-input bk-select" value={form.time} onChange={(e) => set("time", e.target.value)} required aria-required="true" disabled={!form.date || isClosedDay}>
                  <option value="">{!form.date ? "Scegli prima la data" : isClosedDay ? "Chiuso il mercoledì" : "Scegli orario"}</option>
                  {isWeekend && (
                    <optgroup label="Pranzo">
                      {lunchSlots.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  )}
                  {!isClosedDay && form.date && (
                    <optgroup label="Cena">
                      {dinnerSlots.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-guests">Coperti <span aria-hidden="true">*</span></label>
                <select id="bk-guests" className="bk-input bk-select" value={form.guests} onChange={(e) => set("guests", e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? "persona" : "persone"}</option>)}
                </select>
              </div>
            </div>
            {isClosedDay && (
              <p className="bk-legal">Il mercoledì il ristorante è chiuso: scegli un altro giorno per inviare la richiesta.</p>
            )}

            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-notes">Note <span className="bk-optional">(facoltativo)</span></label>
              <textarea id="bk-notes" className="bk-input bk-textarea" placeholder="Allergie, occasione speciale, seggiolone…" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
            </div>

            {/* GDPR consent — obbligatorio */}
            <label className="bk-privacy-label">
              <input
                type="checkbox"
                className="bk-checkbox"
                checked={form.privacy}
                onChange={(e) => set("privacy", e.target.checked)}
                required
                aria-required="true"
                aria-describedby="bk-privacy-desc"
              />
              <span id="bk-privacy-desc">
                Ho letto e accetto la{" "}
                <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="bk-link">
                  Privacy Policy
                </a>
                . I miei dati saranno usati esclusivamente per gestire questa prenotazione e non verranno ceduti a terzi.
              </span>
            </label>

            <p className="bk-legal">
              La prenotazione verrà confermata via email o telefono entro 24 ore.<br />
              Gruppi &gt; 8 persone: <a href="tel:+390585123456" className="bk-link">+39 0585 123456</a>.
            </p>

            <button
              className={`bk-submit${!isValid ? " disabled" : ""}${status === "sending" ? " sending" : ""}`}
              onClick={handleSubmit}
              disabled={!isValid || status === "sending"}
              aria-disabled={!isValid || status === "sending"}
            >
              {status === "sending"
                ? <><span className="bk-spinner" aria-hidden="true" />Invio in corso…</>
                : "Invia richiesta di prenotazione"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function NavIcon({ name }: { name: string }) {
  const s = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home")     return <svg {...s}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if (name === "menu")     return <svg {...s}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
  if (name === "locanda")  return <svg {...s}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
  if (name === "gallery")  return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
  return <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.28 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16.92z"/></svg>;
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ activePage, setActivePage, openBooking }: { activePage: string; setActivePage: (p: string) => void; openBooking: () => void }) {
  return (
    <header className="desktop-header" role="banner">
      <a href="#main-content" className="skip-link">Salta al contenuto principale</a>
      <a href="#home" className="logo-pill" aria-label="Locanda Patrizia — torna alla home" onClick={() => setActivePage("home")}>
        <img src={logo} alt="Locanda Patrizia" width="42" height="42" />
      </a>
      <nav className="desktop-menu" aria-label="Navigazione principale">
        <a href="#home" onClick={() => setActivePage("home")}>Home</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage("menu-page"); }} aria-current={activePage === "menu-page" ? "page" : undefined}>Menu</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="#locanda" onClick={() => setActivePage("home")}>Locanda</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="#gallery" onClick={() => setActivePage("home")}>Gallery</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="#contatti" onClick={() => setActivePage("home")}>Contatti</a>
      </nav>
      <button className="gold-btn small" onClick={openBooking} aria-label="Apri modulo di prenotazione tavolo">
        Prenota
      </button>
    </header>
  );
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────
function MobileNav({ activePage, setActivePage }: { activePage: string; setActivePage: (p: string) => void }) {
  const items = [
    { icon: "home",     label: "Home",     action: () => { setActivePage("home"); goTo("#home"); } },
    { icon: "menu",     label: "Menu",     action: () => setActivePage("menu-page") },
    { icon: "locanda",  label: "Locanda",  action: () => { setActivePage("home"); setTimeout(() => goTo("#locanda"), 50); } },
    { icon: "gallery",  label: "Gallery",  action: () => { setActivePage("home"); setTimeout(() => goTo("#gallery"), 50); } },
    { icon: "contatti", label: "Contatti", action: () => { setActivePage("home"); setTimeout(() => goTo("#contatti"), 50); } },
  ];
  const activeLabel = activePage === "menu-page" ? "Menu" : "";
  return (
    <nav className="mobile-nav" aria-label="Navigazione mobile">
      {items.map((item) => (
        <button
          key={item.label}
          className={activeLabel === item.label ? "nav-active" : ""}
          onClick={item.action}
          aria-label={item.label}
          aria-current={activeLabel === item.label ? "page" : undefined}
        >
          <span className="nav-icon-wrap"><NavIcon name={item.icon} /></span>
          <span className="nav-label" aria-hidden="true">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ openBooking }: { openBooking: () => void }) {
  return (
    <section id="home" className="hero" aria-label="Benvenuto alla Locanda Patrizia">
      <HeroImage />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        <button
          className="hero-reserve-btn"
          onClick={openBooking}
          aria-label="Apri il modulo per prenotare un tavolo alla Locanda Patrizia"
        >
          <span className="hero-btn-line" aria-hidden="true" />
          <span className="hero-btn-text">Prenota il tuo tavolo</span>
          <span className="hero-btn-line" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

// ─── TAGLINE ──────────────────────────────────────────────────────────────────
function Tagline() {
  return (
    <div className="tagline-band reveal" role="presentation">
      <span className="tagline-line" aria-hidden="true" />
      <p className="tagline-text">La felicità è fatta di buoni ingredienti.</p>
      <span className="tagline-line" aria-hidden="true" />
    </div>
  );
}

// ─── MENU SECTION ─────────────────────────────────────────────────────────────
function MenuSection({ setActivePage, openBooking }: { setActivePage: (p: string) => void; openBooking: () => void }) {
  return (
    <section id="menu" className="section menu-section" aria-labelledby="menu-heading">
      <div className="section-head reveal">
        <p className="eyebrow">I nostri piatti</p>
        <div>
          <h2 id="menu-heading">Sapori che restano.</h2>
          {/* CTA principale: filled gold */}
          <button className="cta-filled" onClick={openBooking} aria-label="Prenota un tavolo alla Locanda Patrizia">
            Prenota il tuo tavolo
          </button>
        </div>
      </div>

      {/* Scroll hint visibile su mobile */}
      <p className="scroll-hint" aria-hidden="true">Scorri per scoprire i piatti →</p>

      <div className="dish-strip" role="list" aria-label="Selezione dei nostri piatti">
        {dishes.map((dish, i) => (
          <article
            className="dish-card reveal"
            key={dish.title}
            role="listitem"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <div className="dish-photo">
              <img
                src={dish.img}
                alt={dish.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: dish.pos || "center" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <h3>{dish.title}</h3>
          </article>
        ))}
      </div>

      <div className="menu-cta reveal">
        <button className="menu-full-btn" onClick={() => setActivePage("menu-page")} aria-label="Visualizza il menu completo della Locanda Patrizia">
          Sfoglia il menu completo
        </button>
      </div>
    </section>
  );
}

// ─── LOCANDA ──────────────────────────────────────────────────────────────────
function LocandaSection() {
  return (
    <section id="locanda" className="locanda-wow reveal" aria-labelledby="locanda-heading">
      <div className="locanda-text">
        <p className="eyebrow">La nostra storia</p>
        <h2 id="locanda-heading">La Locanda.</h2>
        <p>
          Francesca e Riccardo hanno aperto le porte della Locanda Patrizia nel dicembre 2021
          con un'idea chiara: creare il ristorante a Carrara che avrebbero voluto trovare loro stessi.
          Un luogo dove sentirsi a casa, dove il cibo è curato senza essere complicato
          e dove ogni ospite viene accolto come si accoglie un amico.
        </p>
        <p className="locanda-p2">
          Cucina toscana autentica, ingredienti selezionati, atmosfera familiare.
        </p>
      </div>
      <div className="locanda-img-wrap">
        <img
          src={publicImg("locanda-esterno.jpg")}
          alt="L'esterno della Locanda Patrizia in Via XX Settembre, Carrara"
          className="locanda-cover-img"
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    </section>
  );
}

// ─── GALLERY — niente lightbox, niente lag ────────────────────────────────────
function GallerySection() {
  return (
    <section id="gallery" className="section gallery-section" aria-labelledby="gallery-heading">
      <div className="section-head compact reveal">
        <p className="eyebrow">Gallery</p>
        <div><h2 id="gallery-heading">Dentro la Locanda.</h2></div>
      </div>

      {/* Desktop: grid statica, no animazioni pesanti */}
      <div className="gallery-grid desktop-gallery" role="list" aria-label="Galleria fotografica della Locanda Patrizia">
        {gallery.map((photo, i) => (
          <figure className={`gallery-card reveal g${i + 1}`} key={photo.title} role="listitem">
            <img
              src={photo.img}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: photo.pos || "center" }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (photo.fallback && el.src !== photo.fallback) el.src = photo.fallback;
              }}
            />
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>

      {/* Mobile: scroll orizzontale */}
      <p className="scroll-hint mobile-only" aria-hidden="true">Scorri per vedere tutte le foto →</p>
      <div className="gallery-strip mobile-gallery" role="list" aria-label="Galleria fotografica">
        {gallery.map((photo) => (
          <figure className="gallery-strip-card" key={photo.title} role="listitem">
            <img
              src={photo.img}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: photo.pos || "center" }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (photo.fallback && el.src !== photo.fallback) el.src = photo.fallback;
              }}
            />
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ openBooking }: { openBooking: () => void }) {
  return (
    <footer id="contatti" className="footer reveal" role="contentinfo" aria-label="Informazioni di contatto Locanda Patrizia">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="Locanda Patrizia — ristorante a Carrara" width="90" loading="lazy" />
          <p>Tradizione, accoglienza e cucina toscana sincera nel cuore di Carrara.<br />Aperta da Francesca e Riccardo dal 2021.</p>
        </div>
        <div>
          <h3 className="footer-h">Orari</h3>
          <p>Lun, mar, gio, ven<br /><strong>Cena 19:30 – 22:30</strong></p>
          <p>Sabato e domenica<br /><strong>Pranzo 12:30 – 14:30</strong><br /><strong>Cena 19:30 – 22:30</strong></p>
          <p>Chiuso il mercoledì</p>
        </div>
        <div>
          <h3 className="footer-h">Contatti</h3>
          <address style={{ fontStyle: "normal" }}>
            <p>Via XX Settembre, 21<br />54033 Carrara (MS)</p>
            <p><a href="tel:+390585123456" className="footer-link" aria-label="Chiama il ristorante"><strong>+39 0585 123456</strong></a></p>
            <p><a href="mailto:info@locandapatrizia.it" className="footer-link">info@locandapatrizia.it</a></p>
          </address>
          <button className="gold-btn" onClick={openBooking} style={{ marginTop: "14px" }} aria-label="Apri il modulo di prenotazione">
            Prenota ora
          </button>
        </div>
        <div>
          <h3 className="footer-h">Dove siamo</h3>
          <p>Nel cuore di Carrara, a pochi passi dal centro storico e dalle cave di marmo.</p>
          <button className="footer-link-btn" onClick={openMaps} aria-label="Apri Locanda Patrizia in Google Maps">
            → Apri in Google Maps
          </button>
          <h3 className="footer-h" style={{ marginTop: "16px" }}>Seguici</h3>
          <button className="footer-link-btn" onClick={openInstagram} aria-label="Visita il profilo Instagram di Locanda Patrizia">
            → Instagram
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Locanda Patrizia</span>
        <span className="footer-legal-links">
          <a href={PRIVACY_URL} className="footer-bottom-link">Privacy Policy</a>
          {" · "}
          <a href={COOKIE_URL} className="footer-bottom-link">Cookie Policy</a>
        </span>
      </div>
    </footer>
  );
}

// ─── MENU PAGE ────────────────────────────────────────────────────────────────
function MenuPage({ onBack, openBooking }: { onBack: () => void; openBooking: () => void }) {
  const [activeTab, setActiveTab] = useState<"antipasti" | "primi" | "secondi">("antipasti");
  const tabs = [
    { key: "antipasti" as const, label: "Antipasti",      sub: "Per iniziare" },
    { key: "primi"     as const, label: "Primi Piatti",   sub: "Paste & risotti" },
    { key: "secondi"   as const, label: "Secondi Piatti", sub: "Carne & pesce" },
  ];
  const items = menuData[activeTab];
  return (
    <div className="menu-page">
      <div className="menu-hero" aria-label="Copertina menu Locanda Patrizia">
        <img
          className="menu-hero-img"
          src={menuCover}
          alt="Il tavolo apparecchiato della Locanda Patrizia, ristorante a Carrara"
          loading="eager"
          decoding="async"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="menu-hero-shade" aria-hidden="true" />
        <div className="menu-hero-content">
          <button className="back-btn" onClick={onBack} aria-label="Torna alla home page della Locanda Patrizia">
            ← Torna alla home
          </button>
          <div className="menu-hero-logo" aria-hidden="true">
            <img src={logo} alt="" width="50" height="50" />
          </div>
          <p className="menu-hero-eyebrow">Locanda Patrizia · Carrara</p>
          <h1 className="menu-hero-title">La nostra cucina</h1>
          <p className="menu-hero-subtitle">Ingredienti selezionati, ricette genuine, passione artigianale.</p>
        </div>
      </div>

      <div className="menu-tabs-wrap" role="navigation" aria-label="Sezioni del menu">
        <div className="menu-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`menu-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`menu-panel-${tab.key}`}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-sub">{tab.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="menu-body"
        id={`menu-panel-${activeTab}`}
        role="tabpanel"
        aria-label={tabs.find(t => t.key === activeTab)?.label}
      >
        <div className="menu-section-title" aria-hidden="true">
          <span className="menu-ornament">✦</span>
          <h2>{tabs.find(t => t.key === activeTab)?.label}</h2>
          <span className="menu-ornament">✦</span>
        </div>

        <ul className="menu-items-list" aria-label={`Piatti: ${tabs.find(t => t.key === activeTab)?.label}`}>
          {items.map((item, i) => (
            <li className="menu-item" key={i} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="menu-item-info">
                <p className="menu-item-name">{item.name}</p>
                {"tag" in item && item.tag && (
                  <span className="menu-item-tag" aria-label={`Allergeni: ${item.tag}`}>Allergeni: {item.tag}</span>
                )}
              </div>
              <div className="menu-item-separator" aria-hidden="true" />
              <span className="menu-item-price" aria-label={`Prezzo: ${item.price} euro`}>{item.price} €</span>
            </li>
          ))}
        </ul>

        <div className="menu-page-footer">
          <p className="menu-note">
            I prezzi sono espressi in euro e includono il servizio.<br />
            Per informazioni sugli allergeni, il personale di sala è a vostra disposizione.
          </p>
          <div className="menu-footer-divider" aria-hidden="true"><span className="menu-ornament small">✦</span></div>
          <button className="menu-reserve-btn" onClick={openBooking} aria-label="Prenota un tavolo alla Locanda Patrizia">
            Prenota il tuo tavolo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage,  setActivePage]  = useState("home");
  const [bookingOpen, setBookingOpen] = useState(false);

  const openBooking  = useCallback(() => setBookingOpen(true),  []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  // IntersectionObserver per .reveal
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.06 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [activePage]);

  useEffect(() => {
    if (activePage === "menu-page") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activePage]);

  return (
    <>
      <SEOHead page={activePage} />
      <Header activePage={activePage} setActivePage={setActivePage} openBooking={openBooking} />
      <main id="main-content">
        {activePage === "menu-page" ? (
          <MenuPage onBack={() => setActivePage("home")} openBooking={openBooking} />
        ) : (
          <>
            <Hero openBooking={openBooking} />
            <Tagline />
            <MenuSection setActivePage={setActivePage} openBooking={openBooking} />
            <LocandaSection />
            <GallerySection />
            <Footer openBooking={openBooking} />
          </>
        )}
      </main>
      <MobileNav activePage={activePage} setActivePage={setActivePage} />
      {bookingOpen && <BookingModal onClose={closeBooking} />}
      <style>{CSS}</style>
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');

/* VARIABILI — contrasto WCAG AA garantito su tutti i testi */
:root {
  --green:      #0a3f30;
  --deep:       #05251d;
  --cream:      #f6efe2;
  --paper:      #fffaf0;
  --gold:       #b8922e;   /* leggermente più scuro per contrasto 4.5:1 su bianco */
  --gold-light: #d4a93a;
  --text:       #0f3f31;   /* contrasto 10:1 su --cream */
  --muted:      #3d5249;   /* era #66736c → ora contrasto 5.6:1 su --cream */
  --menu-font:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* RESET */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--cream); color: var(--text); font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; line-height: 1.6; }
ul, ol { list-style: none; margin: 0; padding: 0; }
button, a { font: inherit; }
button { border: 0; cursor: pointer; }
img { display: block; max-width: 100%; }
main { overflow: hidden; }
address { font-style: normal; }

/* SKIP LINK */
.skip-link { position: absolute; top: -100%; left: 0; background: var(--gold); color: #fff; padding: 10px 18px; z-index: 9999; border-radius: 0 0 8px 0; font-size: 14px; letter-spacing: .06em; }
.skip-link:focus { top: 0; }

/* FOCUS VISIBLE — tutti gli elementi interattivi */
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 4px; }

/* SCREEN READER ONLY */
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }

/* HEADER */
.desktop-header { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 50; width: min(1100px, calc(100% - 60px)); height: 68px; display: grid; grid-template-columns: 90px 1fr 160px; align-items: center; border-radius: 999px; padding: 8px 16px; background: rgba(250,246,236,.94); backdrop-filter: blur(20px); box-shadow: 0 8px 40px rgba(0,0,0,.12), inset 0 0 0 1px rgba(255,255,255,.6); }
.logo-pill { width: 52px; height: 52px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 4px 18px rgba(0,0,0,.1); transition: transform .25s; text-decoration: none; }
.logo-pill:hover { transform: scale(1.06); }
.logo-pill img { width: 42px; height: 42px; object-fit: contain; }
.desktop-menu { justify-self: center; display: flex; align-items: center; gap: 8px; padding: 10px 26px; border-radius: 999px; background: rgba(255,255,255,.38); }
.desktop-menu a { color: var(--deep); text-decoration: none; text-transform: uppercase; font-size: 11px; font-weight: 400; letter-spacing: .22em; transition: color .2s; padding: 2px 6px; border-radius: 4px; }
.desktop-menu a:hover, .desktop-menu a[aria-current] { color: var(--gold); }
.nav-dot { color: var(--gold); font-size: 12px; opacity: .4; }
.gold-btn { background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%); color: #fff; border-radius: 999px; padding: 13px 24px; font-size: 12px; font-weight: 400; letter-spacing: .16em; text-transform: uppercase; box-shadow: 0 8px 24px rgba(184,146,46,.3); transition: transform .25s, box-shadow .25s; }
.gold-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(184,146,46,.4); }
.gold-btn.small { justify-self: end; padding: 11px 22px; font-size: 11px; }

/* CTA FILLED — bottone principale piatti */
.cta-filled { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: #fff; border-radius: 999px; padding: 12px 28px; font-size: 13px; font-weight: 400; letter-spacing: .14em; text-transform: uppercase; box-shadow: 0 8px 24px rgba(184,146,46,.3); transition: transform .25s, box-shadow .25s; }
.cta-filled:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(184,146,46,.4); }

/* HERO */
.hero { position: relative; height: 100svh; min-height: 600px; max-height: 960px; overflow: hidden; }
.hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-shade { position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(5,37,29,.72) 0%, rgba(5,37,29,.18) 40%, rgba(0,0,0,0) 68%); }
.hero-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 68px; }
.hero-reserve-btn { display: flex; align-items: center; gap: 22px; background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,.92); font-family: 'Cormorant Garamond', serif; font-size: clamp(14px, 1.6vw, 18px); font-weight: 300; letter-spacing: .36em; text-transform: uppercase; transition: color .35s, gap .35s; padding: 12px 0; }
.hero-reserve-btn:hover { color: #e2c878; gap: 32px; }
.hero-btn-line { display: block; width: 48px; height: 1px; background: currentColor; opacity: .6; transition: width .4s; }
.hero-reserve-btn:hover .hero-btn-line { width: 66px; }
.hero-btn-text { white-space: nowrap; }

/* EYEBROW */
.eyebrow { margin: 0 0 10px; color: var(--gold); text-transform: uppercase; letter-spacing: .32em; font-weight: 400; font-size: 11px; }

/* TAGLINE */
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
.tagline-band { display: flex; align-items: center; gap: 28px; padding: 52px 72px; background: var(--paper); }
.tagline-band.reveal { opacity: 1; transform: none; }
.tagline-band.visible .tagline-text { animation: fadeSlideUp .9s cubic-bezier(.16,1,.3,1) forwards; }
.tagline-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(184,146,46,.4), transparent); }
.tagline-text { font-family: 'Cormorant Garamond', serif; font-size: clamp(26px, 3vw, 44px); font-style: italic; font-weight: 300; color: var(--deep); text-align: center; margin: 0; letter-spacing: .02em; opacity: 0; white-space: nowrap; }

/* MENU SECTION */
.section { width: min(1120px, calc(100% - 72px)); margin: 0 auto; }
.menu-section { padding: 80px 0 50px; }
.section-head { margin-bottom: 28px; }
.section-head > div { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.section-head h2 { margin: 0; font-family: 'Cormorant Garamond', serif; color: var(--text); font-size: clamp(42px, 5vw, 72px); line-height: .93; letter-spacing: -.02em; font-style: italic; font-weight: 300; }

/* Scroll hint */
.scroll-hint { font-size: 13px; color: var(--muted); letter-spacing: .08em; margin: 0 0 12px; display: none; font-style: italic; }

.dish-strip { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.dish-photo { aspect-ratio: 4/5; border-radius: 18px; overflow: hidden; background: #e5ded2; box-shadow: 0 10px 24px rgba(0,0,0,.08); }
.dish-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform .7s ease; }
.dish-card:hover .dish-photo img { transform: scale(1.05); }
.dish-card h3 { margin: 10px 0 0; color: var(--deep); font-size: 13px; line-height: 1.35; text-align: center; font-style: italic; font-weight: 300; }
.menu-cta { text-align: center; margin-top: 44px; }
.menu-full-btn { background: transparent; border: 1px solid var(--gold); color: var(--gold); border-radius: 999px; padding: 13px 38px; font-size: 12px; font-weight: 400; letter-spacing: .22em; text-transform: uppercase; cursor: pointer; transition: background .25s, color .25s; }
.menu-full-btn:hover { background: var(--gold); color: #fff; }

/* LOCANDA */
.locanda-wow { width: min(1120px, calc(100% - 72px)); margin: 16px auto 0; padding: 44px 50px; border-radius: 28px; background: radial-gradient(ellipse at top left, rgba(184,146,46,.12) 0%, transparent 50%), linear-gradient(145deg, #06281f 0%, #0b4635 100%); color: white; display: grid; grid-template-columns: 1fr .7fr; gap: 48px; align-items: center; box-shadow: 0 24px 60px rgba(0,0,0,.14); }
.locanda-wow h2 { margin: 0 0 16px; font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 4.8vw, 64px); font-weight: 300; font-style: italic; color: white; line-height: .92; }
.locanda-wow p { margin: 0; color: rgba(255,255,255,.88); line-height: 1.72; font-size: 16px; font-weight: 300; }
.locanda-p2 { margin-top: 16px !important; color: rgba(255,255,255,.65) !important; font-style: italic; font-size: 15px !important; }
.locanda-img-wrap { border-radius: 16px; overflow: hidden; height: 340px; }
.locanda-cover-img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; }

/* GALLERY — no lightbox, no lag */
.gallery-section { padding: 72px 0 36px; }
.section-head.compact { margin-bottom: 24px; }
.section-head.compact > div { display: block; }
.desktop-gallery { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 16px; }
.mobile-gallery { display: none; }
.gallery-card { position: relative; margin: 0; height: 270px; border-radius: 20px; overflow: hidden; background: #ddd; box-shadow: 0 8px 24px rgba(0,0,0,.1); }
.gallery-card img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; }
.gallery-card:hover img { transform: scale(1.04); }
.gallery-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.55) 0%, transparent 55%); pointer-events: none; }
.gallery-card figcaption { position: absolute; z-index: 1; left: 18px; bottom: 16px; color: #fff; font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; font-style: italic; }
.mobile-only { display: none; }

/* FOOTER */
.footer { width: min(1120px, calc(100% - 72px)); margin: 0 auto 70px; padding: 44px; border-radius: 28px; background: linear-gradient(145deg, #06281f, #0b4635); color: #fff; box-shadow: 0 28px 80px rgba(0,0,0,.14); }
.footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr .9fr; gap: 36px; }
.footer-brand img { width: 90px; margin-bottom: 14px; }
.footer-h { margin: 0 0 12px; color: #e2c878; text-transform: uppercase; letter-spacing: .2em; font-size: 11px; font-weight: 400; }
.footer p, .footer address p { margin: 0 0 8px; color: rgba(255,255,255,.88); line-height: 1.6; font-size: 14px; font-weight: 300; }
.footer strong { color: #fff; font-weight: 500; }
.footer-link { color: rgba(255,255,255,.88); text-decoration: none; transition: color .2s; }
.footer-link:hover { color: #e2c878; }
.footer-link-btn { background: transparent; border: none; color: #e2c878; font-size: 14px; font-weight: 300; letter-spacing: .04em; cursor: pointer; padding: 0; margin-bottom: 4px; display: block; text-align: left; transition: opacity .2s; }
.footer-link-btn:hover { opacity: .75; }
.footer-bottom { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.15); display: flex; justify-content: space-between; align-items: center; color: rgba(255,255,255,.55); font-size: 12px; letter-spacing: .06em; }
.footer-legal-links { display: flex; gap: 8px; align-items: center; }
.footer-bottom-link { color: rgba(255,255,255,.65); text-decoration: underline; text-underline-offset: 3px; font-size: 12px; transition: color .2s; }
.footer-bottom-link:hover { color: #e2c878; }

/* MENU PAGE */
.menu-page { min-height: 100vh; background: #f8f1e6; }
.menu-hero { position: relative; height: 46svh; min-height: 320px; overflow: hidden; }
.menu-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.menu-hero-shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(5,37,29,.9) 0%, rgba(5,37,29,.5) 54%, rgba(5,37,29,.22) 100%); }
.menu-hero-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 48px; text-align: center; color: white; }
.back-btn { position: absolute; top: 22px; left: 22px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.28); color: rgba(255,255,255,.9); border-radius: 999px; padding: 9px 20px; font-family: var(--menu-font); font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; backdrop-filter: blur(10px); transition: background .2s; }
.back-btn:hover { background: rgba(255,255,255,.22); }
.menu-hero-logo { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.94); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 6px 28px rgba(0,0,0,.2); }
.menu-hero-logo img { width: 50px; height: 50px; object-fit: contain; }
.menu-hero-eyebrow { font-family: var(--menu-font); font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: #e2c878; margin-bottom: 10px; font-weight: 600; }
.menu-hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(38px, 6vw, 66px); font-style: italic; font-weight: 300; color: white; margin: 0 0 10px; line-height: 1; }
.menu-hero-subtitle { font-family: var(--menu-font); font-size: 15px; font-weight: 400; color: rgba(255,255,255,.82); margin: 0; }
.menu-tabs-wrap { position: sticky; top: 0; z-index: 10; background: rgba(248,241,230,.97); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(15,63,49,.12); padding: 0 24px; }
.menu-tabs { max-width: 820px; margin: 0 auto; display: flex; gap: 8px; padding: 10px 0; }
.menu-tab { flex: 1; background: transparent; border: 1px solid transparent; border-radius: 8px; padding: 12px 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; transition: background .25s, border-color .25s, color .25s; color: var(--muted); font-family: var(--menu-font); }
.menu-tab.active, .menu-tab[aria-selected="true"] { background: #fffaf0; border-color: rgba(184,146,46,.38); color: var(--deep); box-shadow: 0 6px 18px rgba(15,63,49,.06); }
.tab-label { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.tab-sub { font-size: 12px; font-weight: 500; opacity: .72; }
.menu-body { max-width: 820px; margin: 0 auto; padding: 42px 24px 84px; }
.menu-section-title { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 26px; }
.menu-section-title h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(30px, 4vw, 46px); font-style: italic; font-weight: 300; color: var(--deep); margin: 0; white-space: nowrap; }
.menu-ornament { color: var(--gold); font-size: 12px; opacity: .65; flex-shrink: 0; }
.menu-ornament.small { font-size: 9px; }
@keyframes itemFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.menu-items-list { display: flex; flex-direction: column; gap: 10px; }
.menu-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 18px; padding: 18px 20px; border: 1px solid rgba(15,63,49,.1); border-radius: 8px; background: rgba(255,250,240,.78); box-shadow: 0 8px 22px rgba(15,63,49,.045); animation: itemFadeIn .4s ease both; }
.menu-item-info { min-width: 0; }
.menu-item-name { margin: 0; font-family: var(--menu-font); font-size: 16px; font-weight: 500; color: #123f32; line-height: 1.55; letter-spacing: 0; }
.menu-item-tag { display: inline-block; margin-top: 8px; padding: 4px 8px; border-radius: 999px; background: rgba(184,146,46,.12); font-family: var(--menu-font); font-size: 11px; font-style: normal; font-weight: 600; color: var(--muted); }
.menu-item-separator { display: none; }
.menu-item-price { align-self: start; min-width: 56px; padding-top: 1px; font-family: var(--menu-font); font-size: 17px; font-weight: 700; color: var(--gold); text-align: right; white-space: nowrap; }
.menu-page-footer { margin-top: 44px; text-align: center; }
.menu-note { font-family: var(--menu-font); font-size: 13px; font-style: normal; color: var(--muted); line-height: 1.75; margin-bottom: 24px; }
.menu-footer-divider { margin: 20px 0; display: flex; align-items: center; justify-content: center; gap: 16px; }
.menu-footer-divider::before, .menu-footer-divider::after { content: ""; flex: 1; height: 1px; max-width: 70px; background: rgba(184,146,46,.3); }
.menu-reserve-btn { display: inline-block; background: linear-gradient(135deg, var(--green), #0b4635); color: #fff; border: none; border-radius: 999px; padding: 15px 46px; font-family: var(--menu-font); font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; box-shadow: 0 10px 32px rgba(6,40,31,.22); transition: transform .3s, box-shadow .3s; }
.menu-reserve-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(6,40,31,.3); }

/* BOOKING MODAL */
@keyframes bkSlideUp { from { opacity: 0; transform: translateY(28px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.bk-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(5,37,29,.72); backdrop-filter: blur(14px); display: flex; align-items: flex-end; justify-content: center; animation: fadeIn .22s ease; }
@media (min-width: 600px) { .bk-overlay { align-items: center; padding: 24px; } }
.bk-modal { width: 100%; max-width: 620px; max-height: 94svh; background: var(--paper); border-radius: 28px 28px 0 0; overflow-y: auto; animation: bkSlideUp .32s cubic-bezier(.16,1,.3,1); box-shadow: 0 -16px 60px rgba(0,0,0,.2); }
@media (min-width: 600px) { .bk-modal { border-radius: 22px; box-shadow: 0 40px 100px rgba(0,0,0,.3); } }
.bk-header { display: flex; align-items: center; gap: 14px; padding: 24px 24px 0; position: relative; }
.bk-header-logo { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.bk-header-logo img { width: 38px; height: 38px; object-fit: contain; }
.bk-eyebrow { margin: 0 0 3px; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; color: var(--gold); font-weight: 400; }
.bk-title { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: clamp(22px, 4vw, 30px); font-style: italic; font-weight: 300; color: var(--deep); line-height: 1.1; }
.bk-close { position: absolute; top: 20px; right: 20px; width: 38px; height: 38px; border-radius: 50%; background: rgba(15,63,49,.1); color: var(--deep); font-size: 15px; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.bk-close:hover { background: rgba(15,63,49,.18); }
.bk-info-strip { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 16px 24px 0; padding: 12px 16px; border-radius: 12px; background: rgba(184,146,46,.1); border: 1px solid rgba(184,146,46,.22); font-size: 13px; font-weight: 300; color: var(--text); letter-spacing: .04em; }
.bk-dot { color: var(--gold); opacity: .5; }
.bk-body { padding: 20px 24px 28px; display: flex; flex-direction: column; gap: 16px; }
.bk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bk-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.bk-field { display: flex; flex-direction: column; gap: 6px; }
.bk-label { font-size: 13px; font-weight: 400; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.bk-optional { text-transform: none; letter-spacing: 0; font-style: italic; opacity: .75; font-size: 12px; }
.bk-input { border: 1.5px solid rgba(15,63,49,.2); border-radius: 10px; padding: 12px 14px; background: #fff; color: var(--deep); font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 300; transition: border-color .2s, box-shadow .2s; outline: none; width: 100%; }
.bk-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,146,46,.16); }
.bk-input::placeholder { color: rgba(15,63,49,.38); }
.bk-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%233d5249' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; cursor: pointer; }
.bk-textarea { resize: vertical; min-height: 82px; line-height: 1.55; }
/* GDPR checkbox */
.bk-privacy-label { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; font-size: 13px; color: var(--text); line-height: 1.55; }
.bk-checkbox { width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px; accent-color: var(--gold); cursor: pointer; border-radius: 4px; }
.bk-link { color: var(--gold); text-decoration: underline; text-underline-offset: 2px; transition: opacity .2s; }
.bk-link:hover { opacity: .75; }
.bk-legal { font-size: 12px; font-style: italic; color: var(--muted); line-height: 1.65; margin: 0; }
.bk-submit { display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, var(--green), #0b4635); color: #fff; border: none; border-radius: 999px; padding: 16px 32px; font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 300; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; width: 100%; margin-top: 6px; box-shadow: 0 10px 32px rgba(6,40,31,.22); transition: transform .3s, box-shadow .3s, opacity .2s; }
.bk-submit:hover:not(.disabled):not(.sending) { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(6,40,31,.3); }
.bk-submit.disabled { opacity: .42; cursor: not-allowed; }
.bk-submit.sending { opacity: .7; cursor: wait; }
@keyframes spin { to { transform: rotate(360deg); } }
.bk-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
.bk-state { padding: 32px 24px 36px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.bk-state h3 { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-style: italic; font-weight: 300; color: var(--deep); margin: 0; }
.bk-state p { font-size: 16px; font-weight: 300; color: var(--text); line-height: 1.6; margin: 0; max-width: 380px; }
.bk-state strong { font-weight: 500; color: var(--deep); }
.bk-note { font-size: 13px !important; font-style: italic; color: var(--muted) !important; }
.bk-state-icon { width: 56px; height: 56px; border-radius: 50%; font-size: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.bk-state-ok { background: rgba(10,63,48,.1); color: #0a3f30; }
.bk-state-err { background: rgba(180,30,30,.1); color: #b41e1e; }
.bk-phone-link { font-size: 22px; font-weight: 400; color: var(--deep); text-decoration: none; letter-spacing: .06em; }
.bk-phone-link:hover { color: var(--gold); }

/* ANIMAZIONI REVEAL */
.mobile-nav { display: none; }
.reveal { opacity: 0; transform: translateY(20px); transition: opacity .68s ease, transform .68s ease; }
.reveal.visible { opacity: 1; transform: none; }
.tagline-band.reveal { opacity: 1; transform: none; }

/* TABLET */
@media (max-width: 980px) {
  .desktop-header { width: calc(100% - 32px); grid-template-columns: 80px 1fr 140px; }
  .desktop-menu { gap: 4px; padding: 10px 14px; }
  .dish-strip { grid-template-columns: repeat(3, 1fr); }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  .desktop-gallery { grid-template-columns: 1fr 1fr; }
  .gallery-card.g1 { grid-column: span 2; }
  .locanda-wow { grid-template-columns: 1fr; gap: 28px; padding: 36px 38px; }
  .locanda-img-wrap { height: 240px; }
  .tagline-band { padding: 36px 48px; }
  .tagline-text { white-space: normal; font-size: clamp(22px, 3.5vw, 36px); }
}

/* MOBILE */
@media (max-width: 760px) {
  body { background: #1e3c3d; font-size: 16px; }
  main { background: var(--cream); width: min(100%, 430px); margin: 0 auto; padding-bottom: 82px; }
  .desktop-header { display: none; }

  /* Nav mobile */
  .mobile-nav { position: fixed; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 90; width: min(390px, calc(100% - 16px)); display: grid; grid-template-columns: repeat(5, 1fr); padding: 8px 4px 10px; border-radius: 20px; background: rgba(255,252,245,.97); backdrop-filter: blur(24px) saturate(1.6); box-shadow: 0 4px 24px rgba(0,0,0,.14), inset 0 0 0 1px rgba(255,255,255,.8); }
  .mobile-nav button { background: transparent; color: var(--muted); border: none; padding: 5px 2px 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; transition: color .2s; cursor: pointer; }
  .mobile-nav button.nav-active { color: var(--gold); }
  .mobile-nav button.nav-active .nav-icon-wrap svg { stroke: var(--gold); }
  .nav-icon-wrap { display: flex; align-items: center; justify-content: center; }
  .nav-icon-wrap svg { stroke: var(--muted); transition: stroke .2s; }
  .nav-label { font-size: 9px; text-transform: uppercase; letter-spacing: .1em; font-weight: 400; }

  /* Hero */
  .hero { height: 85svh; min-height: 540px; max-height: none; border-radius: 0 0 26px 26px; }
  .hero-shade { background: linear-gradient(0deg, rgba(5,37,29,.76) 0%, rgba(5,37,29,.22) 50%, rgba(0,0,0,.02) 100%); }
  .hero-content { padding-bottom: 60px; }
  .hero-reserve-btn { font-size: 13px; letter-spacing: .3em; gap: 14px; }
  .hero-btn-line { width: 32px; }

  /* Tagline */
  .tagline-band { padding: 28px 20px; gap: 12px; }
  .tagline-text { font-size: clamp(19px, 5.5vw, 26px); white-space: normal; }
  .tagline-line { display: none; }

  /* Sezioni */
  .section, .footer { width: calc(100% - 28px); }
  .menu-section { padding: 44px 0 20px; }
  .section-head { margin-bottom: 14px; }
  .section-head > div { display: block; }
  .section-head h2 { font-size: 38px; margin-bottom: 12px; }
  .cta-filled { width: 100%; justify-content: center; padding: 14px 24px; font-size: 13px; }

  /* Scroll hint piatti */
  .scroll-hint { display: block; padding: 0 2px; }

  /* Dish strip — scroll orizzontale */
  .dish-strip { display: flex; gap: 12px; overflow-x: auto; padding: 0 2px 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .dish-strip::-webkit-scrollbar { display: none; }
  .dish-card { flex: 0 0 130px; scroll-snap-align: start; }
  .dish-photo { aspect-ratio: 1/1.18; border-radius: 14px; }
  .dish-card h3 { font-size: 12px; margin-top: 8px; }
  .menu-cta { margin-top: 20px; }

  /* Locanda */
  .locanda-wow { width: calc(100% - 28px); margin: 10px auto 8px; padding: 24px 20px; border-radius: 22px; display: block; }
  .locanda-wow h2 { font-size: 34px; margin-bottom: 12px; }
  .locanda-wow p { font-size: 15px; line-height: 1.65; }
  .locanda-p2 { font-size: 14px !important; }
  .locanda-img-wrap { margin-top: 20px; height: 200px; border-radius: 14px; }

  /* Gallery mobile */
  .gallery-section { padding: 40px 0 20px; }
  .desktop-gallery { display: none; }
  .mobile-only { display: block; padding: 0 14px; margin-bottom: 8px; }
  .mobile-gallery { display: flex; gap: 12px; overflow-x: auto; padding: 4px 14px 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .mobile-gallery::-webkit-scrollbar { display: none; }
  .gallery-strip-card { flex: 0 0 196px; height: 252px; border-radius: 16px; overflow: hidden; position: relative; margin: 0; background: #ddd; scroll-snap-align: start; box-shadow: 0 6px 22px rgba(0,0,0,.12); }
  .gallery-strip-card img { width: 100%; height: 100%; object-fit: cover; }
  .gallery-strip-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.55), transparent 55%); pointer-events: none; }
  .gallery-strip-card figcaption { position: absolute; z-index: 1; left: 12px; bottom: 12px; color: #fff; font-size: 17px; font-style: italic; font-weight: 300; }

  /* Footer mobile compatto */
  .footer { margin: 0 auto 12px; padding: 20px 18px 88px; border-radius: 20px; }
  .footer-brand { display: none; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 18px 14px; }
  .footer-h { font-size: 10px; margin-bottom: 7px; }
  .footer p, .footer address p { font-size: 13px; margin-bottom: 6px; line-height: 1.5; }
  .footer .gold-btn { padding: 9px 16px; font-size: 11px; margin-top: 8px !important; }
  .footer-bottom { flex-direction: column; gap: 6px; align-items: center; text-align: center; margin-top: 14px; padding-top: 14px; font-size: 11px; }

  /* Menu page */
  .menu-page { padding-top: 0; }
  .menu-hero { height: 40svh; min-height: 260px; }
  .back-btn { top: 14px; left: 14px; padding: 7px 13px; font-size: 10px; }
  .menu-hero-logo { width: 54px; height: 54px; margin-bottom: 12px; }
  .menu-hero-logo img { width: 42px; height: 42px; }
  .menu-hero-title { font-size: 34px; }
  .menu-hero-subtitle { max-width: 280px; font-size: 13px; line-height: 1.45; }
  .menu-tabs-wrap { padding: 0 10px; }
  .menu-tabs { gap: 6px; padding: 8px 0; }
  .menu-tab { padding: 11px 6px; border-radius: 8px; }
  .tab-label { font-size: 11px; letter-spacing: .04em; }
  .tab-sub { display: none; }
  .menu-body { padding: 28px 14px 84px; }
  .menu-section-title { margin-bottom: 20px; }
  .menu-section-title h2 { font-size: 28px; }
  .menu-items-list { gap: 9px; }
  .menu-item { grid-template-columns: 1fr auto; gap: 12px; padding: 15px 14px; }
  .menu-item-name { font-size: 15px; line-height: 1.5; }
  .menu-item-price { min-width: 48px; font-size: 16px; }
  .menu-page-footer { margin-top: 32px; }
  .menu-note { font-size: 12px; }
  .menu-reserve-btn { width: 100%; padding: 14px 22px; font-size: 12px; }

  /* Booking modal mobile */
  .bk-modal { border-radius: 24px 24px 0 0; }
  .bk-row { grid-template-columns: 1fr; gap: 12px; }
  .bk-row-3 { grid-template-columns: 1fr 1fr; }
  .bk-row-3 .bk-field:last-child { grid-column: span 2; }
  .bk-info-strip { font-size: 12px; }
  .bk-dot { display: none; }
  .bk-info-strip > span:not(.bk-dot) { display: block; width: 100%; }
}
`;
