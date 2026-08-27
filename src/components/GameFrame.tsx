import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, font } from '@/theme/theme';
import { T } from './ui';
import { Screen } from './Screen';
import { useNav } from '@/navigation/Nav';

// Shared frame for every game screen: glow ground, a back button, a display-face title,
// and the persistent responsible-drinking notice (safeguard).
export function GameFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const nav = useNav();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T size={font.body} bold>
            ← 戻る
          </T>
        </Pressable>
        <T size={font.body} display>
          {title}
        </T>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.body}>{children}</View>
      <T dim size={font.small} style={styles.notice}>
        飲みすぎ注意・体調と相談して。飲むかどうかは自由です。
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  notice: { textAlign: 'center', paddingBottom: spacing.sm, paddingHorizontal: spacing.md },
});
