// "Request a game" service, backed by the same Supabase project as お題 sharing. Guarded the same
// way: with no project configured every call is a safe no-op. When configured, a submitted
// request (free text) + the anonymous install id are logged to the `game_requests` table via the
// SECURITY DEFINER `submit_game_request` RPC (see supabase/schema.sql). Best-effort, never throws.
import { getInstallId } from './topics';
import { TOPICS_API } from './topicsConfig';

export function requestsEnabled(): boolean {
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

// Send a "please add this game" request. Returns true if it reached the backend; false when
// disabled or on any failure. The UI thanks the user regardless (it's a suggestion box).
export async function submitGameRequest(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t || !requestsEnabled()) return false;
  const installId = await getInstallId();
  try {
    const res = await fetch(`${restBase()}/rpc/submit_game_request`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ p_text: t, p_install: installId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
