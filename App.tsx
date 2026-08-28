import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { GameHost } from '@/games/GameHost';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BeerGround } from '@/components/Screen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { initAds } from '@/ads/ads';

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
  const { ready, ageAccepted } = useAppState();
  const { route } = useNav();

  if (!ready) return <LoadingScreen />;
  if (!ageAccepted) return <AgeGateScreen />;

  const screen = (() => {
    switch (route.name) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
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
    <Animated.View
      key={key}
      entering={FadeIn.duration(240)}
      exiting={FadeOut.duration(160)}
      style={styles.fill}
    >
      {screen}
    </Animated.View>
  );
}

export default function App() {
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

  // While the app fonts are still loading, show the pour without the logotype so it never flashes
  // in a fallback system face; once fonts are in, the logo renders in the real display font.
  if (!fontsLoaded || !minSplash) return <LoadingScreen showLogo={fontsLoaded} />;

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
              <Router />
            </ErrorBoundary>
          </NavProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
