-- 0006_rbac_crud.sql — CRUD fasilitas frontend + RBAC level-gate
-- Dasar: Quest.requiredLevel (CONTRACTS.md:64), Player.level (CONTRACTS.md:21),
-- API spec "gagal jika requiredLevel belum terpenuhi" (BACKEND_API_SPEC.md).
-- Sebelumnya gate ini hanya tulisan; sekarang ditegakkan server-side dua lapis:
-- (1) fungsi start_quest() service_role-only, (2) policy RLS ikut cek level.
-- Prinsip RBAC: anon = nothing, authenticated = own/read-minimal, service_role = tulis.

-- ===== (1) start_quest via server =====
create or replace function public.start_quest(
  p_player_id uuid,
  p_quest_id uuid
)
returns quest_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests%rowtype;
  v_level integer;
  v_progress quest_progress%rowtype;
begin
  select * into v_quest from quests where id = p_quest_id;
  if not found then
    raise exception 'QUEST_NOT_FOUND';
  end if;
  select level into v_level from players where id = p_player_id;
  if not found then
    raise exception 'PLAYER_NOT_FOUND';
  end if;
  if v_level < v_quest.required_level then
    raise exception 'LEVEL_TOO_LOW';
  end if;
  begin
    insert into quest_progress (player_id, quest_id, status)
    values (p_player_id, p_quest_id, 'active')
    returning * into v_progress;
  exception when unique_violation then
    raise exception 'QUEST_ALREADY_STARTED';
  end;
  return v_progress;
end;
$$;
revoke all on function public.start_quest(uuid, uuid) from public, anon, authenticated;
grant execute on function public.start_quest(uuid, uuid) to service_role;

-- ===== (2) RLS ikut tegakkan level-gate (jalur client langsung tetap aman) =====
drop policy if exists qp_owner_start on quest_progress;
create policy qp_owner_start on quest_progress
  for insert to authenticated
  with check (
    auth.uid() = player_id
    and status = 'active'
    and exists (
      select 1 from quests q
      where q.id = quest_id
        and q.required_level <= (select p.level from players p where p.id = auth.uid())
    )
  );
