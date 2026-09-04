-- 0004_instances.sql — Join/leave instance dengan cap 30 pemain
-- Owner: Backend (session/instance infra). Dasar: max 30 concurrent per instance
-- (CONTEXT.md:24, GAME_DESIGN.md:43), Phase 6 join/leave (IMPLEMENTATION_PLAN.md:89-99),
-- anti-cheat: cap ditegakkan server-side agar client tak bisa penuhi instance.
-- Dipanggil server-side (service_role) saja. instance_id adalah internal backend
-- (format bebas TEXT); kontrak hanya menyimpan nilainya (GameSession.instanceId).

-- Pengetatan: join/leave wajib lewat fungsi di bawah (agar cap terjaga).
-- Cabut policy insert/update langsung milik client dari 0002.
drop policy if exists gs_owner_write on game_sessions;
drop policy if exists gs_owner_end on game_sessions;

create or replace function public.join_instance(
  p_player_id uuid,
  p_world_id text,
  p_instance_id text default null
)
returns game_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_instance text;
  v_count integer;
  v_session game_sessions%rowtype;
begin
  if p_world_id is null or p_world_id = '' then
    raise exception 'WORLD_REQUIRED';
  end if;

  if p_instance_id is not null and p_instance_id <> '' then
    select count(*) into v_count from game_sessions
     where instance_id = p_instance_id and ended_at is null;
    if v_count >= 30 then
      raise exception 'INSTANCE_FULL';
    end if;
    v_instance := p_instance_id;
  else
    -- Cari instance di world yang sama dengan slot (<30 aktif), paling sedikit isi.
    select instance_id into v_instance from game_sessions
     where world_id = p_world_id and ended_at is null
     group by instance_id having count(*) < 30
     order by count(*) asc limit 1;
    if v_instance is null then
      v_instance := 'inst-' || substr(gen_random_uuid()::text, 1, 8);
    end if;
  end if;

  insert into game_sessions (instance_id, player_id, world_id)
  values (v_instance, p_player_id, p_world_id)
  returning * into v_session;
  return v_session;
end;
$$;

create or replace function public.leave_instance(
  p_session_id uuid,
  p_player_id uuid
)
returns game_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session game_sessions%rowtype;
begin
  update game_sessions
     set ended_at = now()
   where id = p_session_id and player_id = p_player_id and ended_at is null
  returning * into v_session;
  if not found then
    raise exception 'SESSION_NOT_FOUND';
  end if;
  return v_session;
end;
$$;

revoke all on function public.join_instance(uuid, text, text) from public, anon, authenticated;
grant execute on function public.join_instance(uuid, text, text) to service_role;
revoke all on function public.leave_instance(uuid, uuid) from public, anon, authenticated;
grant execute on function public.leave_instance(uuid, uuid) to service_role;
