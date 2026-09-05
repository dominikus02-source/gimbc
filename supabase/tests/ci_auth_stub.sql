-- ci_auth_stub.sql — STUB KHUSUS CI. JANGAN apply ke project Supabase asli.
-- Menyediakan auth.uid() + auth.users minimal agar migrasi 0001-0005 dan
-- pgTAP tests bisa jalan di postgres polos. Semua objek dibuat hanya jika
-- belum ada (IF NOT EXISTS / guard), jadi aman jika image sudah menyediakannya.
create schema if not exists auth;

do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'auth' and p.proname = 'uid'
  ) then
    create function auth.uid() returns uuid
    language sql stable as
    $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid $$;
  end if;
end
$$;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
