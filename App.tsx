import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/theme/theme';
import { AppStateProvider, useAppState } from '@/state/AppState';
import { NavProvider, useNav } from '@/navigation/Nav';

import { AgeGateScreen } from '@/screens/AgeGateScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { RosterScreen } from '@/screens/RosterScreen';
import { GameHost } from '@/games/GameHost';
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

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!ageAccepted) return <AgeGateScreen />;

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
}

export default function App() {
  useStartup();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <NavProvider>
            <StatusBar style="light" />
            <Router />
          </NavProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
