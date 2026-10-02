import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { PressableScale, enterItem, PopIn } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { useAppState } from '@/state/AppState';
import {
  syncEnabled,
  fetchCommunityTopics,
  voteTopic,
  loadVotedSet,
  reportTopic,
  blockTopicAuthor,
  type CommunityTopic,
} from '@/services/topics';
import { containsNgWord } from '@/data/ngWords';
import { KEYS, loadJSON, saveJSON } from '@/state/storage';
import { copy, fmt } from '@/content/copy';

// お題 manager for 山手線: add your own お題 (kept locally, and shared to everyone when the
// backend is on), and 👍 the community's お題. Vote counts double as developer analytics.
//
// UGC safeguards (Guideline 1.2): posting rules are accepted once before the first share, an
// NG-word filter rejects obvious abuse, and every community お題 has a ⋯ menu to report it or
// block its author (both hide it immediately; see services/topics.ts).
export function TopicsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { customTopics, addCustomTopic, removeCustomTopic } = useAppState();
  const [draft, setDraft] = useState('');
  const [community, setCommunity] = useState<CommunityTopic[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const shared = syncEnabled();

  useEffect(() => {
    if (!visible) return;
    void loadJSON<boolean>(KEYS.ugcAgreed, false).then(setAgreed);
  }, [visible]);

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

  const commit = (t: string) => {
    addCustomTopic(t);
    setDraft('');
  };

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (containsNgWord(t)) {
      Alert.alert(copy.topics.ngTitle, copy.topics.ngBody);
      return;
    }
    if (shared && !agreed) {
      Alert.alert(copy.topics.rulesTitle, copy.topics.rulesBody, [
        { text: copy.topics.cancel, style: 'cancel' },
        {
          text: copy.topics.rulesAgree,
          onPress: () => {
            setAgreed(true);
            void saveJSON(KEYS.ugcAgreed, true);
            commit(t);
          },
        },
      ]);
      return;
    }
    commit(t);
  };

  const drop = (text: string) => setCommunity((prev) => prev.filter((c) => c.text !== text));

  const moderate = (text: string) => {
    Alert.alert(text, copy.topics.moderateBody, [
      {
        text: copy.topics.report,
        onPress: () => {
          drop(text);
          void reportTopic(text);
          Alert.alert(copy.topics.reportedTitle, copy.topics.reportedBody);
        },
      },
      {
        text: copy.topics.block,
        style: 'destructive',
        onPress: () => {
          drop(text);
          void blockTopicAuthor(text);
          Alert.alert(copy.topics.blockedTitle, copy.topics.blockedBody);
        },
      },
      { text: copy.topics.cancel, style: 'cancel' },
    ]);
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
        <Animated.View entering={PopIn} style={styles.wrap}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.head}>
              <Icon name="game-yamanote" size={24} color={colors.text} />
              <T display size={font.heading}>
                {copy.topics.title}
              </T>
            </View>

            <T dim size={font.small}>
              {copy.topics.addOwn}{shared ? copy.topics.addOwnSharedSuffix : ''}
            </T>
            <View style={styles.row}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={add}
                placeholder={copy.topics.placeholder}
                placeholderTextColor={colors.textDim}
                style={styles.input}
                returnKeyType="done"
              />
              <Button title={copy.topics.add} kind="accent" onPress={add} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ gap: spacing.sm }}>
              {customTopics.length > 0 && (
                <>
                  <T dim size={font.small} style={styles.section}>
                    {copy.topics.yourTopics}
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
                        {copy.common.cross}
                      </T>
                    </PressableScale>
                  ))}
                </>
              )}

              <T dim size={font.small} style={styles.section}>
                {copy.topics.communityTopics}
              </T>
              {!shared ? (
                <T dim size={font.small} style={styles.note}>
                  {copy.topics.comingSoon}
                </T>
              ) : loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
              ) : community.length === 0 ? (
                <T dim size={font.small} style={styles.note}>
                  {copy.topics.empty}
                </T>
              ) : (
                community.map((c, i) => {
                  const on = voted.has(c.text);
                  return (
                    <Animated.View key={c.text} entering={enterItem(i)} style={styles.voteRow}>
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
                      <Pressable
                        onPress={() => moderate(c.text)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={fmt(copy.topics.moreA11y, { text: c.text })}
                        style={styles.moreBtn}
                      >
                        <Icon name="more" size={20} color={colors.textDim} />
                      </Pressable>
                    </Animated.View>
                  );
                })
              )}
            </ScrollView>

            <Button title={copy.topics.close} kind="ghost" onPress={onClose} style={{ marginTop: spacing.sm }} />
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
    minWidth: 0, // let the field shrink so the 追加 button never overflows the card (web)
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
  moreBtn: { paddingVertical: 4, paddingLeft: 2 },
});
