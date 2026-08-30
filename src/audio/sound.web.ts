// Web stub for the UI Studio (expo start --web). expo-audio is a native module; on web these
// no-op so the real app can bundle and run in the browser for UI tuning. Native builds use
// sound.ts unchanged (countdown-timer bed + explosion SFX for the time-gated games).
export function audioAvailable(): boolean {
  return false;
}
export function startTimer(): void {
  /* no audio on web */
}
export function switchTimerFast(): void {
  /* no audio on web */
}
export function stopTimer(): void {
  /* no audio on web */
}
export function playExplosion(): void {
  /* no audio on web */
}
