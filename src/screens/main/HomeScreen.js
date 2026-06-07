import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNetwork } from '../../context/NetworkContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DraftCard from '../../components/DraftCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import NetworkStatus from '../../components/NetworkStatus';
import { successHaptic, impactHaptic } from '../../utils/haptics';
import { trackEvent, AnalyticsEvents } from '../../utils/analytics';
import { useAppStore } from '../../store/appStore';
import Logger from '../../utils/logger';

export default function HomeScreen() {
  const theme = useTheme();
  const { isConnected } = useNetwork();
  const showToast = useAppStore((state) => state.showToast);
  const incrementStats = useAppStore((state) => state.incrementStats);
  const [drafts, setDrafts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isConnected) { loadDrafts(); } }, [isConnected]);

  const loadDrafts = useCallback(async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) return;
      const snapshot = await firestore().collection('users').doc(userId).collection('draftLogs').orderBy('createdAt', 'desc').limit(20).get();
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { Logger.error('Failed to load drafts', error); showToast('Failed to load drafts', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadDrafts(); setRefreshing(false); }, [loadDrafts]);

  const handleApprove = useCallback(async (draftId) => {
    successHaptic();
    try {
      const userId = auth().currentUser?.uid;
      await firestore().collection('users').doc(userId).collection('draftLogs').doc(draftId).update({ status: 'sent' });
      setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'sent' } : d));
      incrementStats('totalDraftsApproved');
      trackEvent(AnalyticsEvents.DRAFT_APPROVED);
      showToast('Reply sent! ✅', 'success');
    } catch (error) { Logger.error('Failed to approve draft', error); showToast('Failed to send reply', 'error'); }
  }, [showToast, incrementStats]);

  const handleSkip = useCallback(async (draftId) => {
    impactHaptic();
    try {
      const userId = auth().currentUser?.uid;
      await firestore().collection('users').doc(userId).collection('draftLogs').doc(draftId).update({ status: 'skipped' });
      setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'skipped' } : d));
      incrementStats('totalDraftsSkipped');
      trackEvent(AnalyticsEvents.DRAFT_SKIPPED);
      showToast('Reply skipped', 'info');
    } catch (error) { Logger.error('Failed to skip draft', error); showToast('Failed to skip', 'error'); }
  }, [showToast, incrementStats]);

  const handleEdit = useCallback((draftId) => { impactHaptic(); showToast('Edit feature coming soon!', 'info'); }, [showToast]);

  const renderItem = useCallback(({ item }) => <DraftCard draft={item} onApprove={() => handleApprove(item.id)} onSkip={() => handleSkip(item.id)} onEdit={() => handleEdit(item.id)} />, [handleApprove, handleSkip, handleEdit]);
  const keyExtractor = useCallback((item) => item.id, []);
  const getItemLayout = useCallback((data, index) => ({ length: 250, offset: 250 * index, index }), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <NetworkStatus />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>SilentMode</Text>
        <Text style={[styles.subtitle, { color: theme.colors.accent }]}>{isConnected ? 'Your anxiety shield is active 🛡️' : 'Offline mode - Waiting for connection'}</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>{[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={200} style={styles.skeleton} />)}</View>
      ) : drafts.length === 0 ? (
        <EmptyState emoji="😌" title="No anxiety here yet" subtitle="When messages come in, SilentMode will draft replies for you" />
      ) : (
        <FlatList data={drafts} keyExtractor={keyExtractor} renderItem={renderItem} getItemLayout={getItemLayout} removeClippedSubviews={true} maxToRenderPerBatch={10} windowSize={5} initialNumToRender={5} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} colors={[theme.colors.accent]} />} contentContainerStyle={styles.listContent} ListFooterComponent={<View style={{ height: 32 }} />} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '600' },
  loadingContainer: { paddingHorizontal: 24 },
  skeleton: { marginBottom: 16, borderRadius: 12 },
  listContent: { paddingHorizontal: 24 },
});