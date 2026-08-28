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
import { BeerGround } from './Screen';

const { height: H } = Dimensions.get('window');

// Boot screen: the glass fills. We render the REAL home glass (BeerGround) underneath and drain
// a cream foam cover upward off the top, so the beer + foam head + carbonation revealed at the
// end are exactly what the home screen shows — the pour resolves seamlessly into home instead of
// cutting to a different-looking glass.
//
// `showLogo` is false only during the very first frames before the app fonts finish loading, so
// the カンパイ！ logotype never renders in a fallback system face that doesn't match the app.
export function LoadingScreen({ showLogo = true }: { showLogo?: boolean }) {
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withTiming(1, { duration: 1700, easing: Easing.bezier(0.4, 0.15, 0.2, 1) });
  }, [fill]);

  // The cream cover shrinks from full height to 0; its bottom edge is the rising beer surface.
  const coverStyle = useAnimatedStyle(() => ({ height: (1 - fill.value) * H }));

  return (
    <View style={styles.root}>
      {/* the actual home glass — this is the end state of the pour */}
      <BeerGround />

      {/* cream foam cover, receding upward to reveal the beer rising from the bottom */}
      <Animated.View style={[styles.cover, coverStyle]}>
        <LinearGradient
          colors={['#FFFDF8', '#FBF2DD', '#F6E8CB']}
          style={StyleSheet.absoluteFill}
        />
        {/* foam line riding the surface at the cover's bottom edge */}
        <View style={styles.surface} />
      </Animated.View>

      {showLogo && (
        <View style={styles.center} pointerEvents="none">
          <Animated.Text style={styles.logo}>
            カンパイ<Animated.Text style={styles.bang}>！</Animated.Text>
          </Animated.Text>
          <Animated.Text style={styles.sub}>飲み会・宅飲みパーティーゲーム集</Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  cover: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  // Foam line riding the surface: anchored just past the cover's bottom edge so only a thin band
  // shows (and it clips away cleanly as the cover drains to zero at the end of the pour).
  surface: {
    position: 'absolute',
    bottom: -6,
    left: -20,
    right: -20,
    height: 12,
    backgroundColor: colors.foam,
  },
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
