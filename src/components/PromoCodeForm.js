import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PROMO_TYPES = [
  { id: 'vip', label: 'VIP Days', emoji: '👑' },
  { id: 'premium', label: 'Premium Days', emoji: '💎' },
  { id: 'extend_days', label: 'Extend Days', emoji: '⏰' },
  { id: 'discount_percent', label: 'Discount %', emoji: '🏷️' },
  { id: 'discount_fixed', label: 'Discount $', emoji: '💰' },
];

export default function PromoCodeForm({ onSave, onCancel, theme: propTheme }) {
  const theme = propTheme || useTheme();
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('vip');
  const [value, setValue] = useState('30');
  const [maxUses, setMaxUses] = useState('100');
  const [expiryDate, setExpiryDate] = useState('');
  const [neverExpires, setNeverExpires] = useState(false);

  const handleSave = () => {
    if (!code.trim()) { alert('Please enter a promo code.'); return; }
    if (!value || parseInt(value) <= 0) { alert('Please enter a valid value.'); return; }

    onSave({
      code: code.trim(),
      description: description.trim(),
      type,
      value: parseInt(value),
      maxUses: parseInt(maxUses) || 100,
      expiresAt: neverExpires ? null : expiryDate || null,
      neverExpires,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create Promo Code</Text>
      
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Code</Text>
      <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} value={code} onChangeText={setCode} placeholder="e.g., LAUNCH2025" placeholderTextColor={theme.colors.textSecondary} autoCapitalize="characters" />

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (optional)</Text>
      <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} value={description} onChangeText={setDescription} placeholder="e.g., Launch week special" placeholderTextColor={theme.colors.textSecondary} />

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type</Text>
      <View style={styles.typeGrid}>
        {PROMO_TYPES.map(t => (
          <TouchableOpacity key={t.id} style={[styles.typeCard, { backgroundColor: type === t.id ? theme.colors.accent : theme.colors.surfaceLight }]} onPress={() => setType(t.id)}>
            <Text style={styles.typeEmoji}>{t.emoji}</Text>
            <Text style={[styles.typeLabel, { color: type === t.id ? theme.colors.black : theme.colors.text }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Value ({type.includes('discount') ? (type === 'discount_percent' ? '%' : '$') : 'Days'})</Text>
      <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} value={value} onChangeText={setValue} keyboardType="numeric" />

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Max Uses</Text>
      <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} value={maxUses} onChangeText={setMaxUses} keyboardType="numeric" />

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Never Expires</Text>
        <Switch value={neverExpires} onValueChange={setNeverExpires} trackColor={{ false: theme.colors.border, true: theme.colors.accent }} thumbColor={neverExpires ? theme.colors.accent : '#ccc'} />
      </View>

      {!neverExpires && (
        <>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Expiry Date (YYYY-MM-DD)</Text>
          <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} value={expiryDate} onChangeText={setExpiryDate} placeholder="2025-12-31" placeholderTextColor={theme.colors.textSecondary} />
        </>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.colors.border }]} onPress={onCancel}>
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.accent }]} onPress={handleSave}>
          <Text style={[styles.saveText, { color: theme.colors.black }]}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: { padding: 12, borderRadius: 12, alignItems: 'center', width: '30%' },
  typeEmoji: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  switchLabel: { fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '700' },
});