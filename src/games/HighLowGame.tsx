import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { GameFrame } from '@/components/GameFrame';
import { T, Button, PlayingCard } from '@/components/ui';
import { FlipIn } from '@/components/motion';
import { spacing, font, colors } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';

const rank = (n: number) => (n === 1 ? 'A' : n === 11 ? 'J' : n === 12 ? 'Q' : n === 13 ? 'K' : `${n}`);
const draw = () => 1 + Math.floor(Math.random() * 13);

// 高低 / High&Low: guess whether the next card is higher or lower. Wrong → 罰ゲーム.
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
        <T
          dim
          size={11}
          style={{ letterSpacing: 2, textTransform: 'uppercase' }}
        >
          現在のカード
        </T>
        <FlipIn trigger={current}>
          <PlayingCard label={rank(current)} red size="lg" />
        </FlipIn>
        <T dim style={{ textAlign: 'center' }}>
          次のカードは上か下か。{'\n'}はずれたら 罰ゲーム。
        </T>

        {result == null ? (
          <View style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
            <View style={{ flex: 1 }}>
              <Button title="ハイ" icon="up" kind="accent" onPress={() => guess('high')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="ロー" icon="down" kind="accent" onPress={() => guess('low')} />
            </View>
          </View>
        ) : (
          <>
            <FlipIn trigger={next}>
              <PlayingCard label={next != null ? rank(next) : ''} red size="md" />
            </FlipIn>
            {result === 'win' ? (
              <Animated.View entering={ZoomIn.springify().damping(12)}>
                <T display size={font.heading} style={{ color: colors.success }}>
                  セーフ！次の人へ
                </T>
              </Animated.View>
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
