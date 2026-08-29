// AdMob interstitials — guarded so the app still runs in Expo Go / web / tests where the
// native module is absent. RELEASE builds use the real AdMob unit ids below; dev builds
// always use Google's official TEST ids so you never tap a live ad (which can get the
// account banned). App ids live in app.json. See docs/ROADMAP.md Phase 3.
//
// Frequency: interstitials only BETWEEN games (called on game open), capped so the first
// couple of opens are always ad-free and ads never interrupt mid-round.
//
// Design (2026-08-29): PRELOAD-AND-CACHE. The old code created + loaded an interstitial
// on-demand and raced the load against a 6s timeout, so any fill slower than 6s (common on
// a fresh AdMob account) was silently dropped — the #1 reason "ads don't show up". Now we
// keep one interstitial loaded ahead of time, show the cached one instantly when the cap is
// hit, and immediately preload the next. In __DEV__ every decision is logged so you can see
// on-device (Metro / Xcode console) exactly why an ad did or didn't appear.
import { Platform } from 'react-native';

let Ads: any = null;
try {
  Ads = require('react-native-google-mobile-ads');
} catch {
  Ads = null;
}

let initialized = false;
let opensSinceAd = 0;
const SHOW_EVERY = 3; // show at most one interstitial per 3 game opens (first 2 are ad-free)

// The single preloaded interstitial + its state.
let cached: any = null;
let cachedLoaded = false;
let loading = false;

function log(...args: unknown[]): void {
  if (__DEV__) console.log('[kanpai/ads]', ...args);
}

export function adsAvailable(): boolean {
  return !!Ads;
}

// Real AdMob interstitial ad unit ids, per platform. Only used in release builds.
const REAL_INTERSTITIAL: Record<string, string> = {
  ios: 'ca-app-pub-6862698457969651/3331645387',
  // android: add once an Android AdMob app + unit exist; falls back to the test id below.
};

function interstitialUnitId(): string | null {
  if (!Ads) return null;
  // Dev / Expo Go: always Google's TEST id so a live ad is never tapped during testing,
  // and so ads reliably show while developing (test inventory always fills).
  if (__DEV__) return Ads.TestIds?.INTERSTITIAL ?? null;
  return REAL_INTERSTITIAL[Platform.OS] ?? Ads.TestIds?.INTERSTITIAL ?? null;
}

// Build + load a fresh interstitial and cache it. Idempotent: no-op while one is already
// loading or a loaded ad is waiting. The next preload is kicked from CLOSED/ERROR handlers.
function preload(): void {
  if (!Ads || loading || cachedLoaded) return;
  const unit = interstitialUnitId();
  if (!unit) {
    log('preload skipped: no unit id');
    return;
  }
  loading = true;
  try {
    const ad = Ads.InterstitialAd.createForAdRequest(unit, {
      requestNonPersonalizedAdsOnly: true,
    });
    ad.addAdEventListener(Ads.AdEventType.LOADED, () => {
      cached = ad;
      cachedLoaded = true;
      loading = false;
      log('interstitial loaded, ready to show');
    });
    ad.addAdEventListener(Ads.AdEventType.ERROR, (err: unknown) => {
      // No fill / network / config error. Clear state; the next game open retries.
      log('interstitial load error:', err);
      cached = null;
      cachedLoaded = false;
      loading = false;
    });
    ad.addAdEventListener(Ads.AdEventType.CLOSED, () => {
      // User dismissed the ad. Drop the spent instance and preload the next one.
      log('interstitial closed, preloading next');
      cached = null;
      cachedLoaded = false;
      loading = false;
      preload();
    });
    ad.load();
    log('interstitial load requested', __DEV__ ? '(TEST id)' : '(live id)', unit);
  } catch (e) {
    log('preload threw:', e);
    loading = false;
  }
}

export async function initAds(): Promise<void> {
  if (!Ads) {
    log('native module absent — ads disabled (Expo Go / web / simulator without dev build)');
    return;
  }
  if (initialized) return;
  try {
    await Ads.default().initialize();
    initialized = true;
    log('SDK initialized');
    preload(); // have the first interstitial ready before the cap is ever hit
  } catch (e) {
    log('SDK init failed:', e);
  }
}

export async function maybeShowInterstitial(adsRemoved: boolean): Promise<void> {
  if (adsRemoved) {
    log('skip: ads removed (owner)');
    return;
  }
  if (!Ads) return;

  opensSinceAd += 1;
  if (opensSinceAd < SHOW_EVERY) {
    log(`open ${opensSinceAd}/${SHOW_EVERY} — no ad yet`);
    return;
  }

  if (!cachedLoaded || !cached) {
    // Cap reached but nothing is ready (slow/absent fill). Don't reset the counter —
    // kick a preload so the NEXT open can show, and don't block gameplay waiting.
    log('cap reached but no ad loaded — preloading, will try next open');
    preload();
    return;
  }

  opensSinceAd = 0;
  const ad = cached;
  // Mark spent immediately so a double-open can't show the same instance twice; CLOSED will
  // preload the replacement.
  cached = null;
  cachedLoaded = false;
  try {
    log('showing interstitial');
    ad.show();
  } catch (e) {
    log('show threw:', e);
    preload();
  }
}
