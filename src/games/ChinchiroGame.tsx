import React, { useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font, colors } from '@/theme/theme';

const d = () => 1 + Math.floor(Math.random() * 6);

// チンチロ: roll 3 dice, evaluate the classic role. v1 shows your roll + name;
// scoring/turn-order comparison across players is a fast-follow (see ROADMAP).
type Roll = { dice: [number, number, number]; label: string; kind: 'good' | 'normal' | 'bad' };

function evaluate(dice: [number, number, number]): Roll {
  const [a, b, c] = [...dice].sort();
  const allSame = a === b && b === c;
  if (a === 4 && b === 5 && c === 6) return { dice, label: 'シゴロ（4-5-6）', kind: 'good' };
  if (a === 1 && b === 2 && c === 3) return { dice, label: 'ヒフミ（1-2-3）', kind: 'bad' };
  if (allSame) return { dice, label: `ゾロ目（${a}のアラシ）`, kind: 'good' };
  // a pair => the odd die is the "me" (point)
  if (a === b || b === c) {
    const point = a === b ? c : a;
    return { dice, label: `${point}の目`, kind: 'normal' };
  }
  return { dice, label: '目なし（ションベン）', kind: 'bad' };
}

export function ChinchiroGame() {
  const [roll, setRoll] = useState<Roll | null>(null);

  const shake = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRoll(evaluate([d(), d(), d()]));
  };

  const tint =
    roll?.kind === 'good' ? colors.success : roll?.kind === 'bad' ? colors.danger : colors.text;

  return (
    <GameFrame title="チンチロ">
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <T dim style={{ textAlign: 'center' }}>
          3つのサイコロを振って役を出そう。負けた人は 飲む or 罰ゲーム。
        </T>
        <T size={64}>{roll ? roll.dice.map((n) => '⚀⚁⚂⚃⚄⚅'[n - 1]).join(' ') : '🎲 🎲 🎲'}</T>
        {roll && (
          <T size={font.heading} bold style={{ color: tint, textAlign: 'center' }}>
            {roll.label}
          </T>
        )}
        <Button title={roll ? 'もう一回振る' : 'サイコロを振る'} kind="accent" onPress={shake} />
      </View>
    </GameFrame>
  );
}
