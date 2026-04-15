-- Bulk import batches; SKUs optionally reference an import

create table if not exists public.sku_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  filename text not null,
  row_count integer not null default 0 check (row_count >= 0),
  status text not null check (status in ('completed', 'partial', 'failed')),
  error_summary text,
  created_at timestamptz not null default now()
);

create index if not exists sku_imports_user_created_idx
  on public.sku_imports (user_id, created_at desc);

alter table public.sku_imports enable row level security;

drop policy if exists "Users select own sku_imports" on public.sku_imports;
drop policy if exists "Users insert own sku_imports" on public.sku_imports;
drop policy if exists "Users update own sku_imports" on public.sku_imports;
drop policy if exists "Users delete own sku_imports" on public.sku_imports;

create policy "Users select own sku_imports"
  on public.sku_imports for select
  using (auth.uid() = user_id);

create policy "Users insert own sku_imports"
  on public.sku_imports for insert
  with check (auth.uid() = user_id);

create policy "Users update own sku_imports"
  on public.sku_imports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own sku_imports"
  on public.sku_imports for delete
  using (auth.uid() = user_id);

alter table public.skus
  add column if not exists import_id uuid references public.sku_imports (id) on delete set null;

create index if not exists skus_user_import_idx
  on public.skus (user_id, import_id)
  where import_id is not null;
