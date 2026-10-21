import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { spacing, font } from '@/theme/theme';
import { T } from './ui';
import { Screen } from './Screen';
import { useNav } from '@/navigation/Nav';
import { copy } from '@/content/copy';

// Shared frame for every game screen: glow ground, a back button, a display-face title.
export function GameFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const nav = useNav();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T size={font.body} bold>
            {copy.common.back}
          </T>
        </Pressable>
        <T size={font.heading} display>
          {title}
        </T>
        <View style={{ width: 48 }} />
      </View>
      {/* Scrollable body: result screens (8 seats, scoreboard + loser chips + buttons) can be taller
          than a small iPhone. A plain centered View overflowed both up over the header and down off
          screen, hiding the 戻る / もう一回 buttons. flexGrow keeps short phases vertically centered. */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
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
  scroll: { flex: 1 },
  body: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
});
