import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as Sentry from '@sentry/react-native';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    if (!__DEV__) {
      Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    }
  }

  render() {
    if (this.state.hasError) {
      const theme = this.props.theme;
      return (
        <View style={[styles.container, { backgroundColor: theme?.colors?.background || '#000000' }]}>
          <Text style={styles.emoji}>😅</Text>
          <Text style={[styles.title, { color: theme?.colors?.text || '#FFFFFF' }]}>Oops! Something went wrong</Text>
          <Text style={[styles.subtitle, { color: theme?.colors?.textSecondary || '#999999' }]}>SilentMode hit a snag. Don't worry, your data is safe.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.props.onRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ error, onRetry, children }) {
  const theme = useTheme();

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.emoji}>😅</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Oops! Something went wrong</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>SilentMode hit a snag. Don't worry, your data is safe.</Text>
        {__DEV__ && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error?.message || error?.toString?.() || 'Unknown error'}
          </Text>
        )}
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.accent }]} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <ErrorBoundaryClass theme={theme} onRetry={onRetry}>{children}</ErrorBoundaryClass>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  errorText: { fontSize: 12, textAlign: 'center', marginBottom: 24, padding: 12, backgroundColor: '#1A1A1A', borderRadius: 8, overflow: 'hidden' },
  retryButton: { backgroundColor: '#00FF88', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  retryText: { color: '#000000', fontSize: 18, fontWeight: '600' },
});