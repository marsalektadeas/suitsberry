-- Nákupy z košíku (source = 'order') i poptávky z kontaktního formuláře (source = 'contact').
-- Spouští se idempotentně přes `npm run db:migrate`.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null check (source in ('order', 'contact')),
  status text not null default 'new',
  name text not null,
  phone text,
  email text,
  items jsonb not null default '[]'::jsonb,
  message text,
  internal_note text not null default ''
);

-- Přechod z první verze (jeden oblek na řádek). Tabulka byla v tu chvíli prázdná,
-- takže se staré sloupce jen zahodí, nic se nepřevádí.
alter table leads add column if not exists number bigint generated always as identity (start with 1001);
alter table leads add column if not exists items jsonb not null default '[]'::jsonb;
alter table leads drop column if exists product_id;
alter table leads drop column if exists product_name;
alter table leads drop column if exists color;
alter table leads drop column if exists size;

-- Nákup a poptávka mají každý vlastní sadu stavů (viz STATUS_OPTIONS v lib/lead-schema.ts).
alter table leads drop constraint if exists leads_status_check;
alter table leads add constraint leads_status_check check (
  (source = 'order' and status in ('new', 'approved', 'paid', 'shipped', 'done', 'cancelled'))
  or (source = 'contact' and status in ('new', 'contacted', 'done', 'cancelled'))
);

create unique index if not exists leads_number_idx on leads (number);
create index if not exists leads_created_at_idx on leads (created_at desc);
