import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { PressableScale, PopIn, enterItem } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { GAMES, GameDef } from '@/data/games';
import { useNav } from '@/navigation/Nav';
import { useAppState } from '@/state/AppState';
import { maybeShowInterstitial } from '@/ads/ads';
import { GameRequestModal } from '@/games/GameRequestModal';
import { copy, fmt } from '@/content/copy';

export function HomeScreen() {
  const nav = useNav();
  const { adsRemoved, players, setRoster } = useAppState();
  const [rulesFor, setRulesFor] = useState<GameDef | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);

  // Summary line for the 参加者 entry: leader (most losses) once anyone has lost, else headcount.
  const leader = players.reduce<(typeof players)[number] | null>(
    (best, p) => (p.losses > 0 && (!best || p.losses > best.losses) ? p : best),
    null,
  );
  const playersSub = !players.length
    ? copy.players.homeEmptySub
    : leader
      ? fmt(copy.players.homeLeaderSub, { name: leader.name, n: leader.losses })
      : fmt(copy.players.homeCountSub, { n: players.length });

  const openGame = (g: GameDef) => {
    // Interstitials only between games (on open), frequency-capped, and never for owners.
    void maybeShowInterstitial(adsRemoved);
    if (g.needsRoster) {
      // Registered players ARE the roster: seed it and skip the per-session roster screen
      // once there are enough of them. Otherwise fall back to the quick-add roster flow.
      if (players.length >= g.minPlayers) {
        setRoster(players.map((p) => p.name));
        nav.go({ name: 'game', id: g.id });
      } else {
        nav.go({ name: 'roster', next: g.id });
      }
    } else {
      nav.go({ name: 'game', id: g.id });
    }
  };

  return (
    <Screen edges={['top']}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View>
          <T display size={font.title}>
            {copy.brand.name}
          </T>
          <T dim size={font.small} style={styles.headerSub}>
            {copy.brand.tagline}
          </T>
        </View>
        <PressableScale onPress={() => nav.go({ name: 'settings' })} scaleTo={0.85} hitSlop={12}>
          <Icon name="settings" size={24} color={colors.text} />
        </PressableScale>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.grid}>
        {/* 参加者・負けカウント — a utility entry, deliberately NOT styled like a game tile:
            solid caramel card + people icon + chevron, so it reads as a manager, not a game. */}
        <Animated.View entering={enterItem(0)}>
          <PressableScale style={styles.playersTile} onPress={() => nav.go({ name: 'players' })}>
            <View style={styles.playersIcon}>
              <Icon name="players" size={26} color={colors.cream} />
            </View>
            <View style={{ flex: 1 }}>
              <T size={font.body} black style={{ color: colors.cream }}>
                {copy.players.homeTitle}
              </T>
              <T size={font.small} style={styles.playersSub}>
                {playersSub}
              </T>
            </View>
            <Icon name="back" size={22} color={colors.cream} style={styles.playersChevron} />
          </PressableScale>
        </Animated.View>

        {GAMES.map((g, i) => (
          <Animated.View key={g.id} entering={enterItem(i + 1)} style={styles.tile}>
            {/* Left: main tap target opens the game */}
            <PressableScale style={styles.tileMain} onPress={() => openGame(g)}>
              <Icon name={g.icon} size={34} color={colors.text} />
              <View style={styles.tileText}>
                <T size={font.heading} black>
                  {g.title}
                </T>
                <T dim size={font.small} style={styles.tileSub}>
                  {g.subtitle}
                </T>
              </View>
            </PressableScale>
            {/* Right: separate tap target shows the rules without launching the game */}
            <PressableScale
              style={styles.rulesBtn}
              scaleTo={0.8}
              onPress={() => setRulesFor(g)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={fmt(copy.home.rulesA11y, { title: g.title })}
            >
              <Icon name="info" size={26} color={colors.accent} />
            </PressableScale>
            {g.status === 'stub' && (
              <View style={styles.badge}>
                <T size={11} bold style={{ color: colors.accent }}>
                  {copy.home.inProgress}
                </T>
              </View>
            )}
          </Animated.View>
        ))}

        {/* Suggestion box: let players ask for more games. */}
        <Animated.View entering={enterItem(GAMES.length + 1)}>
          <PressableScale style={styles.requestTile} scaleTo={0.97} onPress={() => setRequestOpen(true)}>
            <Icon name="add" size={26} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <T bold style={{ color: colors.accent }}>
                {copy.home.requestTitle}
              </T>
              <T dim size={font.small} style={{ marginTop: 2 }}>
                {copy.home.requestSub}
              </T>
            </View>
          </PressableScale>
        </Animated.View>
      </ScrollView>

      <GameRequestModal visible={requestOpen} onClose={() => setRequestOpen(false)} />

      <Modal
        visible={rulesFor != null}
        transparent
        animationType="fade"
        onRequestClose={() => setRulesFor(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setRulesFor(null)}>
          {/* Inner press is swallowed so tapping the card doesn't close the modal */}
          <Animated.View entering={PopIn} style={styles.modalWrap}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHead}>
              {rulesFor && <Icon name={rulesFor.icon} size={30} color={colors.text} />}
              <T size={font.heading} display style={styles.modalTitle}>
                {rulesFor?.title}
              </T>
            </View>
            <T dim size={font.small} style={styles.modalLabel}>
              {copy.home.rulesLabel}
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
                title={copy.home.close}
                kind="ghost"
                onPress={() => setRulesFor(null)}
                style={styles.modalClose}
              />
            </Pressable>
          </Animated.View>
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
  playersTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
  },
  playersIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  playersSub: { color: colors.cream, opacity: 0.85, marginTop: 2 },
  playersChevron: { transform: [{ scaleX: -1 }] }, // flip chevron-back to point forward
  requestTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
  modalWrap: { width: '100%', maxWidth: 420 },
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
