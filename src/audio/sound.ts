// Sound layer for カンパイ！. Guarded exactly like ads/iap: if the native `expo-audio`
// module is absent (Expo Go, web, unit tests) every call is a safe no-op, so screens can call
// these freely without feature-detecting themselves.
//
// Used by the time-gated games (ロシアンルーレット, 英語禁止): a looping countdown-timer bed
// (`assets/audio/timer.mp3`) that we swap for a double-speed version (`timer-fast.mp3`) when time
// is running out, plus a one-shot explosion SFX (`explosion.mp3`) for ロシアンルーレット's blast.

type ExpoAudio = typeof import('expo-audio');
type AudioPlayer = import('expo-audio').AudioPlayer;

let mod: ExpoAudio | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mod = require('expo-audio') as ExpoAudio;
} catch {
  mod = null; // native module not present — every export below no-ops
}

let modeReady = false;
async function ensureMode(): Promise<void> {
  if (modeReady || !mod) return;
  try {
    // Play through the silent switch (a party phone is often on silent) and mix with any music
    // already playing rather than seizing the whole audio session.
    await mod.setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {
    /* best-effort */
  }
  modeReady = true;
}

export function audioAvailable(): boolean {
  return mod != null;
}

// ── Countdown timer bed ──────────────────────────────────────────────────────
// Two looping players, created lazily and reused: the normal-speed ticking and its double-speed
// (倍速) version. `startTimer` plays the normal loop; `switchTimerFast` cross-swaps to the fast
// loop as time runs low; `stopTimer` halts both. Only one is ever audible at a time.
let timerNormal: AudioPlayer | null = null;
let timerFast: AudioPlayer | null = null;

function pausePlayer(p: AudioPlayer | null): void {
  if (!p) return;
  try {
    p.pause();
    void p.seekTo(0);
  } catch {
    /* best-effort */
  }
}

export function startTimer(): void {
  if (!mod) return;
  void ensureMode();
  try {
    pausePlayer(timerFast);
    if (!timerNormal) {
      timerNormal = mod.createAudioPlayer(require('../../assets/audio/timer.mp3'));
      timerNormal.loop = true;
    }
    timerNormal.volume = 0.8;
    void timerNormal.seekTo(0);
    timerNormal.play();
  } catch {
    /* best-effort */
  }
}

// Swap the normal loop for the double-speed one (call when time is nearly up). Idempotent-ish:
// if the fast loop is already the active one, restarting it is harmless.
export function switchTimerFast(): void {
  if (!mod) return;
  void ensureMode();
  try {
    pausePlayer(timerNormal);
    if (!timerFast) {
      timerFast = mod.createAudioPlayer(require('../../assets/audio/timer-fast.mp3'));
      timerFast.loop = true;
    }
    timerFast.volume = 0.8;
    void timerFast.seekTo(0);
    timerFast.play();
  } catch {
    /* best-effort */
  }
}

export function stopTimer(): void {
  pausePlayer(timerNormal);
  pausePlayer(timerFast);
}

// ── Explosion SFX ───────────────────────────────────────────────────────────
// One-shot. Fresh player each call (short clip) so overlapping booms never clip each other; it
// removes itself once finished.
export function playExplosion(): void {
  if (!mod) return;
  void ensureMode();
  try {
    const p = mod.createAudioPlayer(require('../../assets/audio/explosion.mp3'));
    p.volume = 1;
    p.play();
    // Release after the clip's length so we don't leak native players.
    setTimeout(() => {
      try {
        p.remove();
      } catch {
        /* already gone */
      }
    }, 3000);
  } catch {
    /* best-effort */
  }
}
