import React, { useState, useRef, useEffect } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button } from '@/components/ui';
import { spacing, font, colors } from '@/theme/theme';
import { PenaltyReveal } from './PenaltyReveal';

// ロシアンルーレット / 爆弾パス: hold the phone, pass it around. It "explodes" on a
// random person after a random interval. Whoever holds it → 罰ゲーム.
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
            <Icon name="bomb" size={68} color={colors.text} />
            <Button title="スタート" kind="accent" onPress={start} />
          </>
        )}
        {state === 'ticking' && (
          <>
            <Icon name="fuse" size={68} color={colors.accent} />
            <T black size={font.heading} style={{ textAlign: 'center' }}>
              回して！回して！
            </T>
          </>
        )}
        {state === 'boom' && (
          <>
            <Icon name="boom" size={72} color={colors.danger} />
            <T display size={font.title} style={{ color: colors.danger }}>
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
