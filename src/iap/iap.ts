// ¥370 remove-ads 買い切り (non-consumable). Guarded require so dev/Expo Go/web/tests
// don't crash when the native StoreKit module is absent.
//
// Requires setup before it works on a real device (see docs/ROADMAP.md Phase 3):
//   - App Store Connect: create a NON-CONSUMABLE IAP with product id REMOVE_ADS_SKU
//   - Paid Apps agreement active; sandbox tester for testing
//   - A dev/EAS build (native module — not Expo Go)
//
// NOTE: react-native-iap's API surface shifts across major versions. The calls below are
// the common shape; verify signatures against the installed version before relying on them.

let IAP: any = null;
try {
  IAP = require('react-native-iap');
} catch {
  IAP = null;
}

export const REMOVE_ADS_SKU = 'app.kanpai.mvp.removeads';

export function iapAvailable(): boolean {
  return !!IAP;
}

/** Attempt purchase. Returns true only if the entitlement is confirmed owned. */
export async function purchaseRemoveAds(): Promise<boolean> {
  if (!IAP) return false;
  try {
    await IAP.initConnection();
    await IAP.getProducts?.({ skus: [REMOVE_ADS_SKU] });
    await IAP.requestPurchase?.({ sku: REMOVE_ADS_SKU });
    // The authoritative confirmation is the purchase-updated listener + receipt validation;
    // callers should also verify via restorePurchases() on next launch.
    return await isRemoveAdsOwned();
  } catch {
    return false;
  } finally {
    try {
      await IAP.endConnection?.();
    } catch {
      /* noop */
    }
  }
}

/** Restore / check ownership of the remove-ads entitlement. */
export async function restorePurchases(): Promise<boolean> {
  return isRemoveAdsOwned();
}

async function isRemoveAdsOwned(): Promise<boolean> {
  if (!IAP) return false;
  try {
    await IAP.initConnection();
    const purchases = (await IAP.getAvailablePurchases?.()) ?? [];
    return purchases.some((p: any) => p?.productId === REMOVE_ADS_SKU);
  } catch {
    return false;
  }
}
