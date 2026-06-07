// Add state:
const [referralCode, setReferralCode] = useState('');

// Add to handleSignUp:
await signUpWithEmail(email.trim(), password, referralCode.trim() || null);

// Add referral code input above the sign up button:
<TextInput
  style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
  placeholder="Referral Code (optional)"
  placeholderTextColor={theme.colors.textSecondary}
  value={referralCode}
  onChangeText={setReferralCode}
  autoCapitalize="characters"
  editable={!loading}
/>