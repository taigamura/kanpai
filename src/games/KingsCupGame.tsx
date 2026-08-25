import React, { useState } from 'react';
import { View } from 'react-native';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font, colors } from '@/theme/theme';

// キングスカップ (basic v1): draw a card, each rank triggers a rule. Clean rules only.
// STUB status: needs polish — card-back animation, drawn-card tracking, and the
// "4th King = everyone toasts" cup mechanic (see ROADMAP).
const RULES: Record<number, { name: string; rule: string }> = {
  1: { name: 'A・ウォーターフォール', rule: '全員で飲み始め、右隣が止めるまで飲む（ノンアルOK）' },
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
  13: { name: 'K・キング', rule: 'ルールを決められる。4枚目のKを引いた人は全員でカンパイ！' },
};

const drawCard = () => 1 + Math.floor(Math.random() * 13);

export function KingsCupGame() {
  const [card, setCard] = useState<number | null>(null);
  const rule = card ? RULES[card] : null;

  return (
    <GameFrame title="キングスカップ">
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <T size={80}>{card ? '🂠' : '👑'}</T>
        {rule ? (
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
        <Button
          title={card ? '次のカード' : 'カードを引く'}
          kind="accent"
          onPress={() => setCard(drawCard())}
        />
      </View>
    </GameFrame>
  );
}
