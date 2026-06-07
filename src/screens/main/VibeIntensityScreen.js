import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TONE_PRESETS, VIBE_INTENSITY_LABELS, VIBE_INTENSITY_DEFAULTS } from '../../config/constants';
import { useAppStore } from '../../store/appStore';
import { selectionHaptic, successHaptic } from '../../utils/haptics';

const INTENSITY_LEVELS = [1, 2, 3, 4, 5];

export default function VibeIntensityScreen({ route, navigation }) {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const vibeIntensity = useAppStore((state) => state.vibeIntensity);
  const setVibeIntensity = useAppStore((state) => state.setVibeIntensity);
  
  const vibeId = route.params?.vibeId || 'professional';
  const vibe = TONE_PRESETS.find(v => v.id === vibeId) || TONE_PRESETS[0];
  const currentLevel = vibeIntensity[vibeId] || VIBE_INTENSITY_DEFAULTS[vibeId];

  const handleSetIntensity = useCallback((level) => {
    selectionHaptic();
    setVibeIntensity(vibeId, level);
    showToast(`${vibe.label} intensity set to ${VIBE_INTENSITY_LABELS[level]}`, 'success');
  }, [vibeId, vibe.label, setVibeIntensity, showToast]);

  const getExampleText = (level) => {
    const examples = {
      sarcastic: {
        1: "Sure, just super free right now. Text later",
        2: "Oh totally not busy at all 😅 brb",
        3: "Oh sure, let me drop everything 🙄 text u later",
        4: "Shocking. Can't talk.",
        5: "Wow. Groundbreaking.",
      },
      professional: {
        1: "Thank you. I'll follow up shortly.",
        2: "Got it. Will respond soon.",
        3: "Received. I'll review and get back to you.",
        4: "Acknowledged. Response forthcoming.",
        5: "Understood. I will provide a comprehensive response at my earliest convenience.",
      },
      chill: {
        1: "cool",
        2: "yeah cool, later",
        3: "yeah sounds good, text u later",
        4: "bet. busy rn.",
        5: "k.",
      },
      warm: {
        1: "Hey! Busy but thinking of you 💛",
        2: "Aww thanks! Swamped rn but text soon 💛",
        3: "That's so sweet! Tied up rn but let's catch up later 💛",
        4: "You're the best! Super busy but sending love 💛✨",
        5: "My heart is full! I'm drowning in work but you made my day 💛💛💛",
      },
      spicy: {
        1: "Not right now.",
        2: "Busy. Later.",
        3: "Read the room. I'm busy.",
        4: "Did I stutter? Busy.",
        5: "Leave. Me. Alone. 🌶️",
      },
      culture: {
        1: "My dear, I dey busy small. I go reply you.",
        2: "Ah ah my dear, I dey work now o. Later na.",
        3: "My darling, abeg give me small time. I go call you back proper.",
        4: "Ehn ehn! You sef know say I dey busy now. No vex!",
        5: "CHAI! My own don finish! I go reply you when I free, my dear. No kill me with plenty message o!",
      },
    };

    return examples[vibeId]?.[level] || "Custom reply at this intensity level.";
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{vibe.emoji}</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{vibe.label} Intensity</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          How strong should the {vibe.label.toLowerCase()} vibe be?
        </Text>
      </View>

      <View style={[styles.currentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}>
        <Text style={[styles.currentLabel, { color: theme.colors.textSecondary }]}>Current Level</Text>
        <Text style={[styles.currentValue, { color: theme.colors.accent }]}>
          {currentLevel} - {VIBE_INTENSITY_LABELS[currentLevel]}
        </Text>
      </View>

      <View style={styles.intensityList}>
        {INTENSITY_LEVELS.map((level) => {
          const isActive = currentLevel === level;
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.intensityCard,
                {
                  backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                  borderColor: isActive ? theme.colors.accent : theme.colors.border,
                  borderWidth: isActive ? 3 : 1,
                },
              ]}
              onPress={() => handleSetIntensity(level)}
              activeOpacity={0.8}
            >
              <View style={styles.intensityHeader}>
                <View style={styles.levelRow}>
                  <Text style={[styles.levelNumber, { color: isActive ? theme.colors.black : theme.colors.text }]}>
                    {level}
                  </Text>
                  <Text style={[styles.levelLabel, { color: isActive ? theme.colors.black : theme.colors.accent }]}>
                    {VIBE_INTENSITY_LABELS[level]}
                  </Text>
                </View>
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: theme.colors.black }]}>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                )}
              </View>
              <View style={[styles.exampleBox, { backgroundColor: isActive ? theme.colors.black + '10' : theme.colors.background }]}>
                <Text style={[styles.exampleText, { color: isActive ? theme.colors.black : theme.colors.textSecondary }]}>
                  "{getExampleText(level)}"
                </Text>
              </View>
              <View style={styles.dotsRow}>
                {INTENSITY_LEVELS.map((dot) => (
                  <View
                    key={dot}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: dot <= level
                          ? (isActive ? theme.colors.black : theme.colors.accent)
                          : theme.colors.border,
                        width: dot <= level ? 16 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          💡 Intensity affects how strongly the AI applies this vibe. Lower = subtle hints, higher = full personality mode.
        </Text>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerEmoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  currentCard: { padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center', marginBottom: 24 },
  currentLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  currentValue: { fontSize: 28, fontWeight: '700' },
  intensityList: { gap: 12, marginBottom: 24 },
  intensityCard: { padding: 20, borderRadius: 16 },
  intensityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  levelNumber: { fontSize: 28, fontWeight: '800' },
  levelLabel: { fontSize: 16, fontWeight: '600' },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  exampleBox: { padding: 14, borderRadius: 10, marginBottom: 12 },
  exampleText: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  dotsRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
  infoCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  infoText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
});