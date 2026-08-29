import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button, Card } from '@/components/ui';
import { Screen } from '@/components/Screen';
import { useAppState } from '@/state/AppState';
import { useNav } from '@/navigation/Nav';
import { purchaseRemoveAds, restorePurchases, iapAvailable } from '@/iap/iap';
import { copy } from '@/content/copy';

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
          Alert.alert(copy.settings.alertCannotBuyTitle, copy.settings.alertCannotBuyBody);
        }
        return;
      }
      const ok = await purchaseRemoveAds();
      if (ok) setAdsRemoved(true);
      else Alert.alert(copy.settings.alertPurchaseFailedTitle, copy.settings.alertPurchaseFailedBody);
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const owned = await restorePurchases();
      setAdsRemoved(owned);
      Alert.alert(owned ? copy.settings.alertRestored : copy.settings.alertNotFound);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={nav.home} hitSlop={12}>
          <T bold>{copy.common.back}</T>
        </Pressable>
        <T display size={font.heading}>
          {copy.settings.title}
        </T>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {/* Custom 罰ゲーム (v1 editable content) */}
        <Card>
          <T size={font.heading} black>
            {copy.settings.penaltiesTitle}
          </T>
          <T dim size={font.small} style={{ marginTop: spacing.xs }}>
            {copy.settings.penaltiesHelp}
          </T>
          <View style={[styles.row, { marginTop: spacing.md }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => {
                addCustomPenalty(draft);
                setDraft('');
              }}
              placeholder={copy.settings.penaltiesPlaceholder}
              placeholderTextColor={colors.textDim}
              style={styles.input}
              returnKeyType="done"
            />
            <Button
              title={copy.settings.add}
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
                {copy.settings.penaltiesEmpty}
              </T>
            )}
            {customPenalties.map((p) => (
              <Pressable key={p} style={styles.chip} onPress={() => removeCustomPenalty(p)}>
                <T>{p}</T>
                <T dim size={font.small}>
                  {copy.common.cross}
                </T>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Remove ads (¥370 買い切り) — wired to StoreKit in the IAP task */}
        <Card>
          <T size={font.heading} black>
            {copy.settings.removeAdsTitle}
          </T>
          <T dim size={font.small} style={{ marginTop: spacing.xs }}>
            {copy.settings.removeAdsHelp}
          </T>
          {adsRemoved ? (
            <T style={{ marginTop: spacing.md, color: colors.success }} bold>
              {copy.settings.purchased}
            </T>
          ) : (
            <>
              <Button
                title={busy ? copy.settings.processing : copy.settings.buy}
                onPress={buyRemoveAds}
                disabled={busy}
                style={{ marginTop: spacing.md }}
              />
              <Button
                title={copy.settings.restore}
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
          <Pressable onPress={() => void Linking.openURL('https://taigamura.github.io/kanpai/terms.html')}>
            <T black>{copy.settings.legalLink}</T>
          </Pressable>
          <T dim size={font.small} style={{ marginTop: spacing.sm }}>
            {copy.settings.legalNote}
          </T>
        </Card>
      </ScrollView>
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
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.bgElevated,
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
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
