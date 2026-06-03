import { fallbackMenuItems } from "./fallbackMenu";
import { MENU_CATEGORY_ORDER } from "./menuConfig";
import { isSupabaseConfigured, supabaseClient } from "./supabaseClient";

const normalizeMenuItem = (item) => ({
  id: item.id,
  categoria: item.categoria,
  nome: item.nome,
  descrizione: item.descrizione || "",
  prezzo: Number(item.prezzo),
  disponibile: Boolean(item.disponibile),
  ordine: Number(item.ordine || 0),
  created_at: item.created_at,
});

const sortMenuItems = (items) =>
  [...items].sort((a, b) => {
    const categoryA = MENU_CATEGORY_ORDER.indexOf(a.categoria);
    const categoryB = MENU_CATEGORY_ORDER.indexOf(b.categoria);
    const safeCategoryA = categoryA === -1 ? 999 : categoryA;
    const safeCategoryB = categoryB === -1 ? 999 : categoryB;

    if (safeCategoryA !== safeCategoryB) return safeCategoryA - safeCategoryB;
    if (a.ordine !== b.ordine) return a.ordine - b.ordine;
    return a.nome.localeCompare(b.nome, "it");
  });

export async function fetchMenuItems() {
  if (!isSupabaseConfigured) {
    return {
      items: sortMenuItems(fallbackMenuItems.filter((item) => item.disponibile).map(normalizeMenuItem)),
      source: "fallback",
    };
  }

  const query =
    "?select=id,categoria,nome,descrizione,prezzo,disponibile,ordine,created_at&disponibile=eq.true&order=categoria.asc,ordine.asc";
  const data = await supabaseClient.select("menu", query);

  return {
    items: sortMenuItems(data.map(normalizeMenuItem)),
    source: "supabase",
  };
}

export function groupMenuByCategory(items) {
  return MENU_CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.categoria === category),
  })).filter((section) => section.items.length > 0);
}

export function subscribeToMenuChanges() {
  // Hook pronto per il futuro realtime:
  // con @supabase/supabase-js potremo ascoltare postgres_changes sulla tabella menu
  // e rifare fetchMenuItems() quando WhatsApp/API aggiornano il database.
  return () => {};
}

