import React, { useState } from 'react';
import { View } from 'react-native';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font } from '@/theme/theme';
import { ANKETO_QUESTIONS } from '@/data/anketoQuestions';
import { useAppState } from '@/state/AppState';

// 匿名アンケート（押したの誰だ風）: "誰が一番◯◯?" everyone votes secretly, reveal tally.
// STUB status: v1 draws the question + shows the roster. The pass-around SECRET voting
// flow (each player taps their pick with the screen hidden from others, then reveal the
// tally) is the real build — see ROADMAP. This screen proves the data + roster wiring.
export function AnketoGame() {
  const { roster } = useAppState();
  const [q, setQ] = useState(
    ANKETO_QUESTIONS[Math.floor(Math.random() * ANKETO_QUESTIONS.length)]
  );

  return (
    <GameFrame title="匿名アンケート">
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <T size={font.heading} bold style={{ textAlign: 'center' }}>
          {q}
        </T>
        <T dim style={{ textAlign: 'center' }}>
          （制作中）スマホを回して、こっそり1人に投票 → 全員終わったら結果発表。
        </T>
        <T dim size={font.small} style={{ textAlign: 'center' }}>
          参加者：{roster.length ? roster.join('・') : '未設定'}
        </T>
        <Button
          title="次の質問"
          kind="accent"
          onPress={() => setQ(ANKETO_QUESTIONS[Math.floor(Math.random() * ANKETO_QUESTIONS.length)])}
        />
      </View>
    </GameFrame>
  );
}
