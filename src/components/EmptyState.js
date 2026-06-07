import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ emoji, title, subtitle, actionLabel, onAction }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.accent }]} onPress={onAction}>
          <Text style={[styles.actionText, { color: theme.colors.black }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, paddingVertical: 64 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  actionButton: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  actionText: { fontSize: 16, fontWeight: '600' },
});