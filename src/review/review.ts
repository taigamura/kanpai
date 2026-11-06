// In-app review prompt (SKStoreReviewController via expo-store-review). Guarded like ads/iap so
// web / tests without the native module just no-op. iOS itself caps the sheet at 3 per year.
import { KEYS, loadJSON, saveJSON } from '@/state/storage';
import { nextReviewState, type ReviewState } from './policy';

let StoreReview: any = null;
try {
  StoreReview = require('expo-store-review');
} catch {
  StoreReview = null;
}

/** Call when the user leaves a game. Never prompts mid-play: only on the way back home. */
export async function recordGameSession(sessionMs: number): Promise<void> {
  const prev = await loadJSON<ReviewState>(KEYS.review, { sessions: 0, lastAsked: null });
  const { state, ask } = nextReviewState(prev, sessionMs, Date.now());
  if (state !== prev) await saveJSON(KEYS.review, state);
  if (!ask || !StoreReview) return;
  try {
    if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
  } catch {
    // best-effort
  }
}
