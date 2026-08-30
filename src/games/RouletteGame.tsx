import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameFrame } from '@/components/GameFrame';
import { Icon } from '@/components/Icon';
import { T, Button, RuleCard } from '@/components/ui';
import { enterBoom } from '@/components/motion';
import { spacing, font, colors } from '@/theme/theme';
import { startTimer, switchTimerFast, stopTimer, playExplosion } from '@/audio/sound';
import { PenaltyReveal } from './PenaltyReveal';
import { copy } from '@/content/copy';

// ロシアンルーレット / 爆弾パス: hold the phone, pass it around. While it ticks the bomb
// inflates and a countdown-timer bed plays (swapping to 倍速 after a few seconds); it "explodes"
// on a random person after a random interval — a big on-screen blast, sound, and vibration.
// Whoever holds it → 罰ゲーム.
// The blast time is random/unknown, so instead of ramping over it we just swap the timer bed to
// its 倍速 (double-speed) version after a fixed amount of ticking.
const FAST_AFTER_MS = 5000;

export function RouletteGame() {
  const [state, setState] = useState<'idle' | 'ticking' | 'boom'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fast = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bomb visuals: `grow` inflates it over the whole tick, `pulse` gives a fast heartbeat on top,
  // `shake` rattles it, `flash` is a full-screen blast flash on detonation.
  const grow = useSharedValue(1);
  const pulse = useSharedValue(1);
  const shake = useSharedValue(0);
  const flash = useSharedValue(0);

  const bombStyle = useAnimatedStyle(() => ({
    transform: [{ scale: grow.value * pulse.value }, { rotate: `${shake.value}deg` }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const clearTimers = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (fast.current) {
      clearTimeout(fast.current);
      fast.current = null;
    }
  };

  const stopMotion = () => {
    cancelAnimation(grow);
    cancelAnimation(pulse);
    cancelAnimation(shake);
  };

  const start = () => {
    clearTimers();
    stopMotion();
    setState('ticking');

    // inflate + heartbeat + rattle
    grow.value = 1;
    pulse.value = 1;
    shake.value = 0;
    grow.value = withTiming(2.4, { duration: 15000, easing: Easing.in(Easing.quad) });
    pulse.value = withRepeat(
      withTiming(1.12, { duration: 220, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    shake.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 60 }),
        withTiming(4, { duration: 120 }),
        withTiming(0, { duration: 60 })
      ),
      -1
    );

    // countdown timer bed; swap to 倍速 after FAST_AFTER_MS (the blast time itself is random)
    startTimer();
    fast.current = setTimeout(switchTimerFast, FAST_AFTER_MS);

    const ms = 4000 + Math.random() * 11000; // 4–15s
    timer.current = setTimeout(() => {
      clearTimers();
      stopMotion();
      stopTimer();
      playExplosion();
      // strong vibration + haptic burst on detonation
      Vibration.vibrate([0, 90, 60, 260]);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // blast flash
      flash.value = withSequence(
        withTiming(0.75, { duration: 60 }),
        withTiming(0, { duration: 520, easing: Easing.out(Easing.quad) })
      );
      setState('boom');
    }, ms);
  };

  // Tear down timers, audio, and animations if the player leaves mid-round.
  useEffect(() => {
    return () => {
      clearTimers();
      stopMotion();
      stopTimer();
    };
  }, []);

  return (
    <GameFrame title={copy.roulette.title}>
      {/* full-screen blast flash, above the glass, below nothing important */}
      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />

      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        {state === 'idle' && (
          <>
            <RuleCard>
              <T dim style={{ textAlign: 'center' }}>
                {copy.roulette.intro}
              </T>
            </RuleCard>
            <Icon name="bomb" size={68} color={colors.text} />
            <Button title={copy.roulette.start} kind="accent" onPress={start} />
          </>
        )}
        {state === 'ticking' && (
          <>
            <View style={styles.bombStage}>
              <Animated.View style={bombStyle}>
                <Icon name="bomb" size={92} color={colors.text} />
              </Animated.View>
            </View>
            <T black size={font.heading} style={{ textAlign: 'center' }}>
              {copy.roulette.ticking}
            </T>
          </>
        )}
        {state === 'boom' && (
          <>
            <Animated.View entering={enterBoom()}>
              <Icon name="boom" size={128} color={colors.danger} />
            </Animated.View>
            <Animated.View entering={FadeIn.delay(120).duration(300)}>
              <T display size={font.title} style={{ color: colors.danger }}>
                {copy.roulette.boom}
              </T>
            </Animated.View>
            <PenaltyReveal loserLabel={copy.roulette.loserLabel} />
            <Button title={copy.roulette.again} kind="ghost" onPress={start} />
          </>
        )}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.danger,
    zIndex: 10,
  },
  // Reserve room so the inflating bomb (up to ~2.4×) doesn't shove the layout around.
  bombStage: { height: 240, alignItems: 'center', justifyContent: 'center' },
});
