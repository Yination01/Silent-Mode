import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyBadge() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.accent + '15', borderColor: theme.colors.accent + '30' }]}>
      <Text style={styles.emoji}>🔒</Text>
      <Text style={[styles.text, { color: theme.colors.accent }]}>Privacy-first AI • Zero message storage • Open source</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginHorizontal: 24, marginBottom: 16 },
  emoji: { fontSize: 16, marginRight: 8 },
  text: { fontSize: 13, fontWeight: '600', textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', lineHeight: 18 },
});