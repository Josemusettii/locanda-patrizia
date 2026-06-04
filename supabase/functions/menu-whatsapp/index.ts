type MenuCategory = "antipasti" | "primi" | "secondi" | "dolci" | "vini";
type CommandStatus = "success" | "error" | "info";

type IncomingMessage = {
  text: string;
  sender?: string;
  source: "twilio" | "meta" | "json" | "text";
};

type CommandResult = {
  status: CommandStatus;
  action?: string;
  response: string;
  menuItemId?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-menu-webhook-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const categoryAliases: Record<string, MenuCategory> = {
  antipasto: "antipasti",
  antipasti: "antipasti",
  primi: "primi",
  primo: "primi",
  "primi piatti": "primi",
  secondo: "secondi",
  secondi: "secondi",
  "secondi piatti": "secondi",
  dolce: "dolci",
  dolci: "dolci",
  vino: "vini",
  vini: "vini",
  cantina: "vini",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const cleanItemName = (value: string) =>
  value
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const parsePrice = (value: string) => Number(value.replace(",", "."));

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const twimlResponse = (message: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`, {
    headers: { ...corsHeaders, "Content-Type": "text/xml" },
  });

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const webhookSecret = Deno.env.get("MENU_WEBHOOK_SECRET") || "";
const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "";

async function supabaseFetch(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server env non configurato.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Errore Supabase ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function getMaxOrder(category: MenuCategory) {
  const rows = await supabaseFetch(
    `menu?select=ordine&categoria=eq.${encodeURIComponent(category)}&order=ordine.desc&limit=1`,
  );
  return Number(rows?.[0]?.ordine || 0);
}

async function findMenuItems(term: string) {
  const safeTerm = term.replace(/[%*_]/g, "");
  return supabaseFetch(
    `menu?select=id,categoria,nome,prezzo,disponibile&nome=ilike.*${encodeURIComponent(safeTerm)}*&order=categoria.asc,ordine.asc&limit=8`,
  );
}

async function logCommand(message: IncomingMessage, result: CommandResult) {
  try {
    await supabaseFetch("menu_command_log", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        source: message.source,
        sender: message.sender || null,
        command_text: message.text,
        action: result.action || null,
        status: result.status,
        response: result.response,
        menu_item_id: result.menuItemId || null,
      }),
    });
  } catch (error) {
    console.error("Errore log comando", error);
  }
}

function parseCategory(value: string): MenuCategory | null {
  return categoryAliases[normalize(value)] || null;
}

function helpMessage() {
  return [
    "Comandi menu Locanda Patrizia:",
    "aggiungi Vermentino 22 ai vini",
    "aggiungi Lingua 18 agli antipasti descrizione: Con salsa verde",
    "nascondi Polpo",
    "mostra Polpo",
    "cambia prezzo Uovo al Purgatorio 12",
  ].join("\n");
}

async function addItem(text: string): Promise<CommandResult> {
  const addMatch = text.match(/^aggiungi\s+(.+?)\s+(?:ai|agli|alle|a)\s+(.+?)(?:\s+descrizione\s*:\s*(.+))?$/i);
  if (!addMatch) {
    return {
      status: "error",
      action: "add",
      response: "Formato non chiaro. Esempio: aggiungi Vermentino 22 ai vini",
    };
  }

  const nameAndPrice = addMatch[1].trim();
  const category = parseCategory(addMatch[2].trim());
  const description = addMatch[3]?.trim() || "";
  const priceMatch = nameAndPrice.match(/(.+?)\s+€?\s*(\d+(?:[,.]\d{1,2})?)$/);

  if (!priceMatch || !category) {
    return {
      status: "error",
      action: "add",
      response: "Mi servono nome, prezzo e categoria. Esempio: aggiungi Vermentino 22 ai vini",
    };
  }

  const nome = cleanItemName(priceMatch[1]);
  const prezzo = parsePrice(priceMatch[2]);
  const ordine = (await getMaxOrder(category)) + 10;

  const rows = await supabaseFetch("menu?select=id&on_conflict=categoria,nome", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      categoria: category,
      nome,
      descrizione: description,
      prezzo,
      disponibile: true,
      ordine,
    }),
  });

  const itemId = rows?.[0]?.id;
  return {
    status: "success",
    action: "add",
    menuItemId: itemId,
    response: `Fatto: "${nome}" è ora nel menu ${category} a € ${prezzo}.`,
  };
}

async function updatePrice(text: string): Promise<CommandResult> {
  const match = text.match(/^cambia\s+prezzo\s+(.+?)\s+€?\s*(\d+(?:[,.]\d{1,2})?)$/i);
  if (!match) {
    return {
      status: "error",
      action: "change_price",
      response: "Formato non chiaro. Esempio: cambia prezzo Ravioli 16",
    };
  }

  const nome = cleanItemName(match[1]);
  const prezzo = parsePrice(match[2]);
  const items = await findMenuItems(nome);

  if (!items.length) {
    return { status: "error", action: "change_price", response: `Non trovo "${nome}" nel menu.` };
  }

  if (items.length > 1) {
    return {
      status: "error",
      action: "change_price",
      response: `Ho trovato più piatti: ${items.map((item: { nome: string }) => item.nome).join(", ")}. Scrivi un nome più preciso.`,
    };
  }

  const item = items[0];
  await supabaseFetch(`menu?id=eq.${item.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ prezzo }),
  });

  return {
    status: "success",
    action: "change_price",
    menuItemId: item.id,
    response: `Fatto: prezzo di "${item.nome}" aggiornato a € ${prezzo}.`,
  };
}

async function setAvailability(text: string, disponibile: boolean): Promise<CommandResult> {
  const action = disponibile ? "show" : "hide";
  const match = text.match(disponibile ? /^mostra\s+(.+)$/i : /^nascondi\s+(.+)$/i);
  const nome = cleanItemName(match?.[1] || "");

  if (!nome) {
    return {
      status: "error",
      action,
      response: disponibile ? "Formato non chiaro. Esempio: mostra Polpo" : "Formato non chiaro. Esempio: nascondi Polpo",
    };
  }

  const items = await findMenuItems(nome);
  if (!items.length) {
    return { status: "error", action, response: `Non trovo "${nome}" nel menu.` };
  }

  if (items.length > 1) {
    return {
      status: "error",
      action,
      response: `Ho trovato più piatti: ${items.map((item: { nome: string }) => item.nome).join(", ")}. Scrivi un nome più preciso.`,
    };
  }

  const item = items[0];
  await supabaseFetch(`menu?id=eq.${item.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ disponibile }),
  });

  return {
    status: "success",
    action,
    menuItemId: item.id,
    response: disponibile ? `Fatto: "${item.nome}" è di nuovo visibile.` : `Fatto: "${item.nome}" è stato nascosto dal menu.`,
  };
}

async function handleCommand(message: IncomingMessage): Promise<CommandResult> {
  const text = message.text.trim();
  const command = normalize(text);

  if (!command || command === "aiuto" || command === "help" || command === "menu") {
    return { status: "info", action: "help", response: helpMessage() };
  }

  if (command.startsWith("aggiungi ")) return addItem(text);
  if (command.startsWith("cambia prezzo ")) return updatePrice(text);
  if (command.startsWith("nascondi ")) return setAvailability(text, false);
  if (command.startsWith("mostra ")) return setAvailability(text, true);

  return {
    status: "error",
    action: "unknown",
    response: `Comando non riconosciuto.\n\n${helpMessage()}`,
  };
}

async function parseIncomingMessage(req: Request): Promise<IncomingMessage> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams(await req.text());
    return {
      text: form.get("Body") || form.get("message") || "",
      sender: form.get("From") || undefined,
      source: "twilio",
    };
  }

  if (contentType.includes("application/json")) {
    const body = await req.json();
    const metaText = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    const metaSender = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;

    return {
      text: body.message || body.text || metaText || "",
      sender: body.from || body.sender || metaSender || undefined,
      source: metaText ? "meta" : "json",
    };
  }

  return {
    text: await req.text(),
    source: "text",
  };
}

async function isAuthorized(req: Request) {
  if (!webhookSecret) return false;

  const url = new URL(req.url);
  const headerSecret = req.headers.get("x-menu-webhook-secret");
  const querySecret = url.searchParams.get("secret");

  return headerSecret === webhookSecret || querySecret === webhookSecret;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && challenge) {
      return token === verifyToken
        ? new Response(challenge, { headers: corsHeaders })
        : jsonResponse({ error: "Verify token non valido." }, 403);
    }

    return jsonResponse({
      ok: true,
      name: "Locanda Patrizia menu WhatsApp webhook",
      examples: ["aggiungi Vermentino 22 ai vini", "nascondi Polpo", "cambia prezzo Ravioli 16"],
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo non supportato." }, 405);
  }

  if (!(await isAuthorized(req))) {
    return jsonResponse({ error: "Webhook non autorizzato." }, 401);
  }

  const message = await parseIncomingMessage(req);
  const isTwilio = message.source === "twilio";

  try {
    const result = await handleCommand(message);
    await logCommand(message, result);
    return isTwilio ? twimlResponse(result.response) : jsonResponse(result, result.status === "error" ? 400 : 200);
  } catch (error) {
    const response = error instanceof Error ? error.message : "Errore sconosciuto.";
    const result = { status: "error" as CommandStatus, action: "internal_error", response };
    await logCommand(message, result);
    return isTwilio ? twimlResponse(response) : jsonResponse(result, 500);
  }
});
