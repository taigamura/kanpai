import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button } from '@/components/ui';
import { spacing, font, colors, radius } from '@/theme/theme';
import { ANKETO_QUESTIONS } from '@/data/anketoQuestions';
import { useAppState } from '@/state/AppState';
import { PenaltyReveal } from './PenaltyReveal';

// 匿名アンケート（押したの誰だ風）: pass the phone around; each player secretly votes for
// one person; the tally is revealed at the end. Top-voted → 罰ゲーム.
//
// Secrecy is enforced by a hand-off cover screen between voters: the ballot only appears
// after the named voter taps to reveal it, and the pick immediately advances to the next
// cover screen so the previous vote is never visible to the next person.

type Phase = 'intro' | 'handoff' | 'ballot' | 'reveal';

const pickQuestion = () =>
  ANKETO_QUESTIONS[Math.floor(Math.random() * ANKETO_QUESTIONS.length)];

export function AnketoGame() {
  const { roster } = useAppState();
  const [question, setQuestion] = useState(pickQuestion);
  const [phase, setPhase] = useState<Phase>('intro');
  const [voterIndex, setVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});

  const voter = roster[voterIndex];

  const tally = useMemo(() => {
    const entries = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const top = entries.length ? entries[0][1] : 0;
    const winners = entries.filter(([, n]) => n === top && top > 0).map(([name]) => name);
    return { entries, winners, top };
  }, [votes]);

  const start = () => {
    setVotes({});
    setVoterIndex(0);
    setPhase('handoff');
  };

  const castVote = (name: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVotes((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
    if (voterIndex + 1 >= roster.length) {
      setPhase('reveal');
    } else {
      setVoterIndex((i) => i + 1);
      setPhase('handoff');
    }
  };

  const nextRound = () => {
    setQuestion(pickQuestion());
    setPhase('intro');
  };

  return (
    <GameFrame title="匿名アンケート">
      {phase === 'intro' && (
        <View style={styles.center}>
          <T size={font.heading} black style={styles.q}>
            {question}
          </T>
          <T dim style={styles.help}>
            スマホを回して、1人ずつこっそり投票します。他の人に見られないように！
          </T>
          <T dim size={font.small}>
            参加者：{roster.length ? roster.join('・') : '未設定'}
          </T>
          <Button title="投票をはじめる" kind="accent" onPress={start} />
          <Button title="別の質問にする" kind="ghost" onPress={nextRound} />
        </View>
      )}

      {phase === 'handoff' && (
        <View style={styles.center}>
          <Icon name="pass-phone" size={64} color={colors.accent} />
          <T size={font.title} display style={styles.q}>
            {voter} さんへ
          </T>
          <T dim style={styles.help}>
            スマホを {voter} さんに渡してください。{'\n'}準備ができたらタップ。
          </T>
          <Button
            title={`${voter} です・投票する`}
            kind="accent"
            onPress={() => setPhase('ballot')}
          />
        </View>
      )}

      {phase === 'ballot' && (
        <View style={styles.ballot}>
          <T dim size={font.small}>
            {voter} さんの投票（{voterIndex + 1}/{roster.length}）
          </T>
          <T size={font.heading} black style={styles.q}>
            {question}
          </T>
          <View style={styles.options}>
            {roster.map((name) => (
              <Pressable key={name} style={styles.option} onPress={() => castVote(name)}>
                <T bold>{name}</T>
              </Pressable>
            ))}
          </View>
          <T dim size={font.small} style={styles.foot}>
            こっそり選んでね。タップした瞬間に次の人へ。
          </T>
        </View>
      )}

      {phase === 'reveal' && (
        <View style={styles.center}>
          <T dim size={font.small}>
            結果発表
          </T>
          <T size={font.heading} black style={styles.q}>
            {question}
          </T>
          <View style={styles.results}>
            {tally.entries.map(([name, n]) => (
              <View
                key={name}
                style={[styles.resultRow, tally.winners.includes(name) && styles.resultRowWin]}
              >
                <T>{name}</T>
                <T bold style={{ color: colors.accent }}>
                  {n}票
                </T>
              </View>
            ))}
          </View>
          <PenaltyReveal
            loserLabel={`最多得票：${tally.winners.join('・')} さん！`}
          />
          <Button title="次の質問" kind="ghost" onPress={nextRound} />
        </View>
      )}
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  q: { textAlign: 'center' },
  help: { textAlign: 'center', lineHeight: 22 },
  ballot: { flex: 1, gap: spacing.md, justifyContent: 'center' },
  options: { gap: spacing.sm },
  option: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
  },
  foot: { textAlign: 'center', marginTop: spacing.sm },
  results: { width: '100%', gap: spacing.sm, marginVertical: spacing.md },
  resultRow: {
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
  resultRowWin: {
    borderColor: colors.accentLine,
  },
});
