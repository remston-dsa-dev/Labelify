-- Labelify: SKUs with EAN-13 GTIN per user, RLS
-- Run in Supabase: SQL Editor → New query → paste → Run (or: supabase db push)

create table if not exists public.skus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gtin text not null check (gtin ~ '^[0-9]{13}$'),
  name text not null,
  lot text,
  price_cents integer not null default 0 check (price_cents >= 0),
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, gtin)
);

create index if not exists skus_user_created_idx
  on public.skus (user_id, created_at desc);

alter table public.skus enable row level security;

drop policy if exists "Users select own skus" on public.skus;
drop policy if exists "Users insert own skus" on public.skus;
drop policy if exists "Users update own skus" on public.skus;
drop policy if exists "Users delete own skus" on public.skus;

create policy "Users select own skus"
  on public.skus for select
  using (auth.uid() = user_id);

create policy "Users insert own skus"
  on public.skus for insert
  with check (auth.uid() = user_id);

create policy "Users update own skus"
  on public.skus for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own skus"
  on public.skus for delete
  using (auth.uid() = user_id);

create or replace function public.set_skus_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists skus_set_updated_at on public.skus;
create trigger skus_set_updated_at
  before update on public.skus
  for each row execute function public.set_skus_updated_at();
