import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon, IconName } from '@/components/Icon';
import { T, Button } from '@/components/ui';
import { TumbleDie, PressableScale } from '@/components/motion';
import { spacing, font, colors, radius } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';

// チンチロ: pass-around multiplayer. Each seat rolls 3 dice in turn; roles are scored
// and compared; the lowest roll → 罰ゲーム. Seat-based (no names needed).

const d = () => 1 + Math.floor(Math.random() * 6);

type Roll = { dice: [number, number, number]; label: string; score: number; kind: 'good' | 'normal' | 'bad' };

// Higher score = stronger. Lowest score loses.
function evaluate(dice: [number, number, number]): Roll {
  const [a, b, c] = [...dice].sort((x, y) => x - y);
  if (a === 1 && b === 1 && c === 1) return { dice, label: 'ピンゾロ（1のアラシ）', score: 70, kind: 'good' };
  if (a === b && b === c) return { dice, label: `${a}のアラシ`, score: 50 + a, kind: 'good' };
  if (a === 4 && b === 5 && c === 6) return { dice, label: 'シゴロ（4-5-6）', score: 45, kind: 'good' };
  if (a === 1 && b === 2 && c === 3) return { dice, label: 'ヒフミ（1-2-3）', score: -2, kind: 'bad' };
  if (a === b || b === c) {
    const point = a === b ? c : a; // the odd die is the point
    return { dice, label: `${point}の目`, score: point, kind: 'normal' };
  }
  return { dice, label: '目なし（ションベン）', score: -1, kind: 'bad' };
}

type Phase = 'setup' | 'handoff' | 'rolled' | 'reveal';

export function ChinchiroGame() {
  const [players, setPlayers] = useState(3);
  const [phase, setPhase] = useState<Phase>('setup');
  const [seat, setSeat] = useState(0);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [current, setCurrent] = useState<Roll | null>(null);
  const [rollSeq, setRollSeq] = useState(0); // bumps each roll so the dice re-tumble

  const loserSeat = useMemo(() => {
    if (rolls.length !== players) return -1;
    let lo = 0;
    rolls.forEach((r, i) => {
      if (r.score < rolls[lo].score) lo = i;
    });
    return lo;
  }, [rolls, players]);

  const startGame = () => {
    setRolls([]);
    setSeat(0);
    setCurrent(null);
    setPhase('handoff');
  };

  const roll = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCurrent(evaluate([d(), d(), d()]));
    setRollSeq((n) => n + 1);
    setPhase('rolled');
  };

  const confirmRoll = () => {
    if (!current) return;
    const next = [...rolls, current];
    setRolls(next);
    if (next.length >= players) {
      setPhase('reveal');
    } else {
      setSeat((s) => s + 1);
      setCurrent(null);
      setPhase('handoff');
    }
  };

  const tint = (k: Roll['kind']) =>
    k === 'good' ? colors.success : k === 'bad' ? colors.danger : colors.text;

  return (
    <GameFrame title="チンチロ">
      {phase === 'setup' && (
        <View style={styles.center}>
          <T dim style={styles.help}>
            3つのサイコロを振って役を出そう。{'\n'}一番弱い役の人は 罰ゲーム。
          </T>
          <T size={font.small} dim>
            人数
          </T>
          <View style={styles.stepper}>
            <PressableScale style={styles.stepBtn} scaleTo={0.88} onPress={() => setPlayers((p) => Math.max(2, p - 1))}>
              <T size={26} bold>
                −
              </T>
            </PressableScale>
            <T size={font.title} black style={{ minWidth: 60, textAlign: 'center' }}>
              {players}
            </T>
            <PressableScale style={styles.stepBtn} scaleTo={0.88} onPress={() => setPlayers((p) => Math.min(8, p + 1))}>
              <T size={26} bold>
                ＋
              </T>
            </PressableScale>
          </View>
          <Button title="はじめる" kind="accent" onPress={startGame} />
        </View>
      )}

      {phase === 'handoff' && (
        <View style={styles.center}>
          <Icon name="dice" size={52} color={colors.text} />
          <T size={font.title} display>
            {seat + 1}人目
          </T>
          <T dim style={styles.help}>
            スマホを {seat + 1} 人目に渡してください。
          </T>
          <Button title="サイコロを振る" kind="accent" onPress={roll} />
        </View>
      )}

      {phase === 'rolled' && current && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {seat + 1}人目の結果
          </T>
          <View style={styles.diceRow}>
            {current.dice.map((v, i) => (
              <TumbleDie key={i} nonce={rollSeq} delay={i * 90}>
                <Icon name={`die-${v}` as IconName} size={64} color={tint(current.kind)} />
              </TumbleDie>
            ))}
          </View>
          <Animated.View key={rollSeq} entering={ZoomIn.delay(320).springify().damping(11)}>
            <T display size={20} style={{ color: tint(current.kind), textAlign: 'center' }}>
              {current.label}
            </T>
          </Animated.View>
          <Button title="振り直し" kind="ghost" onPress={roll} />
          <Button
            title={seat + 1 >= players ? '結果を見る' : '次の人へ'}
            kind="accent"
            onPress={confirmRoll}
          />
        </View>
      )}

      {phase === 'reveal' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            結果
          </T>
          <View style={styles.results}>
            {rolls.map((r, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 80).springify().damping(15)}
                style={[styles.resultRow, i === loserSeat && { borderColor: colors.danger, borderWidth: 1 }]}
              >
                <T>{i + 1}人目</T>
                <View style={styles.diceRowSmall}>
                  {r.dice.map((v, j) => (
                    <Icon key={j} name={`die-${v}` as IconName} size={22} color={tint(r.kind)} />
                  ))}
                </View>
                <T bold style={{ color: tint(r.kind) }}>
                  {r.label}
                </T>
              </Animated.View>
            ))}
          </View>
          <PenaltyReveal loserLabel={`一番弱いのは ${loserSeat + 1}人目！`} />
          <Button title="もう一回" kind="ghost" onPress={() => setPhase('setup')} />
        </View>
      )}
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  help: { textAlign: 'center', lineHeight: 22 },
  diceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  diceRowSmall: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: { width: '100%', gap: spacing.sm, marginBottom: spacing.sm },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
