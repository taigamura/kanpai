import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/theme';

// Shared screen ground. Mirrors design-mockups.html: a quiet dark twilight-blue base with
// two soft radial glows — 提灯 red top-left, beer gold top-right. React Native has no radial
// gradient primitive, so we approximate with large low-opacity circles (blurred by their
// scale + low alpha on the dark ground) over a subtle vertical LinearGradient.
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
      <LinearGradient
        colors={[colors.bgElevated, colors.bg]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.glow, styles.glowRed]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowGold]} />
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  glow: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: 230,
  },
  glowRed: {
    top: -180,
    left: -140,
    backgroundColor: colors.glowRed,
  },
  glowGold: {
    top: -160,
    right: -160,
    backgroundColor: colors.glowGold,
  },
});
