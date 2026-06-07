import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { URLS } from '../../config/constants';

export default function PrivacyScreen() {
  const theme = useTheme();

  const handleEmail = async (email) => {
    const url = `mailto:${email}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) { await Linking.openURL(url); }
      else { Alert.alert('Email Us', `Please email us at ${email}`); }
    } catch (error) { Alert.alert('Email Us', `Please email us at ${email}`); }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}><Text style={[styles.title, { color: theme.colors.text }]}>Your Privacy Matters</Text><Text style={[styles.subtitle, { color: theme.colors.accent }]}>SilentMode is built with privacy as a core principle.</Text></View>
      <PrivacyCard emoji="🔒" title="Zero Message Storage" text="Your messages are processed in real-time and immediately discarded. We never store, read, or analyze your conversations." theme={theme} accent />
      <PrivacyCard emoji="📊" title="What We Actually Store" text="• Your email (for login)\n• Your tone preference\n• Your VIP list\n• Your mode settings\n• Anonymous usage counters\n\nThat's it. No message history. No contacts." theme={theme} />
      <PrivacyCard emoji="🤖" title="How AI Processing Works" text="1. Your phone detects notification\n2. Sender & text sent to API\n3. AI generates reply (2-3 sec)\n4. Reply sent to your phone\n5. Everything deleted from memory\n\nEncrypted with HTTPS throughout." theme={theme} />
      <PrivacyCard emoji="💰" title="How We Make Money" text="We don't. SilentMode is 100% free. We use only free cloud tiers. Some users choose to buy us a coffee - entirely optional." theme={theme} />
      <PrivacyCard emoji="🔓" title="Open Source" text="Every line of code is public on GitHub. Verify our privacy claims yourself. No hidden functionality." theme={theme}>
        <TouchableOpacity style={[styles.linkButton, { borderColor: theme.colors.accent }]} onPress={() => Linking.openURL(URLS.GITHUB_REPO)}><Text style={[styles.linkText, { color: theme.colors.accent }]}>View Source Code →</Text></TouchableOpacity>
      </PrivacyCard>
      <PrivacyCard emoji="🗑️" title="Delete Your Data" text="Delete your account and every trace disappears. Settings → Delete Account." theme={theme} />
      <PrivacyCard emoji="📱" title="Permissions Explained" text="• Notification Access: Read incoming messages\n• Overlay: Show approve/skip popup\n• Contacts: VIP identification only\n• Accessibility: Auto-paste replies (Android)" theme={theme} />
      <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>Last updated: June 2025</Text>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

function PrivacyCard({ emoji, title, text, children, theme, accent }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: accent ? theme.colors.accent : theme.colors.border }]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={[styles.cardTitle, { color: accent ? theme.colors.accent : theme.colors.text }]}>{title}</Text>
      <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>{text}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  card: { padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardEmoji: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  cardText: { fontSize: 15, lineHeight: 24 },
  linkButton: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  linkText: { fontSize: 16, fontWeight: '600' },
  lastUpdated: { fontSize: 12, textAlign: 'center', lineHeight: 20, marginTop: 32 },
});