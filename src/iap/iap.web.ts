// Web stub for the UI Studio (expo start --web). StoreKit/IAP is native-only; on web it no-ops
// so the real app can bundle and run in the browser for UI tuning. Native uses iap.ts unchanged.
export const REMOVE_ADS_SKU = 'app.kanpai.mvp.removeads';

export function iapAvailable(): boolean {
  return false;
}
export async function purchaseRemoveAds(): Promise<boolean> {
  return false;
}
export async function restorePurchases(): Promise<boolean> {
  return false;
}
