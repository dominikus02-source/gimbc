-- 0003_grant_reward.sql — Fungsi server penilaian + grant reward atomik
-- Owner: Backend (anti-cheat). Dasar: core loop ANSWER->REWARD (CONTEXT.md:8-11),
-- XP/coins dari challenge+quest (GAME_DESIGN.md:24-32), RLS 0002 (client tak boleh
-- tulis rewards / complete quest langsung). Dipanggil server-side (service_role) saja.
-- Level TIDAK diubah di sini: tidak ada rumus level di markdown (butuh keputusan
-- game-design bersama). XP/coins ditambah; level menyusul via migrasi terpisah.

create or replace function public.complete_quest(
  p_player_id uuid,
  p_quest_id uuid,
  p_correct boolean
)
returns quest_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests%rowtype;
  v_progress quest_progress%rowtype;
begin
  select * into v_quest from quests where id = p_quest_id;
  if not found then
    raise exception 'QUEST_NOT_FOUND';
  end if;

  select * into v_progress
    from quest_progress
   where player_id = p_player_id and quest_id = p_quest_id;
  if not found then
    raise exception 'PROGRESS_NOT_FOUND';
  end if;
  if v_progress.status <> 'active' then
    raise exception 'QUEST_NOT_ACTIVE';
  end if;

  if p_correct then
    update quest_progress
       set status = 'completed', completed_at = now()
     where id = v_progress.id
    returning * into v_progress;

    if v_quest.xp_reward > 0 then
      insert into rewards (player_id, quest_id, type, amount)
      values (p_player_id, p_quest_id, 'xp', v_quest.xp_reward);
      update players set xp = xp + v_quest.xp_reward where id = p_player_id;
    end if;

    if v_quest.coin_reward > 0 then
      insert into rewards (player_id, quest_id, type, amount)
      values (p_player_id, p_quest_id, 'coin', v_quest.coin_reward);
      update players set coins = coins + v_quest.coin_reward where id = p_player_id;
    end if;
  else
    update quest_progress
       set status = 'failed', completed_at = now()
     where id = v_progress.id
    returning * into v_progress;
  end if;

  return v_progress;
end;
$$;

-- Hanya service_role yang boleh eksekusi (dipanggil dari server-side).
revoke all on function public.complete_quest(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.complete_quest(uuid, uuid, boolean) to service_role;
