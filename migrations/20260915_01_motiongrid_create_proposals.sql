-- Migration: MotionGrid proposals + proposal_items
-- Depends on: 20260909_motiongrid_auth_profiles.sql (role hook), 20260910_motiongrid_create_clients.sql

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  title text not null,
  description text,

  status text not null default 'draft'
    check (status in ('draft', 'sent', 'approved', 'rejected')),

  valid_until date,
  total_amount numeric(12,2) not null default 0,

  -- Public link uses a token, not the client slug — a client can have more
  -- than one proposal, so `/proposal/[client-slug]` alone would collide.
  -- This becomes the /proposal/[token] route in Checkpoint 3E/3F.
  public_token uuid not null unique default gen_random_uuid(),

  sent_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,

  created_by uuid references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposals_client_id_idx
  on public.proposals (client_id);

create index if not exists proposals_status_idx
  on public.proposals (status);

create table if not exists public.proposal_items (
  id uuid primary key default gen_random_uuid(),

  proposal_id uuid not null
    references public.proposals(id)
    on delete cascade,

  name text not null,
  description text,

  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,

  position int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposal_items_proposal_id_idx
  on public.proposal_items (proposal_id);

-- ═══════════════════════════════════════════════════════════════
-- Keep proposals.total_amount in sync with its items automatically,
-- so the list page never has to compute sums on the fly.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.proposals_recalc_total()
returns trigger
language plpgsql
as $function$
declare
  target_proposal_id uuid;
begin
  target_proposal_id := coalesce(new.proposal_id, old.proposal_id);

  update public.proposals
  set total_amount = (
    select coalesce(sum(quantity * unit_price), 0)
    from public.proposal_items
    where proposal_id = target_proposal_id
  ),
  updated_at = now()
  where id = target_proposal_id;

  return null;
end;
$function$;

drop trigger if exists proposal_items_recalc_total on public.proposal_items;
create trigger proposal_items_recalc_total
  after insert or update or delete on public.proposal_items
  for each row execute function public.proposals_recalc_total();

-- ═══════════════════════════════════════════════════════════════
-- RLS — admins/super_admins manage everything. Public read policy for
-- the client-facing /proposal/[token] view comes in Checkpoint 3F, once
-- that route exists (don't open it up before it's needed).
-- ═══════════════════════════════════════════════════════════════
alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;

drop policy if exists "Admins can manage proposals" on public.proposals;
create policy "Admins can manage proposals" on public.proposals
for all to authenticated
using (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) in ('admin', 'super_admin'))
with check (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) in ('admin', 'super_admin'));

drop policy if exists "Admins can manage proposal items" on public.proposal_items;
create policy "Admins can manage proposal items" on public.proposal_items
for all to authenticated
using (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) in ('admin', 'super_admin'))
with check (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) in ('admin', 'super_admin'));