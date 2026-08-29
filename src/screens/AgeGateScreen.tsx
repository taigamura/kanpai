import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { font, spacing } from '@/theme/theme';
import { T, Button } from '@/components/ui';
import { Screen } from '@/components/Screen';
import { useAppState } from '@/state/AppState';
import { copy } from '@/content/copy';

// First-launch age gate + liability disclaimer (safeguard).
// Drinking age in Japan is 20. Shown once; acceptance persisted.
export function AgeGateScreen() {
  const { acceptAge } = useAppState();
  return (
    <Screen>
      <View style={styles.body}>
        <T display size={font.title} style={styles.logo}>
          {copy.brand.name}
        </T>
        <T dim size={font.body} style={styles.sub}>
          {copy.brand.tagline}
        </T>

        <T display size={font.heading} style={styles.q}>
          {copy.ageGate.question}
        </T>

        <T dim size={font.small} style={styles.terms}>
          {copy.ageGate.terms}
        </T>

        <Button title={copy.ageGate.confirm} kind="accent" onPress={acceptAge} style={styles.cta} />
        <Button
          title={copy.ageGate.readTerms}
          kind="ghost"
          onPress={() => void Linking.openURL('https://taigamura.github.io/kanpai/terms.html')}
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
