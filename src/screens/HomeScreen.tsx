import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T } from '@/components/ui';
import { GAMES, GameDef } from '@/data/games';
import { useNav } from '@/navigation/Nav';
import { useAppState } from '@/state/AppState';
import { maybeShowInterstitial } from '@/ads/ads';

export function HomeScreen() {
  const nav = useNav();
  const { adsRemoved } = useAppState();

  const openGame = (g: GameDef) => {
    // Interstitials only between games (on open), frequency-capped, and never for owners.
    void maybeShowInterstitial(adsRemoved);
    if (g.needsRoster) nav.go({ name: 'roster', next: g.id });
    else nav.go({ name: 'game', id: g.id });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <T size={font.title} bold>
            カンパイ！
          </T>
          <T dim size={font.small}>
            飲み会・宅飲みパーティーゲーム集
          </T>
        </View>
        <Pressable onPress={() => nav.go({ name: 'settings' })} hitSlop={12}>
          <T size={22}>⚙️</T>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {GAMES.map((g) => (
          <Pressable key={g.id} style={styles.tile} onPress={() => openGame(g)}>
            <T size={40}>{g.emoji}</T>
            <T size={font.heading} bold style={styles.tileTitle}>
              {g.title}
            </T>
            <T dim size={font.small} style={styles.tileSub}>
              {g.subtitle}
            </T>
            {g.status === 'stub' && (
              <T size={font.small} style={styles.soon}>
                制作中
              </T>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  grid: { padding: spacing.md, gap: spacing.md },
  tile: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  tileTitle: { marginTop: spacing.sm },
  tileSub: { marginTop: spacing.xs },
  soon: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: '700',
  },
});
