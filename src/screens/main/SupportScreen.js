import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { openBuyMeCoffee, openGitHubSponsors } from '../../services/paymentService';
import { selectionHaptic } from '../../utils/haptics';
import { trackEvent, AnalyticsEvents } from '../../utils/analytics';
import { useAppStore } from '../../store/appStore';

const COFFEE_OPTIONS = [
  { id: 'small', amount: 3, emoji: '☕', label: 'Small Coffee', description: 'Covers 1,500 AI replies' },
  { id: 'medium', amount: 5, emoji: '🫗', label: 'Medium Latte', description: 'Covers 2,500 AI replies' },
  { id: 'large', amount: 10, emoji: '☕️', label: 'Large Cappuccino', description: 'Covers 5,000 AI replies' },
  { id: 'custom', amount: null, emoji: '💝', label: 'Custom Amount', description: 'Every bit helps keep us free' },
];

export default function SupportScreen() {
  const theme = useTheme();
  const showToast = useAppStore((state) => state.showToast);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleBuyCoffee = useCallback(async (amount) => {
    selectionHaptic();
    const finalAmount = amount || parseFloat(customAmount);
    if (!finalAmount || finalAmount < 1) { Alert.alert('Minimum $1', 'Coffee starts at $1 minimum to cover processing fees.'); return; }
    try {
      await openBuyMeCoffee(finalAmount);
      trackEvent(AnalyticsEvents.COFFEE_BOUGHT, { amount: finalAmount });
      showToast('Thank you! Redirecting... 💚', 'success');
    } catch (error) { showToast('Could not open payment page', 'error'); }
  }, [customAmount, showToast]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>💚</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Support SilentMode</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>SilentMode is 100% free and open source. No ads, no data selling, no investors.{'\n\n'}Help us keep it that way by buying us a coffee!</Text>
      </View>
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.accent }]}>🌱 How Your Support Helps</Text>
        <StatItem emoji="🤖" label="AI API Costs" value="~$0.002 per reply" theme={theme} />
        <StatItem emoji="☁️" label="Server Costs" value="$0/month (free tiers)" theme={theme} />
        <StatItem emoji="❤️" label="Funding Model" value="100% community-funded" theme={theme} />
        <StatItem emoji="🔒" label="Privacy First" value="We never sell your data" theme={theme} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Buy us a coffee ☕</Text>
      {COFFEE_OPTIONS.map((option) => (
        <TouchableOpacity key={option.id} style={[styles.coffeeCard, { backgroundColor: selectedAmount === option.id ? theme.colors.surfaceLight : theme.colors.surface, borderColor: selectedAmount === option.id ? theme.colors.accent : theme.colors.border, borderWidth: selectedAmount === option.id ? 2 : 1 }]} onPress={() => { setSelectedAmount(option.id); if (option.id !== 'custom') handleBuyCoffee(option.amount); }} activeOpacity={0.8}>
          <View style={styles.coffeeHeader}>
            <Text style={styles.coffeeEmoji}>{option.emoji}</Text>
            <View style={styles.coffeeInfo}><Text style={[styles.coffeeLabel, { color: theme.colors.text }]}>{option.label}</Text><Text style={[styles.coffeeDesc, { color: theme.colors.textSecondary }]}>{option.description}</Text></View>
            {option.amount && <View style={[styles.amountBadge, { backgroundColor: theme.colors.accent + '20' }]}><Text style={[styles.coffeeAmount, { color: theme.colors.accent }]}>${option.amount}</Text></View>}
          </View>
          {option.id === 'custom' && selectedAmount === 'custom' && (
            <View style={styles.customSection}>
              <TextInput style={[styles.customInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} placeholder="Enter amount ($)" placeholderTextColor={theme.colors.textSecondary} keyboardType="decimal-pad" value={customAmount} onChangeText={setCustomAmount} />
              <TouchableOpacity style={[styles.customButton, { backgroundColor: theme.colors.accent }]} onPress={() => handleBuyCoffee(null)} activeOpacity={0.8}><Text style={[styles.customButtonText, { color: theme.colors.black }]}>Buy Coffee</Text></TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      ))}
      <View style={[styles.otherWays, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.otherTitle, { color: theme.colors.text }]}>Other Ways to Support</Text>
        <SupportOption emoji="⭐" label="GitHub Sponsors" description="Monthly sponsorship for developers" onPress={() => { selectionHaptic(); openGitHubSponsors(); }} theme={theme} />
        <SupportOption emoji="📢" label="Spread the Word" description="Share SilentMode with friends" onPress={() => { selectionHaptic(); }} theme={theme} />
        <SupportOption emoji="💻" label="Contribute Code" description="We're open source! PRs welcome" onPress={() => { selectionHaptic(); Linking.openURL('https://github.com/silentmodeapp/silentmode'); }} theme={theme} />
      </View>
      <View style={styles.footer}><Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Thank you for being part of the SilentMode community 💚</Text></View>
    </ScrollView>
  );
}

function StatItem({ emoji, label, value, theme }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <View style={styles.statContent}><Text style={[styles.statLabel, { color: theme.colors.text }]}>{label}</Text><Text style={[styles.statValue, { color: theme.colors.textSecondary }]}>{value}</Text></View>
    </View>
  );
}

function SupportOption({ emoji, label, description, onPress, theme }) {
  return (
    <TouchableOpacity style={[styles.supportOption, { borderColor: theme.colors.border }]} onPress={onPress}>
      <Text style={styles.supportEmoji}>{emoji}</Text>
      <View style={styles.supportInfo}><Text style={[styles.supportLabel, { color: theme.colors.text }]}>{label}</Text><Text style={[styles.supportDesc, { color: theme.colors.textSecondary }]}>{description}</Text></View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 },
  statsCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  statsTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  statItem: { flexDirection: 'row', marginBottom: 16 },
  statEmoji: { fontSize: 24, marginRight: 12, width: 32 },
  statContent: { flex: 1 },
  statLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  coffeeCard: { padding: 20, borderRadius: 16, marginBottom: 12 },
  coffeeHeader: { flexDirection: 'row', alignItems: 'center' },
  coffeeEmoji: { fontSize: 36, marginRight: 16 },
  coffeeInfo: { flex: 1 },
  coffeeLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  coffeeDesc: { fontSize: 14, lineHeight: 20 },
  amountBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  coffeeAmount: { fontSize: 20, fontWeight: '700' },
  customSection: { marginTop: 16 },
  customInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 18, marginBottom: 12, fontWeight: '600' },
  customButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  customButtonText: { fontSize: 16, fontWeight: '700' },
  otherWays: { padding: 20, borderRadius: 16, borderWidth: 1, marginTop: 24, marginBottom: 24 },
  otherTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  supportOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  supportEmoji: { fontSize: 28, marginRight: 16 },
  supportInfo: { flex: 1 },
  supportLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  supportDesc: { fontSize: 14 },
  footer: { alignItems: 'center', paddingVertical: 32 },
  footerText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});