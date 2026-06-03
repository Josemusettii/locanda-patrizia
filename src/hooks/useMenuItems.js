import { useEffect, useState } from "react";
import { fetchMenuItems, subscribeToMenuChanges } from "../lib/menuService";

export function useMenuItems() {
  const [items, setItems] = useState([]);
  const [source, setSource] = useState("loading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadMenu = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await fetchMenuItems();
        if (!mounted) return;
        setItems(result.items);
        setSource(result.source);
      } catch (err) {
        if (!mounted) return;
        setItems([]);
        setError(err?.message || "Non riesco a caricare il menu.");
        setSource("error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMenu();
    const unsubscribe = subscribeToMenuChanges(loadMenu);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { items, source, loading, error };
}

