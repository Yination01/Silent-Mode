import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CoffeeButton({ onPress, size = 'medium', label = 'Buy me a coffee', showEmoji = true, style }) {
  const sizeConfig = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, emojiSize: 18, borderRadius: 8 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, emojiSize: 22, borderRadius: 12 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 20, emojiSize: 26, borderRadius: 16 },
  };
  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: '#FF813F', paddingVertical: config.paddingVertical, paddingHorizontal: config.paddingHorizontal, borderRadius: config.borderRadius, shadowColor: '#FF813F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {showEmoji && <Text style={[styles.emoji, { fontSize: config.emojiSize }]}>☕</Text>}
      <Text style={[styles.label, { fontSize: config.fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  emoji: {},
  label: { color: '#FFFFFF', fontWeight: '700' },
});