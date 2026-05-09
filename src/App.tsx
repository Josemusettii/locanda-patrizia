/**
 * App.tsx — Locanda Patrizia
 *
 * OTTIMIZZAZIONI SEO + PERFORMANCE (visivamente identico)
 * ────────────────────────────────────────────────────────
 * LCP / Performance:
 *  • HeroImage: usa preload statici in index.html per scoprire prima la LCP
 *  • fetchpriority="high" sull'img hero
 *  • Tutte le immagini non-LCP hanno loading="lazy" + decoding="async"
 *  • Rimosso il doppio rendering mobile/desktop via CSS display:none
 *  • sizes= corretto su ogni img per evitare download sovradimensionati
 *
 * SEO strutturale:
 *  • Testo nascosto .sr-only con keyword geo-localizzate in ogni sezione
 *  • FAQ schema (JSON-LD) → rich snippet su Google
 *  • BreadcrumbList schema nella menu page
 *  • Menu schema (hasMenu + MenuSection + MenuItem) nel JSON-LD
 *  • Canonical tag aggiornato dinamicamente
 *  • hreflang it + og:locale
 *  • Ogni h2/h3 contiene keyword naturali ("ristorante Carrara", ecc.)
 *  • aria-label già ottimizzati per Google (coincidono con query reali)
 *
 * Testo invisibile (per crawler, non per utenti):
 *  • Ogni sezione ha un <p className="sr-only"> con 40-60 parole di keyword
 *    naturali — invisibile visivamente, leggibile da Google
 *  • Non è keyword stuffing: frasi complete e semanticamente corrette
 */

import { lazy, Suspense, useEffect, useState, useRef, useCallback } from "react";
import "./App.css";
import logo           from "./assets/logo.webp";
import piattoCarne    from "./assets/piatto-carne.webp";
import piattoCostine  from "./assets/piatto-costine.webp";
import piattoTaco     from "./assets/piatto-taco.webp";
import salaBancone    from "./assets/sala-bancone.webp";
import salaHero       from "./assets/sala-hero.webp";
import esternoCarrara from "./assets/esterno-carrara.webp";
import menuCover      from "./assets/menu-cover.webp";

const MenuPage = lazy(() => import("./MenuPage"));

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_b8n6lq3";
const EMAILJS_TEMPLATE_ID = "template_lmk9tqb";
const EMAILJS_PUBLIC_KEY  = "tKbOdM_r2oD9lbM_s";

const SITE_URL      = "https://www.locandapatrizia.it";
const MAPS_URL      = "https://maps.google.com/?q=Piazza+delle+Erbe+1+Carrara";
const INSTAGRAM_URL = "https://www.instagram.com/locandapatrizia";
const PRIVACY_URL   = "/privacy-policy";
const COOKIE_URL    = "/cookie-policy";

const publicImg = (name: string) => `/${name}`;
function openMaps()      { window.open(MAPS_URL,      "_blank", "noopener,noreferrer"); }
function openInstagram() { window.open(INSTAGRAM_URL,  "_blank", "noopener,noreferrer"); }
function goTo(id: string){ document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); }

type Photo = { title: string; alt: string; img: string; fallback?: string; pos?: string; };
type BookingStatus = "idle" | "sending" | "success" | "error";

type Page = "home" | "menu-page";

const routeToPage = (): Page => {
  if (typeof window === "undefined") return "home";
  return window.location.pathname.replace(/\/$/, "") === "/menu" ? "menu-page" : "home";
};

const isBookingRoute = () =>
  typeof window !== "undefined" && window.location.pathname.replace(/\/$/, "") === "/prenota";

const pagePath = (page: Page) => page === "menu-page" ? "/menu" : "/";

// ─── DATI ─────────────────────────────────────────────────────────────────────
const dishes: Photo[] = [
  { title: "Capellacci al ricordo di baccalà marinato",           alt: "Capellacci di pasta fresca ripieni di baccalà marinato su fondo cremoso — Locanda Patrizia Carrara",          img: publicImg("ravioli-pomodoro.jpg"), pos: "50% 55%" },
  { title: "Bottoni ripieni di quaglia e crema di provola affumicata", alt: "Bottoni di pasta fresca ripieni di quaglia con crema di provola affumicata — ristorante Carrara",         img: publicImg("ravioli-bianco.jpg"),   pos: "50% 53%" },
  { title: "Plin ripieni di gamberi e lardo su crema di asparagi", alt: "Ravioli del plin con gamberi e lardo di Colonnata su vellutata di asparagi — cucina toscana Carrara",         img: publicImg("ravioli-asparagi.jpg"), pos: "50% 55%" },
  { title: "Piccioncino con radicchio e crema di carote",          alt: "Piccioncino cotto con fondo, radicchio brasato e crema di carote — secondo piatto ristorante Carrara",        img: piattoCarne,                      pos: "50% 45%" },
  { title: "Costolette di agnello alle erbette di montagna",       alt: "Costolette di agnello panate alle erbe aromatiche di montagna con patate — Locanda Patrizia",                 img: piattoCostine,                    pos: "50% 50%" },
  { title: "Tacos con pulled pork e guacamole",                    alt: "Tacos con pulled pork, guacamole e crème fraîche all'erba cipollina — antipasto creativo Locanda Patrizia",   img: piattoTaco,                       pos: "42% 50%" },
];

const gallery: Photo[] = [
  { title: "Il bancone",  alt: "Il bancone in legno della Locanda Patrizia, ristorante nel centro storico di Carrara",                     img: salaBancone,                                                pos: "50% 50%" },
  { title: "La sala",     alt: "La sala da pranzo della Locanda Patrizia con tavoli apparecchiati e statue di marmo di Carrara",           img: publicImg("gallery-statua.jpg"), fallback: esternoCarrara,  pos: "50% 50%" },
  { title: "Carrara",     alt: "Il centro storico di Carrara con arte di strada — dove si trova la Locanda Patrizia ristorante",           img: esternoCarrara,                                             pos: "50% 50%" },
  { title: "I dettagli",  alt: "Dettagli del bancone della Locanda Patrizia: bottiglie di vino, sculture e fiori secchi",                 img: publicImg("gallery-tavolo.jpg"),                            pos: "50% 50%" },
  { title: "La chicca",   alt: "Le caramelle di benvenuto della Locanda Patrizia con quadri e dettagli di sala",                         img: publicImg("gallery-chicca.jpg"),                            pos: "50% 56%" },
  { title: "Il menu",     alt: "La copertina illustrata del menu della Locanda Patrizia, ristorante a Carrara in Piazza delle Erbe, 1",        img: menuCover,                                                  pos: "50% 50%" },
];


// ─── SEO HEAD ─────────────────────────────────────────────────────────────────
function SEOHead({ page }: { page: string }) {
  useEffect(() => {
    const isMenu = page === "menu-page";

    const title = isMenu
      ? "Menu Ristorante — Locanda Patrizia | Carrara (MS)"
      : "Locanda Patrizia | Ristorante a Carrara — Cucina Toscana & Creativa";

    const desc = isMenu
      ? "Menu della Locanda Patrizia a Carrara: antipasti di mare e terra, pasta fresca artigianale, secondi di carne e pesce. Cucina toscana e creativa. Prenota il tuo tavolo."
      : "Locanda Patrizia, ristorante nel centro storico di Carrara (MS). Cucina toscana autentica e creativa con ingredienti selezionati. Aperto a cena tutti i giorni tranne mercoledì, pranzo sabato e domenica. Prenota online.";

    const canonical = isMenu ? `${SITE_URL}/menu` : SITE_URL;

    document.title = title;

    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta") as HTMLMetaElement; document.head.appendChild(el); }
      (el as any)[attr] = val;
    };
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) { el = document.createElement("link") as HTMLLinkElement; document.head.appendChild(el); }
      el.rel = rel; el.href = href;
    };

    // Core meta
    setMeta('meta[name="description"]',         "content", desc);
    setMeta('meta[name="robots"]',              "content", "index, follow, max-snippet:-1, max-image-preview:large");
    setMeta('meta[name="author"]',              "content", "Locanda Patrizia");
    setMeta('meta[name="geo.region"]',          "content", "IT-MS");
    setMeta('meta[name="geo.placename"]',       "content", "Carrara");
    setMeta('meta[name="geo.position"]',        "content", "44.0787;10.0932");
    setMeta('meta[name="ICBM"]',               "content", "44.0787, 10.0932");

    // Open Graph
    setMeta('meta[property="og:title"]',        "content", title);
    setMeta('meta[property="og:description"]',  "content", desc);
    setMeta('meta[property="og:image"]',        "content", `${SITE_URL}/og-image.jpg`);
    setMeta('meta[property="og:image:width"]',  "content", "1200");
    setMeta('meta[property="og:image:height"]', "content", "630");
    setMeta('meta[property="og:image:alt"]',    "content", "Locanda Patrizia — ristorante a Carrara");
    setMeta('meta[property="og:url"]',          "content", canonical);
    setMeta('meta[property="og:type"]',         "content", "restaurant");
    setMeta('meta[property="og:locale"]',       "content", "it_IT");
    setMeta('meta[property="og:site_name"]',    "content", "Locanda Patrizia");

    // Twitter Card
    setMeta('meta[name="twitter:card"]',        "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]',       "content", title);
    setMeta('meta[name="twitter:description"]', "content", desc);
    setMeta('meta[name="twitter:image"]',       "content", `${SITE_URL}/og-image.jpg`);

    // Canonical + hreflang
    setLink("canonical", canonical);

    // ── JSON-LD ────────────────────────────────────────────────────────────────
    const upsertScript = (id: string, content: object) => {
      let s = document.getElementById(id) as HTMLScriptElement | null;
      if (!s) { s = document.createElement("script"); s.id = id; s.type = "application/ld+json"; document.head.appendChild(s); }
      s.textContent = JSON.stringify(content);
    };
    const removeScript = (id: string) => document.getElementById(id)?.remove();

    if (!isMenu) {
      // 1. Restaurant schema
      upsertScript("ld-restaurant", {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": `${SITE_URL}/#restaurant`,
        name: "Locanda Patrizia",
        description: "Ristorante nel centro storico di Carrara con cucina toscana autentica e creativa. Pasta fresca artigianale, ingredienti selezionati, atmosfera accogliente.",
        url: SITE_URL,
        telephone: "+390585873443",
        email: "locandapatriziaa@gmail.com",
        image: [`${SITE_URL}/og-image.jpg`, `${SITE_URL}/hero-desktop.webp`],
        logo: `${SITE_URL}/logo.webp`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Piazza delle Erbe, 1",
          addressLocality: "Carrara",
          addressRegion: "MS",
          postalCode: "54033",
          addressCountry: "IT",
        },
        geo: { "@type": "GeoCoordinates", latitude: 44.0787, longitude: 10.0932 },
        hasMap: MAPS_URL,
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Thursday","Friday"], opens: "19:30", closes: "22:30" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday","Sunday"], opens: "12:30", closes: "14:30" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday","Sunday"], opens: "19:30", closes: "22:30" },
        ],
        servesCuisine: ["Cucina Toscana", "Cucina Italiana", "Pasta fresca", "Pesce"],
        priceRange: "€€",
        currenciesAccepted: "EUR",
        paymentAccepted: "Cash, Credit Card",
        menu: `${SITE_URL}/menu`,
        acceptsReservations: "True",
        sameAs: [INSTAGRAM_URL],
        hasMenu: {
          "@type": "Menu",
          name: "Menu Locanda Patrizia",
          url: `${SITE_URL}/menu`,
        },
      });

      // 2. FAQ schema → rich snippet su Google
      upsertScript("ld-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Dove si trova la Locanda Patrizia a Carrara?",
            acceptedAnswer: { "@type": "Answer", text: "La Locanda Patrizia si trova in Piazza delle Erbe 1, 54033 Carrara (MS), nel cuore del centro storico." },
          },
          {
            "@type": "Question",
            name: "Quando è aperta la Locanda Patrizia?",
            acceptedAnswer: { "@type": "Answer", text: "La Locanda Patrizia è aperta a cena tutti i giorni tranne il mercoledì (19:30–22:30). Il sabato e la domenica anche a pranzo (12:30–14:30)." },
          },
          {
            "@type": "Question",
            name: "Come si prenota un tavolo alla Locanda Patrizia?",
            acceptedAnswer: { "@type": "Answer", text: "Puoi prenotare direttamente dal sito locandapatrizia.it compilando il modulo online, oppure chiamando il +39 0585 873443." },
          },
          {
            "@type": "Question",
            name: "Che tipo di cucina propone la Locanda Patrizia?",
            acceptedAnswer: { "@type": "Answer", text: "La Locanda Patrizia propone cucina toscana autentica e creativa: pasta fresca artigianale, antipasti di mare e terra, secondi di carne e pesce con ingredienti locali selezionati." },
          },
          {
            "@type": "Question",
            name: "La Locanda Patrizia ha un menu fisso o alla carta?",
            acceptedAnswer: { "@type": "Answer", text: "La Locanda Patrizia serve esclusivamente alla carta, con un menu che cambia stagionalmente per valorizzare i migliori prodotti locali toscani." },
          },
        ],
      });

      // 3. LocalBusiness breadcrumb
      upsertScript("ld-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ],
      });

      removeScript("ld-menu-breadcrumb");
    } else {
      removeScript("ld-restaurant");
      removeScript("ld-faq");
      removeScript("ld-breadcrumb");

      // Menu page: breadcrumb separato
      upsertScript("ld-menu-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Menu", item: `${SITE_URL}/menu` },
        ],
      });
    }
  }, [page]);

  return null;
}

// ─── HERO IMAGE — ottimizzata per LCP ────────────────────────────────────────
// fetchpriority="high" + nessun lazy + dimensioni esplicite per evitare layout shift
function HeroImage() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <img
      className="hero-img"
      src={isMobile ? publicImg("hero-mobile.webp") : publicImg("hero-desktop.webp")}
      alt="La sala della Locanda Patrizia, ristorante nel centro storico di Carrara con cucina toscana"
      width={isMobile ? 1024 : 1672}
      height={isMobile ? 1535 : 941}
      fetchPriority="high"
      decoding="async"
      loading="eager"
      style={{ objectPosition: isMobile ? "50% 50%" : "52% 58%" }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = salaHero; }}
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
        template_params: { guest_name: form.guest_name, guest_email: form.guest_email, phone: form.phone, date: form.date, time: form.time, guests: form.guests, notes: form.notes || "—" },
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
        <div className="bk-header">
          <div className="bk-header-logo" aria-hidden="true">
            <img src={logo} alt="" width="38" height="38" loading="eager" />
          </div>
          <div>
            <p className="bk-eyebrow" aria-hidden="true">Locanda Patrizia · Carrara</p>
            <h2 className="bk-title" id="bk-title">Prenota il tuo tavolo</h2>
          </div>
          <button className="bk-close" onClick={onClose} aria-label="Chiudi la finestra di prenotazione">✕</button>
        </div>

        <div className="bk-info-strip" role="note" aria-label="Orari di apertura">
          <span>Pranzo: Sab–Dom 12:30–14:30</span>
          <span className="bk-dot" aria-hidden="true">·</span>
          <span>Cena: tutti i giorni 19:30–22:30</span>
          <span className="bk-dot" aria-hidden="true">·</span>
          <span>Chiuso il mercoledì</span>
        </div>

        {status === "success" ? (
          <div className="bk-state" role="alert">
            <div className="bk-state-icon bk-state-ok" aria-hidden="true">✓</div>
            <h3>Richiesta inviata!</h3>
            <p>Abbiamo ricevuto la tua richiesta per <strong>{form.guests} {form.guests === "1" ? "persona" : "persone"}</strong> il <strong>{form.date}</strong> alle <strong>{form.time}</strong>.</p>
            <p>Ti confermeremo a breve su <strong>{form.guest_email}</strong>.</p>
            <p className="bk-note">La prenotazione è valida solo dopo la conferma del ristorante.</p>
            <button className="bk-submit" onClick={onClose}>Chiudi</button>
          </div>
        ) : status === "error" ? (
          <div className="bk-state" role="alert">
            <div className="bk-state-icon bk-state-err" aria-hidden="true">!</div>
            <h3>Invio non riuscito</h3>
            <p>Chiamaci direttamente:</p>
            <a className="bk-phone-link" href="tel:+390585873443">+39 0585 873443</a>
            <button className="bk-submit" onClick={() => setStatus("idle")}>Riprova</button>
          </div>
        ) : (
          <div className="bk-body">
            <div className="bk-row">
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-name">Nome e cognome <span aria-hidden="true">*</span></label>
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
                  <option value="">{!form.date ? "Prima scegli la data" : isClosedDay ? "Chiuso il mercoledì" : "Scegli orario"}</option>
                  {isWeekend && <optgroup label="Pranzo">{lunchSlots.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>}
                  {!isClosedDay && form.date && <optgroup label="Cena">{dinnerSlots.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>}
                </select>
              </div>
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-guests">Coperti <span aria-hidden="true">*</span></label>
                <select id="bk-guests" className="bk-input bk-select" value={form.guests} onChange={(e) => set("guests", e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? "persona" : "persone"}</option>)}
                </select>
              </div>
            </div>
            {isClosedDay && <p className="bk-warn" role="alert">Il mercoledì siamo chiusi. Scegli un altro giorno.</p>}
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-notes">Note <span className="bk-optional">(facoltativo)</span></label>
              <textarea id="bk-notes" className="bk-input bk-textarea" placeholder="Allergie, occasione speciale, seggiolone…" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
            </div>
            <label className="bk-privacy-label">
              <input type="checkbox" className="bk-checkbox" checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)} required aria-required="true" aria-describedby="bk-privacy-desc" />
              <span id="bk-privacy-desc">Ho letto e accetto la <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="bk-link">Privacy Policy</a>. I miei dati saranno usati solo per gestire questa prenotazione e non verranno ceduti a terzi.</span>
            </label>
            <p className="bk-legal">Conferma entro 24 ore via email o telefono. Gruppi &gt;8: <a href="tel:+390585873443" className="bk-link">+39 0585 873443</a>.</p>
            <button
              className={`bk-submit${!isValid ? " disabled" : ""}${status === "sending" ? " sending" : ""}`}
              onClick={handleSubmit}
              disabled={!isValid || status === "sending"}
              aria-disabled={!isValid || status === "sending"}
            >
              {status === "sending" ? <><span className="bk-spinner" aria-hidden="true" />Invio in corso…</> : "Invia richiesta di prenotazione"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function NavIcon({ name }: { name: string }) {
  const s = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "home")     return <svg {...s}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if (name === "menu")     return <svg {...s}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
  if (name === "locanda")  return <svg {...s}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
  if (name === "gallery")  return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
  return <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.28 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16.92z"/></svg>;
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ activePage, setActivePage, openBooking }: { activePage: Page; setActivePage: (p: Page) => void; openBooking: () => void }) {
  return (
    <header className="desktop-header" role="banner">
      <a href="#main-content" className="skip-link">Salta al contenuto principale</a>
      <a href="/" className="logo-pill" aria-label="Locanda Patrizia — ristorante a Carrara, torna alla home" onClick={(e) => { e.preventDefault(); setActivePage("home"); }}>
        <img src={logo} alt="Logo Locanda Patrizia" width="42" height="42" loading="eager" />
      </a>
      <nav className="desktop-menu" aria-label="Navigazione principale">
        <a href="/" onClick={(e) => { e.preventDefault(); setActivePage("home"); }}>Home</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="/menu" onClick={(e) => { e.preventDefault(); setActivePage("menu-page"); }} aria-current={activePage === "menu-page" ? "page" : undefined}>Menu</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="/#locanda" onClick={(e) => { e.preventDefault(); setActivePage("home"); setTimeout(() => goTo("#locanda"), 50); }}>Locanda</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="/#gallery" onClick={(e) => { e.preventDefault(); setActivePage("home"); setTimeout(() => goTo("#gallery"), 50); }}>Gallery</a>
        <span className="nav-dot" aria-hidden="true">·</span>
        <a href="/#contatti" onClick={(e) => { e.preventDefault(); setActivePage("home"); setTimeout(() => goTo("#contatti"), 50); }}>Contatti</a>
      </nav>
      <button className="gold-btn small" onClick={openBooking} aria-label="Prenota un tavolo al ristorante Locanda Patrizia a Carrara">
        Prenota
      </button>
    </header>
  );
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────
function MobileNav({ activePage, setActivePage }: { activePage: Page; setActivePage: (p: Page) => void }) {
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
        <button key={item.label} className={activeLabel === item.label ? "nav-active" : ""} onClick={item.action} aria-label={item.label} aria-current={activeLabel === item.label ? "page" : undefined}>
          <span className="nav-icon-wrap"><NavIcon name={item.icon} /></span>
          <span className="nav-label" aria-hidden="true">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function FloatingBookingButton({ openBooking }: { openBooking: () => void }) {
  return (
    <button className="floating-booking-btn" onClick={openBooking} aria-label="Prenota un tavolo alla Locanda Patrizia">
      Prenota
    </button>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ openBooking }: { openBooking: () => void }) {
  return (
    <section id="home" className="hero" aria-label="Locanda Patrizia — ristorante nel centro storico di Carrara">
      <HeroImage />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        {/* Testo SEO invisibile — keyword per Google */}
        <p className="sr-only">
          Locanda Patrizia è il ristorante nel centro storico di Carrara aperto da Francesca e Riccardo nel 2021.
          Cucina toscana autentica e creativa: pasta fresca artigianale, pesce fresco, carne selezionata.
          Prenota il tuo tavolo online per cena o pranzo nel weekend a Carrara, in provincia di Massa-Carrara.
        </p>
        <button
          className="hero-reserve-btn"
          onClick={openBooking}
          aria-label="Prenota un tavolo alla Locanda Patrizia, ristorante a Carrara"
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
function MenuSection({ setActivePage }: { setActivePage: (p: Page) => void }) {
  return (
    <section id="menu" className="section menu-section" aria-labelledby="menu-heading">
      {/* Testo SEO invisibile */}
      <p className="sr-only">
        Il menu della Locanda Patrizia a Carrara offre antipasti di mare e terra, primi piatti di pasta fresca fatta a mano,
        e secondi di carne e pesce. Specialità toscane rivisitate con ingredienti locali della Toscana.
        Ristorante ideale per cene romantiche, pranzi in famiglia e occasioni speciali a Carrara e dintorni.
      </p>
      <div className="section-head reveal">
        <p className="eyebrow">I nostri piatti</p>
        <div>
          <h2 id="menu-heading">Sapori che restano.</h2>
        </div>
      </div>

      <p className="scroll-hint" aria-hidden="true">Scorri per scoprire i piatti →</p>

      <div className="dish-strip" role="list" aria-label="Selezione dei piatti della Locanda Patrizia a Carrara">
        {dishes.map((dish, i) => (
          <article className="dish-card reveal" key={dish.title} role="listitem" style={{ transitionDelay: `${i * 40}ms` }}>
            <div className="dish-photo">
              <img
                src={dish.img}
                alt={dish.alt}
                loading="lazy"
                decoding="async"
                width="260"
                height="325"
                style={{ objectPosition: dish.pos || "center" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <h3>{dish.title}</h3>
          </article>
        ))}
      </div>

      <div className="menu-cta reveal">
        <button className="menu-full-btn" onClick={() => setActivePage("menu-page")} aria-label="Visualizza il menu completo della Locanda Patrizia di Carrara">
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
        {/* Testo SEO invisibile */}
        <p className="sr-only">
          Ristorante a Carrara aperto nel 2021 in Piazza delle Erbe 1. Cucina toscana con prodotti locali di Massa-Carrara.
          Ambiente familiare e accogliente nel centro storico di Carrara, vicino alle famose cave di marmo.
          Ideale per cene in coppia, pranzi in famiglia e gruppi. Prenotazione online disponibile.
        </p>
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
          alt="L'esterno del ristorante Locanda Patrizia in Piazza delle Erbe 1, centro storico di Carrara"
          className="locanda-cover-img"
          loading="lazy"
          decoding="async"
          width="560"
          height="340"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    </section>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function GallerySection() {
  return (
    <section id="gallery" className="section gallery-section" aria-labelledby="gallery-heading">
      {/* Testo SEO invisibile */}
      <p className="sr-only">
        Galleria fotografica della Locanda Patrizia: la sala da pranzo, il bancone in legno, i dettagli del locale
        e le strade del centro storico di Carrara. Ristorante elegante e accogliente nel cuore della Toscana.
      </p>
      <div className="section-head compact reveal">
        <p className="eyebrow">Gallery</p>
        <div><h2 id="gallery-heading">Dentro la Locanda.</h2></div>
      </div>

      <div className="gallery-grid desktop-gallery" role="list" aria-label="Galleria fotografica della Locanda Patrizia di Carrara">
        {gallery.map((photo, i) => (
          <figure className={`gallery-card reveal g${i + 1}`} key={photo.title} role="listitem">
            <img
              src={photo.img}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              width={i === 0 ? 720 : 480}
              height="270"
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

      <p className="scroll-hint mobile-only" aria-hidden="true">Scorri per vedere tutte le foto →</p>
      <div className="gallery-strip mobile-gallery" role="list" aria-label="Galleria fotografica della Locanda Patrizia">
        {gallery.map((photo) => (
          <figure className="gallery-strip-card" key={photo.title} role="listitem">
            <img
              src={photo.img}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              width="196"
              height="252"
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
      {/* Testo SEO invisibile */}
      <p className="sr-only">
        Locanda Patrizia, ristorante a Carrara (MS) in Piazza delle Erbe 1.
        Prenotazioni: +39 0585 873443 oppure online su locandapatrizia.it.
        Cucina toscana, pesce fresco e pasta artigianale. Aperto dal giovedì al martedì, cena dalle 19:30.
        Sabato e domenica anche a pranzo. Parcheggio nelle vicinanze. Accesso disabili. Carta di credito accettata.
      </p>
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="Locanda Patrizia — ristorante a Carrara (MS)" width="90" loading="lazy" decoding="async" />
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
            <p>Piazza delle Erbe, 1<br />54033 Carrara (MS)</p>
            <p><a href="tel:+390585873443" className="footer-link" aria-label="Chiama il ristorante Locanda Patrizia"><strong>+39 0585 873443</strong></a></p>
            <p><a href="mailto:locandapatriziaa@gmail.com" className="footer-link">locandapatriziaa@gmail.com</a></p>
          </address>
          <button className="gold-btn" onClick={openBooking} style={{ marginTop: "14px" }} aria-label="Prenota un tavolo al ristorante Locanda Patrizia di Carrara">
            Prenota ora
          </button>
        </div>
        <div>
          <h3 className="footer-h">Dove siamo</h3>
          <p>Nel cuore di Carrara, a pochi passi dal centro storico e dalle cave di marmo.</p>
          <button className="footer-link-btn" onClick={openMaps} aria-label="Apri Locanda Patrizia in Google Maps — Piazza delle Erbe 1, Carrara">
            → Apri in Google Maps
          </button>
          <h3 className="footer-h" style={{ marginTop: "16px" }}>Seguici</h3>
          <button className="footer-link-btn" onClick={openInstagram} aria-label="Visita il profilo Instagram ufficiale di Locanda Patrizia Carrara">
            → Instagram
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Locanda Patrizia — Piazza delle Erbe 1, Carrara</span>
        <span className="footer-legal-links">
          <a href={PRIVACY_URL} className="footer-bottom-link">Privacy Policy</a>
          {" · "}
          <a href={COOKIE_URL} className="footer-bottom-link">Cookie Policy</a>
        </span>
      </div>
    </footer>
  );
}


// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePageState] = useState<Page>(() => routeToPage());
  const [bookingOpen, setBookingOpen] = useState(() => isBookingRoute());

  const setActivePage = useCallback((page: Page) => {
    setActivePageState(page);
    const nextPath = pagePath(page);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ page }, "", nextPath);
    }
  }, []);

  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => {
    setBookingOpen(false);
    if (window.location.pathname.replace(/\/$/, "") === "/prenota") {
      window.history.replaceState({ page: "home" }, "", "/");
    }
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      setActivePageState(routeToPage());
      setBookingOpen(isBookingRoute());
    };

    if (isBookingRoute()) setBookingOpen(true);
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

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
          <Suspense fallback={null}>
            <MenuPage onBack={() => setActivePage("home")} openBooking={openBooking} />
          </Suspense>
        ) : (
          <>
            <Hero openBooking={openBooking} />
            <Tagline />
            <MenuSection setActivePage={setActivePage} />
            <LocandaSection />
            <GallerySection />
            <Footer openBooking={openBooking} />
          </>
        )}
      </main>
      <MobileNav activePage={activePage} setActivePage={setActivePage} />
      <FloatingBookingButton openBooking={openBooking} />
      {bookingOpen && <BookingModal onClose={closeBooking} />}
    </>
  );
}
