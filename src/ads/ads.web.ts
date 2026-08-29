// Web stub for the UI Studio (expo start --web). AdMob is native-only; on web it no-ops so the
// real app can bundle and run in the browser for UI tuning. Native builds use ads.ts unchanged.
export function adsAvailable(): boolean {
  return false;
}
export async function initAds(): Promise<void> {
  /* no ads on web */
}
export async function maybeShowInterstitial(_adsRemoved: boolean): Promise<void> {
  /* no ads on web */
}
