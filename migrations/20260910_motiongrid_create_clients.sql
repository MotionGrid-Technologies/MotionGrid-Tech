create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  company text not null,
  phone text,
  email text not null,

  slug text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_email_idx
  on public.clients (email);

create index if not exists clients_slug_idx
  on public.clients (slug);