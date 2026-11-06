// Pure policy for the in-app review prompt (kept separate from the native module for tests).
export type ReviewState = { sessions: number; lastAsked: number | null };

export const MIN_SESSION_MS = 90_000; // a game left open this long counts as actually played
export const ASK_AFTER_SESSIONS = 3;
export const COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

/** Fold one finished session into the state; `ask` says whether to prompt now. */
export function nextReviewState(
  s: ReviewState,
  sessionMs: number,
  now: number,
): { state: ReviewState; ask: boolean } {
  if (sessionMs < MIN_SESSION_MS) return { state: s, ask: false };
  const sessions = s.sessions + 1;
  const cooled = s.lastAsked == null || now - s.lastAsked >= COOLDOWN_MS;
  const ask = sessions >= ASK_AFTER_SESSIONS && cooled;
  return { state: { sessions, lastAsked: ask ? now : s.lastAsked }, ask };
}
