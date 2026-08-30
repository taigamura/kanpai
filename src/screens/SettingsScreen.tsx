import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { colors, spacing, font, radius } from '@/theme/theme';
import { T, Button, Card } from '@/components/ui';
import { Screen } from '@/components/Screen';
import { useAppState } from '@/state/AppState';
import { useNav } from '@/navigation/Nav';
import { purchaseRemoveAds, restorePurchases, iapAvailable, fetchRemoveAdsProduct } from '@/iap/iap';
import { debugTryInterstitial } from '@/ads/ads';
import { subscribeAdStatus, type AdStatus } from '@/ads/adStatus';
import { copy, fmt } from '@/content/copy';

export function SettingsScreen() {
  const { customPenalties, addCustomPenalty, removeCustomPenalty, adsRemoved, setAdsRemoved } =
    useAppState();
  const nav = useNav();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  // Live StoreKit price (e.g. "¥300"). Null until fetched; falls back to the copy default so the
  // button never shows a stale hardcoded number — the real price comes from the ASC price tier.
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (iapAvailable()) {
      fetchRemoveAdsProduct().then((p) => {
        if (alive && p?.price) setPrice(p.price);
      });
    }
    return () => {
      alive = false;
    };
  }, []);

  const buyLabel = fmt(copy.settings.buy, { price: price ?? copy.settings.buyPriceFallback });

  // Hidden ad diagnostic: tap the Settings title 7× to reveal it (works in release/TestFlight,
  // where the [kanpai/ads] console logs are silenced). Lets a tester see SDK/interstitial/banner
  // state on-device and force an interstitial attempt.
  const [titleTaps, setTitleTaps] = useState(0);
  const [showAdDebug, setShowAdDebug] = useState(false);
  const [ad, setAd] = useState<AdStatus | null>(null);
  useEffect(() => (showAdDebug ? subscribeAdStatus(setAd) : undefined), [showAdDebug]);
  const bumpTitle = () => {
    const n = titleTaps + 1;
    setTitleTaps(n);
    if (n >= 7) setShowAdDebug(true);
  };

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
      const result = await purchaseRemoveAds();
      if (result === 'owned') {
        setAdsRemoved(true);
      } else if (result === 'unavailable') {
        // Product not resolvable (not set up in ASC / Paid Apps agreement inactive). Show a clear
        // message instead of the native "[?]" purchase sheet.
        Alert.alert(copy.settings.alertUnavailableTitle, copy.settings.alertUnavailableBody);
      } else {
        // 'cancelled' — user backed out of the payment sheet; treat quietly as a failed attempt.
        Alert.alert(copy.settings.alertPurchaseFailedTitle, copy.settings.alertPurchaseFailedBody);
      }
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
        <Pressable onPress={bumpTitle} hitSlop={8}>
          <T display size={font.heading}>
            {copy.settings.title}
          </T>
        </Pressable>
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

        {/* Remove ads (買い切り) — price shown is StoreKit's live localized price from ASC */}
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
                title={busy ? copy.settings.processing : buyLabel}
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

        {/* Hidden ad diagnostic (revealed by tapping the title 7×). Debug-only; not localized copy. */}
        {showAdDebug && (
          <Card>
            <T size={font.heading} black>
              広告診断
            </T>
            <T dim size={font.small} style={{ marginTop: spacing.xs }}>
              広告が出ない原因を端末上で確認するための開発用パネルです。
            </T>
            <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
              <DebugRow label="ネイティブ広告モジュール" value={ad?.module ?? '—'} />
              <DebugRow label="広告ユニット" value={ad?.env ?? '—'} />
              <DebugRow label="SDK" value={ad?.sdk ?? '—'} />
              <DebugRow label="インタースティシャル" value={ad?.interstitial ?? '—'} />
              <DebugRow label="バナー" value={ad?.banner ?? '—'} />
              <DebugRow label="ゲーム開封カウント" value={`${ad?.opens ?? 0} / 3`} />
            </View>
            <Button
              title="インタースティシャルを試す"
              kind="accent"
              onPress={debugTryInterstitial}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.debugRow}>
      <T dim size={font.small} style={{ flexShrink: 0 }}>
        {label}
      </T>
      <T size={font.small} style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </T>
    </View>
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
  debugRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
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
