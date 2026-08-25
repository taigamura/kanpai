import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, font } from '@/theme/theme';
import { T } from './ui';
import { useNav } from '@/navigation/Nav';

// Shared frame for every game screen: back button, title, and the persistent
// responsible-drinking notice (safeguard).
export function GameFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const nav = useNav();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T size={font.body} bold>
            ← 戻る
          </T>
        </Pressable>
        <T size={font.heading} bold>
          {title}
        </T>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.body}>{children}</View>
      <T dim size={font.small} style={styles.notice}>
        飲みすぎ注意・体調と相談して。飲むかどうかは自由です。
      </T>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
