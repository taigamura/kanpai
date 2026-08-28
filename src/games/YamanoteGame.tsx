import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { GameFrame } from '@/components/GameFrame';
import { T, Button, Pill } from '@/components/ui';
import { enterItem, enterPop } from '@/components/motion';
import { spacing, font, colors } from '@/theme/theme';
import { YAMANOTE_THEMES, YAMANOTE_HINTS } from '@/data/yamanoteThemes';
import { useAppState } from '@/state/AppState';
import { PenaltyReveal } from './PenaltyReveal';
import { TopicsModal } from './TopicsModal';

// 山手線ゲーム (anchor): draw a theme, players answer in turn to a rhythm.
// The app is the referee/theme source; play happens verbally. Loser → 罰ゲーム.
export function YamanoteGame() {
  const { customTopics } = useAppState();
  const [theme, setTheme] = useState<string | null>(null);
  const [lost, setLost] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Built-in お題 plus any the group has added (their own + shared community ones live here).
  const pool = useMemo(
    () => Array.from(new Set([...YAMANOTE_THEMES, ...customTopics])),
    [customTopics]
  );

  const hints = theme ? YAMANOTE_HINTS[theme] : undefined;

  const draw = () => {
    setLost(false);
    setShowHint(false);
    setTheme(pool[Math.floor(Math.random() * pool.length)]);
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
            <Button
              title="お題を追加・みんなのお題"
              kind="ghost"
              onPress={() => setShowTopics(true)}
            />
          </>
        ) : (
          <>
            <T
              dim
              size={11}
              style={{ color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' }}
            >
              お題
            </T>
            <Animated.View key={theme} entering={enterPop()}>
              <T display size={font.title} style={{ textAlign: 'center' }}>
                {theme}
              </T>
            </Animated.View>

            {/* ヒント: reveals a few example answers to un-stick the table. Built-in お題 only. */}
            {hints && hints.length > 0 && (
              showHint ? (
                <View style={styles.hintBox}>
                  {hints.map((ex, i) => (
                    <Animated.View key={ex} entering={enterItem(i)}>
                      <Pill>{ex}</Pill>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <Button
                  title="ヒント（例）"
                  kind="ghost"
                  icon="bulb"
                  onPress={() => setShowHint(true)}
                />
              )
            )}

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
      <TopicsModal visible={showTopics} onClose={() => setShowTopics(false)} />
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  hintBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: 300,
  },
});
