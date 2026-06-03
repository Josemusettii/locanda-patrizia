export function MenuLoading() {
  return (
    <div className="menu-state" role="status">
      <span className="menu-state-dot" aria-hidden="true" />
      <p>Caricamento menu...</p>
    </div>
  );
}

export function MenuError({ message }) {
  return (
    <div className="menu-state menu-state-error" role="alert">
      <p>Il menu non è disponibile in questo momento.</p>
      {message && <small>{message}</small>}
    </div>
  );
}

export function MenuEmpty() {
  return (
    <div className="menu-state">
      <p>Il menu verrà aggiornato a breve.</p>
    </div>
  );
}

