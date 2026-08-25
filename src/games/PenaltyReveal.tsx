import React, { useState } from 'react';
import { View } from 'react-native';
import { T, Button } from '@/components/ui';
import { spacing, colors, font } from '@/theme/theme';
import { useAppState } from '@/state/AppState';

// Core safeguard component: when someone loses, they choose 飲む OR a 罰ゲーム.
// Drinking is never forced — this is the always-present alternative.
export function PenaltyReveal({ loserLabel }: { loserLabel: string }) {
  const { penalties } = useAppState();
  const [penalty, setPenalty] = useState<string | null>(null);

  const draw = () => {
    const p = penalties[Math.floor(Math.random() * penalties.length)];
    setPenalty(p);
  };

  return (
    <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
      <T size={font.heading} bold style={{ color: colors.danger, textAlign: 'center' }}>
        {loserLabel}
      </T>
      <T dim style={{ textAlign: 'center' }}>
        1杯飲む、または罰ゲーム。選んでね（飲まなくてOK）。
      </T>
      {penalty ? (
        <T size={font.heading} bold style={{ textAlign: 'center' }}>
          罰ゲーム：{penalty}
        </T>
      ) : (
        <Button title="罰ゲームを引く" kind="accent" onPress={draw} />
      )}
    </View>
  );
}
