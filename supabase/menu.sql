create extension if not exists pgcrypto;

create table if not exists public.menu (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('antipasti', 'primi', 'secondi', 'dolci', 'vini')),
  nome text not null,
  descrizione text,
  prezzo numeric(10, 2) not null,
  disponibile boolean not null default true,
  ordine integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists menu_categoria_ordine_idx on public.menu (categoria, ordine);
create index if not exists menu_disponibile_idx on public.menu (disponibile);
create unique index if not exists menu_categoria_nome_key on public.menu (categoria, nome);

grant select on public.menu to anon, authenticated;

alter table public.menu enable row level security;

drop policy if exists "Menu disponibile leggibile pubblicamente" on public.menu;
create policy "Menu disponibile leggibile pubblicamente"
on public.menu
for select
to anon, authenticated
using (disponibile = true);

insert into public.menu (categoria, nome, descrizione, prezzo, disponibile, ordine) values
('antipasti', 'Lingua Salmistrata', 'Con salsa verde, salsa tonnata e gel al lime', 18, true, 10),
('antipasti', 'L''Uovo al Purgatorio', 'Uovo bio, fonduta di Parmigiano Reggiano, olio al basilico e crostone di pane', 12, true, 20),
('antipasti', 'Tacos Fusion', 'Pulled pork artigianale, guacamole e crème fraîche all''erba cipollina', 16, true, 30),
('antipasti', 'Tacos Summer', 'Tartare di tonno, guacamole, crème fraîche all''erba cipollina e gel al mojito', 16, true, 40),
('antipasti', 'La Chianina', 'Battuta al coltello di pura Chianina e i suoi condimenti classici', 16, true, 50),
('antipasti', 'Il Fresco', 'Frittino di mare del giorno secondo mercato', 14, true, 60),
('antipasti', 'Riso al Salto', 'Riso cacio e pepe croccante, tartare di gambero blu, gel al mango e teriyaki', 17, true, 70),
('primi', 'Ricordo di Baccalà', 'Cappellacci fatti a mano con ripieno di baccalà marinato', 19, true, 10),
('primi', 'Bottoni alla Quaglia', 'Ripieni di quaglia su crema di provola affumicata e il suo fondo', 18, true, 20),
('primi', 'La Tradizione', 'Lasagnette verdi stordellata con il tipico ripieno dei tordelli alla carrarese', 15, true, 30),
('primi', 'Cacciagione', 'Pappardelle al cervo', 18, true, 40),
('primi', 'Mare e Terra', 'Ravioli del plin ai gamberi e lardo di Colonnata su crema di asparagi', 20, true, 50),
('primi', 'Lo Spaghetto', 'Monograno Felicetti, vongole veraci sgusciate, zest di limone e bottarga', 25, true, 60),
('secondi', 'Il Polpo', 'In doppia cottura su crema di patate al limone, cipolla croccante e maionese', 22, true, 10),
('secondi', 'Pollo alla Birra', 'Ripieno di verdure e salsiccia con patate duchesse', 17, true, 20),
('secondi', 'La Vaporata', 'Calamari e gamberi al vapore con verdurine marinate', 20, true, 30),
('secondi', 'L''Agnello', 'Costolette alle erbe di montagna, patate novelle e fondo bruno', 25, true, 40),
('secondi', 'Il Nostro Piccione', 'Con crema di carote, radicchio e il suo fondo', 24, true, 50)
on conflict (categoria, nome) do nothing;
