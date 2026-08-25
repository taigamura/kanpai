import React, { useState } from 'react';
import { View } from 'react-native';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font, colors } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';

const rank = (n: number) => (n === 1 ? 'A' : n === 11 ? 'J' : n === 12 ? 'Q' : n === 13 ? 'K' : `${n}`);
const draw = () => 1 + Math.floor(Math.random() * 13);

// 高低 / High&Low: guess whether the next card is higher or lower. Wrong → 飲む or 罰ゲーム.
export function HighLowGame() {
  const [current, setCurrent] = useState(draw());
  const [next, setNext] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const guess = (dir: 'high' | 'low') => {
    const n = draw();
    setNext(n);
    const correct = dir === 'high' ? n >= current : n <= current;
    setResult(correct ? 'win' : 'lose');
  };

  const cont = () => {
    if (next != null) setCurrent(next);
    setNext(null);
    setResult(null);
  };

  return (
    <GameFrame title="高低（ハイ&ロー）">
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <T dim>現在のカード</T>
        <T size={80} bold>
          {rank(current)}
        </T>

        {result == null ? (
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button title="⬆️ ハイ" kind="accent" onPress={() => guess('high')} />
            <Button title="⬇️ ロー" kind="accent" onPress={() => guess('low')} />
          </View>
        ) : (
          <>
            <T dim>次のカード</T>
            <T size={56} bold>
              {next != null ? rank(next) : ''}
            </T>
            {result === 'win' ? (
              <T size={font.heading} bold style={{ color: colors.success }}>
                セーフ！次の人へ
              </T>
            ) : (
              <PenaltyReveal loserLabel="はずれ！あなたの番" />
            )}
            <Button title="続ける" kind="ghost" onPress={cont} />
          </>
        )}
      </View>
    </GameFrame>
  );
}
