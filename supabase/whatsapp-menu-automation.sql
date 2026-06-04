create table if not exists public.menu_command_log (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'whatsapp',
  sender text,
  command_text text not null,
  action text,
  status text not null check (status in ('success', 'error', 'info')),
  response text not null,
  menu_item_id uuid references public.menu(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists menu_command_log_created_at_idx
on public.menu_command_log (created_at desc);

create index if not exists menu_command_log_status_idx
on public.menu_command_log (status);

alter table public.menu_command_log enable row level security;
