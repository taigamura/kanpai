import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing, Dimensions } from 'react-native';
import ReAnimated, {
  useAnimatedSensor,
  SensorType,
  useDerivedValue,
  useSharedValue,
  useAnimatedStyle,
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

// The beer surface should stay level with gravity as the phone tilts. We read the device's
// roll (left-right tilt) on the UI thread and counter-rotate the liquid layer, low-passed for
// a gentle slosh and capped so it never dumps. No sensor (simulator/web) → angle stays 0.
const TILT_CAP = 0.16; // radians (~9°)
function useTiltStyle() {
  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 40 });
  const smooth = useSharedValue(0);
  const angle = useDerivedValue(() => {
    const roll = sensor.sensor.value.roll;
    const target = Math.max(-TILT_CAP, Math.min(TILT_CAP, -roll));
    smooth.value = smooth.value + (target - smooth.value) * 0.1; // low-pass toward target
    return smooth.value;
  });
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}rad` }] }));
}

// Shared screen ground. Mirrors docs/lager-tilt.html (concept 1 "生ビール Lager"): a static
// amber liquid base, then a tilt layer (cream foam head + carbonation + glass shine) that
// counter-rotates to the phone's tilt so the beer looks real. Every screen sits inside the glass.
export function Screen({
  children,
  edges = ['top', 'bottom'],
  style,
}: {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}) {
  const tiltStyle = useTiltStyle();
  return (
    <View style={styles.root}>
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
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
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
