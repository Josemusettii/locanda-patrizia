import { useEffect, useState, useRef } from "react";
import logo from "./assets/logo.png";
import heroDesktop from "./assets/hero-desktop.jpg";
import heroMobile from "./assets/hero-mobile.jpg";
import salaBancone from "./assets/sala-bancone.jpg";
import esternoCarrara from "./assets/esterno-carrara.jpg";
import piattoCarne from "./assets/piatto-carne.jpg";
import piattoCostine from "./assets/piatto-costine.jpg";
import piattoTaco from "./assets/piatto-taco.jpg";
import menuCover from "./assets/menu-cover.jpg";

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────
// 1. Vai su https://www.emailjs.com e crea un account gratuito
// 2. Crea un "Email Service" collegando la tua email Gmail/Outlook
// 3. Crea un "Email Template" con le variabili qui sotto
// 4. Sostituisci i tre valori con i tuoi
const EMAILJS_SERVICE_ID  = "service_XXXXXXX";   // ← il tuo Service ID
const EMAILJS_TEMPLATE_ID = "template_XXXXXXX";  // ← il tuo Template ID
const EMAILJS_PUBLIC_KEY  = "XXXXXXXXXXXXXXXXXXXX"; // ← la tua Public Key

// ─── TEMPLATE EMAILJS ─────────────────────────────────────────────────────────
// Nel pannello EmailJS, crea un template con questo testo:
//
// Soggetto: Nuova prenotazione – {{guest_name}} – {{date}} ore {{time}}
//
// Corpo:
// Hai ricevuto una nuova richiesta di prenotazione da {{guest_name}}.
//
// Data:     {{date}}
// Ora:      {{time}}
// Coperti:  {{guests}}
// Telefono: {{phone}}
// Email:    {{guest_email}}
// Note:     {{notes}}
//
// Rispondi al cliente per confermare: {{guest_email}}
// ─────────────────────────────────────────────────────────────────────────────

const MAPS_URL     = "https://maps.google.com/?q=Via+XX+Settembre+21+Carrara";
const INSTAGRAM_URL = "https://www.instagram.com/locandapatrizia";
const publicImg = (name: string) => `/${name}`;

function openMaps()      { window.open(MAPS_URL,      "_blank", "noopener,noreferrer"); }
function openInstagram() { window.open(INSTAGRAM_URL,  "_blank", "noopener,noreferrer"); }
function goTo(id: string){ document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); }

// ─── TIPI ─────────────────────────────────────────────────────────────────────
type Photo = { title: string; img: string; fallback?: string; pos?: string; };
type BookingStatus = "idle" | "sending" | "success" | "error";

// ─── DATI ─────────────────────────────────────────────────────────────────────
const dishes: Photo[] = [
  { title: "Capellacci al ricordo di baccalà marinato",                                  img: publicImg("ravioli-pomodoro.jpg"), pos: "50% 55%" },
  { title: "Bottoni ripieni di quaglia, il suo fondo e crema di provola affumicata",      img: publicImg("ravioli-bianco.jpg"),   pos: "50% 53%" },
  { title: "Plin ripieni di gamberi e lardo su crema di asparagi",                        img: publicImg("ravioli-asparagi.jpg"), pos: "50% 55%" },
  { title: "Piccioncino con suo fondo, radicchio e crema di carote",                      img: piattoCarne,                      pos: "50% 45%" },
  { title: "Costolette di agnello panate alle erbette di montagna con patate",            img: piattoCostine,                    pos: "50% 50%" },
  { title: "Tacos con pulled pork",                                                       img: piattoTaco,                       pos: "42% 50%" },
];

const gallery: Photo[] = [
  { title: "Il bancone",  img: salaBancone,                                                pos: "50% 50%" },
  { title: "La sala",     img: publicImg("gallery-statua.jpg"), fallback: esternoCarrara,  pos: "50% 50%" },
  { title: "Carrara",     img: esternoCarrara,                                             pos: "50% 50%" },
  { title: "I dettagli",  img: publicImg("gallery-tavolo.jpg"),                            pos: "50% 50%" },
  { title: "Il menu",     img: menuCover,                                                  pos: "50% 50%" },
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

// ─── UTILS ────────────────────────────────────────────────────────────────────
function Img({ src, fallback, alt, pos }: { src: string; fallback?: string; alt: string; pos?: string }) {
  return (
    <img src={src} alt={alt} style={{ objectPosition: pos || "center" }}
      onError={(e) => { if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} />
  );
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <Img src={photo.img} fallback={photo.fallback} alt={photo.title} pos={photo.pos} />
        <p className="lightbox-caption">{photo.title}</p>
      </div>
    </div>
  );
}

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", phone: "",
    date: "", time: "", guests: "2", notes: "",
  });
  const [status, setStatus] = useState<BookingStatus>("idle");
  const firstRef = useRef<HTMLInputElement>(null);

  // Blocca scroll body quando modal è aperta
  useEffect(() => {
    document.body.style.overflow = "hidden";
    firstRef.current?.focus();
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", h);
    };
  }, [onClose]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Data minima = domani
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Orari disponibili
  const lunchSlots  = ["12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00"];
  const dinnerSlots = ["19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30"];
  const allSlots    = [...lunchSlots, ...dinnerSlots];

  const handleSubmit = async () => {
    if (!form.guest_name || !form.guest_email || !form.date || !form.time || !form.phone) return;
    setStatus("sending");

    try {
      // EmailJS - invia email al ristorante
      const payload = {
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          guest_name:  form.guest_name,
          guest_email: form.guest_email,
          phone:       form.phone,
          date:        form.date,
          time:        form.time,
          guests:      form.guests,
          notes:       form.notes || "—",
        },
      };
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        throw new Error("EmailJS error");
      }
    } catch {
      setStatus("error");
    }
  };

  const isValid = form.guest_name && form.guest_email && form.phone && form.date && form.time;

  return (
    <div className="bk-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Prenota un tavolo">
      <div className="bk-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bk-header">
          <div className="bk-header-logo">
            <img src={logo} alt="Locanda Patrizia" />
          </div>
          <div>
            <p className="bk-eyebrow">Locanda Patrizia · Carrara</p>
            <h2 className="bk-title">Prenota il tuo tavolo</h2>
          </div>
          <button className="bk-close" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>

        {/* Info orari */}
        <div className="bk-info-strip">
          <span>🕐 Pranzo 12:30 – 14:30</span>
          <span className="bk-dot">·</span>
          <span>🕗 Cena 19:30 – 22:30</span>
          <span className="bk-dot">·</span>
          <span>Chiuso il martedì</span>
        </div>

        {/* Contenuto — success / error / form */}
        {status === "success" ? (
          <div className="bk-success">
            <div className="bk-success-icon">✓</div>
            <h3>Richiesta inviata!</h3>
            <p>Abbiamo ricevuto la tua richiesta per <strong>{form.guests} persone</strong> il <strong>{form.date}</strong> alle <strong>{form.time}</strong>.</p>
            <p>Ti contatteremo a breve su <strong>{form.guest_email}</strong> per confermare la disponibilità.</p>
            <p className="bk-success-note">Non dimenticare: la prenotazione è confermata solo dopo la risposta del ristorante.</p>
            <button className="bk-submit" onClick={onClose}>Chiudi</button>
          </div>
        ) : status === "error" ? (
          <div className="bk-success">
            <div className="bk-error-icon">✕</div>
            <h3>Qualcosa non ha funzionato</h3>
            <p>Non è stato possibile inviare la richiesta. Prova a chiamarci direttamente:</p>
            <p className="bk-phone">+39 0585 123456</p>
            <button className="bk-submit" onClick={() => setStatus("idle")}>Riprova</button>
          </div>
        ) : (
          <div className="bk-body">
            {/* Riga 1 — Nome e Telefono */}
            <div className="bk-row">
              <div className="bk-field">
                <label className="bk-label">Nome e cognome *</label>
                <input
                  ref={firstRef}
                  className="bk-input"
                  type="text"
                  placeholder="Mario Rossi"
                  value={form.guest_name}
                  onChange={(e) => set("guest_name", e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="bk-field">
                <label className="bk-label">Telefono *</label>
                <input
                  className="bk-input"
                  type="tel"
                  placeholder="+39 333 1234567"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Riga 2 — Email */}
            <div className="bk-field">
              <label className="bk-label">Email *</label>
              <input
                className="bk-input"
                type="email"
                placeholder="mario@email.it"
                value={form.guest_email}
                onChange={(e) => set("guest_email", e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Riga 3 — Data, Orario, Coperti */}
            <div className="bk-row bk-row-3">
              <div className="bk-field">
                <label className="bk-label">Data *</label>
                <input
                  className="bk-input"
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="bk-field">
                <label className="bk-label">Orario *</label>
                <select className="bk-input bk-select" value={form.time} onChange={(e) => set("time", e.target.value)}>
                  <option value="">Scegli</option>
                  <optgroup label="Pranzo">
                    {lunchSlots.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                  <optgroup label="Cena">
                    {dinnerSlots.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="bk-field">
                <label className="bk-label">Coperti *</label>
                <select className="bk-input bk-select" value={form.guests} onChange={(e) => set("guests", e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? "persona" : "persone"}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Riga 4 — Note */}
            <div className="bk-field">
              <label className="bk-label">Richieste speciali <span className="bk-optional">(facoltativo)</span></label>
              <textarea
                className="bk-input bk-textarea"
                placeholder="Allergie, occasioni speciali, seggiolone per bambini…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Note legali */}
            <p className="bk-legal">
              La prenotazione verrà confermata telefonicamente o via email entro 24 ore.
              Per gruppi superiori a 8 persone contattaci direttamente al <strong>+39 0585 123456</strong>.
            </p>

            {/* Submit */}
            <button
              className={`bk-submit ${!isValid ? "disabled" : ""} ${status === "sending" ? "sending" : ""}`}
              onClick={handleSubmit}
              disabled={!isValid || status === "sending"}
            >
              {status === "sending" ? (
                <><span className="bk-spinner" />Invio in corso…</>
              ) : (
                "Invia richiesta di prenotazione"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function NavIcon({ name }: { name: string }) {
  const s = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home")     return <svg {...s}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if (name === "menu")     return <svg {...s}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
  if (name === "locanda")  return <svg {...s}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
  if (name === "gallery")  return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
  return <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.28 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16.92z"/></svg>;
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ activePage, setActivePage, openBooking }: { activePage: string; setActivePage: (p: string) => void; openBooking: () => void }) {
  return (
    <header className="desktop-header">
      <a href="#home" className="logo-pill" aria-label="Locanda Patrizia" onClick={() => setActivePage("home")}>
        <img src={logo} alt="Locanda Patrizia" />
      </a>
      <nav className="desktop-menu">
        <a href="#home"     onClick={() => setActivePage("home")}>Home</a>
        <span className="nav-dot">·</span>
        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage("menu-page"); }}>Menu</a>
        <span className="nav-dot">·</span>
        <a href="#locanda"  onClick={() => setActivePage("home")}>Locanda</a>
        <span className="nav-dot">·</span>
        <a href="#gallery"  onClick={() => setActivePage("home")}>Gallery</a>
        <span className="nav-dot">·</span>
        <a href="#contatti" onClick={() => setActivePage("home")}>Contatti</a>
      </nav>
      <button className="gold-btn small" onClick={openBooking}>Prenota</button>
    </header>
  );
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────
function MobileNav({ activePage, setActivePage, openBooking }: { activePage: string; setActivePage: (p: string) => void; openBooking: () => void }) {
  const items = [
    { icon: "home",     label: "Home",     action: () => { setActivePage("home"); goTo("#home"); } },
    { icon: "menu",     label: "Menu",     action: () => setActivePage("menu-page") },
    { icon: "locanda",  label: "Locanda",  action: () => { setActivePage("home"); setTimeout(() => goTo("#locanda"), 50); } },
    { icon: "gallery",  label: "Gallery",  action: () => { setActivePage("home"); setTimeout(() => goTo("#gallery"), 50); } },
    { icon: "contatti", label: "Contatti", action: () => { setActivePage("home"); setTimeout(() => goTo("#contatti"), 50); } },
  ];
  const activeLabel = activePage === "menu-page" ? "Menu" : "";
  return (
    <nav className="mobile-nav">
      {items.map((item) => (
        <button key={item.label} className={activeLabel === item.label ? "nav-active" : ""} onClick={item.action}>
          <span className="nav-icon-wrap"><NavIcon name={item.icon} /></span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ openBooking }: { openBooking: () => void }) {
  return (
    <section id="home" className="hero">
      <img className="hero-img hero-img-desktop" src={heroDesktop} alt="Locanda Patrizia"
        style={{ objectPosition: "52% 58%" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = publicImg("gallery-tavolo.jpg"); }} />
      <img className="hero-img hero-img-mobile" src={heroMobile} alt="Locanda Patrizia"
        style={{ objectPosition: "50% 50%" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = publicImg("sala-hero.jpg"); }} />
      <div className="hero-shade" />
      <div className="hero-content">
        <button className="hero-reserve-btn" onClick={openBooking}>
          <span className="hero-btn-line" />
          <span className="hero-btn-text">Prenota il tuo tavolo</span>
          <span className="hero-btn-line" />
        </button>
      </div>
    </section>
  );
}

// ─── TAGLINE ──────────────────────────────────────────────────────────────────
function Tagline() {
  return (
    <div className="tagline-band reveal">
      <span className="tagline-line" />
      <p className="tagline-text">La felicità è fatta di buoni ingredienti.</p>
      <span className="tagline-line" />
    </div>
  );
}

// ─── MENU SECTION ─────────────────────────────────────────────────────────────
function MenuSection({ setActivePage, openBooking }: { setActivePage: (p: string) => void; openBooking: () => void }) {
  return (
    <section id="menu" className="section menu-section">
      <div className="section-head reveal">
        <p className="eyebrow">I nostri piatti</p>
        <div>
          <h2>Sapori che restano.</h2>
          <button onClick={openBooking}>Prenota →</button>
        </div>
      </div>
      <div className="dish-strip">
        {dishes.map((dish, i) => (
          <article className="dish-card reveal" key={dish.title} style={{ transitionDelay: `${i * 40}ms` }}>
            <div className="dish-photo"><Img src={dish.img} alt={dish.title} pos={dish.pos} /></div>
            <h3>{dish.title}</h3>
          </article>
        ))}
      </div>
      <div className="menu-cta reveal">
        <button className="menu-full-btn" onClick={() => setActivePage("menu-page")}>
          Sfoglia il menu completo
        </button>
      </div>
    </section>
  );
}

// ─── LOCANDA ──────────────────────────────────────────────────────────────────
function LocandaSection() {
  return (
    <section id="locanda" className="locanda-wow reveal">
      <div className="locanda-text">
        <p className="eyebrow">La nostra storia</p>
        <h2>La Locanda.</h2>
        <p>Francesca e Riccardo hanno aperto le porte della Locanda nel dicembre 2021 con un'idea chiara: creare il posto che avrebbero voluto trovare loro stessi. Un luogo dove sentirsi a casa, dove il cibo è curato senza essere complicato e dove ogni ospite viene accolto come si accoglie un amico.</p>
        <p className="locanda-p2">Da Carrara, con tutto l'amore che solo una famiglia sa mettere in tavola.</p>
      </div>
      <div className="locanda-img-wrap">
        <img src={publicImg("locanda-esterno.jpg")} alt="Ingresso Locanda Patrizia" className="locanda-cover-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      </div>
    </section>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function GallerySection() {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  return (
    <section id="gallery" className="section gallery-section">
      <div className="section-head compact reveal">
        <p className="eyebrow">Gallery</p>
        <div><h2>Dentro la Locanda.</h2></div>
      </div>
      <div className="gallery-grid desktop-gallery">
        {gallery.map((photo, i) => (
          <figure className={`gallery-card reveal g${i + 1}`} key={photo.title} onClick={() => setLightbox(photo)}>
            <Img src={photo.img} fallback={photo.fallback} alt={photo.title} pos={photo.pos} />
            <div className="gallery-zoom-icon">⊕</div>
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-strip mobile-gallery">
        {gallery.map((photo) => (
          <figure className="gallery-strip-card" key={photo.title} onClick={() => setLightbox(photo)}>
            <Img src={photo.img} fallback={photo.fallback} alt={photo.title} pos={photo.pos} />
            <div className="gallery-zoom-icon">⊕</div>
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>
      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ openBooking }: { openBooking: () => void }) {
  return (
    <footer id="contatti" className="footer reveal">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="Locanda Patrizia" />
          <p>Tradizione, accoglienza e cucina sincera nel cuore di Carrara.<br />Aperta da Francesca e Riccardo dal 2021.</p>
        </div>
        <div>
          <h4>Orari</h4>
          <p>Pranzo<br /><strong>12:30 – 14:30</strong></p>
          <p>Cena<br /><strong>19:30 – 22:30</strong></p>
          <p>Chiuso il martedì</p>
        </div>
        <div>
          <h4>Contatti</h4>
          <p>Via XX Settembre, 21<br />54033 Carrara (MS)</p>
          <p><strong>+39 0585 123456</strong></p>
          <p>info@locandapatrizia.it</p>
          <button className="gold-btn" onClick={openBooking} style={{ marginTop: "12px" }}>Prenota ora</button>
        </div>
        <div>
          <h4>Dove siamo</h4>
          <p>Nel cuore di Carrara, a pochi passi dal centro storico.</p>
          <p onClick={openMaps} style={{ color:"var(--gold)", cursor:"pointer" }}>→ Apri in Google Maps</p>
          <h4 style={{ marginTop:"14px" }}>Seguici</h4>
          <p onClick={openInstagram} style={{ color:"var(--gold)", cursor:"pointer" }}>→ Instagram</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Locanda Patrizia</span>
        <span>Privacy Policy · Cookie Policy</span>
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
      <div className="menu-hero">
        <img className="menu-hero-img" src={menuCover} alt="Locanda Patrizia"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <div className="menu-hero-shade" />
        <div className="menu-hero-content">
          <button className="back-btn" onClick={onBack}>← Torna alla home</button>
          <div className="menu-hero-logo"><img src={logo} alt="Locanda Patrizia" /></div>
          <p className="menu-hero-eyebrow">Locanda Patrizia · Carrara</p>
          <h1 className="menu-hero-title">La nostra cucina</h1>
          <p className="menu-hero-subtitle">Ingredienti selezionati, ricette genuine, passione artigianale.</p>
        </div>
      </div>
      <div className="menu-tabs-wrap">
        <div className="menu-tabs">
          {tabs.map((tab) => (
            <button key={tab.key} className={`menu-tab ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-sub">{tab.sub}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="menu-body">
        <div className="menu-section-title">
          <span className="menu-ornament">✦</span>
          <h2>{tabs.find(t => t.key === activeTab)?.label}</h2>
          <span className="menu-ornament">✦</span>
        </div>
        <div className="menu-items-list">
          {items.map((item, i) => (
            <div className="menu-item" key={i} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="menu-item-info">
                <p className="menu-item-name">{item.name}</p>
                {"tag" in item && item.tag && <span className="menu-item-tag">Allergeni: {item.tag}</span>}
              </div>
              <div className="menu-item-separator" />
              <span className="menu-item-price">{item.price} €</span>
            </div>
          ))}
        </div>
        <div className="menu-page-footer">
          <p className="menu-note">I prezzi sono espressi in euro e includono il servizio.<br />Per informazioni sugli allergeni, il personale di sala è a vostra disposizione.</p>
          <div className="menu-footer-divider"><span className="menu-ornament small">✦</span></div>
          <button className="menu-reserve-btn" onClick={openBooking}>Prenota il tuo tavolo</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage,    setActivePage]   = useState("home");
  const [bookingOpen,   setBookingOpen]  = useState(false);

  const openBooking  = () => setBookingOpen(true);
  const closeBooking = () => setBookingOpen(false);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [activePage]);

  useEffect(() => {
    if (activePage === "menu-page") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activePage]);

  return (
    <>
      <Header activePage={activePage} setActivePage={setActivePage} openBooking={openBooking} />
      <main>
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
      <MobileNav activePage={activePage} setActivePage={setActivePage} openBooking={openBooking} />

      {/* Booking Modal */}
      {bookingOpen && <BookingModal onClose={closeBooking} />}

      <style>{CSS}</style>
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Serif+Display:ital@0;1&display=swap');

:root {
  --green: #0a3f30; --deep: #05251d; --cream: #f6efe2; --paper: #fffaf0;
  --gold: #cfaa55; --gold-light: #e2c878; --text: #0f3f31; --muted: #66736c;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--cream); color: var(--text); font-family: 'Cormorant Garamond', Georgia, serif; }
button, a { font: inherit; }
button { border: 0; cursor: pointer; }
img { display: block; max-width: 100%; }
main { overflow: hidden; }

/* ── HEADER ── */
.desktop-header { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 50; width: min(1100px, calc(100% - 60px)); height: 68px; display: grid; grid-template-columns: 90px 1fr 140px; align-items: center; border-radius: 999px; padding: 8px 16px; background: rgba(250,246,236,.92); backdrop-filter: blur(20px); box-shadow: 0 8px 40px rgba(0,0,0,.12), inset 0 0 0 1px rgba(255,255,255,.6); }
.logo-pill { width: 52px; height: 52px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 4px 18px rgba(0,0,0,.1); transition: transform .25s; }
.logo-pill:hover { transform: scale(1.06); }
.logo-pill img { width: 42px; height: 42px; object-fit: contain; }
.desktop-menu { justify-self: center; display: flex; align-items: center; gap: 8px; padding: 10px 26px; border-radius: 999px; background: rgba(255,255,255,.38); }
.desktop-menu a { color: var(--deep); text-decoration: none; text-transform: uppercase; font-size: 11px; font-weight: 300; letter-spacing: .22em; transition: color .2s; padding: 2px 6px; }
.desktop-menu a:hover { color: var(--gold); }
.nav-dot { color: var(--gold); font-size: 12px; opacity: .35; }
.gold-btn { background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%); color: #fff; border-radius: 999px; padding: 13px 24px; font-size: 11px; font-weight: 300; letter-spacing: .18em; text-transform: uppercase; box-shadow: 0 8px 24px rgba(207,170,85,.28); transition: transform .25s, box-shadow .25s; }
.gold-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(207,170,85,.38); }
.gold-btn.small { justify-self: end; padding: 11px 22px; }

/* ── HERO ── */
.hero { position: relative; height: 100svh; min-height: 600px; max-height: 960px; overflow: hidden; }
.hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-img-mobile { display: none; }
.hero-shade { position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(5,37,29,.68) 0%, rgba(5,37,29,.16) 38%, rgba(0,0,0,0) 65%); }
.hero-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 64px; }
.hero-reserve-btn { display: flex; align-items: center; gap: 22px; background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,.88); font-family: 'Cormorant Garamond', serif; font-size: clamp(13px, 1.6vw, 17px); font-weight: 300; letter-spacing: .36em; text-transform: uppercase; transition: color .35s, gap .35s; padding: 10px 0; }
.hero-reserve-btn:hover { color: var(--gold-light); gap: 32px; }
.hero-btn-line { display: block; width: 48px; height: 1px; background: currentColor; opacity: .55; transition: width .4s; }
.hero-reserve-btn:hover .hero-btn-line { width: 64px; }
.hero-btn-text { white-space: nowrap; }
.eyebrow { margin: 0 0 10px; color: var(--gold); text-transform: uppercase; letter-spacing: .32em; font-weight: 300; font-size: 11px; }

/* ── TAGLINE ── */
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
.tagline-band { display: flex; align-items: center; gap: 28px; padding: 52px 72px; background: var(--paper); }
.tagline-band.reveal { opacity: 1; transform: none; }
.tagline-band.visible .tagline-text { animation: fadeSlideUp .9s cubic-bezier(.16,1,.3,1) forwards; }
.tagline-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(207,170,85,.4), transparent); }
.tagline-text { font-family: 'Cormorant Garamond', serif; font-size: clamp(26px, 3vw, 44px); font-style: italic; font-weight: 300; color: var(--deep); text-align: center; margin: 0; letter-spacing: .02em; opacity: 0; white-space: nowrap; }

/* ── MENU SECTION ── */
.section { width: min(1120px, calc(100% - 72px)); margin: 0 auto; }
.menu-section { padding: 80px 0 50px; }
.section-head { margin-bottom: 34px; }
.section-head > div { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
.section-head h2 { margin: 0; font-family: 'Cormorant Garamond', serif; color: var(--text); font-size: clamp(46px, 5.4vw, 76px); line-height: .93; letter-spacing: -.02em; font-style: italic; font-weight: 300; }
.section-head button { background: transparent; color: var(--text); font-weight: 300; font-size: 16px; letter-spacing: .06em; }
.dish-strip { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.dish-photo { aspect-ratio: 4/5; border-radius: 18px; overflow: hidden; background: #e5ded2; box-shadow: 0 14px 30px rgba(0,0,0,.09); }
.dish-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform .9s cubic-bezier(.2,.7,.2,1); }
.dish-card:hover img { transform: scale(1.07); }
.dish-card h3 { margin: 10px 0 0; color: var(--deep); font-size: 13px; line-height: 1.3; text-align: center; font-style: italic; font-weight: 300; }
.menu-cta { text-align: center; margin-top: 44px; }
.menu-full-btn { background: transparent; border: 1px solid var(--gold); color: var(--gold); border-radius: 999px; padding: 13px 38px; font-size: 11px; font-weight: 300; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; transition: background .25s, color .25s; }
.menu-full-btn:hover { background: var(--gold); color: #fff; }

/* ── LOCANDA ── */
.locanda-wow { width: min(1120px, calc(100% - 72px)); margin: 16px auto 0; padding: 44px 50px; border-radius: 28px; background: radial-gradient(ellipse at top left, rgba(207,170,85,.14) 0%, transparent 50%), linear-gradient(145deg, #06281f 0%, #0b4635 100%); color: white; display: grid; grid-template-columns: 1fr .7fr; gap: 48px; align-items: center; box-shadow: 0 24px 60px rgba(0,0,0,.14); }
.locanda-wow h2 { margin: 0 0 16px; font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 4.8vw, 64px); font-weight: 300; font-style: italic; color: white; line-height: .92; }
.locanda-wow p { margin: 0; color: rgba(255,255,255,.72); line-height: 1.72; font-size: 16px; font-weight: 300; }
.locanda-p2 { margin-top: 16px !important; color: rgba(255,255,255,.46) !important; font-style: italic; font-size: 15px !important; }
.locanda-img-wrap { border-radius: 16px; overflow: hidden; height: 340px; }
.locanda-cover-img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; }

/* ── GALLERY ── */
.gallery-section { padding: 72px 0 36px; }
.section-head.compact { margin-bottom: 24px; }
.desktop-gallery { display: grid; grid-template-columns: 1.25fr .9fr .9fr; gap: 16px; }
.mobile-gallery { display: none; }
.gallery-card { position: relative; margin: 0; height: 265px; border-radius: 22px; overflow: hidden; background: #ddd; box-shadow: 0 16px 34px rgba(0,0,0,.08); cursor: pointer; }
.gallery-card img { width: 100%; height: 100%; object-fit: cover; transition: transform .9s cubic-bezier(.2,.7,.2,1); }
.gallery-card:hover img { transform: scale(1.06); }
.gallery-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.52), transparent 56%); }
.gallery-card figcaption { position: absolute; z-index: 1; left: 18px; bottom: 16px; color: white; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; font-style: italic; }
.gallery-zoom-icon { position: absolute; z-index: 2; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.16); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; opacity: 0; transition: opacity .25s; }
.gallery-card:hover .gallery-zoom-icon { opacity: 1; }

/* ── LIGHTBOX ── */
.lightbox-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(5,37,29,.94); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn .25s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.lightbox-inner { position: relative; max-width: 880px; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,.5); }
.lightbox-inner img { width: 100%; height: auto; max-height: 80vh; object-fit: contain; background: #000; }
.lightbox-close { position: absolute; top: 14px; right: 14px; z-index: 10; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.12); color: #fff; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.lightbox-close:hover { background: rgba(255,255,255,.25); }
.lightbox-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 20px; background: linear-gradient(0deg, rgba(0,0,0,.7), transparent); color: rgba(255,255,255,.82); font-style: italic; font-weight: 300; font-size: 17px; margin: 0; }

/* ── FOOTER ── */
.footer { width: min(1120px, calc(100% - 72px)); margin: 0 auto 70px; padding: 44px; border-radius: 28px; background: linear-gradient(145deg, #06281f, #0b4635); color: #fff; box-shadow: 0 28px 80px rgba(0,0,0,.14); }
.footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr .9fr; gap: 36px; }
.footer-brand img { width: 90px; margin-bottom: 14px; }
.footer h4 { margin: 0 0 12px; color: var(--gold); text-transform: uppercase; letter-spacing: .2em; font-size: 10px; font-weight: 300; }
.footer p { margin: 0 0 8px; color: rgba(255,255,255,.62); line-height: 1.6; font-size: 14px; font-weight: 300; }
.footer strong { color: #fff; font-weight: 400; }
.footer-bottom { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.1); display: flex; justify-content: space-between; color: rgba(255,255,255,.32); font-size: 11px; letter-spacing: .08em; }

/* ── MENU PAGE ── */
.menu-page { min-height: 100vh; background: var(--cream); }
.menu-hero { position: relative; height: 52svh; min-height: 340px; overflow: hidden; }
.menu-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.menu-hero-shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(5,37,29,.86) 0%, rgba(5,37,29,.5) 50%, rgba(5,37,29,.28) 100%); }
.menu-hero-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 48px; text-align: center; color: white; }
.back-btn { position: absolute; top: 22px; left: 22px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.22); color: rgba(255,255,255,.78); border-radius: 999px; padding: 9px 20px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; cursor: pointer; backdrop-filter: blur(10px); transition: background .2s; }
.back-btn:hover { background: rgba(255,255,255,.2); color: #fff; }
.menu-hero-logo { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.94); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 6px 28px rgba(0,0,0,.2); }
.menu-hero-logo img { width: 50px; height: 50px; object-fit: contain; }
.menu-hero-eyebrow { font-size: 11px; letter-spacing: .38em; text-transform: uppercase; color: var(--gold-light); margin-bottom: 10px; font-weight: 300; }
.menu-hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 6vw, 64px); font-style: italic; font-weight: 300; color: white; margin: 0 0 10px; line-height: 1; }
.menu-hero-subtitle { font-size: 14px; font-weight: 300; color: rgba(255,255,255,.55); font-style: italic; margin: 0; }
.menu-tabs-wrap { position: sticky; top: 0; z-index: 10; background: rgba(246,239,226,.96); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(207,170,85,.18); padding: 0 24px; }
.menu-tabs { max-width: 720px; margin: 0 auto; display: flex; }
.menu-tab { flex: 1; background: transparent; border: none; padding: 16px 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; border-bottom: 2px solid transparent; transition: border-color .25s, color .25s; color: var(--muted); }
.menu-tab.active { border-color: var(--gold); color: var(--deep); }
.tab-label { font-size: 13px; font-weight: 300; letter-spacing: .14em; text-transform: uppercase; }
.tab-sub { font-size: 11px; font-style: italic; font-weight: 300; opacity: .65; }
.menu-body { max-width: 860px; margin: 0 auto; padding: 44px 40px 80px; }
.menu-section-title { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; }
.menu-section-title h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 44px); font-style: italic; font-weight: 300; color: var(--deep); margin: 0; white-space: nowrap; }
.menu-ornament { color: var(--gold); font-size: 12px; opacity: .65; flex-shrink: 0; }
.menu-ornament.small { font-size: 9px; }
@keyframes itemFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.menu-items-list { display: flex; flex-direction: column; }
.menu-item { display: flex; align-items: center; gap: 0; padding: 20px 0; border-bottom: 1px solid rgba(15,63,49,.07); animation: itemFadeIn .4s ease both; }
.menu-item:last-child { border-bottom: none; }
.menu-item-info { flex-shrink: 0; max-width: 68%; }
.menu-item-name { margin: 0; font-size: 19px; font-weight: 300; color: var(--deep); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.menu-item-tag { display: block; margin-top: 3px; font-size: 11px; font-style: italic; color: var(--muted); }
.menu-item-separator { flex: 1; height: 1px; min-width: 20px; margin: 0 16px; background: repeating-linear-gradient(90deg, rgba(207,170,85,.3) 0, rgba(207,170,85,.3) 3px, transparent 3px, transparent 9px); }
.menu-item-price { font-size: 21px; font-weight: 300; color: var(--gold); white-space: nowrap; flex-shrink: 0; letter-spacing: .02em; }
.menu-page-footer { margin-top: 48px; text-align: center; }
.menu-note { font-size: 12px; font-style: italic; color: var(--muted); line-height: 1.75; margin-bottom: 24px; }
.menu-footer-divider { margin: 20px 0; display: flex; align-items: center; justify-content: center; gap: 16px; }
.menu-footer-divider::before, .menu-footer-divider::after { content: ""; flex: 1; height: 1px; max-width: 70px; background: rgba(207,170,85,.3); }
.menu-reserve-btn { display: inline-block; background: linear-gradient(135deg, var(--green), #0b4635); color: rgba(255,255,255,.88); border: none; border-radius: 999px; padding: 15px 46px; font-size: 12px; font-weight: 300; letter-spacing: .22em; text-transform: uppercase; cursor: pointer; box-shadow: 0 10px 32px rgba(6,40,31,.22); transition: transform .3s, box-shadow .3s; }
.menu-reserve-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(6,40,31,.3); }

/* ── BOOKING MODAL ── */
@keyframes bkSlideUp { from { opacity: 0; transform: translateY(32px) scale(.98); } to { opacity: 1; transform: none; } }
.bk-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(5,37,29,.7); backdrop-filter: blur(14px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0; animation: fadeIn .25s ease;
}
@media (min-width: 600px) {
  .bk-overlay { align-items: center; padding: 24px; }
}
.bk-modal {
  width: 100%; max-width: 620px; max-height: 94svh;
  background: var(--paper); border-radius: 28px 28px 0 0;
  overflow-y: auto; animation: bkSlideUp .35s cubic-bezier(.16,1,.3,1);
  box-shadow: 0 -20px 80px rgba(0,0,0,.25);
}
@media (min-width: 600px) {
  .bk-modal { border-radius: 24px; box-shadow: 0 40px 100px rgba(0,0,0,.3); }
}

/* Header modal */
.bk-header {
  display: flex; align-items: center; gap: 14px;
  padding: 24px 24px 0; position: relative;
}
.bk-header-logo { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.bk-header-logo img { width: 38px; height: 38px; object-fit: contain; }
.bk-eyebrow { margin: 0 0 3px; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--gold); font-weight: 300; }
.bk-title { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: clamp(22px, 4vw, 30px); font-style: italic; font-weight: 300; color: var(--deep); line-height: 1; }
.bk-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; background: rgba(15,63,49,.08); color: var(--deep); font-size: 14px; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.bk-close:hover { background: rgba(15,63,49,.14); }

/* Info strip */
.bk-info-strip {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin: 16px 24px 0; padding: 12px 16px; border-radius: 12px;
  background: rgba(207,170,85,.1); border: 1px solid rgba(207,170,85,.2);
  font-size: 12px; font-weight: 300; color: var(--text); letter-spacing: .04em;
}
.bk-dot { color: var(--gold); opacity: .5; }

/* Body del form */
.bk-body { padding: 20px 24px 28px; display: flex; flex-direction: column; gap: 16px; }
.bk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bk-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.bk-field { display: flex; flex-direction: column; gap: 6px; }
.bk-label { font-size: 11px; font-weight: 300; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.bk-optional { text-transform: none; letter-spacing: 0; font-style: italic; opacity: .7; }
.bk-input {
  border: 1px solid rgba(15,63,49,.18); border-radius: 10px;
  padding: 12px 14px; background: #fff; color: var(--deep);
  font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 300;
  transition: border-color .2s, box-shadow .2s; outline: none; width: 100%;
}
.bk-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(207,170,85,.14); }
.bk-input::placeholder { color: rgba(15,63,49,.35); }
.bk-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2366736c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; cursor: pointer; }
.bk-textarea { resize: vertical; min-height: 80px; line-height: 1.55; }
.bk-legal { font-size: 12px; font-style: italic; color: var(--muted); line-height: 1.6; margin: 0; }

/* Submit */
.bk-submit {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(135deg, var(--green), #0b4635);
  color: rgba(255,255,255,.9); border: none; border-radius: 999px;
  padding: 16px 32px; font-family: 'Cormorant Garamond', serif;
  font-size: 14px; font-weight: 300; letter-spacing: .2em; text-transform: uppercase;
  cursor: pointer; width: 100%; margin-top: 4px;
  box-shadow: 0 10px 32px rgba(6,40,31,.22);
  transition: transform .3s, box-shadow .3s, opacity .2s;
}
.bk-submit:hover:not(.disabled):not(.sending) { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(6,40,31,.3); }
.bk-submit.disabled { opacity: .45; cursor: not-allowed; }
.bk-submit.sending { opacity: .7; cursor: wait; }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.bk-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }

/* Success / Error state */
.bk-success { padding: 32px 24px 36px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.bk-success h3 { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-style: italic; font-weight: 300; color: var(--deep); margin: 0; }
.bk-success p { font-size: 15px; font-weight: 300; color: var(--text); line-height: 1.6; margin: 0; max-width: 380px; }
.bk-success strong { font-weight: 400; color: var(--deep); }
.bk-success-note { font-size: 12px !important; font-style: italic; color: var(--muted) !important; }
.bk-success-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(10,63,48,.1); color: var(--green); font-size: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.bk-error-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(200,50,50,.1); color: #c03030; font-size: 22px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.bk-phone { font-size: 22px !important; font-weight: 400 !important; color: var(--deep) !important; letter-spacing: .06em; }

/* ── ANIMAZIONI GENERALI ── */
.mobile-nav { display: none; }
.reveal { opacity: 0; transform: translateY(22px); transition: opacity .72s ease, transform .72s ease; }
.reveal.visible { opacity: 1; transform: none; }
.tagline-band.reveal { opacity: 1; transform: none; }

/* ── TABLET ── */
@media (max-width: 980px) {
  .desktop-header { width: calc(100% - 32px); grid-template-columns: 80px 1fr 120px; }
  .desktop-menu { gap: 4px; padding: 10px 16px; }
  .hero-content { padding-bottom: 52px; }
  .dish-strip { grid-template-columns: repeat(3, 1fr); }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  .desktop-gallery { grid-template-columns: 1fr 1fr; }
  .gallery-card.g1 { grid-column: span 2; }
  .locanda-wow { grid-template-columns: 1fr; gap: 28px; padding: 36px 38px; }
  .locanda-img-wrap { height: 240px; }
  .tagline-band { padding: 36px 48px; }
  .tagline-text { white-space: normal; font-size: clamp(22px, 3.5vw, 36px); }
}

/* ── MOBILE ── */
@media (max-width: 760px) {
  body { background: #1e3c3d; }
  main { background: var(--cream); width: min(100%, 430px); margin: 0 auto; padding-bottom: 80px; }
  .desktop-header { display: none; }

  .mobile-nav { position: fixed; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 90; width: min(390px, calc(100% - 16px)); display: grid; grid-template-columns: repeat(5, 1fr); padding: 8px 4px 10px; border-radius: 20px; background: rgba(255,252,245,.97); backdrop-filter: blur(24px) saturate(1.6); box-shadow: 0 4px 24px rgba(0,0,0,.13), inset 0 0 0 1px rgba(255,255,255,.8); }
  .mobile-nav button { background: transparent; color: var(--muted); border: none; padding: 5px 2px 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; border-radius: 14px; transition: color .2s; cursor: pointer; }
  .mobile-nav button.nav-active { color: var(--gold); }
  .mobile-nav button.nav-active .nav-icon-wrap svg { stroke: var(--gold); }
  .nav-icon-wrap { display: flex; align-items: center; justify-content: center; }
  .nav-icon-wrap svg { stroke: var(--muted); transition: stroke .2s; }
  .nav-label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .1em; font-weight: 300; }

  .hero { height: 85svh; min-height: 540px; max-height: none; border-radius: 0 0 26px 26px; }
  .hero-img-desktop { display: none; }
  .hero-img-mobile { display: block; }
  .hero-shade { background: linear-gradient(0deg, rgba(5,37,29,.74) 0%, rgba(5,37,29,.2) 48%, rgba(0,0,0,.02) 100%); }
  .hero-content { padding-bottom: 58px; }
  .hero-reserve-btn { font-size: 12px; letter-spacing: .3em; gap: 14px; }
  .hero-btn-line { width: 32px; }
  .hero-reserve-btn:hover .hero-btn-line { width: 44px; }

  .tagline-band { padding: 28px 20px; gap: 12px; }
  .tagline-text { font-size: clamp(19px, 5.5vw, 26px); white-space: normal; }
  .tagline-line { display: none; }

  .section, .footer { width: calc(100% - 28px); }
  .menu-section { padding: 44px 0 20px; }
  .section-head { margin-bottom: 18px; }
  .section-head > div { display: block; }
  .section-head h2 { font-size: 38px; }
  .section-head button { margin-top: 8px; }
  .dish-strip { display: flex; gap: 12px; overflow-x: auto; padding: 0 2px 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .dish-strip::-webkit-scrollbar { display: none; }
  .dish-card { flex: 0 0 128px; scroll-snap-align: start; }
  .dish-photo { aspect-ratio: 1/1.18; border-radius: 14px; }
  .dish-card h3 { font-size: 12px; margin-top: 8px; }
  .menu-cta { margin-top: 22px; }

  .locanda-wow { width: calc(100% - 28px); margin: 10px auto 8px; padding: 24px 20px; border-radius: 22px; display: block; }
  .locanda-wow h2 { font-size: 34px; margin-bottom: 12px; }
  .locanda-wow p { font-size: 14px; line-height: 1.62; }
  .locanda-p2 { font-size: 13px !important; }
  .locanda-img-wrap { margin-top: 20px; height: 200px; border-radius: 14px; }

  .gallery-section { padding: 40px 0 20px; }
  .desktop-gallery { display: none; }
  .mobile-gallery { display: flex; gap: 12px; overflow-x: auto; padding: 0 14px 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .mobile-gallery::-webkit-scrollbar { display: none; }
  .gallery-strip-card { flex: 0 0 196px; height: 252px; border-radius: 16px; overflow: hidden; position: relative; margin: 0; background: #ddd; cursor: pointer; scroll-snap-align: start; box-shadow: 0 6px 22px rgba(0,0,0,.12); }
  .gallery-strip-card img { width: 100%; height: 100%; object-fit: cover; }
  .gallery-strip-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.55), transparent 55%); }
  .gallery-strip-card figcaption { position: absolute; z-index: 1; left: 12px; bottom: 12px; color: white; font-size: 17px; font-style: italic; font-weight: 300; }
  .gallery-strip-card .gallery-zoom-icon { top: 10px; right: 10px; opacity: .6; }

  .lightbox-overlay { padding: 10px; }
  .lightbox-inner { border-radius: 14px; }
  .lightbox-inner img { max-height: 72vh; }

  .footer { margin: 0 auto 12px; padding: 18px 16px 84px; border-radius: 20px; }
  .footer-brand { display: none; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 18px 14px; }
  .footer h4 { font-size: 9px; margin-bottom: 6px; letter-spacing: .18em; }
  .footer p { font-size: 12px; margin-bottom: 5px; line-height: 1.5; }
  .footer .gold-btn { padding: 9px 16px; font-size: 10px; margin-top: 8px !important; }
  .footer-bottom { justify-content: center; flex-wrap: wrap; gap: 4px; margin-top: 14px; padding-top: 12px; font-size: 9.5px; }

  .menu-page { padding-top: 0; }
  .menu-hero { height: 44svh; min-height: 270px; }
  .back-btn { top: 14px; left: 14px; padding: 7px 14px; font-size: 10px; }
  .menu-hero-logo { width: 56px; height: 56px; margin-bottom: 13px; }
  .menu-hero-logo img { width: 44px; height: 44px; }
  .menu-hero-title { font-size: 34px; }
  .menu-hero-subtitle { font-size: 12px; }
  .menu-tabs-wrap { padding: 0 10px; }
  .menu-tab { padding: 13px 6px; }
  .tab-label { font-size: 12px; }
  .tab-sub { display: none; }
  .menu-body { padding: 30px 16px 80px; }
  .menu-section-title { margin-bottom: 24px; }
  .menu-section-title h2 { font-size: 26px; }
  .menu-item { padding: 15px 0; }
  .menu-item-name { font-size: 15px; }
  .menu-item-price { font-size: 15px; }
  .menu-page-footer { margin-top: 32px; }
  .menu-reserve-btn { padding: 13px 32px; font-size: 11px; }

  /* Booking modal mobile */
  .bk-modal { border-radius: 24px 24px 0 0; max-height: 92svh; }
  .bk-row { grid-template-columns: 1fr; gap: 12px; }
  .bk-row-3 { grid-template-columns: 1fr 1fr; }
  .bk-row-3 .bk-field:last-child { grid-column: span 2; }
  .bk-info-strip { font-size: 11px; gap: 6px; }
  .bk-dot { display: none; }
  .bk-info-strip > span:not(.bk-dot) { display: block; width: 100%; }
}
`;
