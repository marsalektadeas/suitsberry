-- Poptávky z webu: objednávky z detailu obleku i zprávy z kontaktního formuláře.
-- Spouští se idempotentně přes `npm run db:migrate`.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null check (source in ('order', 'contact')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'agreed', 'shipped', 'done', 'cancelled')),
  name text not null,
  phone text,
  email text,
  product_id text,
  product_name text,
  color text,
  size text,
  message text,
  internal_note text not null default ''
);

create index if not exists leads_created_at_idx on leads (created_at desc);
