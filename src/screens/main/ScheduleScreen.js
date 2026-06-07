import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/appStore';
import { selectionHaptic, successHaptic } from '../../utils/haptics';

const DAYS = [
  { id: 'monday', label: 'Mon' }, { id: 'tuesday', label: 'Tue' }, { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' }, { id: 'friday', label: 'Fri' }, { id: 'saturday', label: 'Sat' }, { id: 'sunday', label: 'Sun' },
];

const MODES = [
  { id: 'focus', label: 'Focus Mode', emoji: '🎯' },
  { id: 'social_battery_low', label: 'Social Battery Low', emoji: '🔋' },
  { id: 'sleep', label: 'Sleep Mode', emoji: '😴' },
];

export default function ScheduleScreen() {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const scheduledModes = useAppStore((state) => state.scheduledModes);
  const addScheduledMode = useAppStore((state) => state.addScheduledMode);
  const removeScheduledMode = useAppStore((state) => state.removeScheduledMode);
  const [showNew, setShowNew] = useState(false);
  const [selectedMode, setSelectedMode] = useState(MODES[0].id);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const toggleDay = useCallback((dayId) => { selectionHaptic(); setSelectedDays(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]); }, []);

  const handleSave = useCallback(() => {
    if (selectedDays.length === 0) { Alert.alert('Select Days', 'Please select at least one day.'); return; }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) { Alert.alert('Invalid Time', 'Please use HH:MM format (e.g., 09:00, 14:30).'); return; }
    successHaptic();
    addScheduledMode({ id: `schedule_${Date.now()}`, modeId: selectedMode, days: selectedDays, startTime, endTime, enabled: true });
    setShowNew(false); setSelectedDays([]);
    showToast('Schedule created!', 'success');
  }, [selectedMode, selectedDays, startTime, endTime, addScheduledMode, showToast]);

  const handleDelete = useCallback((id) => {
    Alert.alert('Delete Schedule', 'Remove this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeScheduledMode(id); showToast('Schedule removed', 'info'); } },
    ]);
  }, [removeScheduledMode, showToast]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Scheduled Modes</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Automatically enable modes at specific times</Text>
      </View>
      {scheduledModes.map((schedule) => {
        const mode = MODES.find(m => m.id === schedule.modeId);
        return (
          <View key={schedule.id} style={[styles.scheduleCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleEmoji}>{mode?.emoji}</Text>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleMode, { color: theme.colors.text }]}>{mode?.label || 'Unknown'}</Text>
                <Text style={[styles.scheduleTime, { color: theme.colors.textSecondary }]}>{schedule.startTime} - {schedule.endTime}</Text>
                <Text style={[styles.scheduleDays, { color: theme.colors.textSecondary }]}>{schedule.days.map(d => d.substring(0, 3)).join(', ')}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.deleteButton, { borderColor: theme.colors.error }]} onPress={() => handleDelete(schedule.id)}>
              <Text style={[styles.deleteText, { color: theme.colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      {scheduledModes.length === 0 && (
        <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🕐</Text><Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No schedules yet. Create one to auto-enable modes.</Text></View>
      )}
      <TouchableOpacity style={[styles.addButton, { borderColor: theme.colors.accent }]} onPress={() => setShowNew(!showNew)}>
        <Text style={[styles.addText, { color: theme.colors.accent }]}>{showNew ? 'Cancel' : '+ Add Schedule'}</Text>
      </TouchableOpacity>
      {showNew && (
        <View style={[styles.newForm, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>New Schedule</Text>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mode</Text>
          <View style={styles.modeSelector}>
            {MODES.map((mode) => (
              <TouchableOpacity key={mode.id} style={[styles.modeOption, { backgroundColor: selectedMode === mode.id ? theme.colors.accent : theme.colors.surfaceLight }]} onPress={() => setSelectedMode(mode.id)}>
                <Text style={styles.modeEmoji}>{mode.emoji}</Text><Text style={[styles.modeLabel, { color: selectedMode === mode.id ? theme.colors.black : theme.colors.text }]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Days</Text>
          <View style={styles.daySelector}>
            {DAYS.map((day) => (
              <TouchableOpacity key={day.id} style={[styles.dayOption, { backgroundColor: selectedDays.includes(day.id) ? theme.colors.accent : theme.colors.surfaceLight }]} onPress={() => toggleDay(day.id)}>
                <Text style={[styles.dayText, { color: selectedDays.includes(day.id) ? theme.colors.black : theme.colors.textSecondary }]}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.timeRow}>
            <View style={styles.timeField}><Text style={[styles.label, { color: theme.colors.textSecondary }]}>Start</Text><TextInput style={[styles.timeInput, { color: theme.colors.text, borderColor: theme.colors.border }]} value={startTime} onChangeText={setStartTime} placeholder="09:00" placeholderTextColor={theme.colors.textSecondary} /></View>
            <View style={styles.timeField}><Text style={[styles.label, { color: theme.colors.textSecondary }]}>End</Text><TextInput style={[styles.timeInput, { color: theme.colors.text, borderColor: theme.colors.border }]} value={endTime} onChangeText={setEndTime} placeholder="17:00" placeholderTextColor={theme.colors.textSecondary} /></View>
          </View>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.accent }]} onPress={handleSave}><Text style={[styles.saveText, { color: theme.colors.black }]}>Save Schedule</Text></TouchableOpacity>
        </View>
      )}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  scheduleCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center' },
  scheduleEmoji: { fontSize: 32, marginRight: 16 },
  scheduleInfo: { flex: 1 },
  scheduleMode: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  scheduleTime: { fontSize: 14, marginBottom: 2 },
  scheduleDays: { fontSize: 13 },
  deleteButton: { marginTop: 12, alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  deleteText: { fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  addButton: { height: 56, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  addText: { fontSize: 16, fontWeight: '600' },
  newForm: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  formTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 16 },
  modeSelector: { flexDirection: 'row', gap: 8 },
  modeOption: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  modeEmoji: { fontSize: 24, marginBottom: 4 },
  modeLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  daySelector: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 13, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeField: { flex: 1 },
  timeInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, textAlign: 'center' },
  saveButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveText: { fontSize: 16, fontWeight: '600' },
});