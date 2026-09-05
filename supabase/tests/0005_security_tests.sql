-- 0005_security_tests.sql — Negative security tests untuk 2 blocker TL
-- Jalankan di Supabase SQL Editor (project game DEV) SETELAH apply 0001-0005,
-- dengan ekstensi pgTAP aktif:  create extension if not exists pgtap;
-- GREEN = semua test ok, tanpa error. Script rollback di akhir (DB bersih).
-- Catatan: tidak bisa dijalankan tanpa Supabase (butuh auth.uid() + pgTAP).

begin;
select plan(8);

-- ===== Setup (sebagai postgres, bypass RLS) =====
insert into players (id, username, avatar_id, level, xp, coins) values
  ('11111111-1111-1111-1111-111111111111', 'alice', 'av1', 1, 0, 0),
  ('22222222-2222-2222-2222-222222222222', 'bob', 'av2', 1, 0, 0)
on conflict (id) do nothing;

insert into game_sessions (id, instance_id, player_id, world_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'inst-t1', '11111111-1111-1111-1111-111111111111', 'bahasa-village'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'inst-t1', '22222222-2222-2222-2222-222222222222', 'bahasa-village')
on conflict (id) do nothing;

-- ===== Bertindak sebagai Alice (authenticated) =====
set role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', false);

-- Blocker 1: client UPDATE level/xp/coins/username -> DENIED (42501)
select throws_ok(
  $$ update players set level = 99 where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', 'T1 client UPDATE level DENIED');
select throws_ok(
  $$ update players set xp = 9999 where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', 'T2 client UPDATE xp DENIED');
select throws_ok(
  $$ update players set coins = 9999 where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', 'T3 client UPDATE coins DENIED');
select throws_ok(
  $$ update players set username = 'hacker' where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', 'T4 client UPDATE username langsung DENIED (wajib via server API)');

-- Blocker 2: Alice -> sesi Alice ALLOWED ...
select lives_ok(
  $$ insert into player_positions (session_id, player_id, x, y, z, rotation_y)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             '11111111-1111-1111-1111-111111111111', 1, 0, 2, 0) $$,
  'T5 Alice INSERT posisi ke sesi miliknya ALLOWED');

-- ... Alice -> sesi Bob DENIED
select throws_ok(
  $$ insert into player_positions (session_id, player_id, x, y, z, rotation_y)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
             '11111111-1111-1111-1111-111111111111', 9, 0, 9, 0) $$,
  '42501', 'T6 Alice INSERT posisi ke sesi Bob DENIED');

-- ... Alice pindahkan baris miliknya ke sesi Bob DENIED
select throws_ok(
  $$ update player_positions set session_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     where session_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
       and player_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', 'T7 Alice UPDATE posisi ke sesi Bob DENIED');

-- Fungsi server tidak bisa dieksekusi client
select ok(
  not has_function_privilege('authenticated',
    'public.update_profile(uuid, text, text)', 'execute'),
  'T8 authenticated TIDAK bisa eksekusi update_profile');

select * from finish();
rollback;
reset role;
