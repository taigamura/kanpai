import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '@/theme/theme';

const { height: H } = Dimensions.get('window');

// A fixed set of bubbles rising inside the filling liquid.
const BOOT_BUBBLES = [
  { left: '14%', size: 6, delay: 200, dur: 1400 },
  { left: '28%', size: 4, delay: 600, dur: 1200 },
  { left: '42%', size: 7, delay: 100, dur: 1500 },
  { left: '58%', size: 4, delay: 800, dur: 1100 },
  { left: '72%', size: 6, delay: 400, dur: 1350 },
  { left: '86%', size: 3, delay: 1000, dur: 1000 },
] as const;

function BootBubble({ left, size, delay, dur }: (typeof BOOT_BUBBLES)[number]) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: dur, easing: Easing.out(Easing.quad) });
  }, [p, dur]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value < 0.85 ? 0.7 : 0.7 * (1 - (p.value - 0.85) / 0.15),
    transform: [{ translateY: -p.value * H * 0.5 }],
  }));
  return (
    <Animated.View
      style={[
        styles.bubble,
        { left, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

// Boot screen: the glass pours from empty. Amber rises bottom-to-top with a foam head riding the
// surface and carbonation climbing, the カンパイ！ logo waiting in the glass. Shown while fonts /
// ads / stored state initialize, then home cross-fades in.
export function LoadingScreen() {
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withTiming(1, { duration: 1700, easing: Easing.bezier(0.4, 0.15, 0.2, 1) });
  }, [fill]);

  const liquidStyle = useAnimatedStyle(() => ({ height: fill.value * H }));

  return (
    <View style={styles.root}>
      {/* empty glass — foam-cream gradient like the top of the pour */}
      <LinearGradient colors={['#FFFDF8', '#FBF2DD', '#F6E8CB']} style={StyleSheet.absoluteFill} />

      {/* the liquid, growing up from the bottom */}
      <Animated.View style={[styles.liquid, liquidStyle]}>
        <LinearGradient
          colors={[colors.beerTop, colors.beerBot]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* foam head riding the rising surface */}
        <View style={styles.foam} />
        {/* carbonation */}
        {BOOT_BUBBLES.map((b, i) => (
          <BootBubble key={i} {...b} />
        ))}
      </Animated.View>

      {/* logo sits in the glass the whole time */}
      <View style={styles.center} pointerEvents="none">
        <Animated.Text style={styles.logo}>
          カンパイ<Animated.Text style={styles.bang}>！</Animated.Text>
        </Animated.Text>
        <Animated.Text style={styles.sub}>飲み会・宅飲みパーティーゲーム集</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBF2DD', overflow: 'hidden' },
  liquid: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  foam: {
    position: 'absolute',
    top: -7,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: colors.foam,
    borderRadius: 6,
  },
  bubble: { position: 'absolute', bottom: 8, backgroundColor: 'rgba(255,255,255,0.7)' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  logo: { fontFamily: fonts.display, fontSize: 40, color: colors.text },
  bang: { fontFamily: fonts.display, fontSize: 40, color: colors.primary },
  sub: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, color: colors.textDim },
});
