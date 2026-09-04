-- 0002_rls_phase5.sql — RLS Phase 5, game-local auth only
-- Owner: Backend. Dasar: ARCHITECTURE.md:35 (game-local only), :37-39 (no service-role
-- di frontend), CONTRACTS.md:5 (DB internal milik backend), IMPLEMENTATION_PLAN.md:75-85.
-- Konvensi: players.id = auth.users.id saat auth di-wire (Phase 5). service_role bypass
-- RLS (default Supabase) untuk operasi server-side sensitif (grant reward, complete quest).
-- Prinsip anti-cheat (milik backend): client TIDAK boleh insert/update rewards,
-- TIDAK boleh set quest_progress.status='completed' langsung. Itu via server-side.

-- ===== players: pemilik kelola miliknya =====
drop policy if exists players_owner_read on players;
create policy players_owner_read on players
  for select to authenticated using (auth.uid() = id);

drop policy if exists players_owner_update on players;
create policy players_owner_update on players
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- insert profil sendiri saat signup (id = auth.uid()). Tanpa ini user baru tak bisa buat profil.
drop policy if exists players_owner_insert on players;
create policy players_owner_insert on players
  for insert to authenticated with check (auth.uid() = id);

-- ===== quests: konten baca publik terautentikasi =====
drop policy if exists quests_auth_read on quests;
create policy quests_auth_read on quests
  for select to authenticated using (true);

-- ===== quest_progress: pemilik baca + mulai; selesaikan via server =====
drop policy if exists qp_owner_read on quest_progress;
create policy qp_owner_read on quest_progress
  for select to authenticated using (auth.uid() = player_id);

drop policy if exists qp_owner_start on quest_progress;
create policy qp_owner_start on quest_progress
  for insert to authenticated with check (auth.uid() = player_id and status = 'active');

-- tidak ada policy update/delete untuk client: transisi active->completed/failed
-- dilakukan server-side (service_role) setelah validasi jawaban. Mencegah cheat XP/coins.

-- ===== rewards: pemilik baca saja; grant via server =====
drop policy if exists rewards_owner_read on rewards;
create policy rewards_owner_read on rewards
  for select to authenticated using (auth.uid() = player_id);

-- tidak ada policy insert/update/delete untuk client: reward di-grant server-side
-- bersamaan dengan penyelesaian quest (satu transaksi, service_role).

-- ===== game_sessions: pemilik tulis miliknya, terautentikasi baca (sync lobby) =====
drop policy if exists gs_owner_read on game_sessions;
create policy gs_owner_read on game_sessions
  for select to authenticated using (auth.uid() = player_id);

drop policy if exists gs_instance_read on game_sessions;
create policy gs_instance_read on game_sessions
  for select to authenticated using (true);

drop policy if exists gs_owner_write on game_sessions;
create policy gs_owner_write on game_sessions
  for insert to authenticated with check (auth.uid() = player_id);

drop policy if exists gs_owner_end on game_sessions;
create policy gs_owner_end on game_sessions
  for update to authenticated using (auth.uid() = player_id) with check (auth.uid() = player_id);

-- ===== player_positions: baca untuk sync (max 30/instance, CONTEXT.md:24), tulis milik sendiri =====
drop policy if exists pp_sync_read on player_positions;
create policy pp_sync_read on player_positions
  for select to authenticated using (true);

drop policy if exists pp_owner_write on player_positions;
create policy pp_owner_write on player_positions
  for insert to authenticated with check (auth.uid() = player_id);

drop policy if exists pp_owner_update on player_positions;
create policy pp_owner_update on player_positions
  for update to authenticated using (auth.uid() = player_id) with check (auth.uid() = player_id);
