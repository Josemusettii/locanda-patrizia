import { useEffect } from "react";
import logo from "./assets/logo.png";
import heroFallback from "./assets/sala-hero.jpg";
import salaBancone from "./assets/sala-bancone.jpg";
import esternoCarrara from "./assets/esterno-carrara.jpg";
import piattoCarne from "./assets/piatto-carne.jpg";
import piattoCostine from "./assets/piatto-costine.jpg";
import piattoTaco from "./assets/piatto-taco.jpg";

const BOOKING_URL = "https://www.locandapatrizia.it/prenota";
const publicImg = (name: string) => `/${name}`;

function openBooking() {
  window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
}

function goTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
}

type Photo = {
  title: string;
  img: string;
  fallback?: string;
  pos?: string;
};

const dishes: Photo[] = [
  { title: "Capellacci al ricordo di baccalà marinato", img: publicImg("ravioli-pomodoro.jpg"), pos: "50% 55%" },
  { title: "Bottoni ripieni di quaglia, il suo fondo e crema di provola affumicata", img: publicImg("ravioli-bianco.jpg"), pos: "50% 53%" },
  { title: "Plin ripieni di gamberi e lardo su crema di asparagi", img: publicImg("ravioli-asparagi.jpg"), pos: "50% 55%" },
  { title: "Piccioncino con suo fondo, radicchio e crema di carote", img: piattoCarne, pos: "50% 45%" },
  { title: "Costolette di agnello panate alle erbette di montagna con patate", img: piattoCostine, pos: "50% 50%" },
  { title: "Tacos con pulled pork", img: piattoTaco, pos: "42% 50%" },
];

const gallery: Photo[] = [
  { title: "Il bancone", img: salaBancone, pos: "50% 50%" },
  { title: "La sala", img: publicImg("gallery-statua.jpg"), fallback: esternoCarrara, pos: "50% 50%" },
  { title: "Carrara", img: esternoCarrara, pos: "50% 50%" },
];

function Img({ src, fallback, alt, pos }: { src: string; fallback?: string; alt: string; pos?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ objectPosition: pos || "center" }}
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

function Header() {
  return (
    <header className="desktop-header">
      <a href="#home" className="logo-pill" aria-label="Locanda Patrizia home">
        <img src={logo} alt="Locanda Patrizia" />
      </a>
      <nav className="desktop-menu">
        <a href="#home">Home</a>
        <a href="#menu">Menu</a>
        <a href="#locanda">Locanda</a>
        <a href="#gallery">Gallery</a>
        <a href="#contatti">Contatti</a>
      </nav>
      <button className="gold-btn small" onClick={openBooking}>Prenota</button>
    </header>
  );
}

function MobileNav() {
  const items = [
    ["⌂", "Home", "#home"],
    ["≡", "Menu", "#menu"],
    ["◇", "Locanda", "#locanda"],
    ["○", "Gallery", "#gallery"],
    ["☎", "Contatti", "#contatti"],
  ];
  return (
    <nav className="mobile-nav">
      {items.map(([icon, label, id]) => (
        <button key={label} onClick={() => goTo(id)}>
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="hero">
      <Img src={publicImg("gallery-tavolo.jpg")} fallback={heroFallback} alt="Locanda Patrizia" pos="50% 58%" />
      <div className="hero-shade" />
      <div className="hero-content reveal">
        <img src={logo} alt="Locanda Patrizia" className="mobile-logo" />
        <p className="eyebrow">Carrara</p>
        <h1>Locanda<br />Patrizia</h1>
        <p className="hero-text">Una cucina autentica, elegante e sincera. Un luogo caldo dove sentirsi accolti, tra piatti curati, atmosfera familiare e sapori che restano.</p>
        <div className="hero-actions">
          <button className="gold-btn" onClick={openBooking}>Prenota il tuo tavolo</button>
          <button className="outline-btn" onClick={() => goTo("#menu")}>Scopri i piatti</button>
        </div>
      </div>
    </section>
  );
}

function MenuSection() {
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
        {dishes.map((dish, index) => (
          <article className="dish-card reveal" key={dish.title} style={{ transitionDelay: `${index * 35}ms` }}>
            <div className="dish-photo">
              <Img src={dish.img} alt={dish.title} pos={dish.pos} />
            </div>
            <h3>{dish.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function LocandaSection() {
  return (
    <section id="locanda" className="locanda-wow reveal">
      <div>
        <p className="eyebrow">La Locanda</p>
        <h2>Calda, intima, vera.</h2>
        <p>Legno, marmo e luce calda. Un ambiente raccolto nel cuore di Carrara, pensato per stare bene senza fretta.</p>
      </div>
      <div className="locanda-notes">
        <span>Accoglienza di casa</span>
        <span>Cucina espressa</span>
        <span>Atmosfera elegante</span>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section id="gallery" className="section gallery-section">
      <div className="section-head compact reveal">
        <p className="eyebrow">Gallery</p>
        <div>
          <h2>Dentro la Locanda.</h2>
        </div>
      </div>
      <div className="gallery-grid">
        {gallery.map((photo, index) => (
          <figure className={`gallery-card reveal g${index + 1}`} key={photo.title}>
            <Img src={photo.img} fallback={photo.fallback} alt={photo.title} pos={photo.pos} />
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function BookingBand() {
  return (
    <section className="booking-band reveal">
      <div>
        <p className="eyebrow">Prenota</p>
        <h2>Riserva il tuo tavolo</h2>
        <p>Scegli giorno, orario e disponibilità dal sistema di prenotazione online.</p>
      </div>
      <button className="gold-btn" onClick={openBooking}>Vai alla prenotazione</button>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contatti" className="footer reveal">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="Locanda Patrizia" />
          <p>Tradizione, accoglienza e cucina sincera nel cuore di Carrara.</p>
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
          <p>+39 0585 123456</p>
          <p>info@locandapatrizia.it</p>
        </div>
        
      </div>
      <div className="footer-bottom">
        <span>© 2024 Locanda Patrizia</span>
        <span>Privacy Policy · Cookie Policy</span>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <MenuSection />
        <LocandaSection />
        <GallerySection />
        <BookingBand />
        <Footer />
      </main>
      <MobileNav />

      <style>{`
        :root {
          --green: #0a3f30;
          --deep: #05251d;
          --cream: #f6efe2;
          --paper: #fffaf0;
          --gold: #cfaa55;
          --text: #0f3f31;
          --muted: #66736c;
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          background: var(--cream);
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        button, a { font: inherit; }
        button { border: 0; cursor: pointer; }
        img { display: block; max-width: 100%; }
        main { overflow: hidden; }

        .desktop-header {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          width: min(1120px, calc(100% - 72px));
          height: 76px;
          display: grid;
          grid-template-columns: 120px 1fr 150px;
          align-items: center;
          border-radius: 999px;
          padding: 10px 18px;
          background: rgba(250, 246, 236, .86);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 70px rgba(0,0,0,.16), inset 0 0 0 1px rgba(255,255,255,.55);
        }
        .logo-pill {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          display: grid;
          place-items: center;
          box-shadow: 0 14px 28px rgba(0,0,0,.12);
        }
        .logo-pill img { width: 46px; height: 46px; object-fit: contain; }
        .desktop-menu {
          justify-self: center;
          display: flex;
          gap: 34px;
          padding: 13px 34px;
          border-radius: 999px;
          background: rgba(255,255,255,.44);
        }
        .desktop-menu a {
          color: var(--deep);
          text-decoration: none;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .14em;
        }
        .desktop-menu a:hover { color: var(--gold); }
        .gold-btn, .footer button {
          background: var(--gold);
          color: #fff;
          border-radius: 999px;
          padding: 15px 26px;
          font-weight: 900;
          box-shadow: 0 16px 34px rgba(207,170,85,.28);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .gold-btn:hover, .footer button:hover { transform: translateY(-2px); box-shadow: 0 20px 42px rgba(207,170,85,.32); }
        .gold-btn.small { justify-self: end; padding: 14px 25px; }
        .outline-btn {
          background: rgba(255,255,255,.08);
          color: white;
          border: 1px solid rgba(255,255,255,.5);
          border-radius: 999px;
          padding: 15px 26px;
          font-weight: 900;
          backdrop-filter: blur(12px);
        }

        .hero { position: relative; min-height: 720px; height: 92vh; isolation: isolate; }
        .hero > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .hero-shade {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.42) 42%, rgba(0,0,0,.12) 72%), linear-gradient(0deg, rgba(0,0,0,.24), transparent 44%);
        }
        .hero-content {
          position: relative; z-index: 2;
          width: min(1120px, calc(100% - 72px));
          height: 100%;
          margin: 0 auto;
          padding-top: 90px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          color: white;
        }
        .mobile-logo { display: none; }
        .eyebrow { margin: 0 0 13px; color: var(--gold); text-transform: uppercase; letter-spacing: .32em; font-weight: 950; font-size: 13px; }
        .hero h1 { margin: 0 0 18px; font-family: Georgia, "Times New Roman", serif; font-size: clamp(72px, 8vw, 116px); line-height: .84; letter-spacing: -.055em; }
        .hero-text { max-width: 560px; margin: 0 0 34px; font-size: 20px; line-height: 1.58; color: rgba(255,255,255,.94); font-weight: 650; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

        .section { width: min(1120px, calc(100% - 72px)); margin: 0 auto; }
        .menu-section { padding: 78px 0 46px; }
        .section-head { margin-bottom: 34px; }
        .section-head > div { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
        .section-head h2, .booking-band h2 { margin: 0; font-family: Georgia, "Times New Roman", serif; color: var(--text); font-size: clamp(46px, 5.4vw, 76px); line-height: .93; letter-spacing: -.05em; }
        .section-head button { background: transparent; color: var(--text); font-weight: 900; }
        .dish-strip { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
        .dish-photo { aspect-ratio: 4 / 5; border-radius: 19px; overflow: hidden; background: #e5ded2; box-shadow: 0 16px 34px rgba(0,0,0,.08); }
        .dish-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.7,.2,1); }
        .dish-card:hover img { transform: scale(1.06); }
        .dish-card h3 { margin: 12px 0 0; color: var(--deep); font-family: Georgia, "Times New Roman", serif; font-size: 16px; line-height: 1.12; text-align: center; }

        .locanda-wow {
          width: min(1120px, calc(100% - 72px));
          margin: 22px auto 0;
          padding: 34px 38px;
          border-radius: 30px;
          background: radial-gradient(circle at top left, rgba(207,170,85,.20), transparent 34%), linear-gradient(135deg, #06281f, #0b4635);
          color: white;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 34px;
          align-items: end;
          box-shadow: 0 22px 58px rgba(0,0,0,.13);
        }
        .locanda-wow h2 { margin: 0 0 12px; font-family: Georgia, "Times New Roman", serif; color: white; font-size: clamp(38px, 4.6vw, 62px); line-height: .94; letter-spacing: -.05em; }
        .locanda-wow p:not(.eyebrow) { margin: 0; max-width: 620px; color: rgba(255,255,255,.76); line-height: 1.55; font-size: 17px; }
        .locanda-notes { display: grid; gap: 10px; }
        .locanda-notes span { display: block; padding: 13px 16px; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.13); color: rgba(255,255,255,.86); font-weight: 850; font-size: 14px; }

        .gallery-section { padding: 70px 0 34px; }
        .section-head.compact { margin-bottom: 24px; }
        .gallery-grid { display: grid; grid-template-columns: 1.25fr .9fr .9fr; gap: 16px; }
        .gallery-card { position: relative; margin: 0; height: 265px; border-radius: 22px; overflow: hidden; background: #ddd; box-shadow: 0 16px 34px rgba(0,0,0,.08); }
        .gallery-card.g1 { height: 265px; }
        .gallery-card img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.7,.2,1); }
        .gallery-card:hover img { transform: scale(1.05); }
        .gallery-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.5), transparent 58%); }
        .gallery-card figcaption { position: absolute; z-index: 1; left: 18px; bottom: 16px; color: white; font-family: Georgia, "Times New Roman", serif; font-size: 24px; font-weight: 900; }

        .booking-band {
          width: min(1120px, calc(100% - 72px));
          margin: 0 auto 24px;
          padding: 34px 38px;
          border-radius: 28px;
          background: var(--paper);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          box-shadow: 0 18px 48px rgba(0,0,0,.08);
        }
        .booking-band h2 { font-size: clamp(34px, 4vw, 54px); }
        .booking-band p { margin: 12px 0 0; color: var(--muted); max-width: 560px; line-height: 1.55; }

        .footer { width: min(1120px, calc(100% - 72px)); margin: 0 auto 70px; padding: 42px; border-radius: 30px; background: linear-gradient(135deg, #06281f, #0b4635); color: #fff; box-shadow: 0 28px 80px rgba(0,0,0,.14); }
        .footer-grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr .8fr; gap: 36px; }
        .footer-brand img { width: 92px; margin-bottom: 16px; filter: drop-shadow(0 10px 18px rgba(0,0,0,.18)); }
        .footer h4 { margin: 0 0 18px; color: var(--gold); text-transform: uppercase; letter-spacing: .18em; font-size: 13px; }
        .footer p { margin: 0 0 13px; color: rgba(255,255,255,.76); line-height: 1.58; font-size: 14px; }
        .footer strong { color: #fff; }
        .footer button { padding: 12px 18px; font-size: 14px; margin-top: 8px; }
        .footer-bottom { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.14); display: flex; justify-content: space-between; gap: 20px; color: rgba(255,255,255,.56); font-size: 12px; }

        .mobile-nav { display: none; }
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .72s ease, transform .72s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 980px) {
          .desktop-header { width: calc(100% - 32px); grid-template-columns: 86px 1fr 126px; }
          .desktop-menu { gap: 18px; padding: 12px 22px; }
          .dish-strip { grid-template-columns: repeat(3, 1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .gallery-grid { grid-template-columns: 1fr 1fr; }
          .gallery-card.g1 { grid-column: span 2; }
        }

        @media (max-width: 760px) {
          body { background: #203f40; }
          main { background: var(--cream); width: min(100%, 430px); margin: 0 auto; padding-bottom: 96px; }
          .desktop-header { display: none; }
          .mobile-nav { position: fixed; left: 50%; bottom: 12px; transform: translateX(-50%); z-index: 90; width: min(396px, calc(100% - 24px)); display: grid; grid-template-columns: repeat(5, 1fr); padding: 10px 8px; border-radius: 26px; background: rgba(255,250,240,.95); backdrop-filter: blur(18px); box-shadow: 0 12px 40px rgba(0,0,0,.22), inset 0 0 0 1px rgba(0,0,0,.06); }
          .mobile-nav button { background: transparent; color: var(--text); font-size: 12px; font-weight: 950; padding: 6px 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .mobile-nav span { color: var(--gold); font-size: 19px; line-height: 1; }

          .hero { min-height: 625px; height: 82svh; border-radius: 0 0 28px 28px; overflow: hidden; }
          .hero > img { object-position: 52% center !important; }
          .hero-shade { background: linear-gradient(90deg, rgba(0,0,0,.70), rgba(0,0,0,.42) 60%, rgba(0,0,0,.08)), linear-gradient(0deg, rgba(0,0,0,.50), transparent 54%); }
          .hero-content { width: calc(100% - 40px); justify-content: flex-end; padding: 0 0 48px; }
          .mobile-logo { display: block; width: 58px; height: 58px; object-fit: contain; border-radius: 50%; background: rgba(255,255,255,.92); padding: 8px; margin-bottom: 78px; box-shadow: 0 12px 28px rgba(0,0,0,.22); }
          .eyebrow { font-size: 12px; letter-spacing: .27em; }
          .hero h1 { font-size: 58px; line-height: .86; margin-bottom: 14px; }
          .hero-text { font-size: 16px; line-height: 1.5; max-width: 340px; margin-bottom: 22px; }
          .hero-actions { gap: 10px; }
          .gold-btn, .outline-btn { padding: 13px 16px; font-size: 14px; }

          .section, .booking-band, .footer { width: calc(100% - 32px); }
          .menu-section { padding: 44px 0 24px; }
          .section-head { margin-bottom: 22px; }
          .section-head > div { display: block; }
          .section-head h2, .booking-band h2 { font-size: 43px; max-width: 340px; }
          .section-head button { margin-top: 12px; }
          .dish-strip { display: flex; gap: 12px; overflow-x: auto; padding: 0 2px 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
          .dish-strip::-webkit-scrollbar { display: none; }
          .dish-card { flex: 0 0 142px; scroll-snap-align: start; }
          .dish-photo { aspect-ratio: 1 / 1.18; border-radius: 17px; }
          .dish-card h3 { font-size: 14px; line-height: 1.14; margin-top: 10px; }

          .locanda-wow { width: calc(100% - 32px); margin: 10px auto 8px; padding: 20px 18px; border-radius: 24px; display: block; }
          .locanda-wow h2 { font-size: 34px; margin-bottom: 10px; }
          .locanda-wow p:not(.eyebrow) { font-size: 14px; line-height: 1.48; }
          .locanda-notes { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 15px; }
          .locanda-notes span { padding: 10px 13px; font-size: 12px; }

          .gallery-section { padding: 40px 0 22px; }
          .gallery-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .gallery-card, .gallery-card.g1 { height: 150px; min-height: auto; grid-column: auto; border-radius: 16px; }
          .gallery-card.g1 { grid-column: span 2; height: 176px; }
          .gallery-card figcaption { font-size: 17px; left: 14px; bottom: 12px; }

          .booking-band { margin: 0 auto 18px; padding: 24px 20px; border-radius: 24px; display: block; }
          .booking-band p { font-size: 14px; }
          .booking-band .gold-btn { margin-top: 18px; }

          .footer { margin: 0 auto 18px; padding: 20px 18px 92px; border-radius: 24px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 18px 16px; }
          .footer-brand { grid-column: 1 / -1; }
          .footer-brand img { display: none; }
          .footer-brand p { font-size: 13px; margin-bottom: 0; }
          .footer h4 { font-size: 11px; margin-bottom: 10px; }
          .footer p { font-size: 12px; line-height: 1.45; margin-bottom: 8px; }
          .footer button { padding: 10px 14px; font-size: 12px; }
          .footer-bottom { display: block; line-height: 1.6; margin-top: 16px; padding-top: 14px; font-size: 11px; }
        }
      `}</style>
    </>
  );
}
