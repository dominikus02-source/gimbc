-- 0005_security_hardening.sql — Penutup 2 blocker TL Dominikus
-- Blocker 1: players server-owned. Hapus UPDATE langsung client; mutasi profil
--   (username/avatarId) hanya via fungsi server; level/xp/coins hanya service_role.
--   Bonus same-class fix: hapus INSERT langsung client (signup bisa set level=99);
--   profil dibuat otomatis trigger dengan default aman. Bagian ini eksplisit agar
--   bisa di-veto: hapus blok handle_new_user + kembalikan policy insert bila tak setuju.
-- Blocker 2: player_positions wajib pasangan session/player valid (EXISTS ke
--   game_sessions milik sendiri + sesi aktif) untuk INSERT dan UPDATE.

-- ===== Blocker 1: players =====
drop policy if exists players_owner_update on players;
drop policy if exists players_owner_insert on players;

-- Mutasi profil via server-side API saja (dipanggil dengan service_role).
create or replace function public.update_profile(
  p_player_id uuid,
  p_username text,
  p_avatar_id text
)
returns players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player players%rowtype;
begin
  if p_username is null or p_username = '' then
    raise exception 'USERNAME_REQUIRED';
  end if;
  if p_avatar_id is null or p_avatar_id = '' then
    raise exception 'AVATAR_REQUIRED';
  end if;
  update players
     set username = p_username, avatar_id = p_avatar_id
   where id = p_player_id
  returning * into v_player;
  if not found then
    raise exception 'PLAYER_NOT_FOUND';
  end if;
  return v_player;
end;
$$;
revoke all on function public.update_profile(uuid, text, text) from public, anon, authenticated;
grant execute on function public.update_profile(uuid, text, text) to service_role;

-- Profil dibuat otomatis saat signup dengan default aman (level=1, xp=0, coins=0).
-- Trigger standar Supabase pada auth.users; bypass RLS (berjalan sebagai pemilik trigger).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.players (id, username, avatar_id, level, xp, coins)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1), 'player'),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_id', ''), 'default'),
    1, 0, 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Blocker 2: player_positions wajib sesi milik sendiri + aktif =====
drop policy if exists pp_owner_write on player_positions;
drop policy if exists pp_owner_update on player_positions;

create policy pp_owner_write on player_positions
  for insert to authenticated
  with check (
    auth.uid() = player_id
    and exists (
      select 1 from game_sessions gs
      where gs.id = session_id
        and gs.player_id = auth.uid()
        and gs.ended_at is null
    )
  );

create policy pp_owner_update on player_positions
  for update to authenticated
  using (
    auth.uid() = player_id
    and exists (
      select 1 from game_sessions gs
      where gs.id = session_id
        and gs.player_id = auth.uid()
        and gs.ended_at is null
    )
  )
  with check (
    auth.uid() = player_id
    and exists (
      select 1 from game_sessions gs
      where gs.id = session_id
        and gs.player_id = auth.uid()
        and gs.ended_at is null
    )
  );
