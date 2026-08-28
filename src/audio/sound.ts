// Sound layer for カンパイ！. Guarded exactly like ads/iap: if the native `expo-audio`
// module is absent (Expo Go, web, unit tests) every call is a safe no-op, so screens can call
// these freely without feature-detecting themselves.
//
// Used by the games that benefit from audio (currently ロシアンルーレット): a looping tension
// bed whose playback rate we ramp up as the bomb inflates, and a one-shot explosion SFX. The
// audio is synthesized/royalty-free (see assets/audio), so nothing needs licensing.

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

// ── Tension bed ─────────────────────────────────────────────────────────────
// A single looping player, created lazily and reused. `startTension` (re)starts it at rate 1;
// `rampTension(p)` sets the playback rate from a 0→1 progress so the ticking accelerates as the
// bomb grows; `stopTension` pauses + rewinds it.
let tension: AudioPlayer | null = null;

export function startTension(): void {
  if (!mod) return;
  void ensureMode();
  try {
    if (!tension) {
      tension = mod.createAudioPlayer(require('../../assets/audio/tension.m4a'));
      tension.loop = true;
    }
    tension.playbackRate = 1;
    tension.volume = 0.7;
    void tension.seekTo(0);
    tension.play();
  } catch {
    /* best-effort */
  }
}

// progress: 0 (just started) → 1 (about to blow). Ramps rate 1.0 → 1.9 (pitch + tempo climb).
export function rampTension(progress: number): void {
  if (!tension) return;
  try {
    const p = Math.max(0, Math.min(1, progress));
    tension.playbackRate = 1 + p * 0.9;
  } catch {
    /* best-effort */
  }
}

export function stopTension(): void {
  if (!tension) return;
  try {
    tension.pause();
    void tension.seekTo(0);
  } catch {
    /* best-effort */
  }
}

// ── Explosion SFX ───────────────────────────────────────────────────────────
// One-shot. Fresh player each call (short clip) so overlapping booms never clip each other; it
// removes itself once finished.
export function playExplosion(): void {
  if (!mod) return;
  void ensureMode();
  try {
    const p = mod.createAudioPlayer(require('../../assets/audio/explosion.m4a'));
    p.volume = 1;
    p.play();
    // Release after the clip's length (~1.6s) so we don't leak native players.
    setTimeout(() => {
      try {
        p.remove();
      } catch {
        /* already gone */
      }
    }, 2500);
  } catch {
    /* best-effort */
  }
}
