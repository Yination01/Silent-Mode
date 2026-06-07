import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, ScrollView, Animated, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_MODES } from '../../config/constants';
import { getModes, setMode, updateModeActive } from '../../services/userService';
import firestore from '@react-native-firebase/firestore';
import { selectionHaptic, successHaptic } from '../../utils/haptics';
import { trackEvent, AnalyticsEvents } from '../../utils/analytics';
import { useAppStore } from '../../store/appStore';
import Logger from '../../utils/logger';
import auth from '@react-native-firebase/auth';

export default function ModesScreen() {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const [modes, setModes] = useState(DEFAULT_MODES);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadModes(); }, []);
  useEffect(() => { Animated.timing(fadeAnim, { toValue: showCustom ? 1 : 0, duration: 300, useNativeDriver: true }).start(); }, [showCustom, fadeAnim]);

  const loadModes = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) return;
      const userModes = await getModes(userId);
      if (userModes.length > 0) { setModes(userModes); }
      else { await Promise.all(DEFAULT_MODES.map(mode => setMode(userId, mode.id, mode))); }
    } catch (error) { Logger.error('Failed to load modes', error); }
    finally { setLoading(false); }
  };

  const toggleMode = useCallback(async (modeId) => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    const currentMode = modes.find(m => m.id === modeId);
    const newActive = !currentMode?.active;
    selectionHaptic();
    setModes(prev => prev.map(m => ({ ...m, active: m.id === modeId ? newActive : false })));
    try {
      await updateModeActive(userId, modeId, newActive);
      if (newActive) { trackEvent(AnalyticsEvents.MODE_ACTIVATED, { mode: currentMode?.type }); showToast(`${currentMode?.name} activated`, 'success'); }
    } catch (error) {
      setModes(prev => prev.map(m => ({ ...m, active: m.id === modeId ? !newActive : false })));
      Logger.error('Failed to toggle mode', error);
      showToast('Failed to toggle mode', 'error');
    }
  }, [modes, showToast]);

  const addCustomMode = useCallback(async () => {
    if (!customName.trim() || !customMessage.trim()) { Alert.alert('Missing Fields', 'Please enter a mode name and auto-reply message.'); return; }
    successHaptic();
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    const newMode = { id: `custom_${Date.now()}`, name: customName.trim(), type: 'custom', autoMessage: customMessage.trim(), active: false, updatedAt: new Date() };
    try {
      await setMode(userId, newMode.id, newMode);
      setModes([...modes, newMode]);
      setCustomName(''); setCustomMessage(''); setShowCustom(false);
      showToast('Custom mode created! 🎉', 'success');
    } catch (error) { Logger.error('Failed to create custom mode', error); showToast('Failed to create mode', 'error'); }
  }, [customName, customMessage, modes, showToast]);

  const deleteMode = useCallback(async (modeId) => {
    Alert.alert('Delete Mode', 'Are you sure you want to delete this custom mode?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const userId = auth().currentUser?.uid;
        if (!userId) return;
        try {
          await firestore().collection('users').doc(userId).collection('modes').doc(modeId).delete();
          setModes(prev => prev.filter(m => m.id !== modeId));
          successHaptic();
          showToast('Mode deleted', 'info');
        } catch (error) { Logger.error('Failed to delete mode', error); showToast('Failed to delete mode', 'error'); }
      }},
    ]);
  }, [showToast]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Quick Modes</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Auto-reply modes for different situations. Only one active at a time.</Text>
      </View>
      {modes.map(mode => (
        <TouchableOpacity key={mode.id} style={[styles.modeCard, { backgroundColor: mode.active ? theme.colors.surfaceLight : theme.colors.surface, borderColor: mode.active ? (mode.color || theme.colors.accent) : theme.colors.border, borderWidth: mode.active ? 2 : 1 }]} onPress={() => toggleMode(mode.id)} activeOpacity={0.8}>
          <View style={styles.modeHeader}>
            <View style={styles.modeTitleRow}>{mode.icon && <Text style={styles.modeIcon}>{mode.icon}</Text>}<Text style={[styles.modeName, { color: theme.colors.text }]}>{mode.name}</Text></View>
            <Switch value={mode.active} onValueChange={() => toggleMode(mode.id)} trackColor={{ false: theme.colors.border, true: mode.color || theme.colors.accent }} thumbColor={mode.active ? (mode.color || theme.colors.accent) : theme.colors.textSecondary} />
          </View>
          <Text style={[styles.modeMessage, { color: theme.colors.textSecondary }]}>"{mode.autoMessage}"</Text>
          {mode.type === 'custom' && <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMode(mode.id)}><Text style={[styles.deleteText, { color: theme.colors.error }]}>Delete</Text></TouchableOpacity>}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.addButton, { borderColor: theme.colors.accent }]} onPress={() => setShowCustom(!showCustom)} activeOpacity={0.8}>
        <Text style={[styles.addButtonText, { color: theme.colors.accent }]}>{showCustom ? 'Cancel' : '+ Create Custom Mode'}</Text>
      </TouchableOpacity>
      {showCustom && (
        <Animated.View style={[styles.customForm, { backgroundColor: theme.colors.surface, opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Custom Mode</Text>
          <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} placeholder="Mode name (e.g., 'In a Meeting')" placeholderTextColor={theme.colors.textSecondary} value={customName} onChangeText={setCustomName} maxLength={50} />
          <TextInput style={[styles.input, styles.textArea, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} placeholder="Auto-reply message" placeholderTextColor={theme.colors.textSecondary} value={customMessage} onChangeText={setCustomMessage} multiline numberOfLines={4} maxLength={200} />
          <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>{customMessage.length}/200</Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.accent }]} onPress={addCustomMode} activeOpacity={0.8}><Text style={[styles.saveText, { color: theme.colors.black }]}>Save Custom Mode</Text></TouchableOpacity>
        </Animated.View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  modeCard: { padding: 20, borderRadius: 16, marginBottom: 12 },
  modeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modeTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modeIcon: { fontSize: 24, marginRight: 12 },
  modeName: { fontSize: 18, fontWeight: '600' },
  modeMessage: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  deleteButton: { marginTop: 12, alignSelf: 'flex-end' },
  deleteText: { fontSize: 14, fontWeight: '600' },
  addButton: { height: 56, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 24 },
  addButtonText: { fontSize: 16, fontWeight: '600' },
  customForm: { padding: 20, borderRadius: 16, marginBottom: 24 },
  formTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, textAlign: 'right', marginBottom: 16 },
  saveButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '600' },
});