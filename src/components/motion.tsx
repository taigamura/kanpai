import React, { useEffect } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  cancelAnimation,
  Easing,
  Keyframe,
  FadeInDown,
  ZoomIn,
  BounceIn,
  type AnimatedStyle,
} from 'react-native-reanimated';

// Gentle popup entrance: a quick scale-from-92% + fade, no overshoot. Replaces the old bouncy
// ZoomIn().springify() on modals so the rules popup settles straight to 100% instead of wobbling.
export const PopIn = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.92 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.quad) },
}).duration(200);

// Shared motion primitives for カンパイ！. All spring/timing values live here so the whole
// app moves with one consistent feel: quick, springy, a little playful (party energy),
// never sluggish. Built on Reanimated 4 (worklets plugin + New Arch already wired).

export const SPRING = { damping: 14, stiffness: 320, mass: 0.7 } as const;
const PRESS_IN = { damping: 18, stiffness: 500, mass: 0.6 } as const;
const PRESS_OUT = { damping: 12, stiffness: 260, mass: 0.7 } as const;

// ── Canonical entrances ──────────────────────────────────────────────────────
// One set of entrance builders the whole app shares, so every "bounce" reads the same instead
// of each screen inventing its own damping/duration. Use these instead of hand-tuning
// FadeInDown/ZoomIn/BounceIn at the call site.
//   • enterItem(i)  — staggered list rows / chips (home tiles, result rows, hint pills).
//   • enterPop(d)   — a single element popping in (お題 titles, roll labels, small reveals).
//   • enterBoom(d)  — the big celebratory/loser reveal (loser label, explosion word).
// Each call returns a FRESH builder (the .delay/.springify calls mutate + return), so they are
// safe to use inside .map without sharing state.
export const STAGGER_MS = 60; // one stagger step between successive list items

export const enterItem = (i = 0) =>
  FadeInDown.delay(i * STAGGER_MS).duration(360).springify().damping(15).stiffness(180);

export const enterPop = (delay = 0) =>
  ZoomIn.delay(delay).springify().damping(13).stiffness(180);

export const enterBoom = (delay = 0) => BounceIn.delay(delay).duration(560);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A Pressable that springs down on touch and back on release. The whole app's tap targets
// (tiles, chips, steppers, vote options) use this so every press feels physical.
export function PressableScale({
  children,
  style,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  ...rest
}: PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, PRESS_IN);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, PRESS_OUT);
        onPressOut?.(e);
      }}
      style={[style, animatedStyle] as StyleProp<AnimatedStyle<ViewStyle>>}
    >
      {children}
    </AnimatedPressable>
  );
}

// A 3D card-flip reveal. Re-runs every time `trigger` changes (draw a new card, next お題),
// swinging in from edge-on with a little overshoot. Used for playing cards and お題 titles.
export function FlipIn({
  trigger,
  children,
  style,
}: {
  trigger: unknown;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) });
  }, [trigger, p]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, p.value * 1.6),
    transform: [
      { perspective: 700 },
      { rotateY: `${(1 - p.value) * 82}deg` },
      { scale: 0.86 + p.value * 0.14 },
    ],
  }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

// A single tumbling die: on each new value (keyed via `nonce`) it hops up, spins a full
// turn, and settles with a spring bounce. Purely visual — the value is already decided.
export function TumbleDie({
  children,
  nonce,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  nonce: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const rot = useSharedValue(0);
  const ty = useSharedValue(0);
  useEffect(() => {
    rot.value = 0;
    ty.value = 0;
    rot.value = withDelay(
      delay,
      withSequence(
        withTiming(-24, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(360, { duration: 520, easing: Easing.out(Easing.cubic) })
      )
    );
    ty.value = withDelay(
      delay,
      withSequence(
        withTiming(-30, { duration: 200, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 5, stiffness: 200, mass: 0.6 })
      )
    );
  }, [nonce, delay, rot, ty]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

// A never-ending gentle pulse (scale up/down), for "live" states like the ticking bomb.
export function Pulse({
  children,
  style,
  min = 0.9,
  max = 1.12,
  duration = 480,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  min?: number;
  max?: number;
  duration?: number;
}) {
  const s = useSharedValue(min);
  useEffect(() => {
    s.value = min;
    s.value = withRepeat(
      withTiming(max, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(s);
  }, [s, min, max, duration]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

// Re-export the Animated view + the entering presets used across screens, so screens import
// motion from one place.
export { default as Animated } from 'react-native-reanimated';
export {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  ZoomIn,
  BounceIn,
  LinearTransition,
} from 'react-native-reanimated';
