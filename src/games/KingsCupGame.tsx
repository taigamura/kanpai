import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font, colors, radius } from '@/theme/theme';

// キングスカップ: draw from a real 52-card deck (no repeats until reshuffled). Each rank
// triggers a rule. The 4th King drawn = 全員でカンパイ (the cup mechanic). Clean rules only.

const RULES: Record<number, { name: string; rule: string }> = {
  1: { name: 'A・ウォーターフォール', rule: '全員で飲み始め、右隣が止めるまで（ノンアルOK）' },
  2: { name: '2・You', rule: '誰か1人を指名。その人が 飲む or 罰ゲーム' },
  3: { name: '3・Me', rule: '自分が 飲む or 罰ゲーム' },
  4: { name: '4・床', rule: '最後に床を触った人が 飲む or 罰ゲーム' },
  5: { name: '5・男', rule: '男性チームが 飲む or 罰ゲーム' },
  6: { name: '6・女', rule: '女性チームが 飲む or 罰ゲーム' },
  7: { name: '7・天', rule: '最後に手を上げた人が 飲む or 罰ゲーム' },
  8: { name: '8・相棒', rule: '相棒を1人決める。以降その人と運命共同体' },
  9: { name: '9・韻', rule: 'お題の言葉に韻を踏む。詰まったら 飲む or 罰ゲーム' },
  10: { name: '10・テーマ', rule: 'カテゴリを1つ決めて順番に。詰まったら負け' },
  11: { name: 'J・ルール', rule: '好きなルールを1つ追加できる' },
  12: { name: 'Q・質問', rule: '質問し合う。答えたら負け' },
  13: { name: 'K・キング', rule: 'ルールを1つ決められる' },
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
  const [deck, setDeck] = useState<number[]>(freshDeck);
  const [card, setCard] = useState<number | null>(null);
  const [kings, setKings] = useState(0);

  const rank = card ? Math.floor(card / 10) : 0;
  const suit = card != null ? SUITS[card % 10] : '';
  const rule = rank ? RULES[rank] : null;
  const isFourthKing = rank === 13 && kings === 4;

  const draw = () => {
    if (deck.length === 0) {
      setDeck(freshDeck());
      setKings(0);
      setCard(null);
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

  return (
    <GameFrame title="キングスカップ">
      <View style={styles.center}>
        <View style={styles.cardFace}>
          {card ? (
            <>
              <T size={44} bold style={{ color: suit === '♥' || suit === '♦' ? colors.danger : colors.text }}>
                {RANK_LABEL[rank] ?? rank}
                {suit}
              </T>
            </>
          ) : (
            <T size={44}>👑</T>
          )}
        </View>

        {isFourthKing ? (
          <>
            <T size={font.title} bold style={{ color: colors.accent, textAlign: 'center' }}>
              4枚目のK！
            </T>
            <T size={font.heading} bold style={{ textAlign: 'center' }}>
              全員でカンパイ！🍻
            </T>
          </>
        ) : rule ? (
          <>
            <T size={font.heading} bold style={{ color: colors.accent, textAlign: 'center' }}>
              {rule.name}
            </T>
            <T style={{ textAlign: 'center' }}>{rule.rule}</T>
          </>
        ) : (
          <T dim style={{ textAlign: 'center' }}>
            カードを引いて、出た役のルールに従おう。
          </T>
        )}

        <View style={styles.meta}>
          <T dim size={font.small}>
            残り {deck.length} 枚
          </T>
          <T dim size={font.small}>
            K {kings}/4
          </T>
        </View>

        <Button
          title={deck.length === 0 ? 'デッキを混ぜ直す' : card ? '次のカード' : 'カードを引く'}
          kind="accent"
          onPress={draw}
        />
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  cardFace: {
    width: 120,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  meta: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
});
