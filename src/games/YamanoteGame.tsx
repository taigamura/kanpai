import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { T, Button } from '@/components/ui';
import { spacing, font, colors } from '@/theme/theme';
import { YAMANOTE_THEMES } from '@/data/yamanoteThemes';
import { PenaltyReveal } from './PenaltyReveal';

const TIMER_SECONDS = 10;

// 山手線ゲーム (anchor): draw a theme, players answer in turn to a rhythm.
// The app is the referee/theme source; play happens verbally. Loser → 罰ゲーム.
// Optional per-answer countdown timer (Phase 2): off by default, purely additive —
// the verbal game plays fine without ever touching it.
export function YamanoteGame() {
  const [theme, setTheme] = useState<string | null>(null);
  const [lost, setLost] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [timeUp, setTimeUp] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  const draw = () => {
    setLost(false);
    setTimerActive(false);
    setTimeUp(false);
    setSecondsLeft(TIMER_SECONDS);
    clearTimer();
    setTheme(YAMANOTE_THEMES[Math.floor(Math.random() * YAMANOTE_THEMES.length)]);
  };

  const startTimer = () => {
    setTimeUp(false);
    setSecondsLeft(TIMER_SECONDS);
    setTimerActive(true);
    clearTimer();
    interval.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setTimeUp(true);
          setTimerActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

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
            <T
              dim
              size={11}
              style={{ color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' }}
            >
              お題
            </T>
            <T display size={font.title} style={{ textAlign: 'center' }}>
              {theme}
            </T>
            {!lost ? (
              <>
                {timerActive ? (
                  <T display size={font.title} style={{ color: colors.accent }}>
                    {secondsLeft}
                  </T>
                ) : timeUp ? (
                  <T display size={font.heading} style={{ color: colors.danger }}>
                    時間切れ！
                  </T>
                ) : (
                  <Button title="タイマー" icon="timer" kind="ghost" onPress={startTimer} />
                )}
                <View style={{ gap: spacing.sm, width: '100%' }}>
                  <Button
                    title="負けた人が出た"
                    onPress={() => {
                      clearTimer();
                      setTimerActive(false);
                      setLost(true);
                    }}
                  />
                  <Button title="次のお題" kind="ghost" onPress={draw} />
                </View>
              </>
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
