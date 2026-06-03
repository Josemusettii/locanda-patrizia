import { useState } from "react";
import logo from "../assets/logo.webp";
import MenuSection from "../components/menu/MenuSection";
import { MenuEmpty, MenuError, MenuLoading } from "../components/menu/MenuStatus";
import { groupMenuByCategory } from "../lib/menuService";
import { useMenuItems } from "../hooks/useMenuItems";

const adminPassword = import.meta.env.VITE_ADMIN_MENU_PASSWORD;
const sessionKey = "locanda-admin-menu-print";

export default function MenuPrintPage({ onBack, openMenu }) {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(sessionKey) === "ok";
  });
  const [passwordError, setPasswordError] = useState("");
  const { items, loading, error } = useMenuItems();
  const sections = groupMenuByCategory(items);

  const handleSubmit = (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!adminPassword) {
      setPasswordError("Configura VITE_ADMIN_MENU_PASSWORD nelle variabili ambiente.");
      return;
    }

    if (password === adminPassword) {
      window.sessionStorage.setItem(sessionKey, "ok");
      setAuthenticated(true);
      setPassword("");
      return;
    }

    setPasswordError("Password non corretta.");
  };

  if (!authenticated) {
    return (
      <div className="print-page admin-lock-page">
        <form className="admin-lock-card" onSubmit={handleSubmit}>
          <img src={logo} alt="Locanda Patrizia" width="82" height="82" />
          <p className="print-eyebrow">Area riservata</p>
          <h1>Menu stampa</h1>
          <p>Inserisci la password del titolare per aprire la versione A4/PDF.</p>
          <label className="admin-password-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {passwordError && <p className="admin-lock-error" role="alert">{passwordError}</p>}
          <button className="menu-reserve-btn" type="submit">Entra</button>
          <button className="menu-print-link admin-secondary-btn" type="button" onClick={onBack}>
            Torna alla home
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="print-page">
      <div className="print-actions" aria-label="Azioni menu stampa">
        <button className="back-btn print-back-btn" onClick={onBack}>
          ← Home
        </button>
        <button className="menu-reserve-btn print-action-btn" onClick={() => window.print()}>
          Stampa / Salva PDF
        </button>
        <button className="menu-print-link print-menu-btn" onClick={openMenu}>
          Menu sito
        </button>
      </div>

      <main className="print-sheet" aria-labelledby="print-menu-title">
        <header className="print-header">
          <img src={logo} alt="Locanda Patrizia" width="96" height="96" />
          <p className="print-eyebrow">Locanda Patrizia</p>
          <h1 id="print-menu-title">Menu</h1>
          <p className="print-subtitle">Esperienza · Emozioni · Sapori</p>
        </header>

        {loading && <MenuLoading />}
        {!loading && error && <MenuError message={error} />}
        {!loading && !error && sections.length === 0 && <MenuEmpty />}
        {!loading && !error && sections.map((section) => (
          <MenuSection category={section.category} items={section.items} print key={section.category} />
        ))}

        <footer className="print-footer">
          <span>Piazza delle Erbe, 1 · Carrara</span>
          <span>+39 0585 873443 · locandapatriziaa@gmail.com</span>
        </footer>
      </main>
    </div>
  );
}
