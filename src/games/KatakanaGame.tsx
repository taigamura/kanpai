import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button, RuleCard } from '@/components/ui';
import { enterBoom } from '@/components/motion';
import { spacing, font, colors, radius } from '@/theme/theme';
import { KATAKANA_WORDS } from '@/data/katakanaWords';
import { startTimer, switchTimerFast, stopTimer } from '@/audio/sound';
import { useAppState } from '@/state/AppState';
import { PenaltyReveal } from './PenaltyReveal';
import { copy, fmt } from '@/content/copy';

// 英語禁止単語あてゲーム: the describer sees a katakana word and must explain it
// in Japanese WITHOUT using katakana or English; others guess aloud. A correct guess within the
// time limit awards BOTH the describer and the guesser a point. First to the target score wins;
// the lowest scorer does 罰ゲーム. The katakana ban is verbal/honor-based (not app-enforced).

type Phase = 'config' | 'handoff' | 'describe' | 'guesser' | 'result' | 'win';

const TARGET_OPTIONS = [3, 5, 7, 10];
const TIME_OPTIONS = [10, 15, 30, 60];

const pickWord = () => KATAKANA_WORDS[Math.floor(Math.random() * KATAKANA_WORDS.length)];

export function KatakanaGame() {
  const { roster } = useAppState();

  const [phase, setPhase] = useState<Phase>('config');
  const [target, setTarget] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [describerIdx, setDescriberIdx] = useState(0);
  const [word, setWord] = useState(pickWord);
  const [remaining, setRemaining] = useState(30);
  const [timedUp, setTimedUp] = useState(false); // did this turn reach the guesser screen via time-up?
  // What happened last turn, for the result screen: a successful pair or a no-score turn.
  const [lastResult, setLastResult] = useState<{ describer: string; guesser: string } | 'none'>(
    'none',
  );

  const describer = roster[describerIdx] ?? roster[0];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = useRef(false); // guard so a turn ends exactly once

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Run the countdown + timer sound only while describing; clean up on any phase change / unmount.
  useEffect(() => {
    if (phase !== 'describe') return;
    startTimer();
    timerRef.current = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => {
      clearTimer();
      stopTimer();
    };
  }, [phase]);

  // Last 5 seconds → swap the timer bed to its 倍速 version (matches the UI turning red).
  useEffect(() => {
    if (phase === 'describe' && remaining === 5) switchTimerFast();
  }, [remaining, phase]);

  // Time up → DON'T auto-lose. Stop the clock and go to the guesser screen so a buzzer-beater can
  // still be credited; that screen also has a 得点なし option for when nobody got it.
  useEffect(() => {
    if (phase === 'describe' && remaining === 0) {
      clearTimer();
      stopTimer();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimedUp(true);
      setPhase('guesser');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  const sorted = useMemo(
    () => roster.map((n) => ({ name: n, score: scores[n] ?? 0 })).sort((a, b) => b.score - a.score),
    [roster, scores],
  );
  const winners = useMemo(() => {
    const top = sorted.length ? sorted[0].score : 0;
    return sorted.filter((s) => s.score === top).map((s) => s.name);
  }, [sorted]);
  const losers = useMemo(() => {
    const low = sorted.length ? sorted[sorted.length - 1].score : 0;
    return sorted.filter((s) => s.score === low).map((s) => s.name);
  }, [sorted]);

  const startGame = () => {
    setScores(Object.fromEntries(roster.map((n) => [n, 0])));
    setDescriberIdx(0);
    setPhase('handoff');
  };

  const beginTurn = () => {
    endedRef.current = false;
    setTimedUp(false);
    setWord(pickWord());
    setRemaining(timeLimit);
    setPhase('describe');
  };

  // End the current describing turn. guesser=null means no score (pass / time up).
  const endTurn = (guesser: string | null) => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimer();

    if (guesser) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = {
        ...scores,
        [describer]: (scores[describer] ?? 0) + 1,
        [guesser]: (scores[guesser] ?? 0) + 1,
      };
      const reachedWin = next[describer] >= target || next[guesser] >= target;
      setScores(next);
      setLastResult({ describer, guesser });
      setPhase(reachedWin ? 'win' : 'result');
    } else {
      setLastResult('none');
      setPhase('result');
    }
  };

  const nextDescriber = () => {
    setDescriberIdx((i) => (i + 1) % roster.length);
    setPhase('handoff');
  };

  const guessers = roster.filter((n) => n !== describer);

  return (
    <GameFrame title={copy.katakana.title}>
      {phase === 'config' && (
        <View style={styles.center}>
          <RuleCard>
            <T dim style={styles.help}>
              {copy.katakana.intro}
            </T>
          </RuleCard>
          <Segmented
            label={copy.katakana.targetLabel}
            options={TARGET_OPTIONS}
            value={target}
            onChange={setTarget}
            suffix={copy.katakana.pointSuffix}
          />
          <Segmented
            label={copy.katakana.timeLabel}
            options={TIME_OPTIONS}
            value={timeLimit}
            onChange={setTimeLimit}
            suffix={copy.katakana.secondSuffix}
          />
          <T dim size={font.small} style={{ textAlign: 'center' }}>
            {copy.anketo.participantsPrefix}
            {roster.join('・')}
          </T>
          <Button title={copy.katakana.start} kind="accent" onPress={startGame} />
        </View>
      )}

      {phase === 'handoff' && (
        <View style={styles.center}>
          <Icon name="pass-phone" size={64} color={colors.accent} />
          <T size={font.title} display style={styles.q}>
            {fmt(copy.katakana.handoffTo, { name: describer })}
          </T>
          <T dim style={styles.help}>
            {fmt(copy.katakana.handoffNote, { name: describer })}
          </T>
          <T dim size={font.small}>
            {fmt(copy.katakana.toWin, { n: target })}
          </T>
          <Button
            title={fmt(copy.katakana.handoffConfirm, { name: describer })}
            kind="accent"
            onPress={beginTurn}
          />
        </View>
      )}

      {phase === 'describe' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            {fmt(copy.katakana.describerLabel, { name: describer })}
          </T>
          <View style={[styles.timerRow, remaining <= 5 && { borderColor: colors.danger }]}>
            <Icon name="timer" size={20} color={remaining <= 5 ? colors.danger : colors.text} />
            <T bold size={font.heading} style={{ color: remaining <= 5 ? colors.danger : colors.text }}>
              {fmt(copy.katakana.remaining, { n: remaining })}
            </T>
          </View>
          <T dim size={font.small} style={{ textAlign: 'center' }}>
            {copy.katakana.wordLabel}
          </T>
          <Animated.View entering={FadeIn.duration(200)}>
            <T display size={font.title} style={styles.word}>
              {word}
            </T>
          </Animated.View>
          <Button
            title={copy.katakana.correct}
            kind="accent"
            onPress={() => {
              setTimedUp(false);
              setPhase('guesser');
            }}
          />
          <Button title={copy.katakana.pass} kind="ghost" onPress={() => endTurn(null)} />
        </View>
      )}

      {phase === 'guesser' && (
        <View style={styles.center}>
          {timedUp && (
            <T bold size={font.heading} style={{ color: colors.danger }}>
              {copy.katakana.timeUp}
            </T>
          )}
          <T size={font.heading} black style={styles.q}>
            {timedUp ? copy.katakana.timeUpPrompt : copy.katakana.whoGuessed}
          </T>
          <T dim size={font.small}>
            {word}
          </T>
          <View style={styles.options}>
            {guessers.map((name) => (
              <Pressable key={name} style={styles.option} onPress={() => endTurn(name)}>
                <T bold>{name}</T>
              </Pressable>
            ))}
          </View>
          <Button title={copy.katakana.noPoint} kind="ghost" onPress={() => endTurn(null)} />
        </View>
      )}

      {phase === 'result' && (
        <View style={styles.center}>
          {lastResult === 'none' ? (
            <T size={font.heading} black style={{ color: colors.textDim }}>
              {copy.katakana.noPoint}
            </T>
          ) : (
            <Animated.View entering={FadeIn.duration(250)}>
              <T size={font.heading} black style={{ color: colors.accent, textAlign: 'center' }}>
                {fmt(copy.katakana.awarded, { describer: lastResult.describer, guesser: lastResult.guesser })}
              </T>
            </Animated.View>
          )}
          <Scoreboard rows={sorted} target={target} />
          <Button title={copy.katakana.next} kind="accent" onPress={nextDescriber} />
        </View>
      )}

      {phase === 'win' && (
        <View style={styles.center}>
          <Animated.View entering={enterBoom()}>
            <Icon name="trophy" size={72} color={colors.accentBright} />
          </Animated.View>
          <T dim size={font.small}>
            {copy.katakana.winnerTitle}
          </T>
          <T display size={font.title} style={{ color: colors.accent, textAlign: 'center' }}>
            {fmt(copy.katakana.winnerLabel, { name: winners.join('・') })}
          </T>
          <Scoreboard rows={sorted} target={target} />
          <PenaltyReveal loserLabel={fmt(copy.katakana.loserLabel, { names: losers.join('・') })} />
          <Button title={copy.katakana.again} kind="ghost" onPress={() => setPhase('config')} />
        </View>
      )}
    </GameFrame>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
  suffix,
}: {
  label: string;
  options: number[];
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <View style={styles.segWrap}>
      <T dim size={font.small}>
        {label}
      </T>
      <View style={styles.segRow}>
        {options.map((opt) => {
          const on = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[styles.seg, on && styles.segOn]}
            >
              <T bold style={{ color: on ? colors.cream : colors.text }}>
                {opt}
                {suffix}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Scoreboard({ rows, target }: { rows: { name: string; score: number }[]; target: number }) {
  return (
    <View style={styles.board}>
      <T dim size={font.small} style={{ textAlign: 'center' }}>
        {copy.katakana.scoreTitle}（{fmt(copy.katakana.toWin, { n: target })}）
      </T>
      {rows.map((r, i) => (
        <View key={r.name} style={styles.boardRow}>
          <View style={styles.boardName}>
            {/* Fixed-width slot so the leader's star never indents their name past the others. */}
            <View style={styles.starSlot}>
              {i === 0 && r.score > 0 ? (
                <Icon name="star" size={16} color={colors.accentBright} />
              ) : null}
            </View>
            <T>{r.name}</T>
          </View>
          <T bold style={{ color: colors.accent }}>
            {r.score}
            {copy.katakana.pointSuffix}
          </T>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  q: { textAlign: 'center' },
  help: { textAlign: 'center', lineHeight: 22 },
  word: { textAlign: 'center', paddingVertical: spacing.sm },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
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
  segWrap: { width: '100%', gap: spacing.xs, alignItems: 'center' },
  segRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  seg: {
    minWidth: 56,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  segOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  board: { width: '100%', gap: spacing.sm, marginVertical: spacing.sm },
  boardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  boardName: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  starSlot: { width: 16, alignItems: 'center' },
});
