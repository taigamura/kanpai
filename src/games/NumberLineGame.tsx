import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button, RuleCard } from '@/components/ui';
import { enterBoom, enterPop } from '@/components/motion';
import { spacing, font, colors, radius } from '@/theme/theme';
import { NUMBERLINE_THEMES } from '@/data/numberLineThemes';
import { computeNumberLineOutcome } from './numberLineScore';
import { useAppState } from '@/state/AppState';
import { PenaltyReveal } from './PenaltyReveal';
import { copy, fmt } from '@/content/copy';

// 意思疎通ゲーム: each player is secretly dealt a number 1–100. A theme sets a scale;
// each player names something matching their number's magnitude. The group then orders everyone
// small→large. On reveal, the player whose guessed position is furthest from their true position
// does 罰ゲーム. A perfectly ordered round = 全員成功 (no penalty). Single-phone, pass-around.

type Phase = 'config' | 'deal' | 'reveal' | 'theme' | 'order' | 'result';

const pickTheme = () => NUMBERLINE_THEMES[Math.floor(Math.random() * NUMBERLINE_THEMES.length)];

// Deal `count` distinct numbers in 1..100.
function dealNumbers(count: number): number[] {
  const pool = Array.from({ length: 100 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function NumberLineGame() {
  const { roster } = useAppState();

  const [phase, setPhase] = useState<Phase>('config');
  const [numbers, setNumbers] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState(pickTheme);
  const [dealIdx, setDealIdx] = useState(0);
  const [ordered, setOrdered] = useState<string[]>([]); // group's small→large guess

  const dealee = roster[dealIdx] ?? roster[0];

  const startRound = () => {
    const nums = dealNumbers(roster.length);
    setNumbers(Object.fromEntries(roster.map((n, i) => [n, nums[i]])));
    setTheme(pickTheme());
    setDealIdx(0);
    setOrdered([]);
    setPhase('deal');
  };

  const afterReveal = () => {
    if (dealIdx + 1 < roster.length) {
      setDealIdx((i) => i + 1);
      setPhase('deal');
    } else {
      setPhase('theme');
    }
  };

  const place = (name: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrdered((prev) => [...prev, name]);
  };
  const undo = () => setOrdered((prev) => prev.slice(0, -1));

  const remaining = roster.filter((n) => !ordered.includes(n));

  // Actual ascending order + the most-misplaced player (loser). Perfect = every position matches.
  const outcome = useMemo(
    () => computeNumberLineOutcome(roster, numbers, ordered),
    [roster, numbers, ordered],
  );

  return (
    <GameFrame title={copy.numberline.title}>
      {phase === 'config' && (
        <View style={styles.center}>
          <RuleCard>
            <T dim style={styles.help}>
              {copy.numberline.intro}
            </T>
          </RuleCard>
          <T dim size={font.small} style={{ textAlign: 'center' }}>
            {copy.anketo.participantsPrefix}
            {roster.join('・')}
          </T>
          <Button title={copy.numberline.start} kind="accent" onPress={startRound} />
        </View>
      )}

      {phase === 'deal' && (
        <View style={styles.center}>
          <Icon name="pass-phone" size={64} color={colors.accent} />
          <T size={font.title} display style={styles.q}>
            {fmt(copy.numberline.dealHandoffTo, { name: dealee })}
          </T>
          <T dim style={styles.help}>
            {fmt(copy.numberline.dealHandoffNote, { name: dealee })}
          </T>
          <Button title={copy.numberline.dealReveal} kind="accent" icon="eye" onPress={() => setPhase('reveal')} />
        </View>
      )}

      {phase === 'reveal' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {copy.numberline.yourNumber}
          </T>
          <Animated.View entering={enterPop()}>
            <T display size={72} style={{ color: colors.accent }}>
              {numbers[dealee]}
            </T>
          </Animated.View>
          <Button title={copy.numberline.dealHide} kind="accent" icon="eye-off" onPress={afterReveal} />
        </View>
      )}

      {phase === 'theme' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {copy.numberline.themeLabel}
          </T>
          <T display size={font.title} style={styles.q}>
            {theme.theme}
          </T>
          <RuleCard label={copy.numberline.themeLabel}>
            <View style={{ gap: spacing.xs }}>
              <T style={{ textAlign: 'center' }}>{fmt(copy.numberline.scaleLow, { low: theme.low })}</T>
              <T style={{ textAlign: 'center' }}>{fmt(copy.numberline.scaleHigh, { high: theme.high })}</T>
            </View>
          </RuleCard>
          <Button title={copy.numberline.toOrder} kind="accent" onPress={() => setPhase('order')} />
        </View>
      )}

      {phase === 'order' && (
        <View style={styles.orderWrap}>
          <T dim size={font.small} style={{ textAlign: 'center' }}>
            {theme.theme}｜{fmt(copy.numberline.scaleLow, { low: theme.low })} … {fmt(copy.numberline.scaleHigh, { high: theme.high })}
          </T>
          <T style={{ textAlign: 'center' }}>{copy.numberline.orderIntro}</T>

          {/* Built order so far (small → large) */}
          <View style={styles.orderList}>
            {ordered.map((name, i) => (
              <View key={name} style={styles.orderRow}>
                <T dim size={font.small}>
                  {i + 1}
                </T>
                <T bold>{name}</T>
              </View>
            ))}
          </View>

          {remaining.length > 0 ? (
            <>
              <T dim size={font.small} style={{ textAlign: 'center' }}>
                {fmt(copy.numberline.orderTapPrompt, { i: ordered.length + 1, total: roster.length })}
              </T>
              <View style={styles.options}>
                {remaining.map((name) => (
                  <Pressable key={name} style={styles.option} onPress={() => place(name)}>
                    <T bold>{name}</T>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <Button title={copy.numberline.orderReveal} kind="accent" onPress={() => setPhase('result')} />
          )}

          {ordered.length > 0 && (
            <Button title={copy.numberline.orderUndo} kind="ghost" onPress={undo} />
          )}
        </View>
      )}

      {phase === 'result' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {copy.numberline.resultTitle}
          </T>
          <T dim size={font.small} style={{ textAlign: 'center' }}>
            {theme.theme}
          </T>
          {/* Reveal numbers in the group's guessed order; the true order is ascending by number. */}
          <View style={styles.board}>
            {outcome.rows.map((r) => {
              const isLoser = r.name === outcome.loser;
              return (
                <View key={r.name} style={[styles.resultRow, isLoser && styles.resultRowLose]}>
                  <T dim size={font.small}>
                    {r.guessPos + 1}
                  </T>
                  <T bold style={{ flex: 1, color: isLoser ? colors.cream : colors.text }}>
                    {r.name}
                  </T>
                  <T display size={font.heading} style={{ color: isLoser ? colors.cream : colors.accent }}>
                    {r.number}
                  </T>
                </View>
              );
            })}
          </View>

          {outcome.perfect ? (
            <Animated.View entering={enterBoom()}>
              <T display size={font.heading} style={{ color: colors.success, textAlign: 'center' }}>
                {copy.numberline.perfect}
              </T>
            </Animated.View>
          ) : (
            <PenaltyReveal loserLabel={fmt(copy.numberline.loserLabel, { name: outcome.loser ?? '' })} />
          )}

          <Button title={copy.numberline.again} kind="accent" onPress={startRound} />
          <Button title={copy.numberline.backToStart} kind="ghost" onPress={() => setPhase('config')} />
        </View>
      )}
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  q: { textAlign: 'center' },
  help: { textAlign: 'center', lineHeight: 22 },
  orderWrap: { flex: 1, gap: spacing.md, justifyContent: 'center' },
  orderList: { gap: spacing.xs, width: '100%' },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  options: { gap: spacing.sm, width: '100%' },
  option: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  board: { width: '100%', gap: spacing.sm, marginVertical: spacing.sm },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resultRowLose: { backgroundColor: colors.danger, borderColor: colors.danger },
});
