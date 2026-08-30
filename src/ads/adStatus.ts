// Always-on ad diagnostics store (NOT __DEV__-gated, so it works in a RELEASE TestFlight build
// where console logs are silenced). ads.ts + BannerAdSlot.tsx report every SDK/interstitial/banner
// event here; the Settings debug panel subscribes and renders the latest state on-device, so you
// can see WHY an ad did or didn't appear (SDK init / LOADED / NO_FILL / ERROR) without Xcode.
//
// Pure JS, no native deps — safe on web/tests too.

export type AdStatus = {
  /** Whether the native react-native-google-mobile-ads module is linked in this build. */
  module: 'present' | 'absent' | 'unknown';
  /** Which ad unit ids this build requests. Test ids never earn revenue; live ids need real fill. */
  env: 'test-ids' | 'live-ids' | 'unknown';
  /** AdMob SDK lifecycle. */
  sdk: 'idle' | 'initializing' | 'ready' | 'failed';
  /** Last interstitial event, human-readable. */
  interstitial: string;
  interstitialUnit: string | null;
  /** Last banner event, human-readable. */
  banner: string;
  bannerUnit: string | null;
  /** Game opens counted toward the frequency cap (interstitial shows on the 3rd). */
  opens: number;
  /** Epoch ms of the last update. */
  updatedAt: number;
};

const state: AdStatus = {
  module: 'unknown',
  env: 'unknown',
  sdk: 'idle',
  interstitial: '—',
  interstitialUnit: null,
  banner: '—',
  bannerUnit: null,
  opens: 0,
  updatedAt: 0,
};

type Listener = (s: AdStatus) => void;
const listeners = new Set<Listener>();

export function getAdStatus(): AdStatus {
  return { ...state };
}

export function subscribeAdStatus(cb: Listener): () => void {
  listeners.add(cb);
  cb(getAdStatus());
  return () => {
    listeners.delete(cb);
  };
}

/** Merge a partial update, stamp the time, and notify subscribers. */
export function reportAdStatus(patch: Partial<AdStatus>): void {
  Object.assign(state, patch);
  state.updatedAt = Date.now();
  const snapshot = getAdStatus();
  listeners.forEach((cb) => {
    try {
      cb(snapshot);
    } catch {
      /* a bad subscriber must not break ad reporting */
    }
  });
}
