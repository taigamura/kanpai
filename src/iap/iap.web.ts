// Web stub for the UI Studio (expo start --web). StoreKit/IAP is native-only; on web it no-ops
// so the real app can bundle and run in the browser for UI tuning. Native uses iap.ts unchanged.
export const REMOVE_ADS_SKU = 'app.kanpai.mvp.removeads';

export type RemoveAdsProduct = { price: string; title: string };
export type PurchaseResult = 'owned' | 'cancelled' | 'unavailable';

export function iapAvailable(): boolean {
  return false;
}
export async function fetchRemoveAdsProduct(): Promise<RemoveAdsProduct | null> {
  return null;
}
export async function purchaseRemoveAds(): Promise<PurchaseResult> {
  return 'unavailable';
}
export async function restorePurchases(): Promise<boolean> {
  return false;
}
