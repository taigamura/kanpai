import React, { useState } from 'react';
import { View } from 'react-native';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font } from '@/theme/theme';
import { YAMANOTE_THEMES } from '@/data/yamanoteThemes';
import { PenaltyReveal } from './PenaltyReveal';

// 山手線ゲーム (anchor): draw a theme, players answer in turn to a rhythm.
// The app is the referee/theme source; play happens verbally. Loser → 飲む or 罰ゲーム.
export function YamanoteGame() {
  const [theme, setTheme] = useState<string | null>(null);
  const [lost, setLost] = useState(false);

  const draw = () => {
    setLost(false);
    setTheme(YAMANOTE_THEMES[Math.floor(Math.random() * YAMANOTE_THEMES.length)]);
  };

  return (
    <GameFrame title="山手線ゲーム">
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        {theme == null ? (
          <>
            <T dim style={{ textAlign: 'center' }}>
              お題に沿って順番に答えます。詰まったり被ったりしたら負け。
            </T>
            <Button title="お題を引く" kind="accent" onPress={draw} />
          </>
        ) : (
          <>
            <T dim>お題</T>
            <T size={font.title} bold style={{ textAlign: 'center' }}>
              {theme}
            </T>
            {!lost ? (
              <View style={{ gap: spacing.sm, width: '100%' }}>
                <Button title="負けた人が出た" onPress={() => setLost(true)} />
                <Button title="次のお題" kind="ghost" onPress={draw} />
              </View>
            ) : (
              <>
                <PenaltyReveal loserLabel="負けた人！" />
                <Button title="次のお題" kind="ghost" onPress={draw} />
              </>
            )}
          </>
        )}
      </View>
    </GameFrame>
  );
}
