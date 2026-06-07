import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TONE_PRESETS } from '../../config/constants';
import { updateUserTone } from '../../services/userService';
import { selectionHaptic, successHaptic } from '../../utils/haptics';
import Logger from '../../utils/logger';
import auth from '@react-native-firebase/auth';

export default function PickVibeScreen({ navigation }) {
  const theme = useTheme();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = useCallback(async () => {
    if (!selected) return;
    const userId = auth().currentUser?.uid;
    if (!userId) { Alert.alert('Error', 'Please sign in again.'); return; }
    successHaptic();
    setLoading(true);
    try {
      await updateUserTone(userId, selected);
      Logger.info('Tone preset saved', { tone: selected });
      navigation.navigate('TextLength');
    } catch (error) {
      Logger.error('Failed to save tone', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  }, [selected, navigation]);

  const renderVibeCard = useCallback(({ item }) => {
    const isSelected = selected === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.vibeCard,
          {
            backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
            borderWidth: isSelected ? 3 : 2,
            transform: [{ scale: isSelected ? 1.05 : 1 }],
          },
        ]}
        onPress={() => { selectionHaptic(); setSelected(item.id); }}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={[styles.vibeLabel, { color: isSelected ? theme.colors.black : theme.colors.text }]}>
          {item.label}
        </Text>
        <Text style={[styles.vibeDesc, { color: isSelected ? theme.colors.black + '99' : theme.colors.textSecondary }]}>
          {item.shortDesc}
        </Text>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: theme.colors.black }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selected, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.progress}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.progressDot, { backgroundColor: i <= 1 ? theme.colors.accent : theme.colors.border }]} />
        ))}
      </View>
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        How should SilentMode text for you?
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Pick your vibe. This trains your AI's personality. You can switch anytime.
      </Text>

      <FlatList
        data={TONE_PRESETS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        renderItem={renderVibeCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      />

      <TouchableOpacity
        style={[
          styles.continueButton,
          {
            backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
            opacity: selected && !loading ? 1 : 0.5,
          },
        ]}
        onPress={handleContinue}
        disabled={!selected || loading}
        activeOpacity={0.8}
      >
        <Text style={[styles.continueText, { color: selected ? theme.colors.black : theme.colors.textSecondary }]}>
          {loading ? 'Saving...' : selected ? `Choose ${TONE_PRESETS.find(v => v.id === selected)?.label}` : 'Select a vibe'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 32 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 20, lineHeight: 22 },
  gridContainer: { paddingBottom: 16 },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  vibeCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  vibeLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  vibeDesc: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
  checkmark: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  continueButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 32, elevation: 6 },
  continueText: { fontSize: 18, fontWeight: '700' },
});