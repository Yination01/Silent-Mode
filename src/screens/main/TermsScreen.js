import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { URLS } from '../../config/constants';

export default function TermsScreen() {
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
      <View style={styles.header}><Text style={[styles.title, { color: theme.colors.text }]}>Terms of Service</Text><Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Simple, human-readable terms.</Text></View>
      <TermsCard title="1. What SilentMode Does" text="SilentMode is an AI assistant that reads your incoming notifications and suggests auto-replies. You always approve or skip every reply." theme={theme} />
      <TermsCard title="2. Your Responsibilities" text="• Review AI replies before sending\n• Don't use for spam or harassment\n• Comply with WhatsApp/Google terms\n• Keep your account secure" theme={theme} />
      <TermsCard title="3. Service Availability" text='SilentMode is provided "as is" without warranties. We strive for 99% uptime but cannot guarantee uninterrupted service. Always review AI replies before sending.' theme={theme} />
      <TermsCard title="4. Free Service" text="SilentMode is and will always be free. Core features remain free forever. Optional premium features may be offered in the future." theme={theme} />
      <TermsCard title="5. Limitation of Liability" text="We are not liable for damages from miscommunication caused by AI-generated replies. Use at your own discretion." theme={theme} />
      <TermsCard title="6. Termination" text="You may stop using SilentMode anytime. We may terminate accounts that violate these terms." theme={theme} />
      <TermsCard title="7. Changes" text="We may update these terms. Significant changes will be notified via the app." theme={theme} />
      <TermsCard title="8. Contact" text="Questions? Reach out:" theme={theme}>
        <TouchableOpacity style={[styles.linkButton, { borderColor: theme.colors.accent }]} onPress={() => handleEmail(URLS.LEGAL_EMAIL)}><Text style={[styles.linkText, { color: theme.colors.accent }]}>legal@silentmode.app →</Text></TouchableOpacity>
      </TermsCard>
      <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>Last updated: June 2025</Text>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

function TermsCard({ title, text, children, theme }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>{text}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  card: { padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  cardText: { fontSize: 15, lineHeight: 24 },
  linkButton: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  linkText: { fontSize: 16, fontWeight: '600' },
  lastUpdated: { fontSize: 12, textAlign: 'center', lineHeight: 20, marginTop: 32 },
});