import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { addVipContact, removeVipContact } from '../../services/userService';
import firestore from '@react-native-firebase/firestore';
import { selectionHaptic, successHaptic } from '../../utils/haptics';
import { trackEvent, AnalyticsEvents } from '../../utils/analytics';
import { useAppStore } from '../../store/appStore';
import Logger from '../../utils/logger';
import auth from '@react-native-firebase/auth';
import EmptyState from '../../components/EmptyState';

export default function VipScreen({ navigation }) {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const [vipContacts, setVipContacts] = useState([]);
  const [newContact, setNewContact] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVipContacts(); }, []);

  const loadVipContacts = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) { setLoading(false); return; }
      const doc = await firestore().collection('users').doc(userId).get();
      setVipContacts(doc.data()?.vipContacts || []);
    } catch (error) { Logger.error('Failed to load VIP contacts', error); showToast('Failed to load VIP contacts', 'error'); }
    finally { setLoading(false); }
  };

  const handleAdd = useCallback(async () => {
    const contact = newContact.trim();
    if (!contact) { Alert.alert('Invalid Contact', 'Please enter a phone number or contact name.'); return; }
    if (vipContacts.includes(contact)) { Alert.alert('Duplicate', 'This contact is already in your VIP list.'); return; }
    selectionHaptic();
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    try {
      await addVipContact(userId, contact);
      setVipContacts(prev => [...prev, contact]);
      setNewContact('');
      trackEvent(AnalyticsEvents.VIP_ADDED);
      showToast(`${contact} added to VIPs ⭐`, 'success');
    } catch (error) { Logger.error('Failed to add VIP contact', error); showToast('Failed to add VIP contact', 'error'); }
  }, [newContact, vipContacts, showToast]);

  const handleRemove = useCallback((contact) => {
    Alert.alert('Remove VIP', `Remove ${contact} from VIP list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const userId = auth().currentUser?.uid;
        if (!userId) return;
        try {
          await removeVipContact(userId, contact);
          setVipContacts(prev => prev.filter(c => c !== contact));
          successHaptic();
          showToast(`${contact} removed from VIPs`, 'info');
        } catch (error) { Logger.error('Failed to remove VIP contact', error); showToast('Failed to remove VIP contact', 'error'); }
      }},
    ]);
  }, [showToast]);

  const handleContactPress = useCallback((contact) => {
    selectionHaptic();
    navigation.navigate('ContactDetail', { contactId: contact, contactName: contact });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity style={[styles.vipItem, { borderColor: theme.colors.border }]} onPress={() => handleContactPress(item)}>
      <View style={[styles.vipIconContainer, { backgroundColor: theme.colors.accent + '20' }]}><Text style={styles.vipEmoji}>⭐</Text></View>
      <Text style={[styles.vipName, { color: theme.colors.text }]} numberOfLines={1}>{item}</Text>
      <TouchableOpacity style={[styles.removeButton, { borderColor: theme.colors.error }]} onPress={() => handleRemove(item)}>
        <Text style={[styles.removeText, { color: theme.colors.error }]}>Remove</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [theme, handleRemove, handleContactPress]);

  const keyExtractor = useCallback((item, index) => index.toString(), []);
  const getItemLayout = useCallback((data, index) => ({ length: 60, offset: 60 * index, index }), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>VIP Contacts</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Messages from VIPs always reach you directly. No auto-reply, no delay.</Text>
      </View>
      <View style={styles.addSection}>
        <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} placeholder="Add phone number or contact name" placeholderTextColor={theme.colors.textSecondary} value={newContact} onChangeText={setNewContact} onSubmitEditing={handleAdd} returnKeyType="done" autoCorrect={false} />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.accent }]} onPress={handleAdd} activeOpacity={0.8}><Text style={[styles.addText, { color: theme.colors.black }]}>Add</Text></TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}><Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text></View>
      ) : vipContacts.length === 0 ? (
        <EmptyState emoji="👑" title="No VIPs yet" subtitle="Add contacts who should always reach you directly." />
      ) : (
        <FlatList data={vipContacts} keyExtractor={keyExtractor} renderItem={renderItem} getItemLayout={getItemLayout} contentContainerStyle={styles.listContent} ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />} />
      )}
      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}>
        <Text style={[styles.infoTitle, { color: theme.colors.accent }]}>💡 How VIP Works</Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>When a VIP messages you, SilentMode skips the auto-reply and notifies you immediately. Perfect for family, partners, or your boss!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  addSection: { flexDirection: 'row', marginBottom: 24, gap: 12 },
  input: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 16 },
  addButton: { height: 48, paddingHorizontal: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addText: { fontSize: 16, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  listContent: { flexGrow: 1 },
  vipItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  vipIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  vipEmoji: { fontSize: 20 },
  vipName: { flex: 1, fontSize: 16, fontWeight: '500' },
  removeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  removeText: { fontSize: 14, fontWeight: '600' },
  separator: { height: 1 },
  infoCard: { padding: 20, borderRadius: 16, borderWidth: 2, marginTop: 24 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 22 },
});