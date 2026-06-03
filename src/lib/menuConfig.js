export const MENU_CATEGORIES = [
  { key: "antipasti", label: "Antipasti", sub: "Per iniziare" },
  { key: "primi", label: "Primi Piatti", sub: "Paste & risotti" },
  { key: "secondi", label: "Secondi Piatti", sub: "Carne & pesce" },
  { key: "dolci", label: "Dolci", sub: "Finale dolce" },
  { key: "vini", label: "Vini", sub: "Cantina" },
];

export const MENU_CATEGORY_ORDER = MENU_CATEGORIES.map((category) => category.key);

export const MENU_CATEGORY_LABELS = MENU_CATEGORIES.reduce((labels, category) => {
  labels[category.key] = category.label;
  return labels;
}, {});

