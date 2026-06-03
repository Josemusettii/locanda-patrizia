const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const normalizeUrl = (url) => url?.replace(/\/$/, "");

export const supabaseClient = {
  url: normalizeUrl(supabaseUrl),
  anonKey: supabaseAnonKey,

  async select(table, query = "") {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase non configurato: mancano VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
    }

    const endpoint = `${this.url}/rest/v1/${table}${query}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: this.anonKey,
        Authorization: `Bearer ${this.anonKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Errore Supabase ${response.status}`);
    }

    return response.json();
  },
};

