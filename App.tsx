import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideInLeft } from 'react-native-reanimated';
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

// Home is depth 0; every other screen is depth 1. Navigating deeper slides in from the
// right, returning home slides in from the left — a clear sense of place on each transition.
const ROUTE_DEPTH: Record<string, number> = { home: 0, settings: 1, roster: 1, game: 1 };

function Router() {
  const { ready, ageAccepted } = useAppState();
  const { route } = useNav();
  const prevDepth = useRef(0);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
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

  const depth = ROUTE_DEPTH[route.name] ?? 1;
  const forward = depth >= prevDepth.current;
  prevDepth.current = depth;
  const key = route.name + ('id' in route ? route.id : 'next' in route ? route.next : '');
  const entering = (forward ? SlideInRight : SlideInLeft).duration(300);

  return (
    <Animated.View key={key} entering={entering} style={styles.flex}>
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
  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <NavProvider>
            <StatusBar style="dark" />
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
  flex: { flex: 1 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
