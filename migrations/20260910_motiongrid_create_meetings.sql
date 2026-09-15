create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  scheduled_at timestamptz not null,

  preparation_notes text,
  business_problem text,

  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meetings_client_id_idx
  on public.meetings (client_id);

create index if not exists meetings_scheduled_at_idx
  on public.meetings (scheduled_at);

-- One active meeting per slot: a scheduled 15-minute slot can only be booked
-- once. Cancelled slots are excluded so they can be re-booked.
create unique index if not exists meetings_scheduled_at_scheduled_uidx
  on public.meetings (scheduled_at)
  where status = 'scheduled';