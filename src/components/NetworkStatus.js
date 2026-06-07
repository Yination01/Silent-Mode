import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';

export default function NetworkStatus() {
  const { isConnected } = useNetwork();
  const theme = useTheme();

  if (isConnected !== false) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.warning }]}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  icon: { fontSize: 16, marginRight: 8 },
  text: { color: '#000000', fontSize: 14, fontWeight: '600' },
});