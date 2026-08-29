import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one';
import {
  ZenKakuGothicNew_400Regular,
  ZenKakuGothicNew_500Medium,
  ZenKakuGothicNew_700Bold,
  ZenKakuGothicNew_900Black,
} from '@expo-google-fonts/zen-kaku-gothic-new';

import { colors } from '@/theme/theme';
import { AppStateProvider, useAppState } from '@/state/AppState';
import { NavProvider, useNav } from '@/navigation/Nav';

import { AgeGateScreen } from '@/screens/AgeGateScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { RosterScreen } from '@/screens/RosterScreen';
import { PlayersScreen } from '@/screens/PlayersScreen';
import { GameHost } from '@/games/GameHost';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BeerGround } from '@/components/Screen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StudioOverlay } from '@/studio/StudioOverlay';
import { initAds } from '@/ads/ads';
import { BannerAdSlot } from '@/ads/BannerAdSlot';

// Request ATT (for ad personalization) then initialize ads. Both are best-effort and
// guarded — absent native modules (Expo Go / web / tests) simply no-op.
function useStartup() {
  useEffect(() => {
    (async () => {
      try {
        const tt = require('expo-tracking-transparency');
        await tt.requestTrackingPermissionsAsync?.();
      } catch {
        /* module absent — fine */
      }
      await initAds();
    })();
  }, []);
}

function Router() {
  const { ageAccepted } = useAppState();
  const { route, home } = useNav();

  // Swipe-right-to-go-back. The nav is flat and every 戻る button goes home, so a rightward swipe
  // from any non-home screen goes home too. Horizontal-intent thresholds + failOffsetY let the
  // vertical ScrollViews (home list, settings) win, and no screen has a horizontal gesture to steal.
  const goBack = useCallback(() => {
    if (route.name !== 'home') home();
  }, [route.name, home]);
  const swipeBack = useMemo(
    () =>
      Gesture.Pan()
        .enabled(route.name !== 'home')
        .activeOffsetX(24) // needs clear rightward horizontal travel to activate
        .failOffsetY([-18, 18]) // give up to vertical scrolling
        .onEnd((e) => {
          'worklet';
          if (e.translationX > 70 && e.velocityX > 0 && e.translationX > Math.abs(e.translationY)) {
            runOnJS(goBack)();
          }
        }),
    [route.name, goBack],
  );

  if (!ageAccepted) return <AgeGateScreen />;

  const screen = (() => {
    switch (route.name) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'players':
        return <PlayersScreen />;
      case 'roster':
        return <RosterScreen next={route.next} />;
      case 'game':
        return <GameHost id={route.id} />;
      default:
        return <HomeScreen />;
    }
  })();

  // The beer glass (BeerGround) is fixed behind every screen, so navigating only cross-fades the
  // content — pages feel like they resolve in place on the same glass, no sliding background.
  const key = route.name + ('id' in route ? route.id : 'next' in route ? route.next : '');
  return (
    <GestureDetector gesture={swipeBack}>
      <Animated.View
        key={key}
        entering={FadeIn.duration(240)}
        exiting={FadeOut.duration(160)}
        style={styles.fill}
      >
        {screen}
      </Animated.View>
    </GestureDetector>
  );
}

// Web-only phone frame: center the app in an iPhone-sized (393×852 logical pt) rounded card on a
// neutral backdrop so `npm run web` reads as a phone instead of stretching full-window (mirrors
// simple-bookkeeping's AppShell). No-op on native. The `nativeID` becomes a DOM `id` the UI Studio
// uses to pin arrow-comment coordinates to the frame rect.
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.webBackdrop}>
      <View nativeID="kanpai-phone-frame" style={styles.webPhone}>
        {children}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <WebFrame>
      <AppBody />
    </WebFrame>
  );
}

function AppBody() {
  useStartup();
  const [fontsLoaded] = useFonts({
    DelaGothicOne_400Regular,
    ZenKakuGothicNew_400Regular,
    ZenKakuGothicNew_500Medium,
    ZenKakuGothicNew_700Bold,
    ZenKakuGothicNew_900Black,
  });
  // Hold the pour for at least its full run so the boot animation is always seen, even when
  // fonts resolve instantly from the bundle.
  const [minSplash, setMinSplash] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinSplash(true), 1900);
    return () => clearTimeout(id);
  }, []);

  // Mount the full provider tree from the FIRST frame — not after the splash gate — so AppState's
  // AsyncStorage hydration runs *during* the pour, and a single BeerGround + single LoadingScreen
  // span the whole boot. The Gate (below, inside the providers) is what holds the pour; it waits on
  // fonts + the min-splash timer + hydration together, then drains straight into Home over the
  // already-mounted glass. This removes the old loading→home flash, which came from a second
  // LoadingScreen (pour reset to 0) and a BeerGround remount at the splash→app handoff.
  const splashHeld = !fontsLoaded || !minSplash;
  return (
    // Amber root as the ultimate fallback ground behind the fixed beer glass.
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppStateProvider>
          <NavProvider>
            <StatusBar style="dark" />
            {/* the lager glass, rendered once and fixed — every screen cross-fades over it */}
            <BeerGround />
            <ErrorBoundary>
              <Shell splashHeld={splashHeld} showLogo={fontsLoaded} />
            </ErrorBoundary>
            {/* UI Studio — web + __DEV__ only; no-op elsewhere */}
            <StudioOverlay />
          </NavProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// App shell = the boot gate + the bottom banner, laid out in a column so the banner reserves its
// own height UNDER the content (it never floats over the UI or hides a button). Lives INSIDE the
// provider tree so it can wait on AppState hydration (`ready`) alongside fonts + the min-splash
// timer, and read `ageAccepted`/`adsRemoved`. One LoadingScreen instance spans the entire boot and
// drains into Home in place, over the persistent BeerGround, so there is no reset pour and no glass
// remount between loading and home. `showLogo` is false only in the first frames before app fonts
// resolve, so the logotype never renders in a fallback system face. The banner shows only once the
// user is past boot AND the age gate — never over the pour or the 20歳以上 screen.
function Shell({ splashHeld, showLogo }: { splashHeld: boolean; showLogo: boolean }) {
  const { ready, ageAccepted } = useAppState();
  const booting = splashHeld || !ready;
  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        {booting ? <LoadingScreen showLogo={showLogo} /> : <Router />}
      </View>
      {!booting && ageAccepted ? <BannerAdSlot /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  // Shell column: content fills, banner sits beneath it in normal flow (reserves its own space).
  shell: { flex: 1 },
  content: { flex: 1 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Web phone frame (see WebFrame). Native ignores these.
  webBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#15100a', // dark neutral so the amber phone reads as a device
  },
  webPhone: {
    flex: 1,
    width: '100%',
    maxWidth: 393, // iPhone 14/15 logical width (pt)
    maxHeight: 852, // iPhone 14/15 logical height (pt)
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    backgroundColor: colors.bg,
    // RN Web renders these as box-shadow; native as elevation/shadow.
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
});
