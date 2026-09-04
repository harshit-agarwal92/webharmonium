-- =========================================================
-- MASTI MUSIC — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Paste this entire file into the Supabase SQL Editor and run.
-- =========================================================

-- 1. USERS TABLE
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp default now()
);

-- 2. FAVORITES TABLE
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  song_id text not null,
  song_name text,
  song_image text,
  created_at timestamp default now()
);

-- 3. PLAYLISTS TABLE
create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  created_at timestamp default now()
);

-- 4. PLAYLIST_SONGS TABLE
create table if not exists playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  song_id text not null,
  song_name text,
  song_image text,
  added_at timestamp default now()
);

-- 5. RECENTLY_PLAYED TABLE
create table if not exists recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  song_id text not null,
  song_name text,
  song_image text,
  played_at timestamp default now()
);

-- 6. FEATURED_CONTENT TABLE (Admin Overrides)
create table if not exists featured_content (
  id uuid primary key default gen_random_uuid(),
  song_id text not null,
  song_name text,
  song_image text,
  section text not null, -- e.g. "trending_hits", "top_charts"
  position int default 0,
  added_by uuid references users(id),
  created_at timestamp default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

alter table users enable row level security;
alter table favorites enable row level security;
alter table playlists enable row level security;
alter table playlist_songs enable row level security;
alter table recently_played enable row level security;
alter table featured_content enable row level security;

-- USERS POLICIES
create policy "Users can view own profile or admins view all" 
  on users for select 
  using (auth.uid() = id or (select role from users where id = auth.uid()) = 'admin');

create policy "Users can update own profile" 
  on users for update 
  using (auth.uid() = id);

-- FAVORITES POLICIES
create policy "Users can manage own favorites" 
  on favorites for all 
  using (auth.uid() = user_id);

-- PLAYLISTS POLICIES
create policy "Users can manage own playlists" 
  on playlists for all 
  using (auth.uid() = user_id);

-- PLAYLIST SONGS POLICIES
create policy "Users can manage own playlist songs" 
  on playlist_songs for all 
  using (
    exists (
      select 1 from playlists 
      where playlists.id = playlist_songs.playlist_id 
      and playlists.user_id = auth.uid()
    )
  );

-- RECENTLY PLAYED POLICIES
create policy "Users can manage own recently played" 
  on recently_played for all 
  using (auth.uid() = user_id);

-- FEATURED CONTENT POLICIES (Public read, Admin write)
create policy "Everyone can view featured content" 
  on featured_content for select 
  using (true);

create policy "Only admins can modify featured content" 
  on featured_content for all 
  using ((select role from users where i-- =========================================================
-- MASTI MUSIC — SUPABASE DATABASE SCHEMA
-- FIXED VERSION
-- =========================================================

-- UUID generation
create extension if not exists pgcrypto;


-- =========================================================
-- 1. USERS
-- =========================================================

create table if not exists public.users (
    id uuid primary key,
    name text not null,
    email text unique not null,
    avatar_url text,
    role text not null default 'user'
        check (role in ('user', 'admin')),
    created_at timestamptz default now()
);


-- =========================================================
-- 2. FAVORITES
-- =========================================================

create table if not exists public.favorites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    song_id text not null,
    song_name text,
    song_image text,
    created_at timestamptz default now(),

    unique(user_id, song_id)
);


-- =========================================================
-- 3. PLAYLISTS
-- =========================================================

create table if not exists public.playlists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);


-- =========================================================
-- 4. PLAYLIST SONGS
-- =========================================================

create table if not exists public.playlist_songs (
    id uuid primary key default gen_random_uuid(),
    playlist_id uuid not null
        references public.playlists(id) on delete cascade,
    song_id text not null,
    song_name text,
    song_image text,
    added_at timestamptz default now(),

    unique(playlist_id, song_id)
);


-- =========================================================
-- 5. RECENTLY PLAYED
-- =========================================================

create table if not exists public.recently_played (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    song_id text not null,
    song_name text,
    song_image text,
    played_at timestamptz default now()
);


-- =========================================================
-- 6. FEATURED CONTENT
-- =========================================================

create table if not exists public.featured_content (
    id uuid primary key default gen_random_uuid(),
    song_id text not null,
    song_name text,
    song_image text,
    section text not null,
    position integer default 0,
    added_by uuid references public.users(id),
    created_at timestamptz default now()
);


-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table public.users enable row level security;
alter table public.favorites enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.recently_played enable row level security;
alter table public.featured_content enable row level security;


-- =========================================================
-- ADMIN CHECK FUNCTION
-- IMPORTANT:
-- Prevents recursive users-table RLS problem.
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.users
        where id = auth.uid()
          and role = 'admin'
    );
$$;


-- =========================================================
-- REMOVE OLD POLICIES
-- Allows this script to be safely re-run.
-- =========================================================

drop policy if exists "Users can view own profile or admins view all"
on public.users;

drop policy if exists "Users can update own profile"
on public.users;

drop policy if exists "Admins can manage users"
on public.users;

drop policy if exists "Users can manage own favorites"
on public.favorites;

drop policy if exists "Users can manage own playlists"
on public.playlists;

drop policy if exists "Users can manage own playlist songs"
on public.playlist_songs;

drop policy if exists "Users can manage own recently played"
on public.recently_played;

drop policy if exists "Everyone can view featured content"
on public.featured_content;

drop policy if exists "Only admins can modify featured content"
on public.featured_content;


-- =========================================================
-- USERS POLICIES
-- =========================================================

create policy "Users can view own profile or admins view all"
on public.users
for select
using (
    auth.uid() = id
    or public.is_admin()
);


create policy "Users can update own profile"
on public.users
for update
using (
    auth.uid() = id
)
with check (
    auth.uid() = id
);


create policy "Admins can manage users"
on public.users
for all
using (
    public.is_admin()
)
with check (
    public.is_admin()
);


-- =========================================================
-- FAVORITES POLICIES
-- =========================================================

create policy "Users can manage own favorites"
on public.favorites
for all
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);


-- =========================================================
-- PLAYLIST POLICIES
-- =========================================================

create policy "Users can manage own playlists"
on public.playlists
for all
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);


-- =========================================================
-- PLAYLIST SONGS POLICIES
-- =========================================================

create policy "Users can manage own playlist songs"
on public.playlist_songs
for all
using (
    exists (
        select 1
        from public.playlists
        where playlists.id = playlist_songs.playlist_id
          and playlists.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.playlists
        where playlists.id = playlist_songs.playlist_id
          and playlists.user_id = auth.uid()
    )
);


-- =========================================================
-- RECENTLY PLAYED
-- =========================================================

create policy "Users can manage own recently played"
on public.recently_played
for all
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);


-- =========================================================
-- FEATURED CONTENT
-- =========================================================

create policy "Everyone can view featured content"
on public.featured_content
for select
using (true);


create policy "Only admins can modify featured content"
on public.featured_content
for all
using (
    public.is_admin()
)
with check (
    public.is_admin()
);


-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists idx_favorites_user_id
on public.favorites(user_id);

create index if not exists idx_playlists_user_id
on public.playlists(user_id);

create index if not exists idx_playlist_songs_playlist_id
on public.playlist_songs(playlist_id);

create index if not exists idx_recently_played_user_id
on public.recently_played(user_id);

create index if not exists idx_recently_played_played_at
on public.recently_played(played_at desc);

create index if not exists idx_featured_content_section_position
on public.featured_content(section, position);


-- =========================================================
-- DONE
-- =========================================================d = auth.uid()) = 'admin');
