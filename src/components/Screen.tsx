import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '@/theme/theme';

const { width: W, height: H } = Dimensions.get('window');

// Speech bubbles printed in two riso inks, drifting behind every screen. Positions are fractions
// of the window; each bubble wanders a few dozen points and back on its own long, eased loop
// (24–40s), so the ground feels alive without ever drawing the eye. Static per render (no random)
// so nothing reflows across navigation. Reanimated's default ReduceMotion.System freezes them for
// users with Reduce Motion on.
type BubbleSpec = {
  x: number; // left, as a fraction of window width
  y: number; // top, as a fraction of window height
  w: number; // width, as a fraction of window width
  color: string;
  alpha: number;
  tail: 'left' | 'right';
  dx: number; // drift distance (pt)
  dy: number;
  turn: number; // drift rotation (deg)
  ms: number; // one-way drift duration
  delay: number;
};
const BUBBLES: BubbleSpec[] = [
  { x: 0.62, y: -0.05, w: 0.5, color: colors.yellow, alpha: 0.55, tail: 'left', dx: -16, dy: 12, turn: -3, ms: 31000, delay: 0 },
  { x: -0.22, y: 0.42, w: 0.78, color: colors.blue, alpha: 0.16, tail: 'right', dx: 22, dy: -18, turn: 3, ms: 36000, delay: 4000 },
  { x: 0.55, y: 0.6, w: 0.66, color: colors.yellow, alpha: 0.5, tail: 'left', dx: -20, dy: -14, turn: -2, ms: 27000, delay: 2000 },
  { x: 0.02, y: 0.84, w: 0.42, color: colors.blue, alpha: 0.14, tail: 'right', dx: 14, dy: -10, turn: 4, ms: 40000, delay: 7000 },
];

function SpeechBubble({ x, y, w, color, alpha, tail, dx, dy, turn, ms, delay }: BubbleSpec) {
  const bw = W * w;
  const bh = bw * 0.72;
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [t, ms, delay]);
  const drift = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, dx]) },
      { translateY: interpolate(t.value, [0, 1], [0, dy]) },
      { rotate: `${interpolate(t.value, [0, 1], [0, turn])}deg` },
    ],
  }));
  const tailSize = bw * 0.26;
  return (
    // Opacity on the wrapper so ellipse + tail composite as ONE shape (no darker overlap seam).
    <Animated.View
      pointerEvents="none"
      style={[styles.bubble, { left: W * x, top: H * y, width: bw, height: bh + tailSize * 0.5, opacity: alpha }, drift]}
    >
      {/* ellipse: a circle squashed vertically (percentage radii aren't elliptical everywhere) */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: (bh - bw) / 2,
          width: bw,
          height: bw,
          borderRadius: bw / 2,
          backgroundColor: color,
          transform: [{ scaleY: bh / bw }],
        }}
      />
      {/* tail: a rotated rounded square tucked under the ellipse's lower edge */}
      <View
        style={{
          position: 'absolute',
          top: bh - tailSize * 0.85,
          [tail === 'left' ? 'left' : 'right']: bw * 0.2,
          width: tailSize,
          height: tailSize,
          borderRadius: tailSize * 0.18,
          backgroundColor: color,
          transform: [{ rotate: tail === 'left' ? '30deg' : '-30deg' }, { skewX: tail === 'left' ? '20deg' : '-20deg' }],
        }}
      />
    </Animated.View>
  );
}

// The riso-paper ground, rendered ONCE behind the whole app (see App.tsx) so it never moves when a
// screen transitions — pages cross-fade over a fixed ground while the bubbles keep drifting.
export function ChatterGround() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.ground]} pointerEvents="none">
      {BUBBLES.map((b, i) => (
        <SpeechBubble key={i} {...b} />
      ))}
    </View>
  );
}

// Per-screen wrapper. Transparent — it sits on top of the persistent ChatterGround so navigating
// only cross-fades the content, never the ground.
export function Screen({
  children,
  edges = ['top', 'bottom'],
  style,
}: {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  ground: { backgroundColor: colors.bg, overflow: 'hidden' },
  bubble: { position: 'absolute', mixBlendMode: 'multiply' },
});
