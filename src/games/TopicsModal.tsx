import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, { ZoomIn, FadeInDown } from 'react-native-reanimated';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { PressableScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { useAppState } from '@/state/AppState';
import {
  syncEnabled,
  fetchCommunityTopics,
  voteTopic,
  loadVotedSet,
  type CommunityTopic,
} from '@/services/topics';

// お題 manager for 山手線: add your own お題 (kept locally, and shared to everyone when the
// backend is on), and 👍 the community's お題. Vote counts double as developer analytics.
export function TopicsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { customTopics, addCustomTopic, removeCustomTopic } = useAppState();
  const [draft, setDraft] = useState('');
  const [community, setCommunity] = useState<CommunityTopic[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const shared = syncEnabled();

  useEffect(() => {
    if (!visible || !shared) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const [list, votes] = await Promise.all([fetchCommunityTopics(), loadVotedSet()]);
      if (!alive) return;
      setCommunity(list);
      setVoted(votes);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [visible, shared]);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    addCustomTopic(t);
    setDraft('');
  };

  const vote = async (text: string) => {
    if (voted.has(text)) return;
    setVoted((p) => new Set(p).add(text)); // optimistic — one 👍 per install
    setCommunity((prev) => prev.map((c) => (c.text === text ? { ...c, votes: c.votes + 1 } : c)));
    await voteTopic(text);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={ZoomIn.duration(240).springify().damping(16)} style={styles.wrap}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.head}>
              <Icon name="game-yamanote" size={24} color={colors.text} />
              <T display size={font.heading}>
                お題
              </T>
            </View>

            <T dim size={font.small}>
              自分のお題を追加{shared ? '（みんなにも共有されます）' : ''}
            </T>
            <View style={styles.row}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={add}
                placeholder="例：好きなアイスの味"
                placeholderTextColor={colors.textDim}
                style={styles.input}
                returnKeyType="done"
              />
              <Button title="追加" kind="accent" onPress={add} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ gap: spacing.sm }}>
              {customTopics.length > 0 && (
                <>
                  <T dim size={font.small} style={styles.section}>
                    あなたのお題（タップで削除）
                  </T>
                  {customTopics.map((t) => (
                    <PressableScale
                      key={t}
                      style={styles.chip}
                      scaleTo={0.97}
                      onPress={() => removeCustomTopic(t)}
                    >
                      <T>{t}</T>
                      <T dim size={font.small}>
                        ✕
                      </T>
                    </PressableScale>
                  ))}
                </>
              )}

              <T dim size={font.small} style={styles.section}>
                みんなのお題
              </T>
              {!shared ? (
                <T dim size={font.small} style={styles.note}>
                  共有・投票は近日公開。いま追加したお題は、この端末のゲームに登場します。
                </T>
              ) : loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
              ) : community.length === 0 ? (
                <T dim size={font.small} style={styles.note}>
                  まだお題がありません。最初の投稿者になろう！
                </T>
              ) : (
                community.map((c, i) => {
                  const on = voted.has(c.text);
                  return (
                    <Animated.View
                      key={c.text}
                      entering={FadeInDown.delay(i * 35).springify().damping(15)}
                      style={styles.voteRow}
                    >
                      <T style={{ flex: 1 }}>{c.text}</T>
                      <PressableScale
                        style={[styles.voteBtn, on && styles.voteBtnOn]}
                        scaleTo={0.82}
                        onPress={() => vote(c.text)}
                      >
                        <Icon name="up" size={15} color={on ? colors.cream : colors.accent} />
                        <T size={font.small} bold style={{ color: on ? colors.cream : colors.accent }}>
                          {c.votes}
                        </T>
                      </PressableScale>
                    </Animated.View>
                  );
                })
              )}
            </ScrollView>

            <Button title="閉じる" kind="ghost" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  wrap: { width: '100%', maxWidth: 460 },
  card: {
    width: '100%',
    maxHeight: '86%',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
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
  scroll: { maxHeight: 320, marginTop: spacing.xs },
  section: { marginTop: spacing.sm, letterSpacing: 1 },
  note: { lineHeight: 20 },
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
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  voteBtnOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
