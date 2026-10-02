// 山手線 お題 sharing + voting service, backed by Supabase. Guarded like ads/iap: with no
// project configured (TOPICS_API.url === '') every call is a safe no-op and the app stays fully
// on-device. When configured, submitted お題 are shared with other players and upvotes aggregate
// on the `topics` table server-side (that aggregate + the submissions log are the developer's
// analytics). All network calls are best-effort and never throw into the UI.
//
// Talks to Supabase directly: the `list_topics` RPC for the ranked read (falls back to a plain
// PostgREST GET if the backend predates it), SECURITY DEFINER RPCs for writes (see
// supabase/schema.sql).
//
// Moderation (Guideline 1.2): users can report an お題 or block its author. Either one hides it
// on this device immediately (KEYS.hiddenTopics) and tells the backend, which drops reported /
// blocked rows from this install's list and hides an お題 for everyone after two reports.
import { KEYS, loadJSON, saveJSON } from '@/state/storage';
import { TOPICS_API } from './topicsConfig';
import { containsNgWord } from '@/data/ngWords';

export type CommunityTopic = { text: string; votes: number };

export function syncEnabled(): boolean {
  return TOPICS_API.url.trim().length > 0 && TOPICS_API.anonKey.trim().length > 0;
}

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: TOPICS_API.anonKey,
    Authorization: `Bearer ${TOPICS_API.anonKey}`,
  };
}

const restBase = () => `${TOPICS_API.url.replace(/\/$/, '')}/rest/v1`;

// Anonymous, per-install id (no account, no PII) so submissions/votes can be de-duplicated
// server-side. Generated once and persisted locally — only ever created once sync is enabled.
let cachedId: string | null = null;
export async function getInstallId(): Promise<string> {
  if (cachedId) return cachedId;
  const existing = await loadJSON<string>(KEYS.installId, '');
  if (existing) {
    cachedId = existing;
    return existing;
  }
  const id = `k_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  cachedId = id;
  void saveJSON(KEYS.installId, id);
  return id;
}

// Which お題 this install has already upvoted (keeps the 👍 one-shot + reflects UI state).
export async function loadVotedSet(): Promise<Set<string>> {
  const arr = await loadJSON<string[]>(KEYS.topicVotes, []);
  return new Set(arr);
}

async function rememberVote(text: string): Promise<void> {
  const arr = await loadJSON<string[]>(KEYS.topicVotes, []);
  if (!arr.includes(text)) void saveJSON(KEYS.topicVotes, [...arr, text]);
}

async function rpc(fn: string, body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${restBase()}/rpc/${fn}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// お題 this install has reported, hidden, or whose author it blocked.
export async function loadHiddenSet(): Promise<Set<string>> {
  const arr = await loadJSON<string[]>(KEYS.hiddenTopics, []);
  return new Set(arr);
}

async function rememberHidden(text: string): Promise<void> {
  const arr = await loadJSON<string[]>(KEYS.hiddenTopics, []);
  if (!arr.includes(text)) await saveJSON(KEYS.hiddenTopics, [...arr, text]);
}

async function fetchRanked(): Promise<CommunityTopic[] | null> {
  try {
    const installId = await getInstallId();
    const res = await fetch(`${restBase()}/rpc/list_topics`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ p_install: installId }),
    });
    if (res.ok) return (await res.json()) as CommunityTopic[];
    const legacy = await fetch(
      `${restBase()}/topics?select=text,votes&order=votes.desc,created_at.desc&limit=100`,
      { headers: headers() }
    );
    return legacy.ok ? ((await legacy.json()) as CommunityTopic[]) : null;
  } catch {
    return null;
  }
}

// Fetch the community お題 ranked by votes (top first), minus anything this install hid or that
// trips the NG-word filter. [] when disabled or on any failure.
export async function fetchCommunityTopics(): Promise<CommunityTopic[]> {
  if (!syncEnabled()) return [];
  const [data, hidden] = await Promise.all([fetchRanked(), loadHiddenSet()]);
  if (!Array.isArray(data)) return [];
  return data.filter((c) => !hidden.has(c.text) && !containsNgWord(c.text));
}

// Share a user-authored お題. Returns true if it reached the backend. When disabled, returns
// false (the お題 is still saved locally by AppState, so the user keeps it in their game).
export async function submitTopic(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t || !syncEnabled() || containsNgWord(t)) return false;
  const installId = await getInstallId();
  return rpc('submit_topic', { p_text: t, p_install: installId });
}

// Upvote an お題 (one per install). Returns true if the vote reached the backend.
export async function voteTopic(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t || !syncEnabled()) return false;
  const installId = await getInstallId();
  const ok = await rpc('vote_topic', { p_text: t, p_install: installId });
  if (ok) void rememberVote(t);
  return ok;
}

// Report an お題 as inappropriate. Hidden locally right away; the backend logs the report for the
// developer and hides the お題 for everyone once a second install reports it.
export async function reportTopic(text: string): Promise<void> {
  await rememberHidden(text);
  if (!syncEnabled()) return;
  const installId = await getInstallId();
  await rpc('report_topic', { p_text: text, p_install: installId });
}

// Block whoever posted this お題: it (and, server-side, all their other お題) vanish for this install.
export async function blockTopicAuthor(text: string): Promise<void> {
  await rememberHidden(text);
  if (!syncEnabled()) return;
  const installId = await getInstallId();
  await rpc('block_topic_author', { p_text: text, p_install: installId });
}
