import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { updateLinkedApps } from '../../services/userService';
import { selectionHaptic, successHaptic } from '../../utils/haptics';
import { trackEvent, AnalyticsEvents } from '../../utils/analytics';
import Logger from '../../utils/logger';
import auth from '@react-native-firebase/auth';

const APPS = [
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  { id: 'sms', label: 'SMS', emoji: '📱', color: '#4488FF' },
  { id: 'gmail', label: 'Gmail', emoji: '📧', color: '#EA4335' },
];

export default function LinkAppsScreen({ navigation }) {
  const theme = useTheme();
  const [selectedApps, setSelectedApps] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleApp = useCallback((appId) => {
    selectionHaptic();
    setSelectedApps(prev => prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]);
  }, []);

  const handleContinue = useCallback(async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) { Alert.alert('Error', 'Please sign in again.'); return; }
    successHaptic();
    setLoading(true);
    try {
      await updateLinkedApps(userId, selectedApps);
      trackEvent(AnalyticsEvents.ONBOARDING_STARTED, { step: 'link_apps' });
      navigation.navigate('PickVibe');
    } catch (error) {
      Logger.error('Failed to save linked apps', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  }, [selectedApps, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.progress}>
        {[0, 1, 2, 3].map(i => <View key={i} style={[styles.progressDot, { backgroundColor: i === 0 ? theme.colors.accent : theme.colors.border }]} />)}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Link Your Apps</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Choose where SilentMode should auto-reply for you. You can change this anytime.</Text>
        {APPS.map(app => {
          const isSelected = selectedApps.includes(app.id);
          return (
            <TouchableOpacity key={app.id} style={[styles.appCard, { backgroundColor: isSelected ? theme.colors.surfaceLight : theme.colors.surface, borderColor: isSelected ? app.color : theme.colors.border, borderWidth: isSelected ? 2 : 1 }]} onPress={() => toggleApp(app.id)} activeOpacity={0.8}>
              <View style={[styles.appIconContainer, { backgroundColor: app.color + '20' }]}><Text style={styles.appEmoji}>{app.emoji}</Text></View>
              <Text style={[styles.appLabel, { color: theme.colors.text }]}>{app.label}</Text>
              <Switch value={isSelected} onValueChange={() => toggleApp(app.id)} trackColor={{ false: theme.colors.border, true: app.color + '80' }} thumbColor={isSelected ? app.color : theme.colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>💡 Pro tip: Link at least one app for SilentMode to work its magic</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.colors.accent }]} onPress={handleContinue} disabled={loading} activeOpacity={0.8}>
          <Text style={[styles.continueText, { color: theme.colors.black }]}>{loading ? 'Saving...' : 'Continue'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('PickVibe')}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 40 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, marginBottom: 32, lineHeight: 24 },
  appCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 12 },
  appIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  appEmoji: { fontSize: 24 },
  appLabel: { flex: 1, fontSize: 18, fontWeight: '600' },
  hint: { fontSize: 14, textAlign: 'center', marginTop: 24, lineHeight: 20 },
  footer: { paddingBottom: 32 },
  continueButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 6 },
  continueText: { fontSize: 18, fontWeight: '700' },
  skipButton: { height: 44, justifyContent: 'center', alignItems: 'center' },
  skipText: { fontSize: 16 },
});