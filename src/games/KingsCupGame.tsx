import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button, PlayingCard, RuleCard } from '@/components/ui';
import { FlipIn, Pulse } from '@/components/motion';
import { spacing, font, colors, radius } from '@/theme/theme';
import { copy, fmt } from '@/content/copy';

// キングスカップ: draw from a real 52-card deck (no repeats until reshuffled). Each rank
// triggers a rule. THE CENTER CUP: a Kが出るたび、引いた人は自分の飲みものを中央のコップに
// 少し注ぐ。4枚目（最後）のKを引いた人が、その中央のコップを飲みほす。
// Because it needs a physical center cup, the game opens with a one-page setup check.

// Rank → rule text lives in the central copy document (content/copy.json).
const RULES = copy.kingscup.rules;
const ruleFor = (rank: number) =>
  RULES[String(rank) as keyof typeof RULES] ?? null;

const RANK_LABEL: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K',
};
const SUITS = ['♠', '♥', '♦', '♣'];

function freshDeck(): number[] {
  // 52 cards encoded as rank*10 + suitIndex, then Fisher–Yates shuffle.
  const deck: number[] = [];
  for (let r = 1; r <= 13; r++) for (let s = 0; s < 4; s++) deck.push(r * 10 + s);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function KingsCupGame() {
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<number[]>(freshDeck);
  const [card, setCard] = useState<number | null>(null);
  const [kings, setKings] = useState(0);

  const rank = card ? Math.floor(card / 10) : 0;
  const suit = card != null ? SUITS[card % 10] : '';
  const rule = rank ? ruleFor(rank) : null;
  const isKing = rank === 13;
  const isFourthKing = isKing && kings === 4;
  // Three Kings are out → exactly one is still in the deck. Whoever draws it drinks the cup.
  const oneKingLeft = kings === 3;

  // The round ends the moment the 4th K is drawn (that player drinks the center cup).
  const restart = () => {
    setDeck(freshDeck());
    setKings(0);
    setCard(null);
  };

  const draw = () => {
    if (deck.length === 0) {
      restart();
      return;
    }
    const next = [...deck];
    const c = next.pop()!;
    const r = Math.floor(c / 10);
    if (r === 13) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setKings((k) => k + 1);
    }
    setDeck(next);
    setCard(c);
  };

  // One-page setup check: this game needs a physical center cup.
  if (!started) {
    return (
      <GameFrame title={copy.kingscup.title}>
        <View style={styles.setup}>
          <Icon name="beer" size={60} color={colors.accent} />
          <RuleCard label={copy.kingscup.setupLabel} style={styles.rulesBox}>
            <T style={styles.setupLead}>
              {copy.kingscup.setupLead}
            </T>
            <T dim style={styles.rule}>
              {copy.kingscup.setupRule1}
            </T>
            <T dim style={styles.rule}>
              {copy.kingscup.setupRule2}
            </T>
          </RuleCard>
          <Button title={copy.kingscup.setupStart} kind="accent" onPress={() => setStarted(true)} />
        </View>
      </GameFrame>
    );
  }

  return (
    <GameFrame title={copy.kingscup.title}>
      <View style={styles.play}>
        {oneKingLeft && !isFourthKing && (
          <Pulse min={0.97} max={1.05} duration={520}>
            <View style={styles.warning}>
              <Icon name="crown" size={18} color={colors.cream} />
              <T bold size={font.small} style={{ color: colors.cream }}>
                {copy.kingscup.lastKingWarning}
              </T>
            </View>
          </Pulse>
        )}

        <FlipIn trigger={card}>
          {card ? (
            <PlayingCard label={`${RANK_LABEL[rank] ?? rank}${suit}`} red={suit === '♥' || suit === '♦'} size="lg" />
          ) : (
            <PlayingCard back size="lg" />
          )}
        </FlipIn>

        <Animated.View key={card ?? 'empty'} entering={FadeInUp.duration(340)} style={styles.ruleBlock}>
          {isFourthKing ? (
            <>
              <T size={font.title} display style={{ color: colors.accent, textAlign: 'center' }}>
                {copy.kingscup.fourthKingTitle}
              </T>
              <T size={font.heading} black style={{ textAlign: 'center' }}>
                {copy.kingscup.fourthKingBody}
              </T>
              <Icon name="beer" size={48} color={colors.accent} />
            </>
          ) : isKing ? (
            <>
              <T size={font.heading} display style={{ color: colors.accent, textAlign: 'center' }}>
                {rule?.name}
              </T>
              <T style={{ textAlign: 'center' }}>
                {copy.kingscup.kingBody}
              </T>
            </>
          ) : rule ? (
            <>
              <T size={font.heading} display style={{ color: colors.accent, textAlign: 'center' }}>
                {rule.name}
              </T>
              <T dim style={{ textAlign: 'center' }}>
                {rule.rule}
              </T>
            </>
          ) : (
            <T dim style={{ textAlign: 'center' }}>
              {copy.kingscup.drawPrompt}
            </T>
          )}
        </Animated.View>

        <View style={styles.meta}>
          <T dim size={font.small}>
            {fmt(copy.kingscup.remaining, { n: deck.length })}
          </T>
          <T dim size={font.small}>
            {fmt(copy.kingscup.kingCount, { n: kings })}
          </T>
        </View>

        {isFourthKing ? (
          <Button title={copy.kingscup.restart} kind="accent" onPress={restart} />
        ) : (
          <Button
            title={deck.length === 0 ? copy.kingscup.reshuffle : card ? copy.kingscup.nextCard : copy.kingscup.drawCard}
            kind="accent"
            onPress={draw}
          />
        )}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  play: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  ruleBlock: { alignItems: 'center', gap: spacing.sm },
  meta: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  setup: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  setupLead: { textAlign: 'center', lineHeight: 24 },
  rulesBox: { gap: spacing.sm, width: '100%', marginVertical: spacing.sm },
  rule: { lineHeight: 22 },
});
