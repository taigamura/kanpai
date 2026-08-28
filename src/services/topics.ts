// 山手線 お題 sharing + voting service. Guarded like ads/iap: with no backend configured
// (TOPICS_API.url === '') every call is a safe no-op and the app stays fully on-device.
// When configured, submitted お題 are shared with other players and upvotes are aggregated
// server-side (that aggregate doubles as the developer's analytics). All network calls are
// best-effort and never throw into the UI.
import { KEYS, loadJSON, saveJSON } from '@/state/storage';
import { TOPICS_API } from './topicsConfig';

export type CommunityTopic = { text: string; votes: number };

export function syncEnabled(): boolean {
  return TOPICS_API.url.trim().length > 0;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOPICS_API.key) {
    h['apikey'] = TOPICS_API.key;
    h['Authorization'] = `Bearer ${TOPICS_API.key}`;
  }
  return h;
}

// Anonymous, per-install id (no account, no PII) so submissions/votes can be de-duplicated
// server-side. Generated once and persisted locally.
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

const base = () => TOPICS_API.url.replace(/\/$/, '');

// Fetch the community お題 ranked by votes. [] when disabled or on any failure.
export async function fetchCommunityTopics(): Promise<CommunityTopic[]> {
  if (!syncEnabled()) return [];
  try {
    const res = await fetch(`${base()}/topics`, { headers: headers() });
    if (!res.ok) return [];
    const data = (await res.json()) as CommunityTopic[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Share a user-authored お題. Returns true if it reached the backend. When disabled, returns
// false (the お題 is still saved locally by AppState, so the user keeps it in their game).
export async function submitTopic(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t || !syncEnabled()) return false;
  try {
    const installId = await getInstallId();
    const res = await fetch(`${base()}/topics`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ installId, text: t }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Upvote an お題 (one per install). Returns true if the vote reached the backend.
export async function voteTopic(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t || !syncEnabled()) return false;
  try {
    const installId = await getInstallId();
    const res = await fetch(`${base()}/votes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ installId, text: t }),
    });
    if (res.ok) void rememberVote(t);
    return res.ok;
  } catch {
    return false;
  }
}
