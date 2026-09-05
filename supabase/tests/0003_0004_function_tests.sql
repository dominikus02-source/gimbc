-- 0003_0004_function_tests.sql — Positive/edge tests fungsi server (0003 + 0004)
-- Jalan sebagai postgres (bypass RLS): menguji LOGIKA fungsi, bukan policy
-- (policy sudah diuji 0005_security_tests.sql sebagai authenticated).
-- GREEN = 14/14. Rollback di akhir (DB bersih). Butuh pgTAP.

begin;
select plan(14);

-- ===== Setup =====
insert into players (id, username, avatar_id, level, xp, coins) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tester', 'av1', 1, 0, 0)
on conflict (id) do nothing;

insert into quests (id, name, description, npc_id, world_id, required_level, xp_reward, coin_reward, sort_order) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Q1', 'desc', 'npc1', 'bahasa-village', 1, 10, 5, 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Q2', 'desc', 'npc1', 'bahasa-village', 1, 10, 5, 2)
on conflict (id) do nothing;

insert into quest_progress (player_id, quest_id, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'active'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'active')
on conflict (player_id, quest_id) do nothing;

-- ===== complete_quest benar =====
select lives_ok(
  $$ select complete_quest('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                           'cccccccc-cccc-cccc-cccc-cccccccccccc', true) $$,
  'F1 complete_quest(true) jalan');
select is(
  (select status from quest_progress where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
     and quest_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'completed', 'F2 progress -> completed');
select is(
  (select count(*) from rewards where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
     and quest_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  2::bigint, 'F3 2 baris reward (xp+coin)');
select is(
  (select xp from players where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  10, 'F4 players.xp +10');
select is(
  (select coins from players where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  5, 'F5 players.coins +5');

-- ===== complete_quest ganda -> tolak =====
select throws_ok(
  $$ select complete_quest('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                           'cccccccc-cccc-cccc-cccc-cccccccccccc', true) $$,
  'P0001', 'F6 complete ulang DENIED (QUEST_NOT_ACTIVE)');

-- ===== complete_quest salah -> failed, tanpa reward =====
select lives_ok(
  $$ select complete_quest('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                           'dddddddd-dddd-dddd-dddd-dddddddddddd', false) $$,
  'F7 complete_quest(false) jalan');
select is(
  (select status from quest_progress where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
     and quest_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  'failed', 'F8 progress -> failed');
select is(
  (select count(*) from rewards where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
     and quest_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  0::bigint, 'F9 gagal = tanpa reward');

-- ===== update_profile via server =====
select is(
  (select username from update_profile('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tester2', 'av9')),
  'tester2', 'F10 update_profile ubah username');

-- ===== join otomatis + cap 30 =====
select lives_ok(
  $$ select join_instance('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bahasa-village', null) $$,
  'F11 join auto ALLOWED');

insert into players (id, username, avatar_id)
select gen_random_uuid(), 'filler' || g, 'av1' from generate_series(1, 30) g
on conflict do nothing;

insert into game_sessions (instance_id, player_id, world_id)
select 'inst-cap', p.id, 'bahasa-village' from players p
where p.username like 'filler%' and not exists
  (select 1 from game_sessions s where s.player_id = p.id and s.instance_id = 'inst-cap');

select throws_ok(
  $$ select join_instance('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bahasa-village', 'inst-cap') $$,
  'P0001', 'F12 join ke-31 ke instance penuh DENIED (INSTANCE_FULL)');

-- ===== leave: sekali ok + ended_at terisi, tak ada sesi aktif tersisa =====
select lives_ok(
  $$ select leave_instance(
    (select id from game_sessions where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
       and ended_at is null limit 1),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
  'F13 leave sesi sendiri ALLOWED');
select is(
  (select count(*) from game_sessions
    where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and ended_at is null),
  0::bigint, 'F14 tidak ada sesi aktif tersisa');

select * from finish();
rollback;
reset role;
