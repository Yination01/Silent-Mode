import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { signInWithEmail } from '../../services/authService';
import AdminService from '../../services/adminService';
import Logger from '../../utils/logger';

export default function AdminLoginScreen({ navigation }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      const isSuperUser = await AdminService.isSuperUser();
      if (isSuperUser) {
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      } else {
        Alert.alert('Access Denied', 'This account does not have admin privileges.');
        await auth().signOut();
      }
    } catch (error) {
      Logger.error('Admin login failed', error);
      Alert.alert('Login Failed', error.message);
    } finally { setLoading(false); }
  }, [email, password, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🛡️</Text>
        <Text style={[styles.title, { color: theme.colors.accent }]}>Admin Login</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Superuser access only</Text>
      </View>
      <View style={styles.form}>
        <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="Admin Email" placeholderTextColor={theme.colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="Password" placeholderTextColor={theme.colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.accent }]} onPress={handleAdminLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={[styles.buttonText, { color: theme.colors.black }]}>Access Admin Panel</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32 },
  header: { alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { width: '100%' },
  input: { width: '100%', height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  button: { width: '100%', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '700' },
});