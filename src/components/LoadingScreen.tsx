import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '@/theme/theme';
import { ChatterGround } from './Screen';
import { copy } from '@/content/copy';

// Boot screen: the REAL home ground (ChatterGround) with the ワイワイ！ logotype popping in like a
// shout, then the tagline fading up. Because the ground is the same one home renders, boot resolves
// into home in place with no background cut.
//
// `showLogo` is false only during the very first frames before the app fonts finish loading, so
// the logotype never renders in a fallback system face that doesn't match the app.
export function LoadingScreen({ showLogo = true }: { showLogo?: boolean }) {
  const pop = useSharedValue(0);
  const sub = useSharedValue(0);
  useEffect(() => {
    if (!showLogo) return;
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
    sub.value = withDelay(350, withTiming(1, { duration: 500 }));
  }, [showLogo, pop, sub]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ scale: 0.6 + 0.4 * pop.value }, { rotate: `${(1 - pop.value) * -6}deg` }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: sub.value,
    transform: [{ translateY: (1 - sub.value) * 8 }],
  }));

  return (
    <View style={styles.root}>
      <ChatterGround />
      {showLogo && (
        <View style={styles.center} pointerEvents="none">
          <Animated.Text style={[styles.logo, logoStyle]}>{copy.brand.name}</Animated.Text>
          <Animated.Text style={[styles.sub, subStyle]}>{copy.brand.tagline}</Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
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
  // Same riso treatment as the home logotype: blue ink with a misregistered yellow offset.
  logo: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.blue,
    textShadowColor: colors.yellow,
    textShadowOffset: { width: 3, height: 2 },
    textShadowRadius: 0,
  },
  sub: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, color: colors.textDim },
});
