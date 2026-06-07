import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ReferralService from '../services/referralService';
import { useAppStore } from '../store/appStore';
import auth from '@react-native-firebase/auth';

export default function ReferralScreen() {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const [referralCode, setReferralCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    const code = await ReferralService.getReferralCode(userId);
    setReferralCode(code);
    const userStats = await ReferralService.getReferralStats(userId);
    setStats(userStats);
    const board = await ReferralService.getLeaderboard(10);
    setLeaderboard(board);
  };

  const handleShare = async () => {
    if (!referralCode) return;
    try {
      await Share.share({
        message: `Try SilentMode - the AI assistant that handles your texts when you're busy! Use my referral code "${referralCode}" when you sign up and we both get free VIP access! 🎉\n\nDownload: https://silentmode.app`,
        title: 'SilentMode Referral',
      });
    } catch (error) {}
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Refer & Earn</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Share SilentMode with friends and both get free VIP days!</Text>
      </View>

      {referralCode && (
        <View style={[styles.codeCard, { backgroundColor: theme.colors.accent }]}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.codeValue}>{referralCode}</Text>
          <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.colors.black }]} onPress={handleShare}>
            <Text style={styles.shareText}>📤 Share with Friends</Text>
          </TouchableOpacity>
        </View>
      )}

      {stats && (
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.colors.accent }]}>{stats.totalReferrals}</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Referrals</Text></View>
            <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.colors.accent }]}>{stats.successfulReferrals}</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Successful</Text></View>
            <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.colors.accent }]}>{stats.rewardsEarned}</Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Days Earned</Text></View>
          </View>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>🏆 Leaderboard</Text>
        {leaderboard.map((entry, index) => (
          <View key={index} style={styles.leaderRow}>
            <Text style={[styles.rank, { color: index < 3 ? theme.colors.accent : theme.colors.textSecondary }]}>#{index + 1}</Text>
            <Text style={[styles.name, { color: theme.colors.text }]}>{entry.email}</Text>
            <Text style={[styles.refs, { color: theme.colors.accent }]}>{entry.referrals} refs</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  codeCard: { padding: 32, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  codeLabel: { fontSize: 14, color: '#000', opacity: 0.7, marginBottom: 8 },
  codeValue: { fontSize: 36, fontWeight: '800', color: '#000', letterSpacing: 4, marginBottom: 20 },
  shareButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shareText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  statsCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  statsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  rank: { fontSize: 16, fontWeight: '700', width: 40 },
  name: { fontSize: 14, flex: 1 },
  refs: { fontSize: 14, fontWeight: '600' },
});