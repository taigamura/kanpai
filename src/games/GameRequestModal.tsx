import React, { useState } from 'react';
import { Modal, View, StyleSheet, Pressable, TextInput, Keyboard } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { PopIn } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { submitGameRequest } from '@/services/requests';
import { copy } from '@/content/copy';

// "Add more games" suggestion box, opened from the home screen. Free-text: the player types the
// game they wish カンパイ！ had; it's sent to the backend (best-effort) and logged for the
// developer. On send we thank the user immediately — it's a suggestion box, not a transaction.
export function GameRequestModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const close = () => {
    // reset for next open
    setText('');
    setSent(false);
    onClose();
  };

  const send = () => {
    const t = text.trim();
    if (!t) return;
    Keyboard.dismiss();
    void submitGameRequest(t); // fire-and-forget; guarded + best-effort
    setSent(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Animated.View entering={PopIn} style={styles.wrap}>
          <Pressable style={styles.card} onPress={() => {}}>
            {sent ? (
              <View style={styles.thanks}>
                <Icon name="check" size={44} color={colors.success} />
                <T display size={font.heading} style={{ textAlign: 'center' }}>
                  {copy.request.thanksTitle}
                </T>
                <T dim style={{ textAlign: 'center', lineHeight: 22 }}>
                  {copy.request.thanksBody}
                </T>
                <Button title={copy.request.close} kind="accent" onPress={close} style={{ marginTop: spacing.sm }} />
              </View>
            ) : (
              <>
                <View style={styles.head}>
                  <Icon name="request" size={24} color={colors.text} />
                  <T display size={font.heading}>
                    {copy.request.title}
                  </T>
                </View>
                <T dim size={font.small} style={{ lineHeight: 20 }}>
                  {copy.request.help}
                </T>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={copy.request.placeholder}
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  multiline
                  maxLength={300}
                  textAlignVertical="top"
                />
                <Button
                  title={copy.request.send}
                  kind="accent"
                  icon="send"
                  onPress={send}
                  disabled={text.trim().length === 0}
                  style={text.trim().length === 0 ? styles.disabled : undefined}
                />
                <Button title={copy.request.close} kind="ghost" onPress={close} />
              </>
            )}
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
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    minHeight: 96,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: font.body,
  },
  disabled: { opacity: 0.5 },
  thanks: { alignItems: 'center', gap: spacing.sm },
});
