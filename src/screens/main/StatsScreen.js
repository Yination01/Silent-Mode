import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import StatsService from '../../services/statsService';
import { selectionHaptic } from '../../utils/haptics';
import { useAppStore } from '../../store/appStore';

export default function StatsScreen() {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const data = await StatsService.getStats();
    setStats(data);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await StatsService.syncStats();
    await loadStats();
    setRefreshing(false);
  }, []);

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading your stats...</Text>
      </View>
    );
  }

  const timeSaved = StatsService.calculateTimeSaved(stats);
  const mostActiveMode = StatsService.calculateMostActiveMode(stats);
  const approvalRate = stats.totalMessagesProcessed > 0 ? Math.round((stats.totalDraftsApproved / stats.totalMessagesProcessed) * 100) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your Stats</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>See how much time SilentMode has saved you</Text>
      </View>
      <View style={styles.periodSelector}>
        {[{ key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'all', label: 'All Time' }].map(({ key, label }) => (
          <TouchableOpacity key={key} style={[styles.periodButton, { backgroundColor: selectedPeriod === key ? theme.colors.accent : theme.colors.surface }]} onPress={() => { selectionHaptic(); setSelectedPeriod(key); }}>
            <Text style={[styles.periodText, { color: selectedPeriod === key ? theme.colors.black : theme.colors.textSecondary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.heroCard, { backgroundColor: theme.colors.accent }]}>
        <Text style={styles.heroEmoji}>⏱️</Text>
        <Text style={styles.heroTitle}>Time Saved</Text>
        <Text style={styles.heroValue}>{timeSaved.hours > 0 ? `${timeSaved.hours}h ` : ''}{timeSaved.minutes}m</Text>
        <Text style={styles.heroSubtext}>{timeSaved.totalReplies} replies handled</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={styles.statEmoji}>✅</Text><Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalDraftsApproved || 0}</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Approved</Text></View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={styles.statEmoji}>⏭️</Text><Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalDraftsSkipped || 0}</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Skipped</Text></View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={styles.statEmoji}>📨</Text><Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalMessagesProcessed || 0}</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Processed</Text></View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={styles.statEmoji}>📊</Text><Text style={[styles.statValue, { color: theme.colors.text }]}>{approvalRate}%</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Approval Rate</Text></View>
      </View>
      {mostActiveMode && (
        <View style={[styles.insightCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}>
          <Text style={styles.insightEmoji}>💡</Text>
          <View style={styles.insightContent}><Text style={[styles.insightTitle, { color: theme.colors.accent }]}>Your Top Mode</Text><Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>{mostActiveMode} is your most-used mode.</Text></View>
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
  loadingText: { fontSize: 16, textAlign: 'center', marginTop: 100 },
  periodSelector: { flexDirection: 'row', marginBottom: 24, gap: 8 },
  periodButton: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  periodText: { fontSize: 14, fontWeight: '600' },
  heroCard: { padding: 32, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 },
  heroValue: { fontSize: 48, fontWeight: '800', color: '#000000' },
  heroSubtext: { fontSize: 14, color: '#000000', opacity: 0.8, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  insightCard: { flexDirection: 'row', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12, alignItems: 'flex-start' },
  insightEmoji: { fontSize: 28, marginRight: 16 },
  insightContent: { flex: 1 },
  insightTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  insightText: { fontSize: 14, lineHeight: 20 },
});