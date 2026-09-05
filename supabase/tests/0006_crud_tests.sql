-- 0006_crud_tests.sql — Tests level-gate + RBAC start_quest (0006)
-- GREEN = 6/6. Rollback di akhir. Butuh pgTAP. Jalan sebagai postgres kecuali
-- bagian RLS (S4–S5) yang memakai SET ROLE authenticated + JWT simulasi.

begin;
select plan(6);

insert into players (id, username, avatar_id, level, xp, coins) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tester', 'av1', 1, 0, 0)
on conflict (id) do nothing;

insert into quests (id, name, description, npc_id, world_id, required_level, xp_reward, coin_reward, sort_order) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Q-low', 'desc', 'npc1', 'bahasa-village', 1, 10, 5, 3),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Q-high', 'desc', 'npc1', 'bahasa-village', 5, 50, 20, 4),
  ('99999999-9999-9999-9999-999999999999', 'Q-low2', 'desc', 'npc1', 'bahasa-village', 1, 10, 5, 5)
on conflict (id) do nothing;

-- S1: level cukup -> started
select lives_ok(
  $$ select start_quest('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee') $$,
  'S1 start_quest level cukup ALLOWED');
select is(
  (select status from quest_progress where player_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
     and quest_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  'active', 'S2 progress -> active');

-- S3: level kurang -> tolak
select throws_ok(
  $$ select start_quest('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        'ffffffff-ffff-ffff-ffff-ffffffffffff') $$,
  'P0001', 'S3 start_quest level kurang DENIED (LEVEL_TOO_LOW)');

-- S4: duplikat -> tolak
select throws_ok(
  $$ select start_quest('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee') $$,
  'P0001', 'S4 start_quest duplikat DENIED');

-- S5: RLS ikut tolak insert langsung level kurang
set role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', false);
select throws_ok(
  $$ insert into quest_progress (player_id, quest_id, status) values
     ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'ffffffff-ffff-ffff-ffff-ffffffffffff', 'active') $$,
  '42501', 'S5 RLS tolak insert langsung level kurang');

-- S6: RLS izinkan insert langsung level cukup
select lives_ok(
  $$ insert into quest_progress (player_id, quest_id, status) values
     ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '99999999-9999-9999-9999-999999999999', 'active') $$,
  'S6 RLS izinkan insert langsung level cukup');
reset role;

select * from finish();
rollback;
