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
import { copy } from '@/content/copy';

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

// RuleCard — the "labeled tab" style (chosen from the 10-option board) for the short rules shown
// before a game starts: a cream card lifted off the beer, with a caramel pill tab straddling the top
// edge that names the box (default 「ルール」, e.g.「はじめる前に」for KingsCup). Geometry mirrors
// docs/rulecard-mockups.html #04. The tab pokes 13px above the card, so `marginTop` reserves room.
export function RuleCard({
  children,
  label = copy.ui.ruleCardLabel,
  style,
}: {
  children: React.ReactNode;
  label?: string;
  style?: ViewProps['style'];
}) {
  return (
    <View style={[styles.ruleCard, style]}>
      <View style={styles.ruleTabWrap} pointerEvents="none">
        <View style={styles.ruleTabPill}>
          <T bold size={11} style={styles.ruleTabText}>
            {label}
          </T>
        </View>
      </View>
      {children}
    </View>
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
  ruleCard: {
    width: '100%',
    marginTop: 13, // room for the tab that straddles the top edge
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingTop: 22,
    paddingBottom: 16,
    paddingHorizontal: 18,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ruleTabWrap: {
    position: 'absolute',
    top: -13,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ruleTabPill: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  ruleTabText: {
    color: colors.cream,
    letterSpacing: 2,
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
