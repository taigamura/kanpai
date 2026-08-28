import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing, Dimensions } from 'react-native';
import ReAnimated, {
  useAnimatedSensor,
  SensorType,
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
} from 'react-native-reanimated';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/theme';

const RISE = Math.round(Dimensions.get('window').height * 0.92);

// Carbonation: a fixed set of bubbles rising from the bottom of the glass to the foam.
// Positions/sizes are static (not random per render) so nothing reflows across nav.
const BUBBLES = [
  { left: '10%', size: 6, delay: 0, duration: 6400 },
  { left: '22%', size: 4, delay: 2200, duration: 5200 },
  { left: '33%', size: 7, delay: 900, duration: 7000 },
  { left: '45%', size: 3, delay: 3200, duration: 4800 },
  { left: '55%', size: 5, delay: 1500, duration: 6000 },
  { left: '66%', size: 4, delay: 3800, duration: 5400 },
  { left: '77%', size: 6, delay: 600, duration: 6800 },
  { left: '88%', size: 3, delay: 2600, duration: 5000 },
] as const;

// A single rising bubble: loops translateY (bottom → top) + a fade in/out, forever.
function Bubble({ left, size, delay, duration }: (typeof BUBBLES)[number]) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [t, duration, delay]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -RISE] });
  const opacity = t.interpolate({
    inputRange: [0, 0.12, 0.8, 1],
    outputRange: [0, 0.8, 0.55, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bubble,
        { left, width: size, height: size, borderRadius: size / 2, opacity, transform: [{ translateY }] },
      ]}
    />
  );
}

// The beer surface stays level with gravity as the phone tilts. Rather than tracking the sensor
// 1:1 (which felt twitchy and glassy), we drive the angle through an underdamped spring on the
// UI thread: the liquid LAGS the phone, sloshes a touch past level, then settles — like a real
// glass. A slow idle sway keeps it looking wet even when the phone is dead level. Capped so it
// never dumps. No sensor (simulator/web) → only the gentle idle sway plays.
const TILT_CAP = 0.12; // radians (~7°) — deliberately small so it reads as liquid, not a gimbal
const STIFFNESS = 70; // spring constant: lower = heavier / laggier
const DAMPING = 9; // < 2·√STIFFNESS (~16.7) → underdamped, so it slosh-overshoots once and settles
const IDLE_AMP = 0.012; // ~0.7° idle sway amplitude
function useTiltStyle() {
  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 20 });
  const cur = useSharedValue(0);
  const vel = useSharedValue(0);
  const clock = useSharedValue(0);

  useFrameCallback((frame) => {
    'worklet';
    const dt = Math.min((frame.timeSincePreviousFrame ?? 16) / 1000, 0.05);
    clock.value += dt;
    const roll = sensor.sensor.value.roll;
    const level = Math.max(-TILT_CAP, Math.min(TILT_CAP, -roll));
    // idle sway only fades in when the phone is essentially level, so it never fights a real tilt
    const idle = Math.abs(level) < 0.015 ? Math.sin(clock.value * 0.9) * IDLE_AMP : 0;
    const target = level + idle;
    // spring integration: a = k·(target − x) − c·v
    const accel = (target - cur.value) * STIFFNESS - vel.value * DAMPING;
    vel.value += accel * dt;
    cur.value += vel.value * dt;
  }, true);

  return useAnimatedStyle(() => ({ transform: [{ rotate: `${cur.value}rad` }] }));
}

// The lager glass ground, rendered ONCE behind the whole app (see App.tsx) so it never moves
// when a screen transitions — pages cross-fade over a fixed glass. Static amber liquid base, then
// a tilt layer (cream foam head + carbonation + glass shine) that counter-rotates to gravity.
export function BeerGround() {
  const tiltStyle = useTiltStyle();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* static amber liquid base — always covers the screen, so a tilt never exposes a gap */}
      <LinearGradient
        colors={[colors.beerTop, colors.beerBot]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* tilt layer: foam + bubbles + shine stay level with gravity as the phone rolls */}
      <ReAnimated.View pointerEvents="none" style={[StyleSheet.absoluteFill, tiltStyle]}>
        {/* carbonation rising from the base */}
        <View style={StyleSheet.absoluteFill}>
          {BUBBLES.map((b, i) => (
            <Bubble key={i} {...b} />
          ))}
        </View>
        {/* foam head — oversized (starts above/beyond the edges) so tilt keeps the top covered */}
        <View style={styles.foam}>
          <View style={styles.foamSolid} />
          <LinearGradient colors={[colors.foam, 'rgba(253,247,230,0)']} style={styles.foamFade} />
        </View>
        {/* diagonal glass shine */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
          locations={[0.34, 0.42, 0.52]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </ReAnimated.View>
    </View>
  );
}

// Per-screen wrapper. Transparent — it sits on top of the persistent BeerGround so navigating
// only cross-fades the content, never the glass.
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
  bubble: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  // Oversized (negative insets + extra height) so the counter-rotation never pulls the foam
  // off the top edge; the visible foam-to-beer transition still lands ~90px down at rest.
  foam: { position: 'absolute', top: -50, left: -60, right: -60, height: 190 },
  foamSolid: { height: 140, backgroundColor: colors.foam },
  foamFade: { height: 26 },
});
