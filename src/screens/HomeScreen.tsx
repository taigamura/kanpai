import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { GAMES, GameDef } from '@/data/games';
import { useNav } from '@/navigation/Nav';
import { useAppState } from '@/state/AppState';
import { maybeShowInterstitial } from '@/ads/ads';

export function HomeScreen() {
  const nav = useNav();
  const { adsRemoved } = useAppState();
  const [rulesFor, setRulesFor] = useState<GameDef | null>(null);

  const openGame = (g: GameDef) => {
    // Interstitials only between games (on open), frequency-capped, and never for owners.
    void maybeShowInterstitial(adsRemoved);
    if (g.needsRoster) nav.go({ name: 'roster', next: g.id });
    else nav.go({ name: 'game', id: g.id });
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View>
          <T display size={font.title}>
            カンパイ！
          </T>
          <T dim size={font.small} style={styles.headerSub}>
            飲み会・宅飲みパーティーゲーム集
          </T>
        </View>
        <Pressable onPress={() => nav.go({ name: 'settings' })} hitSlop={12}>
          <Icon name="settings" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {GAMES.map((g) => (
          <View key={g.id} style={styles.tile}>
            {/* Left: main tap target opens the game */}
            <Pressable style={styles.tileMain} onPress={() => openGame(g)}>
              <Icon name={g.icon} size={34} color={colors.text} />
              <View style={styles.tileText}>
                <T size={font.heading} black>
                  {g.title}
                </T>
                <T dim size={font.small} style={styles.tileSub}>
                  {g.subtitle}
                </T>
              </View>
            </Pressable>
            {/* Right: separate tap target shows the rules without launching the game */}
            <Pressable
              style={styles.rulesBtn}
              onPress={() => setRulesFor(g)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`${g.title} のルール`}
            >
              <Icon name="info" size={26} color={colors.accent} />
            </Pressable>
            {g.status === 'stub' && (
              <View style={styles.badge}>
                <T size={11} bold style={{ color: colors.accent }}>
                  制作中
                </T>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={rulesFor != null}
        transparent
        animationType="fade"
        onRequestClose={() => setRulesFor(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setRulesFor(null)}>
          {/* Inner press is swallowed so tapping the card doesn't close the modal */}
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHead}>
              {rulesFor && <Icon name={rulesFor.icon} size={30} color={colors.text} />}
              <T size={font.heading} display style={styles.modalTitle}>
                {rulesFor?.title}
              </T>
            </View>
            <T dim size={font.small} style={styles.modalLabel}>
              遊び方
            </T>
            <View style={styles.rulesList}>
              {rulesFor?.rules.map((line, i) => (
                <View key={i} style={styles.ruleRow}>
                  <T style={styles.ruleDot}>・</T>
                  <T style={styles.ruleText}>{line}</T>
                </View>
              ))}
            </View>
            <Button
              title="閉じる"
              kind="ghost"
              onPress={() => setRulesFor(null)}
              style={styles.modalClose}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  headerSub: { marginTop: spacing.xs },
  grid: { padding: spacing.md, gap: spacing.md },
  tile: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tileMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tileText: { flex: 1 },
  tileSub: { marginTop: 2, lineHeight: 17 },
  rulesBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  modalTitle: { flex: 1 },
  modalLabel: { marginTop: spacing.sm, letterSpacing: 1 },
  rulesList: { gap: spacing.sm, marginTop: spacing.xs },
  ruleRow: { flexDirection: 'row', gap: 2 },
  ruleDot: { color: colors.accent },
  ruleText: { flex: 1, lineHeight: 22 },
  modalClose: { marginTop: spacing.md },
});
