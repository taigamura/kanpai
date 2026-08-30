// ¥300 remove-ads 買い切り (non-consumable), on react-native-iap v16 (openiap).
// (The authoritative price is the App Store Connect price tier — the app displays StoreKit's
//  localized price at runtime and never hardcodes a number in the buy button.)
// Guarded require so dev/Expo Go/web/tests don't crash when the native StoreKit module
// is absent.
//
// v16 specifics this file gets right (they differ from older majors):
//  - products are fetched with fetchProducts({ skus, type }) — getProducts is gone
//  - requestPurchase is EVENT-BASED: the result arrives via purchaseUpdatedListener,
//    not the return value; requestPurchase takes { request: { apple/google }, type }
//  - finishTransaction MUST be called or iOS replays the transaction every launch
//
// Requires (see docs/ROADMAP.md Phase 3): a NON-CONSUMABLE IAP with product id
// REMOVE_ADS_SKU in App Store Connect, the Paid Apps agreement active, a sandbox tester,
// and a dev/EAS build (native module — not Expo Go).

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

export type RemoveAdsProduct = {
  /** StoreKit's localized, currency-formatted price, e.g. "¥300". */
  price: string;
  /** The product's display name as configured in App Store Connect. */
  title: string;
};

/** Outcome of a buy attempt, so the UI can tell "not set up yet" from "user cancelled". */
export type PurchaseResult = 'owned' | 'cancelled' | 'unavailable';

/**
 * Look up the remove-ads product in the store. Returns null when StoreKit can't resolve it —
 * which on a real device means the non-consumable isn't "Ready to Submit" in App Store Connect
 * yet, or the Paid Apps agreement isn't active. (That unresolved state is exactly what makes the
 * native purchase sheet show a blank "[?]" app name and a placeholder price.)
 */
export async function fetchRemoveAdsProduct(): Promise<RemoveAdsProduct | null> {
  if (!(await ensureConnected())) return null;
  try {
    const products =
      (await IAP.fetchProducts?.({ skus: [REMOVE_ADS_SKU], type: 'in-app' })) ?? [];
    const p = products.find((x: any) => x?.id === REMOVE_ADS_SKU || x?.productId === REMOVE_ADS_SKU);
    if (!p) return null;
    // v16 exposes the formatted price as displayPrice; older/adjacent shapes use localizedPrice.
    const price: string =
      p.displayPrice ?? p.localizedPrice ?? p.price ?? '';
    const title: string = p.title ?? p.displayName ?? '';
    return { price, title };
  } catch {
    return null;
  }
}

// v16 wants a single long-lived connection (not init/end per call).
let connected = false;
async function ensureConnected(): Promise<boolean> {
  if (!IAP) return false;
  if (connected) return true;
  try {
    await IAP.initConnection?.();
    connected = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Buy the remove-ads entitlement. v16 delivers the outcome through purchaseUpdatedListener,
 * so we wait on it, finish the transaction (critical on iOS), then confirm ownership.
 * Returns true only once the entitlement is owned.
 */
export async function purchaseRemoveAds(): Promise<PurchaseResult> {
  if (!(await ensureConnected())) return 'unavailable';

  // Resolve the product FIRST. iOS StoreKit prefers products fetched before buy, and if it can't
  // be resolved (product not created / Paid Apps agreement inactive) we must NOT call
  // requestPurchase — that's what pops the useless "[?]" sheet. Bail out as 'unavailable' instead.
  const product = await fetchRemoveAdsProduct();
  if (!product) return 'unavailable';

  const bought = await new Promise<boolean>((resolve) => {
    let settled = false;
    let updSub: any = null;
    let errSub: any = null;
    const settle = (val: boolean) => {
      if (settled) return;
      settled = true;
      try {
        updSub?.remove?.();
      } catch {
        /* noop */
      }
      try {
        errSub?.remove?.();
      } catch {
        /* noop */
      }
      resolve(val);
    };

    updSub = IAP.purchaseUpdatedListener?.(async (purchase: any) => {
      // Single-IAP app: ignore anything that isn't our product (when a productId is present).
      if (purchase?.productId && purchase.productId !== REMOVE_ADS_SKU) return;
      try {
        await IAP.finishTransaction?.({ purchase, isConsumable: false });
      } catch {
        /* finalize best-effort; ownership is re-checked below */
      }
      settle(true);
    });
    errSub = IAP.purchaseErrorListener?.(() => settle(false));

    Promise.resolve(
      IAP.requestPurchase?.({
        request: { apple: { sku: REMOVE_ADS_SKU }, google: { skus: [REMOVE_ADS_SKU] } },
        type: 'in-app',
      })
    ).catch(() => settle(false));

    // The user may sit on the payment sheet; give them time, then fall back to a check.
    setTimeout(() => settle(false), 120000);
  });

  if (bought || (await isRemoveAdsOwned())) return 'owned';
  return 'cancelled';
}

/** Restore / check ownership of the remove-ads entitlement (also used at launch). */
export async function restorePurchases(): Promise<boolean> {
  return isRemoveAdsOwned();
}

async function isRemoveAdsOwned(): Promise<boolean> {
  if (!(await ensureConnected())) return false;
  try {
    // iOS: sync with StoreKit so a restored non-consumable shows up in the list.
    try {
      await IAP.restorePurchases?.();
    } catch {
      /* best-effort */
    }
    const purchases =
      (await IAP.getAvailablePurchases?.({ onlyIncludeActiveItemsIOS: true })) ?? [];
    return purchases.some((p: any) => p?.productId === REMOVE_ADS_SKU);
  } catch {
    return false;
  }
}
