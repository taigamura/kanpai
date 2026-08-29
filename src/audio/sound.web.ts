// Web stub for the UI Studio (expo start --web). expo-audio is a native module; on web these
// no-op so the real app can bundle and run in the browser for UI tuning. Native builds use
// sound.ts unchanged (tension bed + explosion SFX for ロシアンルーレット).
export function audioAvailable(): boolean {
  return false;
}
export function startTension(): void {
  /* no audio on web */
}
export function rampTension(_progress: number): void {
  /* no audio on web */
}
export function stopTension(): void {
  /* no audio on web */
}
export function playExplosion(): void {
  /* no audio on web */
}
