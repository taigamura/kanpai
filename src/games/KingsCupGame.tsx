import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button, PlayingCard } from '@/components/ui';
import { FlipIn } from '@/components/motion';
import { spacing, font, colors } from '@/theme/theme';

// キングスカップ: draw from a real 52-card deck (no repeats until reshuffled). Each rank
// triggers a rule. THE CENTER CUP: a Kが出るたび、引いた人は自分の飲みものを中央のコップに
// 少し注ぐ。4枚目（最後）のKを引いた人が、その中央のコップを飲みほす。
// Because it needs a physical center cup, the game opens with a one-page setup check.

const RULES: Record<number, { name: string; rule: string }> = {
  1: { name: 'A・ウォーターフォール', rule: '全員で飲み始め、右隣が止めるまで' },
  2: { name: '2・You', rule: '誰か1人を指名。その人が 罰ゲーム' },
  3: { name: '3・Me', rule: '自分が 罰ゲーム' },
  4: { name: '4・床', rule: '最後に床を触った人が 罰ゲーム' },
  5: { name: '5・男', rule: '男性チームが 罰ゲーム' },
  6: { name: '6・女', rule: '女性チームが 罰ゲーム' },
  7: { name: '7・天', rule: '最後に手を上げた人が 罰ゲーム' },
  8: { name: '8・相棒', rule: '相棒を1人決める。以降その人と運命共同体' },
  9: { name: '9・韻', rule: 'お題の言葉に韻を踏む。詰まったら 罰ゲーム' },
  10: { name: '10・テーマ', rule: 'カテゴリを1つ決めて順番に。詰まったら負け' },
  11: { name: 'J・ルール', rule: '好きなルールを1つ追加できる' },
  12: { name: 'Q・質問', rule: '質問し合う。答えたら負け' },
  13: { name: 'K・キング', rule: '自分の飲みものを中央のコップに少し注ぐ' },
};

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
  const rule = rank ? RULES[rank] : null;
  const isKing = rank === 13;
  const isFourthKing = isKing && kings === 4;

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
      <GameFrame title="キングスカップ">
        <View style={styles.setup}>
          <Icon name="beer" size={60} color={colors.accent} />
          <T size={font.heading} black style={styles.center8}>
            はじめる前に
          </T>
          <T style={styles.setupLead}>
            中央に空のコップを1つ用意してください。
          </T>
          <View style={styles.rulesBox}>
            <T dim style={styles.rule}>
              ・K（キング）を引いた人は、自分の飲みものを中央のコップに少し注ぎます。
            </T>
            <T dim style={styles.rule}>
              ・4枚目（最後）のKを引いた人が、その中央のコップを飲みほします。
            </T>
          </View>
          <Button title="コップを用意した・はじめる" kind="accent" onPress={() => setStarted(true)} />
        </View>
      </GameFrame>
    );
  }

  return (
    <GameFrame title="キングスカップ">
      <View style={styles.play}>
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
                最後のK！
              </T>
              <T size={font.heading} black style={{ textAlign: 'center' }}>
                中央のコップはあなたが飲みほします。
              </T>
              <Icon name="beer" size={48} color={colors.accent} />
            </>
          ) : isKing ? (
            <>
              <T size={font.heading} display style={{ color: colors.accent, textAlign: 'center' }}>
                {rule?.name}
              </T>
              <T style={{ textAlign: 'center' }}>
                中央のコップに、自分の飲みものを少し注ごう。
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
              カードを引いて、出た役のルールに従おう。
            </T>
          )}
        </Animated.View>

        <View style={styles.meta}>
          <T dim size={font.small}>
            残り {deck.length} 枚
          </T>
          <T dim size={font.small}>
            K {kings}/4
          </T>
        </View>

        {isFourthKing ? (
          <Button title="もう一回（新しいデッキ）" kind="accent" onPress={restart} />
        ) : (
          <Button
            title={deck.length === 0 ? 'デッキを混ぜ直す' : card ? '次のカード' : 'カードを引く'}
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
  ruleBlock: { alignItems: 'center', gap: spacing.sm },
  meta: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  setup: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  center8: { textAlign: 'center' },
  setupLead: { textAlign: 'center', lineHeight: 24 },
  rulesBox: { gap: spacing.sm, width: '100%', marginVertical: spacing.sm },
  rule: { lineHeight: 22 },
});
