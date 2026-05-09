import logo from "./assets/logo.webp";
import menuCover from "./assets/menu-cover.webp";

type MenuKey = "antipasti" | "primi" | "secondi";
type MenuItem = {
  name: string;
  description: string;
  price: number;
  tag?: string;
};

const menuData: Record<MenuKey, MenuItem[]> = {
  antipasti: [
    { name: "Lingua Salmistrata", description: "Con salsa verde, salsa tonnata e gel al lime", price: 18 },
    { name: "L'Uovo al Purgatorio", description: "Uovo bio, fonduta di Parmigiano Reggiano, olio al basilico e crostone di pane", price: 18 },
    { name: "Tacos Fusion", description: "Pulled pork artigianale, guacamole e crème fraîche all'erba cipollina", price: 16 },
    { name: "Tacos Summer", description: "Tartare di tonno, guacamole, crème fraîche all'erba cipollina e gel al mojito", price: 16 },
    { name: "La Chianina", description: "Battuta al coltello di pura Chianina e i suoi condimenti classici", price: 16 },
    { name: "Il Fresco", description: "Frittino di mare del giorno secondo mercato", price: 14 },
    { name: "Riso al Salto", description: "Riso cacio e pepe croccante, tartare di gambero blu, gel al mango e teriyaki", price: 17 },
  ],
  primi: [
    { name: "Ricordo di Baccalà", description: "Cappellacci fatti a mano con ripieno di baccalà marinato", price: 19 },
    { name: "Bottoni alla Quaglia", description: "Ripieni di quaglia su crema di provola affumicata e il suo fondo", price: 18 },
    { name: "La Tradizione", description: "Lasagnette verdi \"stordellata\" con il tipico ripieno dei tordelli alla carrarese", price: 15 },
    { name: "Cacciagione", description: "Pappardelle al cervo", price: 18 },
    { name: "Mare e Terra", description: "Ravioli del plin ai gamberi e lardo di Colonnata su crema di asparagi", price: 20 },
    { name: "Lo Spaghetto", description: "Monograno Felicetti, vongole veraci sgusciate, zest di limone e bottarga", price: 25 },
  ],
  secondi: [
    { name: "Il Polpo", description: "In doppia cottura su crema di patate al limone, cipolla croccante e maionese", price: 22 },
    { name: "Pollo alla Birra", description: "Ripieno di verdure e salsiccia con patate duchesse", price: 17 },
    { name: "La Vaporata", description: "Calamari e gamberi al vapore con verdurine marinate", price: 20 },
    { name: "L'Agnello", description: "Costolette alle erbe di montagna, patate novelle e fondo bruno", price: 25 },
    { name: "Il Nostro Piccione", description: "Con crema di carote, radicchio e il suo fondo", price: 24 },
  ],
};

// ─── MENU PAGE ────────────────────────────────────────────────────────────────
export default function MenuPage({ onBack, openBooking }: { onBack: () => void; openBooking: () => void }) {
  const tabs = [
    { key: "antipasti" as const, label: "Antipasti",      sub: "Per iniziare" },
    { key: "primi"     as const, label: "Primi Piatti",   sub: "Paste & risotti" },
    { key: "secondi"   as const, label: "Secondi Piatti", sub: "Carne & pesce" },
  ];
  const jumpTo = (key: MenuKey) => {
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
          src={menuCover}
          alt="Il menu del ristorante Locanda Patrizia a Carrara — cucina toscana e creativa"
          loading="eager"
          decoding="async"
          width="1200"
          height="600"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="menu-hero-shade" aria-hidden="true" />
        <div className="menu-hero-content">
          <button className="back-btn" onClick={onBack} aria-label="Torna alla home page della Locanda Patrizia">
            ← Torna alla home
          </button>
          <div className="menu-hero-logo" aria-hidden="true">
            <img src={logo} alt="" width="50" height="50" loading="eager" />
          </div>
          <p className="menu-hero-eyebrow">Locanda Patrizia · Carrara</p>
          <h1 className="menu-hero-title">La nostra cucina</h1>
          <p className="menu-hero-subtitle">Ingredienti selezionati, ricette genuine, passione artigianale.</p>
        </div>
      </div>

      <div className="menu-tabs-wrap" role="navigation" aria-label="Sezioni del menu della Locanda Patrizia">
        <div className="menu-tabs">
          {tabs.map((tab) => (
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

          {tabs.map((section) => (
            <section className="menu-course" id={`menu-panel-${section.key}`} key={section.key} aria-labelledby={`menu-title-${section.key}`}>
              <div className="menu-section-title">
                <span aria-hidden="true" />
                <h2 id={`menu-title-${section.key}`}>{section.label}</h2>
                <span aria-hidden="true" />
              </div>

              <ul className="menu-items-list" aria-label={`${section.label} - Locanda Patrizia Carrara`}>
                {menuData[section.key].map((item, i) => (
                  <li className="menu-item" key={`${section.key}-${item.name}`} style={{ animationDelay: `${i * 36}ms` }}>
                    <div className="menu-item-info">
                      <p className="menu-item-name">{item.name}</p>
                      <p className="menu-item-desc">{item.description}</p>
                      {item.tag && (
                        <span className="menu-item-tag" aria-label={`Allergeni: ${item.tag}`}>Allergeni: {item.tag}</span>
                      )}
                    </div>
                    <div className="menu-item-separator" aria-hidden="true" />
                    <span className="menu-item-price" aria-label={`Prezzo: ${item.price} euro`}>€ {item.price}</span>
                  </li>
                ))}
              </ul>
            </section>
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
