import React, { useState, useRef, useEffect } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font, colors } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';

// ロシアンルーレット / 爆弾パス: hold the phone, pass it around. It "explodes" on a
// random person after a random interval. Whoever holds it → 飲む or 罰ゲーム.
export function RouletteGame() {
  const [state, setState] = useState<'idle' | 'ticking' | 'boom'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setState('ticking');
    const ms = 4000 + Math.random() * 11000; // 4–15s
    timer.current = setTimeout(() => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setState('boom');
    }, ms);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <GameFrame title="ロシアンルーレット">
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        {state === 'idle' && (
          <>
            <T dim style={{ textAlign: 'center' }}>
              スタートしたらスマホを隣へ回していきます。爆発したら…その人の番。
            </T>
            <T size={72}>💣</T>
            <Button title="スタート" kind="accent" onPress={start} />
          </>
        )}
        {state === 'ticking' && (
          <>
            <T size={72}>🧨</T>
            <T size={font.heading} bold style={{ textAlign: 'center' }}>
              回して！回して！
            </T>
          </>
        )}
        {state === 'boom' && (
          <>
            <T size={72}>💥</T>
            <T size={font.title} bold style={{ color: colors.danger }}>
              ドカーン！
            </T>
            <PenaltyReveal loserLabel="今スマホを持っている人！" />
            <Button title="もう一回" kind="ghost" onPress={start} />
          </>
        )}
      </View>
    </GameFrame>
  );
}
