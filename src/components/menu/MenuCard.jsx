const formatPrice = (value) => {
  if (Number.isNaN(Number(value))) return "";
  return `€ ${Number(value).toLocaleString("it-IT", {
    minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function MenuCard({ item, compact = false }) {
  return (
    <li className={compact ? "menu-item menu-print-item" : "menu-item"}>
      <div className="menu-item-info">
        <p className="menu-item-name">{item.nome}</p>
        {item.descrizione && <p className="menu-item-desc">{item.descrizione}</p>}
      </div>
      <div className="menu-item-separator" aria-hidden="true" />
      <span className="menu-item-price" aria-label={`Prezzo: ${formatPrice(item.prezzo)}`}>
        {formatPrice(item.prezzo)}
      </span>
    </li>
  );
}

