-- One-off: apply in Supabase → SQL editor (2026-10-02). Same as the UGC section of schema.sql, plus
-- hiding a drinking-flavored community お題 ahead of the 4.3(b) resubmission.
-- ─────
-- -- UGC moderation (2026-10-02, App Review Guideline 1.2). Idempotent; safe to re-run.
-- Adds: an NG-word filter on submit, per-install report + auto-hide, per-install author block,
-- and a `list_topics` RPC that serves the community list minus hidden / reported / blocked rows.
-- Review reports in the dashboard: select * from topic_reports order by created_at desc;
-- Remove a topic for everyone: update topics set hidden = true where text = '...';
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.topics add column if not exists hidden boolean not null default false;
alter table public.topics add column if not exists author_install text;

-- Backfill authors from the submissions log (first submitter wins).
update public.topics t
set author_install = s.install_id
from (
  select distinct on (text) text, install_id
  from public.topic_submissions
  order by text, created_at
) s
where t.text = s.text and t.author_install is null;

create table if not exists public.banned_words (
  word text primary key
);
insert into public.banned_words (word) values
  ('死ね'), ('殺す'), ('ころす'), ('きもい'), ('キモい'), ('ブス'), ('ちんこ'), ('まんこ'),
  ('セックス'), ('エロ'), ('レイプ'), ('ガイジ'), ('池沼'), ('シナ人'), ('ニガー'),
  ('fuck'), ('shit'), ('sex'), ('nigger'), ('http'), ('www.')
on conflict do nothing;

create table if not exists public.topic_reports (
  install_id text not null,
  text text not null references public.topics(text) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (install_id, text)
);

create table if not exists public.author_blocks (
  install_id text not null,      -- the blocker
  blocked_install text not null, -- the author they no longer want to see
  created_at timestamptz not null default now(),
  primary key (install_id, blocked_install)
);

-- Submit (replaces the v1 function): NG-word filter + records the author.
create or replace function public.submit_topic(p_text text, p_install text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  p_text := btrim(p_text);
  if p_text is null or length(p_text) = 0 or length(p_text) > 60 then
    return;
  end if;
  if exists (select 1 from public.banned_words b where lower(p_text) like '%' || lower(b.word) || '%') then
    return;
  end if;
  insert into public.topic_submissions (install_id, text) values (p_install, p_text);
  insert into public.topics (text, author_install) values (p_text, p_install)
  on conflict (text) do nothing;
end;
$$;

-- Report an お題. Two distinct reports hide it for everyone until the developer reviews it.
create or replace function public.report_topic(p_text text, p_install text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  p_text := btrim(p_text);
  insert into public.topic_reports (install_id, text) values (p_install, p_text)
  on conflict (install_id, text) do nothing;
  update public.topics set hidden = true
  where text = p_text
    and (select count(*) from public.topic_reports r where r.text = p_text) >= 2;
end;
$$;

-- Block the author of an お題: everything they submitted disappears for this install.
create or replace function public.block_topic_author(p_text text, p_install text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author text;
begin
  select author_install into v_author from public.topics where text = btrim(p_text);
  if v_author is null or v_author = p_install then
    return;
  end if;
  insert into public.author_blocks (install_id, blocked_install) values (p_install, v_author)
  on conflict do nothing;
end;
$$;

-- The community list as this install should see it.
create or replace function public.list_topics(p_install text)
returns table (text text, votes integer)
language sql
stable
security definer
set search_path = public
as $$
  select t.text, t.votes
  from public.topics t
  where not t.hidden
    and not exists (
      select 1 from public.topic_reports r where r.text = t.text and r.install_id = p_install
    )
    and not exists (
      select 1 from public.author_blocks b
      where b.install_id = p_install and b.blocked_install = t.author_install
    )
  order by t.votes desc, t.created_at desc
  limit 100;
$$;

alter table public.banned_words enable row level security;
alter table public.topic_reports enable row level security;
alter table public.author_blocks enable row level security;

-- Direct reads (v1 clients) no longer see hidden お題.
drop policy if exists "read topics" on public.topics;
create policy "read topics" on public.topics for select to anon using (not hidden);

grant execute on function public.report_topic(text, text) to anon;
grant execute on function public.block_topic_author(text, text) to anon;
grant execute on function public.list_topics(text) to anon;

-- Keep author ids private: anon may read only the public columns directly.
revoke select on public.topics from anon;
grant select (text, votes, created_at, hidden) on public.topics to anon;

update public.topics set hidden = true where text = '好きなおつまみ';
