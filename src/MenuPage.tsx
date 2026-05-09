import { useState } from "react";
import logo from "./assets/logo.webp";
import menuCover from "./assets/menu-cover.webp";

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

// ─── MENU PAGE ────────────────────────────────────────────────────────────────
export default function MenuPage({ onBack, openBooking }: { onBack: () => void; openBooking: () => void }) {
  const [activeTab, setActiveTab] = useState<"antipasti" | "primi" | "secondi">("antipasti");
  const tabs = [
    { key: "antipasti" as const, label: "Antipasti",      sub: "Per iniziare" },
    { key: "primi"     as const, label: "Primi Piatti",   sub: "Paste & risotti" },
    { key: "secondi"   as const, label: "Secondi Piatti", sub: "Carne & pesce" },
  ];
  const items = menuData[activeTab];
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

      <div className="menu-body" id={`menu-panel-${activeTab}`} role="tabpanel" aria-label={tabs.find(t => t.key === activeTab)?.label}>
        <div className="menu-section-title" aria-hidden="true">
          <span className="menu-ornament">✦</span>
          <h2>{tabs.find(t => t.key === activeTab)?.label}</h2>
          <span className="menu-ornament">✦</span>
        </div>

        <ul className="menu-items-list" aria-label={`${tabs.find(t => t.key === activeTab)?.label} — Locanda Patrizia Carrara`}>
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
          <button className="menu-reserve-btn" onClick={openBooking} aria-label="Prenota un tavolo al ristorante Locanda Patrizia di Carrara">
            Prenota il tuo tavolo
          </button>
        </div>
      </div>
    </div>
  );
}
