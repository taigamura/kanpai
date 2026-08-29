import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon, IconName } from '@/components/Icon';
import { T, Button, RuleCard } from '@/components/ui';
import { TumbleDie, PressableScale, Pulse, enterItem, enterPop } from '@/components/motion';
import { spacing, font, colors, radius } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';
import { useAppState } from '@/state/AppState';
import { copy, fmt } from '@/content/copy';

// チンチロ: pass-around multiplayer. Each seat rolls 3 dice in turn; roles are scored
// and compared; the lowest roll → 罰ゲーム. Seat-based (no names needed).

const d = () => 1 + Math.floor(Math.random() * 6);

type Roll = { dice: [number, number, number]; label: string; score: number; kind: 'good' | 'normal' | 'bad' };

// Higher score = stronger. Lowest score loses.
function evaluate(dice: [number, number, number]): Roll {
  const [a, b, c] = [...dice].sort((x, y) => x - y);
  if (a === 1 && b === 1 && c === 1) return { dice, label: copy.chinchiro.rolePinzoro, score: 70, kind: 'good' };
  if (a === b && b === c) return { dice, label: fmt(copy.chinchiro.roleArashi, { n: a }), score: 50 + a, kind: 'good' };
  if (a === 4 && b === 5 && c === 6) return { dice, label: copy.chinchiro.roleShigoro, score: 45, kind: 'good' };
  if (a === 1 && b === 2 && c === 3) return { dice, label: copy.chinchiro.roleHifumi, score: -2, kind: 'bad' };
  if (a === b || b === c) {
    const point = a === b ? c : a; // the odd die is the point
    return { dice, label: fmt(copy.chinchiro.rolePoint, { n: point }), score: point, kind: 'normal' };
  }
  return { dice, label: copy.chinchiro.roleMenashi, score: -1, kind: 'bad' };
}

type Phase = 'setup' | 'handoff' | 'rolling' | 'rolled' | 'reveal';

export function ChinchiroGame() {
  // When the group has registered players, the seat count IS the roster size (and seats are named);
  // otherwise fall back to the manual 人数 stepper.
  const { players: registered } = useAppState();
  const hasRoster = registered.length > 0;
  const [seatCount, setSeatCount] = useState(3);
  const players = hasRoster ? registered.length : seatCount;
  // Display name for a seat: the registered player's name when set, else 「N人目」.
  const seatLabel = (i: number) =>
    hasRoster ? registered[i]?.name ?? '' : fmt(copy.chinchiro.seatN, { n: i + 1 });
  const [phase, setPhase] = useState<Phase>('setup');
  const [seat, setSeat] = useState(0);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [current, setCurrent] = useState<Roll | null>(null);
  const [rollSeq, setRollSeq] = useState(0); // bumps each roll so the dice re-tumble
  const [spin, setSpin] = useState<[number, number, number]>([1, 1, 1]); // cycling faces while rolling
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSpin = () => {
    if (spinRef.current) {
      clearInterval(spinRef.current);
      spinRef.current = null;
    }
  };
  // Stop the spinner if the screen unmounts mid-roll.
  useEffect(() => clearSpin, []);

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

  // Roll & stop: pressing 振る spins the dice (faces cycle); pressing ストップ freezes them on
  // the real result. Feels like actually throwing the dice instead of an instant reveal.
  const startRoll = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearSpin();
    setCurrent(null);
    setPhase('rolling');
    spinRef.current = setInterval(() => setSpin([d(), d(), d()]), 70);
  };

  const stopRoll = () => {
    clearSpin();
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
    <GameFrame title={copy.chinchiro.title}>
      {phase === 'setup' && (
        <View style={styles.center}>
          <RuleCard>
            <T dim style={styles.help}>
              {copy.chinchiro.intro}
            </T>
          </RuleCard>
          {hasRoster ? (
            <>
              <T size={font.small} dim>
                {copy.chinchiro.rosterLabel}
              </T>
              <T bold style={{ textAlign: 'center' }}>
                {fmt(copy.chinchiro.fromRoster, { names: registered.map((p) => p.name).join('・') })}
              </T>
            </>
          ) : (
            <>
              <T size={font.small} dim>
                {copy.chinchiro.playersLabel}
              </T>
              <View style={styles.stepper}>
                <PressableScale style={styles.stepBtn} scaleTo={0.88} onPress={() => setSeatCount((p) => Math.max(2, p - 1))}>
                  <T size={26} bold>
                    −
                  </T>
                </PressableScale>
                <T size={font.title} black style={{ minWidth: 60, textAlign: 'center' }}>
                  {players}
                </T>
                <PressableScale style={styles.stepBtn} scaleTo={0.88} onPress={() => setSeatCount((p) => Math.min(8, p + 1))}>
                  <T size={26} bold>
                    ＋
                  </T>
                </PressableScale>
              </View>
            </>
          )}
          <Button title={copy.chinchiro.start} kind="accent" onPress={startGame} />
        </View>
      )}

      {phase === 'handoff' && (
        <View style={styles.center}>
          <Icon name="dice" size={52} color={colors.text} />
          <T size={font.title} display>
            {seatLabel(seat)}
          </T>
          <T dim style={styles.help}>
            {hasRoster
              ? fmt(copy.chinchiro.handoffNoteName, { name: seatLabel(seat) })
              : fmt(copy.chinchiro.handoffNote, { n: seat + 1 })}
          </T>
          <Button title={copy.chinchiro.roll} kind="accent" onPress={startRoll} />
        </View>
      )}

      {phase === 'rolling' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {seatLabel(seat)}
          </T>
          <Pulse min={0.96} max={1.06} duration={140}>
            <View style={styles.diceRow}>
              {spin.map((v, i) => (
                <Icon key={i} name={`die-${v}` as IconName} size={64} color={colors.text} />
              ))}
            </View>
          </Pulse>
          <T display size={20} dim style={{ textAlign: 'center' }}>
            {copy.chinchiro.rolling}
          </T>
          <Button title={copy.chinchiro.stop} kind="accent" onPress={stopRoll} />
        </View>
      )}

      {phase === 'rolled' && current && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {hasRoster
              ? fmt(copy.chinchiro.seatResultName, { name: seatLabel(seat) })
              : fmt(copy.chinchiro.seatResult, { n: seat + 1 })}
          </T>
          <View style={styles.diceRow}>
            {current.dice.map((v, i) => (
              <TumbleDie key={i} nonce={rollSeq} delay={i * 90}>
                <Icon name={`die-${v}` as IconName} size={64} color={tint(current.kind)} />
              </TumbleDie>
            ))}
          </View>
          <Animated.View key={rollSeq} entering={enterPop(320)}>
            <T display size={20} style={{ color: tint(current.kind), textAlign: 'center' }}>
              {current.label}
            </T>
          </Animated.View>
          <Button title={copy.chinchiro.reroll} kind="ghost" onPress={startRoll} />
          <Button
            title={seat + 1 >= players ? copy.chinchiro.seeResult : copy.chinchiro.next}
            kind="accent"
            onPress={confirmRoll}
          />
        </View>
      )}

      {phase === 'reveal' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {copy.chinchiro.resultLabel}
          </T>
          <View style={styles.results}>
            {rolls.map((r, i) => (
              <Animated.View
                key={i}
                entering={enterItem(i)}
                style={[styles.resultRow, i === loserSeat && { borderColor: colors.danger, borderWidth: 1 }]}
              >
                <T>{seatLabel(i)}</T>
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
          <PenaltyReveal
            loserLabel={
              hasRoster
                ? fmt(copy.chinchiro.loserLabelName, { name: seatLabel(loserSeat) })
                : fmt(copy.chinchiro.loserLabel, { n: loserSeat + 1 })
            }
          />
          <Button title={copy.chinchiro.again} kind="ghost" onPress={() => setPhase('setup')} />
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
