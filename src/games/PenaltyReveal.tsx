import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { enterBoom, enterPop } from '@/components/motion';
import { T, Button, Pill } from '@/components/ui';
import { spacing, colors, font, radius } from '@/theme/theme';
import { useAppState } from '@/state/AppState';
import { copy } from '@/content/copy';

// When someone loses, they do a 罰ゲーム. The 罰ゲーム pool is user-supplied (no built-in
// defaults in v1), so when the group hasn't added any, we prompt them to decide one / add
// theirs in 設定 — never an empty/undefined draw.
//
// If the group has registered players (opt-in, via the 参加者 screen), the anonymous
// loserLabel is replaced by a tap-to-record selector: tapping a player marks them as this
// round's loser and increments their durable 負け count; tapping again undoes it. Selection
// is a toggle so a mis-tap is reversible and never double-counts.
export function PenaltyReveal({ loserLabel }: { loserLabel: string }) {
  const { penalties, players, adjustLoss } = useAppState();
  const [penalty, setPenalty] = useState<string | null>(null);
  // Names counted during THIS reveal, so toggling adjusts the persisted count by ±1 only.
  const [selected, setSelected] = useState<string[]>([]);
  const hasPenalties = penalties.length > 0;
  const hasPlayers = players.length > 0;

  const draw = () => {
    const p = penalties[Math.floor(Math.random() * penalties.length)];
    setPenalty(p);
  };

  const toggleLoser = (name: string) => {
    const isOn = selected.includes(name);
    void Haptics.impactAsync(
      isOn ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    adjustLoss(name, isOn ? -1 : 1);
    setSelected((prev) => (isOn ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  return (
    <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
      <Animated.View entering={enterBoom()}>
        <T display size={font.heading} style={{ color: colors.danger, textAlign: 'center' }}>
          {loserLabel}
        </T>
      </Animated.View>

      {hasPlayers && (
        <View style={styles.pickWrap}>
          <T dim size={font.small} style={{ textAlign: 'center' }}>
            {copy.penalty.whoPrompt}
          </T>
          <View style={styles.chips}>
            {players.map((p) => {
              const on = selected.includes(p.name);
              return (
                <Pressable
                  key={p.name}
                  onPress={() => toggleLoser(p.name)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <T bold style={{ color: on ? colors.cream : colors.text }}>
                    {p.name}
                  </T>
                  <T
                    size={font.small}
                    bold
                    style={{ color: on ? colors.cream : colors.accent }}
                  >
                    {p.losses}
                    {copy.penalty.lossSuffix}
                  </T>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {hasPenalties ? (
        penalty ? (
          <Animated.View entering={enterPop()}>
            <Pill>{copy.penalty.prefix}{penalty}</Pill>
          </Animated.View>
        ) : (
          <Button title={copy.penalty.draw} kind="accent" onPress={draw} />
        )
      ) : (
        <T dim size={font.small} style={{ textAlign: 'center' }}>
          {copy.penalty.empty}
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickWrap: { width: '100%', alignItems: 'center', gap: spacing.sm },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipOn: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
});
