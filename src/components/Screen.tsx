import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing, Dimensions } from 'react-native';
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

// Shared screen ground. Mirrors docs/lager-tilt.html (concept 1 "生ビール Lager"):
// an amber liquid fill, a cream foam head across the top, carbonation rising through it,
// and a soft diagonal glass shine. Every screen sits "inside the glass."
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
    <View style={styles.root}>
      {/* amber liquid */}
      <LinearGradient
        colors={[colors.beerTop, colors.beerBot]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* carbonation rising from the base */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {BUBBLES.map((b, i) => (
          <Bubble key={i} {...b} />
        ))}
      </View>
      {/* foam head: solid cream band that softens into the beer */}
      <View pointerEvents="none" style={styles.foam}>
        <View style={styles.foamSolid} />
        <LinearGradient
          colors={[colors.foam, 'rgba(253,247,230,0)']}
          style={styles.foamFade}
        />
      </View>
      {/* diagonal glass shine */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
        locations={[0.34, 0.42, 0.52]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
  foam: { position: 'absolute', top: 0, left: 0, right: 0, height: 116 },
  foamSolid: { height: 90, backgroundColor: colors.foam },
  foamFade: { height: 26 },
});
