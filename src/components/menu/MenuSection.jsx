import MenuCard from "./MenuCard";
import { MENU_CATEGORY_LABELS } from "../../lib/menuConfig";

export default function MenuSection({ category, items, print = false }) {
  if (!items?.length) return null;

  return (
    <section
      className={print ? "menu-course menu-print-course" : "menu-course"}
      id={`menu-panel-${category}`}
      aria-labelledby={`menu-title-${category}`}
    >
      <div className="menu-section-title">
        <span aria-hidden="true" />
        <h2 id={`menu-title-${category}`}>{MENU_CATEGORY_LABELS[category] || category}</h2>
        <span aria-hidden="true" />
      </div>

      <ul className="menu-items-list" aria-label={`${MENU_CATEGORY_LABELS[category] || category} - Locanda Patrizia`}>
        {items.map((item) => (
          <MenuCard item={item} compact={print} key={item.id} />
        ))}
      </ul>
    </section>
  );
}

