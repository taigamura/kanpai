import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { GameFrame } from '@/components/GameFrame';
import { T, Button, PlayingCard, RuleCard } from '@/components/ui';
import { FlipIn } from '@/components/motion';
import { spacing, font, colors } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';
import { copy } from '@/content/copy';

const rank = (n: number) => (n === 1 ? 'A' : n === 11 ? 'J' : n === 12 ? 'Q' : n === 13 ? 'K' : `${n}`);
const draw = () => 1 + Math.floor(Math.random() * 13);

// 高低 / High&Low: guess whether the next card is higher or lower. Wrong → 罰ゲーム.
export function HighLowGame() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(draw());
  const [next, setNext] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  // Intro screen: show the rule, and draw the first card only when スタート is pressed.
  const start = () => {
    setCurrent(draw());
    setStarted(true);
  };

  if (!started) {
    return (
      <GameFrame title={copy.highlow.title}>
        <View style={{ alignItems: 'center', gap: spacing.lg }}>
          <RuleCard>
            <T dim style={{ textAlign: 'center' }}>
              {copy.highlow.intro}
            </T>
          </RuleCard>
          <Button title={copy.highlow.start} kind="accent" onPress={start} />
        </View>
      </GameFrame>
    );
  }

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
    <GameFrame title={copy.highlow.title}>
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <T
          dim
          size={11}
          style={{ letterSpacing: 2, textTransform: 'uppercase' }}
        >
          {copy.highlow.currentCard}
        </T>
        <FlipIn trigger={current}>
          <PlayingCard label={rank(current)} red size="lg" />
        </FlipIn>

        {result == null ? (
          <View style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
            <View style={{ flex: 1 }}>
              <Button title={copy.highlow.high} icon="up" kind="accent" onPress={() => guess('high')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={copy.highlow.low} icon="down" kind="accent" onPress={() => guess('low')} />
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
                  {copy.highlow.safe}
                </T>
              </Animated.View>
            ) : (
              <PenaltyReveal loserLabel={copy.highlow.loserLabel} />
            )}
            <Button title={copy.highlow.continue} kind="ghost" onPress={cont} />
          </>
        )}
      </View>
    </GameFrame>
  );
}
