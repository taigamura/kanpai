// Bottom-anchored AdMob banner. Rendered as a normal-flow bar UNDER the app content (see
// App.tsx Shell), so it reserves its own height and can never cover a button — it does not
// float over the UI. Guarded exactly like interstitials: absent native module / web / tests
// no-op, owners (adsRemoved) see nothing, and a no-fill collapses the bar so no empty gap shows.
//
// Sizing: fixed 320×50 standard banner, centered, on a foam-cream bar with an ink hairline so it
// reads as part of the lager theme rather than a white slab.
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/theme';
import { useAppState } from '@/state/AppState';
import { reportAdStatus } from './adStatus';

let Ads: any = null;
try {
  Ads = require('react-native-google-mobile-ads');
} catch {
  Ads = null;
}

// Real AdMob BANNER unit id (create one in AdMob under the same app as the interstitial:
// AdMob → Apps → カンパイ！ → Ad units → Add → Banner). EMPTY until you paste it here — release
// then renders NO banner rather than shipping a TEST id to production (an AdMob policy violation).
// Dev builds always use Google's TEST banner id, so the placement is visible while developing.
const REAL_BANNER: Record<string, string> = {
  ios: 'ca-app-pub-6862698457969651/9261864571', // iOS banner unit (AdMob app ~3900340220)
};

function bannerUnitId(): string | null {
  if (!Ads) return null;
  if (__DEV__) return Ads.TestIds?.BANNER ?? null;
  return REAL_BANNER[Platform.OS] || null;
}

export function BannerAdSlot() {
  const { adsRemoved } = useAppState();
  const insets = useSafeAreaInsets();
  const [failed, setFailed] = useState(false);

  if (adsRemoved || !Ads) return null;
  const unit = bannerUnitId();
  if (!unit) {
    reportAdStatus({ banner: 'ユニットID無し', bannerUnit: null });
    return null;
  }
  if (failed) return null;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <Ads.BannerAd
        unitId={unit}
        size={Ads.BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => {
          if (__DEV__) console.log('[kanpai/ads] banner loaded');
          reportAdStatus({ banner: 'LOADED', bannerUnit: unit });
        }}
        onAdFailedToLoad={(e: unknown) => {
          if (__DEV__) console.log('[kanpai/ads] banner failed:', e);
          const anyErr = e as any;
          reportAdStatus({
            banner: `ERROR/NO_FILL: ${anyErr?.code || anyErr?.message || String(e ?? 'unknown')}`,
            bannerUnit: unit,
          });
          setFailed(true); // collapse the bar on no-fill so no empty gap is left
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.foam,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
