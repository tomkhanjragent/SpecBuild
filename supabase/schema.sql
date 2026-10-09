-- ============ TeamTree schema + RLS ============
create extension if not exists "pgcrypto";

-- 1) Roles
create type public.app_role as enum ('admin', 'staff');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create policy "users can view own role"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);
create policy "admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2) Security-definer helpers
create function public.has_role(_role public.app_role, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create function public.is_member_user(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select _user_id = auth.uid() or public.has_role('admin', auth.uid());
$$;

revoke all on function public.has_role(public.app_role, uuid) from public, anon;
revoke all on function public.is_member_user(uuid) from public, anon;
grant execute on function public.has_role(public.app_role, uuid) to authenticated;
grant execute on function public.is_member_user(uuid) to authenticated;

-- 3) Apps
create table public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.apps enable row level security;

create policy "members manage apps"
  on public.apps for all to authenticated
  using (public.is_member_user(auth.uid()))
  with check (public.is_member_user(auth.uid()));

-- 4) Custom field definitions
create table public.custom_fields (
  id uuid primary key default gen_random_uuid(),
  section text not null default 'Other',
  label text not null,
  field_type text not null default 'text',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.custom_fields enable row level security;

create policy "members manage custom_fields"
  on public.custom_fields for all to authenticated
  using (public.is_member_user(auth.uid()))
  with check (public.is_member_user(auth.uid()));

-- 5) Members (self-referencing tree)
create table public.members (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  parent_id uuid references public.members(id) on delete cascade,
  name text not null,
  phone text,
  whatsapp text,
  app_user_id text,
  photo_path text,
  status text not null default 'active' check (status in ('active','no_work')),
  joined_at timestamptz not null default now(),
  custom jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.members enable row level security;

create policy "members manage members"
  on public.members for all to authenticated
  using (public.is_member_user(auth.uid()))
  with check (public.is_member_user(auth.uid()));

create index members_app_idx on public.members(app_id);
create index members_parent_idx on public.members(parent_id);

-- 6) Private storage bucket for photos
insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', false)
on conflict (id) do nothing;

create policy "member photos read"
  on storage.objects for select to authenticated
  using (bucket_id = 'member-photos' and public.is_member_user(auth.uid()));
create policy "member photos write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'member-photos' and public.is_member_user(auth.uid()));
create policy "member photos update"
  on storage.objects for update to authenticated
  using (bucket_id = 'member-photos' and public.is_member_user(auth.uid()));
create policy "member photos delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'member-photos' and public.is_member_user(auth.uid()));

-- 7) Default data
insert into public.apps (name, sort_order) values
  ('Mako', 1), ('Ayar', 2), ('Chamet', 3), ('Tigo', 4);

insert into public.custom_fields (section, label, field_type, sort_order) values
  ('Payment', 'Payment Method', 'text', 1),
  ('Work', 'Target', 'text', 2),
  ('Work', 'Note', 'text', 3);

-- 8) Grants
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
