import React from 'react';
import {
  Text,
  TextProps,
  Pressable,
  PressableProps,
  View,
  ViewProps,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, font, fonts } from '@/theme/theme';
import { Icon, IconName } from './Icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Text primitive. Defaults to the Zen Kaku Gothic New body face; `display` swaps to the
// Dela Gothic One signage face (logos, お題, headline numbers). `bold`/`black` map to the
// matching Zen weight so the glyphs actually change, not just synthetic-bold.
export function T(
  props: TextProps & {
    dim?: boolean;
    size?: number;
    bold?: boolean;
    black?: boolean;
    display?: boolean;
  }
) {
  const { style, dim, size, bold, black, display, ...rest } = props;
  const family = display
    ? fonts.display
    : black
      ? fonts.bodyBlack
      : bold
        ? fonts.bodyBold
        : fonts.body;
  return (
    <Text
      {...rest}
      style={[
        {
          color: dim ? colors.textDim : colors.text,
          fontSize: size ?? font.body,
          fontFamily: family,
        },
        style,
      ]}
    />
  );
}

export function Card(props: ViewProps) {
  const { style, ...rest } = props;
  return <View {...rest} style={[styles.card, style]} />;
}

// Pill: the gold-outlined 罰ゲーム / status chip from the mockups.
export function Pill(props: TextProps & { children: React.ReactNode }) {
  const { style, children, ...rest } = props;
  return (
    <Text {...rest} style={[styles.pill, style]}>
      {children}
    </Text>
  );
}

// A single playing-card face (高低 / キングスカップ). `back` renders the striped card back;
// `red` colors hearts/diamonds. Size scales the whole card proportionally.
export function PlayingCard({
  label,
  red,
  back,
  size = 'lg',
}: {
  label?: string;
  red?: boolean;
  back?: boolean;
  size?: 'lg' | 'md';
}) {
  const dims =
    size === 'lg' ? { width: 150, height: 206, fontSize: 56 } : { width: 120, height: 164, fontSize: 44 };
  return (
    <View
      style={[
        styles.pcard,
        { width: dims.width, height: dims.height },
        back && styles.pcardBack,
      ]}
    >
      {back ? (
        <Icon name="crown" size={dims.fontSize} color={colors.accentBright} />
      ) : (
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: dims.fontSize,
            color: red ? colors.danger : colors.text,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

export function Button(
  props: PressableProps & { title: string; kind?: 'primary' | 'ghost' | 'accent'; icon?: IconName }
) {
  const { title, kind = 'primary', icon, onPress, style, disabled, ...rest } = props;
  const bg =
    kind === 'primary' ? colors.primary : kind === 'accent' ? colors.accent : 'transparent';
  // Colored buttons (red/caramel) carry cream type; the ghost button is ink on the beer.
  const fg = kind === 'ghost' ? colors.text : colors.cream;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={() => {
        if (disabled) return;
        scale.value = withSpring(0.94, { damping: 18, stiffness: 500, mass: 0.6 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 11, stiffness: 240, mass: 0.7 });
      }}
      onPress={(e) => {
        if (disabled) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.(e);
      }}
      style={[
        styles.btn,
        { backgroundColor: bg },
        kind === 'ghost' && styles.ghost,
        style as object,
        animatedStyle,
      ]}
    >
      <View style={styles.btnInner}>
        {icon && <Icon name={icon} size={18} color={fg} />}
        <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pill: {
    alignSelf: 'center',
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: font.small,
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 14,
    overflow: 'hidden',
    textAlign: 'center',
  },
  pcard: {
    borderRadius: radius.md,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  pcardBack: {
    backgroundColor: colors.cardBack,
  },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  btnText: {
    fontSize: font.body,
    fontFamily: fonts.bodyBlack,
  },
});
