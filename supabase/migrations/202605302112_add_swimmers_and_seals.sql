create extension if not exists pgcrypto;

alter table public.swims
  add column if not exists swimmer_name text;

update public.swims
set swimmer_name = 'Solo swimmer'
where swimmer_name is null;

alter table public.swims
  alter column swimmer_name set not null;

create table if not exists public.seal_sightings (
  id uuid primary key default gen_random_uuid(),
  count integer not null check (count > 0),
  reported_by text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.swims enable row level security;
alter table public.seal_sightings enable row level security;

drop policy if exists "Anyone can read swims" on public.swims;
drop policy if exists "Anyone can log swims" on public.swims;
drop policy if exists "Anyone can update swims" on public.swims;
drop policy if exists "Anyone can delete swims" on public.swims;

create policy "Anyone can read swims"
  on public.swims
  for select
  to anon
  using (true);

create policy "Anyone can log swims"
  on public.swims
  for insert
  to anon
  with check (true);

create policy "Anyone can update swims"
  on public.swims
  for update
  to anon
  using (true)
  with check (true);

create policy "Anyone can delete swims"
  on public.swims
  for delete
  to anon
  using (true);

drop policy if exists "Anyone can read seal sightings" on public.seal_sightings;
drop policy if exists "Anyone can report seal sightings" on public.seal_sightings;

create policy "Anyone can read seal sightings"
  on public.seal_sightings
  for select
  to anon
  using (true);

create policy "Anyone can report seal sightings"
  on public.seal_sightings
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.swims to anon;
grant select, insert on public.seal_sightings to anon;
