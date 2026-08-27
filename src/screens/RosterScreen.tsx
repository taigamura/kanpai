import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { Screen } from '@/components/Screen';
import { useAppState } from '@/state/AppState';
import { useNav } from '@/navigation/Nav';
import type { GameId } from '@/data/games';

// Shared roster entry. Entered once, remembered, editable. Reached only for games
// that need names (needsRoster). Fast quick-add; can proceed once minPlayers met.
export function RosterScreen({ next }: { next: GameId }) {
  const { roster, setRoster } = useAppState();
  const nav = useNav();
  const [draft, setDraft] = useState('');
  const [names, setNames] = useState<string[]>(roster);

  const add = () => {
    const t = draft.trim();
    if (!t || names.includes(t)) return;
    setNames((p) => [...p, t]);
    setDraft('');
  };
  const remove = (n: string) => setNames((p) => p.filter((x) => x !== n));

  const proceed = () => {
    setRoster(names);
    nav.go({ name: 'game', id: next });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T bold>← 戻る</T>
        </Pressable>
        <T display size={font.heading}>
          参加者
        </T>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.row}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          placeholder="名前を入力"
          placeholderTextColor={colors.textDim}
          style={styles.input}
          returnKeyType="done"
        />
        <Button title="追加" kind="accent" onPress={add} />
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        data={names}
        keyExtractor={(n) => n}
        renderItem={({ item }) => (
          <Pressable style={styles.chip} onPress={() => remove(item)}>
            <T>{item}</T>
            <T dim size={font.small}>
              ✕
            </T>
          </Pressable>
        )}
        ListEmptyComponent={
          <T dim style={{ textAlign: 'center', marginTop: spacing.xl }}>
            参加者を追加してください
          </T>
        }
      />

      <View style={{ padding: spacing.lg }}>
        <Button
          title={`はじめる（${names.length}人）`}
          onPress={proceed}
          disabled={names.length < 3}
          style={{ opacity: names.length < 3 ? 0.4 : 1 }}
        />
        {names.length < 3 && (
          <T dim size={font.small} style={{ textAlign: 'center', marginTop: spacing.sm }}>
            3人以上で遊べます
          </T>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: font.body,
  },
  chip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
