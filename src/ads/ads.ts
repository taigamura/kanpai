// AdMob interstitials — guarded so the app still runs in Expo Go / web / tests where the
// native module is absent. RELEASE builds use the real AdMob unit ids below; dev builds
// always use Google's official TEST ids so you never tap a live ad (which can get the
// account banned). App ids live in app.json. See docs/ROADMAP.md Phase 3.
//
// Frequency: interstitials only BETWEEN games (called on game open), capped so the first
// couple of opens are always ad-free and ads never interrupt mid-round.
import { Platform } from 'react-native';

let Ads: any = null;
try {
  Ads = require('react-native-google-mobile-ads');
} catch {
  Ads = null;
}

let initialized = false;
let opensSinceAd = 0;
const SHOW_EVERY = 3; // at most one interstitial per 3 game opens

export function adsAvailable(): boolean {
  return !!Ads;
}

export async function initAds(): Promise<void> {
  if (!Ads || initialized) return;
  try {
    await Ads.default().initialize();
    initialized = true;
  } catch {
    // best-effort; ads simply won't show
  }
}

// Real AdMob interstitial ad unit ids, per platform. Only used in release builds.
const REAL_INTERSTITIAL: Record<string, string> = {
  ios: 'ca-app-pub-6862698457969651/3331645387',
  // android: add once an Android AdMob app + unit exist; falls back to the test id below.
};

function interstitialUnitId(): string | null {
  if (!Ads) return null;
  // Dev / Expo Go: always Google's TEST id so a live ad is never tapped during testing.
  if (__DEV__) return Ads.TestIds?.INTERSTITIAL ?? null;
  return REAL_INTERSTITIAL[Platform.OS] ?? Ads.TestIds?.INTERSTITIAL ?? null;
}

export async function maybeShowInterstitial(adsRemoved: boolean): Promise<void> {
  if (adsRemoved || !Ads) return;
  opensSinceAd += 1;
  if (opensSinceAd < SHOW_EVERY) return;
  opensSinceAd = 0;

  const unit = interstitialUnitId();
  if (!unit) return;

  try {
    const ad = Ads.InterstitialAd.createForAdRequest(unit, {
      requestNonPersonalizedAdsOnly: true,
    });
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      ad.addAdEventListener(Ads.AdEventType.LOADED, () => ad.show());
      ad.addAdEventListener(Ads.AdEventType.CLOSED, done);
      ad.addAdEventListener(Ads.AdEventType.ERROR, done);
      ad.load();
      setTimeout(done, 6000); // safety: never block the UI on a slow/absent fill
    });
  } catch {
    // swallow — an ad failure must never break gameplay
  }
}
