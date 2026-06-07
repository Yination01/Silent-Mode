import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/appStore';
import { selectionHaptic, successHaptic } from '../../utils/haptics';

const DEFAULT_TEMPLATES = [
  { id: 'meeting', label: 'In a meeting', text: "In a meeting right now. I'll call you back." },
  { id: 'driving', label: 'Driving', text: "Driving at the moment. Will reply when I stop." },
  { id: 'busy', label: 'Busy', text: "Tied up right now. Talk soon!" },
  { id: 'later', label: 'Will reply later', text: "Can't talk right now. I'll hit you up later." },
];

export default function TemplatesScreen() {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newText, setNewText] = useState('');
  const [showNew, setShowNew] = useState(false);

  const handleEdit = useCallback((template) => { selectionHaptic(); setEditing(template.id); setEditText(template.text); }, []);
  const handleSaveEdit = useCallback((id) => { successHaptic(); setTemplates(prev => prev.map(t => t.id === id ? { ...t, text: editText } : t)); setEditing(null); showToast('Template updated!', 'success'); }, [editText, showToast]);

  const handleAdd = useCallback(() => {
    if (!newLabel.trim() || !newText.trim()) { Alert.alert('Fill Fields', 'Please enter both label and text.'); return; }
    successHaptic();
    setTemplates(prev => [...prev, { id: `custom_${Date.now()}`, label: newLabel.trim(), text: newText.trim() }]);
    setNewLabel(''); setNewText(''); setShowNew(false);
    showToast('Template added!', 'success');
  }, [newLabel, newText, showToast]);

  const handleDelete = useCallback((id) => {
    Alert.alert('Delete Template', 'Remove this template?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setTemplates(prev => prev.filter(t => t.id !== id)); showToast('Template deleted', 'info'); } },
    ]);
  }, [showToast]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Reply Templates</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Quick replies for common situations</Text>
      </View>
      {templates.map((template) => (
        <View key={template.id} style={[styles.templateCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.templateLabel, { color: theme.colors.text }]}>{template.label}</Text>
          {editing === template.id ? (
            <View>
              <TextInput style={[styles.editInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} value={editText} onChangeText={setEditText} multiline />
              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.editButton, { borderColor: theme.colors.border }]} onPress={() => setEditing(null)}><Text style={[styles.editButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.accent }]} onPress={() => handleSaveEdit(template.id)}><Text style={[styles.editButtonText, { color: theme.colors.black }]}>Save</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.templateText, { color: theme.colors.textSecondary }]}>"{template.text}"</Text>
              <View style={styles.templateActions}>
                <TouchableOpacity onPress={() => handleEdit(template)}><Text style={[styles.actionText, { color: theme.colors.accent }]}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(template.id)}><Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={[styles.addButton, { borderColor: theme.colors.accent }]} onPress={() => setShowNew(!showNew)}>
        <Text style={[styles.addText, { color: theme.colors.accent }]}>{showNew ? 'Cancel' : '+ Add Template'}</Text>
      </TouchableOpacity>
      {showNew && (
        <View style={[styles.newForm, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} placeholder="Template name (e.g., 'At the gym')" placeholderTextColor={theme.colors.textSecondary} value={newLabel} onChangeText={setNewLabel} />
          <TextInput style={[styles.input, styles.textArea, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} placeholder="Reply text" placeholderTextColor={theme.colors.textSecondary} value={newText} onChangeText={setNewText} multiline />
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.accent }]} onPress={handleAdd}><Text style={[styles.saveText, { color: theme.colors.black }]}>Add Template</Text></TouchableOpacity>
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
  templateCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  templateLabel: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  templateText: { fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginBottom: 12 },
  templateActions: { flexDirection: 'row', gap: 16 },
  actionText: { fontSize: 14, fontWeight: '600' },
  editInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  editActions: { flexDirection: 'row', gap: 8 },
  editButton: { flex: 1, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600' },
  addButton: { height: 56, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  addText: { fontSize: 16, fontWeight: '600' },
  newForm: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '600' },
});