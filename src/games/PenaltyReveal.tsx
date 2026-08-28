import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { enterBoom, enterPop } from '@/components/motion';
import { T, Button, Pill } from '@/components/ui';
import { spacing, colors, font } from '@/theme/theme';
import { useAppState } from '@/state/AppState';

// When someone loses, they do a 罰ゲーム. The 罰ゲーム pool is user-supplied (no built-in
// defaults in v1), so when the group hasn't added any, we prompt them to decide one / add
// theirs in 設定 — never an empty/undefined draw.
export function PenaltyReveal({ loserLabel }: { loserLabel: string }) {
  const { penalties } = useAppState();
  const [penalty, setPenalty] = useState<string | null>(null);
  const hasPenalties = penalties.length > 0;

  const draw = () => {
    const p = penalties[Math.floor(Math.random() * penalties.length)];
    setPenalty(p);
  };

  return (
    <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
      <Animated.View entering={enterBoom()}>
        <T display size={font.heading} style={{ color: colors.danger, textAlign: 'center' }}>
          {loserLabel}
        </T>
      </Animated.View>
      {hasPenalties ? (
        penalty ? (
          <Animated.View entering={enterPop()}>
            <Pill>罰ゲーム：{penalty}</Pill>
          </Animated.View>
        ) : (
          <Button title="罰ゲームを引く" kind="accent" onPress={draw} />
        )
      ) : (
        <T dim size={font.small} style={{ textAlign: 'center' }}>
          みんなで罰ゲームを決めよう！オリジナルの罰ゲームは「設定」から追加できます。
        </T>
      )}
    </View>
  );
}
