import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button, Card } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { useNav } from '@/navigation/Nav';
import { purchaseRemoveAds, restorePurchases, iapAvailable } from '@/iap/iap';

export function SettingsScreen() {
  const { customPenalties, addCustomPenalty, removeCustomPenalty, adsRemoved, setAdsRemoved } =
    useAppState();
  const nav = useNav();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const buyRemoveAds = async () => {
    setBusy(true);
    try {
      if (!iapAvailable()) {
        // Native StoreKit absent (Expo Go / dev). Allow a dev-only unlock for testing.
        if (__DEV__) {
          setAdsRemoved(true);
        } else {
          Alert.alert('購入できません', 'この端末では購入を利用できません。');
        }
        return;
      }
      const ok = await purchaseRemoveAds();
      if (ok) setAdsRemoved(true);
      else Alert.alert('購入が完了しませんでした', 'もう一度お試しください。');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const owned = await restorePurchases();
      setAdsRemoved(owned);
      Alert.alert(owned ? '復元しました' : '購入が見つかりません');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T bold>← 戻る</T>
        </Pressable>
        <T size={font.heading} bold>
          設定
        </T>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {/* Custom 罰ゲーム (v1 editable content) */}
        <Card>
          <T size={font.heading} bold>
            オリジナル罰ゲーム
          </T>
          <T dim size={font.small} style={{ marginTop: spacing.xs }}>
            追加した罰ゲームは全ゲームに登場します。飲酒の代わりに選べる内容にしましょう。
          </T>
          <View style={[styles.row, { marginTop: spacing.md }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => {
                addCustomPenalty(draft);
                setDraft('');
              }}
              placeholder="例：モノマネを1つ"
              placeholderTextColor={colors.textDim}
              style={styles.input}
              returnKeyType="done"
            />
            <Button
              title="追加"
              kind="accent"
              onPress={() => {
                addCustomPenalty(draft);
                setDraft('');
              }}
            />
          </View>
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {customPenalties.length === 0 && (
              <T dim size={font.small}>
                まだありません
              </T>
            )}
            {customPenalties.map((p) => (
              <Pressable key={p} style={styles.chip} onPress={() => removeCustomPenalty(p)}>
                <T>{p}</T>
                <T dim size={font.small}>
                  ✕
                </T>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Remove ads (¥370 買い切り) — wired to StoreKit in the IAP task */}
        <Card>
          <T size={font.heading} bold>
            広告を非表示
          </T>
          <T dim size={font.small} style={{ marginTop: spacing.xs }}>
            買い切り（サブスクではありません）。once purchased, ads never return.
          </T>
          {adsRemoved ? (
            <T style={{ marginTop: spacing.md, color: colors.success }} bold>
              購入済み・ありがとうございます
            </T>
          ) : (
            <>
              <Button
                title={busy ? '処理中…' : '¥370で広告を消す'}
                onPress={buyRemoveAds}
                disabled={busy}
                style={{ marginTop: spacing.md }}
              />
              <Button
                title="購入を復元"
                kind="ghost"
                onPress={restore}
                disabled={busy}
                style={{ marginTop: spacing.sm }}
              />
            </>
          )}
        </Card>

        {/* Legal */}
        <Card>
          <Pressable onPress={() => void Linking.openURL('https://example.com/kanpai/terms')}>
            <T>利用規約・免責事項</T>
          </Pressable>
          <T dim size={font.small} style={{ marginTop: spacing.sm }}>
            飲酒は20歳から・自己責任・適量を。一気飲みはやめましょう。
          </T>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: font.body,
  },
  chip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
