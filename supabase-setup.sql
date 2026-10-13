create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.photo_comments (
    id uuid primary key default gen_random_uuid(),
    photo_id text not null,
    display_name text not null check (char_length(display_name) between 1 and 60),
    body text not null check (char_length(body) between 1 and 1200),
    created_at timestamptz not null default now()
);

create table if not exists public.photo_likes (
    photo_id text not null,
    visitor_id uuid not null,
    created_at timestamptz not null default now(),
    primary key (photo_id, visitor_id)
);

create table if not exists public.published_photos (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 1 and 100),
    description text not null check (char_length(description) between 1 and 1200),
    image_url text not null,
    storage_path text not null unique,
    created_at timestamptz not null default now()
);

create table if not exists public.viewer_messages (
    id uuid primary key default gen_random_uuid(),
    body text not null check (char_length(body) between 1 and 1200),
    created_at timestamptz not null default now()
);

create index if not exists photo_comments_photo_created_idx
on public.photo_comments (photo_id, created_at desc);
create index if not exists viewer_messages_created_idx
on public.viewer_messages (created_at desc);

create or replace function public.is_sharine_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from public.admin_users where user_id = auth.uid()
    );
$$;

alter table public.admin_users enable row level security;
alter table public.photo_comments enable row level security;
alter table public.photo_likes enable row level security;
alter table public.published_photos enable row level security;
alter table public.viewer_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.photo_comments, public.photo_likes, public.published_photos, public.viewer_messages to anon, authenticated;
grant insert on public.photo_comments to anon, authenticated;
grant insert, delete on public.photo_likes to authenticated;
grant select on public.admin_users to authenticated;
grant insert, delete on public.published_photos to authenticated;
grant insert on public.viewer_messages to authenticated;
grant usage on schema storage to authenticated;
grant select, insert, delete on storage.objects to authenticated;

drop policy if exists "Admins can see their own admin record" on public.admin_users;
drop policy if exists "Anyone can read photo comments" on public.photo_comments;
drop policy if exists "Visitors can post bounded photo comments" on public.photo_comments;
drop policy if exists "Admins can remove photo comments" on public.photo_comments;
drop policy if exists "Anyone can read photo likes" on public.photo_likes;
drop policy if exists "Visitors can like photos" on public.photo_likes;
drop policy if exists "Visitors can remove their own likes" on public.photo_likes;
drop policy if exists "Anyone can view published photos" on public.published_photos;
drop policy if exists "Admins can publish photos" on public.published_photos;
drop policy if exists "Admins can remove published photos" on public.published_photos;
drop policy if exists "Anyone can read viewer messages" on public.viewer_messages;
drop policy if exists "Admins can publish viewer messages" on public.viewer_messages;
drop policy if exists "Admins can upload gallery images" on storage.objects;
drop policy if exists "Admins can remove gallery images" on storage.objects;

create policy "Admins can see their own admin record"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create policy "Anyone can read photo comments"
on public.photo_comments for select to anon, authenticated
using (true);
create policy "Visitors can post bounded photo comments"
on public.photo_comments for insert to anon, authenticated
with check (
    char_length(display_name) between 1 and 60
    and display_name = btrim(display_name)
    and char_length(body) between 1 and 1200
    and body = btrim(body)
);
create policy "Admins can remove photo comments"
on public.photo_comments for delete to authenticated
using (public.is_sharine_admin());

create policy "Anyone can read photo likes"
on public.photo_likes for select to anon, authenticated
using (true);
create policy "Visitors can like photos"
on public.photo_likes for insert to authenticated
with check (visitor_id = auth.uid());
create policy "Visitors can remove their own likes"
on public.photo_likes for delete to authenticated
using (visitor_id = auth.uid());

create policy "Anyone can view published photos"
on public.published_photos for select to anon, authenticated
using (true);
create policy "Admins can publish photos"
on public.published_photos for insert to authenticated
with check (public.is_sharine_admin());
create policy "Admins can remove published photos"
on public.published_photos for delete to authenticated
using (public.is_sharine_admin());

create policy "Anyone can read viewer messages"
on public.viewer_messages for select to anon, authenticated
using (true);
create policy "Admins can publish viewer messages"
on public.viewer_messages for insert to authenticated
with check (public.is_sharine_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sharine-gallery', 'sharine-gallery', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can upload gallery images"
on storage.objects for insert to authenticated
with check (bucket_id = 'sharine-gallery' and public.is_sharine_admin());
create policy "Admins can remove gallery images"
on storage.objects for delete to authenticated
using (bucket_id = 'sharine-gallery' and public.is_sharine_admin());
