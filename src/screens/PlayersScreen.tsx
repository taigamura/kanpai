import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, FlatList, Alert } from 'react-native';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button, RuleCard } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAppState, type Player } from '@/state/AppState';
import { useNav } from '@/navigation/Nav';
import { copy, fmt } from '@/content/copy';

// Durable named players + their 負け (loss) tally. Registering players here is what flips the
// lose screen from an anonymous「負けた人！」into a tap-to-record selector, and it seeds
// 匿名アンケート's roster. Sorted most-losses-first so it reads as a running leaderboard.
export function PlayersScreen() {
  const { players, addPlayer, removePlayer, resetLosses } = useAppState();
  const nav = useNav();
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    addPlayer(t);
    setDraft('');
  };

  const confirmReset = () => {
    Alert.alert(copy.players.resetConfirmTitle, copy.players.resetConfirmBody, [
      { text: copy.players.cancel, style: 'cancel' },
      { text: copy.players.resetConfirmOk, style: 'destructive', onPress: resetLosses },
    ]);
  };

  // Leaderboard order: most losses first, ties keep insertion order (stable sort).
  const ranked = useMemo(
    () => players.map((p, i) => ({ p, i })).sort((a, b) => b.p.losses - a.p.losses || a.i - b.i).map((x) => x.p),
    [players],
  );
  const anyLosses = players.some((p) => p.losses > 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T bold>{copy.common.back}</T>
        </Pressable>
        <T display size={font.heading}>
          {copy.players.title}
        </T>
        <View style={{ width: 48 }} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <RuleCard label={copy.players.title}>
          <T dim style={{ lineHeight: 22 }}>
            {copy.players.help}
          </T>
        </RuleCard>
      </View>

      <View style={styles.row}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          placeholder={copy.players.inputPlaceholder}
          placeholderTextColor={colors.textDim}
          style={styles.input}
          returnKeyType="done"
        />
        <Button title={copy.players.add} kind="accent" onPress={add} />
      </View>

      <FlatList<Player>
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        data={ranked}
        keyExtractor={(p) => p.name}
        renderItem={({ item }) => (
          <View style={styles.chip}>
            <View style={styles.chipLeft}>
              {item.losses > 0 ? (
                <Icon name="trophy" size={20} color={colors.accent} />
              ) : (
                <Icon name="players" size={20} color={colors.textDim} />
              )}
              <T bold>{item.name}</T>
            </View>
            <View style={styles.chipRight}>
              <T bold size={font.small} style={{ color: item.losses > 0 ? colors.danger : colors.textDim }}>
                {item.losses}
                {copy.players.lossSuffix}
              </T>
              <Pressable onPress={() => removePlayer(item.name)} hitSlop={10}>
                <T dim size={font.small}>
                  {copy.common.cross}
                </T>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <T dim style={{ textAlign: 'center', marginTop: spacing.xl }}>
            {copy.players.empty}
          </T>
        }
        ListFooterComponent={
          players.length ? (
            <T dim size={font.small} style={{ textAlign: 'center', marginTop: spacing.md }}>
              {copy.players.removeHint}
            </T>
          ) : null
        }
      />

      {anyLosses && (
        <View style={{ padding: spacing.lg }}>
          <Button title={copy.players.reset} kind="ghost" onPress={confirmReset} />
        </View>
      )}
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
  chipLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chipRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
