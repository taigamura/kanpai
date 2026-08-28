-- カンパイ！ shared 山手線 お題 backend (Supabase / Postgres).
-- Run this once in the Supabase SQL editor for the project. It creates the pool + vote/
-- submission logs, exposes two SECURITY DEFINER RPCs for the app (anon key only), and locks
-- direct writes behind RLS. The votes aggregate on `topics` is the developer's analytics; the
-- `topic_submissions` log lets you see who submitted what (by anonymous install id, no PII).

create table if not exists public.topics (
  text text primary key,
  votes integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.topic_votes (
  install_id text not null,
  text text not null references public.topics(text) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (install_id, text)
);

create table if not exists public.topic_submissions (
  id bigint generated always as identity primary key,
  install_id text not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- Submit a shared お題: record the submission, then add it to the shared pool if new.
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
  insert into public.topic_submissions (install_id, text) values (p_install, p_text);
  insert into public.topics (text) values (p_text) on conflict (text) do nothing;
end;
$$;

-- Upvote an お題 once per install; bump the aggregate used for ranking + analytics.
create or replace function public.vote_topic(p_text text, p_install text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  p_text := btrim(p_text);
  insert into public.topic_votes (install_id, text) values (p_install, p_text)
  on conflict (install_id, text) do nothing;
  if found then
    update public.topics set votes = votes + 1 where text = p_text;
  end if;
end;
$$;

-- Lock down direct table access; the app only reads `topics` and calls the two RPCs.
alter table public.topics enable row level security;
alter table public.topic_votes enable row level security;
alter table public.topic_submissions enable row level security;

drop policy if exists "read topics" on public.topics;
create policy "read topics" on public.topics for select to anon using (true);

grant usage on schema public to anon;
grant select on public.topics to anon;
grant execute on function public.submit_topic(text, text) to anon;
grant execute on function public.vote_topic(text, text) to anon;
