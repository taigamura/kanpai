import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { font, spacing } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { Screen } from '@/components/Screen';
import { useAppState } from '@/state/AppState';

// First-launch age gate + liability disclaimer (safeguard).
// Drinking age in Japan is 20. Shown once; acceptance persisted.
export function AgeGateScreen() {
  const { acceptAge } = useAppState();
  return (
    <Screen>
      <View style={styles.body}>
        <T display size={font.title} style={styles.logo}>
          カンパイ！
        </T>
        <T dim size={font.body} style={styles.sub}>
          飲み会・宅飲みパーティーゲーム集
        </T>

        <T display size={font.heading} style={styles.q}>
          あなたは{'\n'}20歳以上ですか？
        </T>

        <T dim size={font.small} style={styles.terms}>
          本アプリはお酒を伴う遊びを含みます。飲酒は20歳になってから。飲む・飲まないは
          常に自由で、アプリが飲酒を強制することはありません。飲酒は自己責任・適量を守り、
          体調とよく相談してください。一気飲みは絶対にやめましょう。本アプリの利用によって
          生じたいかなる結果についても、開発者は責任を負いません。
        </T>

        <Button title="はい（20歳以上）" kind="accent" onPress={acceptAge} style={styles.cta} />
        <Button
          title="利用規約を読む"
          kind="ghost"
          onPress={() => void Linking.openURL('https://example.com/kanpai/terms')}
          style={styles.cta}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: { textAlign: 'center' },
  sub: { textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xxl },
  q: { textAlign: 'center', marginBottom: spacing.lg, lineHeight: 34 },
  terms: { lineHeight: 20, marginBottom: spacing.xl },
  cta: { marginBottom: spacing.md },
});
