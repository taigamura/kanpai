import { nextReviewState, MIN_SESSION_MS, COOLDOWN_MS } from '../policy';

const PLAY = MIN_SESSION_MS;
const s0 = { sessions: 0, lastAsked: null };

test('short sessions do not count', () => {
  const r = nextReviewState(s0, PLAY - 1, 0);
  expect(r).toEqual({ state: s0, ask: false });
});

test('asks on 3rd played session, then waits out the cooldown', () => {
  let s = s0;
  const asks: boolean[] = [];
  for (let i = 0; i < 4; i++) {
    const r = nextReviewState(s, PLAY, 1000);
    s = r.state;
    asks.push(r.ask);
  }
  expect(asks).toEqual([false, false, true, false]);
  expect(nextReviewState(s, PLAY, 1000 + COOLDOWN_MS - 1).ask).toBe(false);
  expect(nextReviewState(s, PLAY, 1000 + COOLDOWN_MS).ask).toBe(true);
});
