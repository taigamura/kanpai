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
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, font } from '@/theme/theme';

export function T(props: TextProps & { dim?: boolean; size?: number; bold?: boolean }) {
  const { style, dim, size, bold, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        { color: dim ? colors.textDim : colors.text, fontSize: size ?? font.body },
        bold && { fontWeight: '700' },
        style,
      ]}
    />
  );
}

export function Card(props: ViewProps) {
  const { style, ...rest } = props;
  return <View {...rest} style={[styles.card, style]} />;
}

export function Button(
  props: PressableProps & { title: string; kind?: 'primary' | 'ghost' | 'accent' }
) {
  const { title, kind = 'primary', onPress, style, ...rest } = props;
  const bg =
    kind === 'primary' ? colors.primary : kind === 'accent' ? colors.accent : 'transparent';
  const fg = kind === 'accent' ? colors.bg : colors.text;
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
        kind === 'ghost' && styles.ghost,
        style as object,
      ]}
    >
      <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  btnText: {
    fontSize: font.body,
    fontWeight: '700',
  },
});
