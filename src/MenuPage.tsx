import logo from "./assets/logo.webp";
import MenuSection from "./components/menu/MenuSection";
import { MenuEmpty, MenuError, MenuLoading } from "./components/menu/MenuStatus";
import { MENU_CATEGORIES } from "./lib/menuConfig";
import { groupMenuByCategory } from "./lib/menuService";
import { useMenuItems } from "./hooks/useMenuItems";

const menuHero = "/menu-hero.jpg";

// ─── MENU PAGE ────────────────────────────────────────────────────────────────
export default function MenuPage({ onBack, openBooking }: { onBack: () => void; openBooking: () => void }) {
  const { items, loading, error } = useMenuItems();
  const sections = groupMenuByCategory(items);
  const visibleCategories = MENU_CATEGORIES.filter((category) =>
    sections.some((section) => section.category === category.key)
  );

  const jumpTo = (key: string) => {
    document.getElementById(`menu-panel-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="menu-page">
      {/* Testo SEO invisibile per la menu page */}
      <p className="sr-only">
        Menu del ristorante Locanda Patrizia a Carrara (MS). Cucina toscana autentica con pasta fresca artigianale,
        antipasti creativi di mare e terra, secondi di carne chianina e pesce fresco. Prezzi accessibili per una cena
        di qualità a Carrara. Prenotazione online disponibile su questo sito.
      </p>
      <div className="menu-hero" aria-label="Menu del ristorante Locanda Patrizia a Carrara">
        <img
          className="menu-hero-img"
          src={menuHero}
          alt="Illustrazione del menu Locanda Patrizia con la frase La felicità è fatta di buoni ingredienti"
          loading="eager"
          decoding="async"
          width="1800"
          height="1200"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="menu-hero-content">
          <button className="back-btn" onClick={onBack} aria-label="Torna alla home page della Locanda Patrizia">
            ← Torna alla home
          </button>
        </div>
      </div>

      <div className="menu-tabs-wrap" role="navigation" aria-label="Sezioni del menu della Locanda Patrizia">
        <div className="menu-tabs">
          {(visibleCategories.length ? visibleCategories : MENU_CATEGORIES).map((tab) => (
            <button
              key={tab.key}
              className="menu-tab"
              onClick={() => jumpTo(tab.key)}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-sub">{tab.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="menu-body">
        <div className="menu-paper">
          <div className="menu-paper-mark" aria-hidden="true">
            <img src={logo} alt="" width="86" height="86" loading="lazy" />
          </div>

          {loading && <MenuLoading />}
          {!loading && error && <MenuError message={error} />}
          {!loading && !error && sections.length === 0 && <MenuEmpty />}
          {!loading && !error && sections.map((section) => (
            <MenuSection category={section.category} items={section.items} key={section.category} />
          ))}
        </div>

        <div className="menu-page-footer">
          <p className="menu-note">
            I prezzi sono espressi in euro e includono il servizio.<br />
            Per informazioni sugli allergeni, il personale di sala è a vostra disposizione.
          </p>
          <div className="menu-footer-divider" aria-hidden="true"><span className="menu-ornament small">✦</span></div>
          <button className="menu-reserve-btn" onClick={openBooking} aria-label="Prenota un tavolo al ristorante Locanda Patrizia di Carrara">
            Prenota il tuo tavolo
          </button>
        </div>
      </div>
    </div>
  );
}
