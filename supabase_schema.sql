-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Letters Table
create table public.letters (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  author_name text not null,
  password text not null, -- Simple PIN for friends to manage their own
  reply_content text, -- Response from brother
  is_public boolean default true
);

-- 2. Gifts Table
create table public.gifts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  sender_name text,
  password text,
  expires_at timestamp with time zone,
  barcode_number text,
  is_public boolean default true,
  image_url text,
  selected_by_brother boolean default false
);

-- 3. Photos Table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  storage_path text not null,
  author_name text,
  caption text,
  password text,
  is_public boolean default true
);

-- 4. App Config Table (for Admin settings)
create table public.app_config (
  key text primary key,
  value text
);

-- Seed initial config
insert into public.app_config (key, value) values ('max_gift_selection', '3');
insert into public.app_config (key, value) values ('d_day_date', '2026-02-28');

-- Policies (RLS) - For simplicity in this specific project type, we might start public but usually:
alter table public.letters enable row level security;
alter table public.gifts enable row level security;
alter table public.photos enable row level security;
alter table public.app_config enable row level security;

-- Allow read access to everyone for now (Refine later)
create policy "Enable read access for all users" on public.letters for select using (true);
create policy "Enable insert for all users" on public.letters for insert with check (true);
create policy "Enable update for all users" on public.letters for update using (true); -- Logic handled in app via password check

create policy "Enable read access for all users" on public.gifts for select using (true);
create policy "Enable update for all users" on public.gifts for update using (true);

create policy "Enable read access for all users" on public.photos for select using (true);
create policy "Enable insert for all users" on public.photos for insert with check (true);
create policy "Enable update for all users" on public.photos for update using (true);
create policy "Enable delete for all users" on public.photos for delete using (true);

create policy "Enable delete for all users" on public.letters for delete using (true);

create policy "Enable insert for all users" on public.gifts for insert with check (true);
create policy "Enable delete for all users" on public.gifts for delete using (true);
