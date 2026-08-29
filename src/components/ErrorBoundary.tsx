import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, font } from '@/theme/theme';
import { T, Button } from './ui';
import { Icon } from './Icon';
import { copy } from '@/content/copy';

// Last-resort crash net. Catches render/runtime errors anywhere below it and shows a
// friendly Japanese recovery screen instead of a white/blank crash — so a bad round never
// bricks the party. This is NOT a remote crash reporter (that needs a service + DSN and is
// listed as a manual ship task); it just keeps the app usable and logs to the console.
type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Console only for now; wire a remote reporter (Sentry/Crashlytics) here at ship time.
    console.error('[カンパイ] uncaught error', error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.root}>
        <Icon name="beer" size={60} color={colors.accent} />
        <T size={font.heading} black style={styles.title}>
          {copy.errorBoundary.title}
        </T>
        <T dim style={styles.msg}>
          {copy.errorBoundary.message}
        </T>
        <Button title={copy.errorBoundary.reset} kind="accent" onPress={this.reset} style={styles.btn} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { textAlign: 'center' },
  msg: { textAlign: 'center', lineHeight: 22 },
  btn: { marginTop: spacing.md, alignSelf: 'stretch' },
});
