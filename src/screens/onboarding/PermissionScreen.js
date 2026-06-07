import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { completeOnboarding } from '../../services/userService';
import PermissionService from '../../services/permissionService';
import { successHaptic, impactHaptic } from '../../utils/haptics';
import { trackEvent, AnalyticsEvents } from '../../utils/analytics';
import { navigationRef } from '../../utils/navigationRef';
import Logger from '../../utils/logger';
import auth from '@react-native-firebase/auth';

export default function PermissionsScreen() {
  const theme = useTheme();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [grantedCount, setGrantedCount] = useState(0);
  const [totalRequired, setTotalRequired] = useState(0);

  useEffect(() => {
    loadPermissionStatus();
  }, []);

  const loadPermissionStatus = async () => {
    const status = await PermissionService.checkAllPermissions();
    setPermissions(status);
    
    const perms = Platform.OS === 'android' ? PermissionService.PERMISSIONS.android : PermissionService.PERMISSIONS.ios;
    const required = Object.values(perms).filter(p => p.required).length;
    const granted = Object.entries(status).filter(([key, val]) => {
      const perm = perms[key];
      return perm?.required && val;
    }).length;
    
    setTotalRequired(required);
    setGrantedCount(granted);
  };

  const handleGrantPermission = useCallback(async (permissionKey) => {
    impactHaptic();
    const result = await PermissionService.requestPermission(permissionKey);
    await loadPermissionStatus();
    
    if (result) {
      Alert.alert('Permission Granted ✅', `${PermissionService.PERMISSIONS.android[permissionKey]?.name || 'Permission'} has been enabled.`);
    }
  }, []);

  const handleGrantAll = useCallback(async () => {
    impactHaptic();
    
    if (Platform.OS === 'android') {
      Alert.alert(
        'Setup Permissions',
        'SilentMode needs a few permissions to work:\n\n1. Notification Access - to read messages\n2. Overlay - to show reply popup\n3. Accessibility (optional) - to auto-send\n\nYou\'ll be guided through each one.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Setup', onPress: async () => {
            const perms = PermissionService.PERMISSIONS.android;
            const requiredPerms = Object.entries(perms).filter(([_, p]) => p.required);
            
            for (const [key, perm] of requiredPerms) {
              await new Promise(resolve => setTimeout(resolve, 500));
              await handleGrantPermission(key);
            }
            
            await loadPermissionStatus();
          }},
        ]
      );
    } else {
      Alert.alert('iOS Setup', 'Go to Settings → Notifications → SilentMode to enable notifications.', [{ text: 'OK' }]);
    }
  }, [handleGrantPermission]);

  const handleFinish = useCallback(async () => {
    const missing = await PermissionService.getMissingPermissions();
    
    if (missing.length > 0) {
      const missingNames = missing.map(m => m.name).join(', ');
      Alert.alert(
        'Missing Permissions',
        `SilentMode works best with these permissions: ${missingNames}\n\nYou can grant them later in Settings.`,
        [
          { text: 'Grant Now', onPress: handleGrantAll },
          { text: 'Skip for Now', onPress: completeSetup },
        ]
      );
    } else {
      await completeSetup();
    }
  }, [handleGrantAll]);

  const completeSetup = async () => {
    successHaptic();
    setLoading(true);
    try {
      const userId = auth().currentUser?.uid;
      if (userId) {
        await completeOnboarding(userId);
        trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED);
        if (navigationRef.isReady()) {
          navigationRef.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
      }
    } catch (error) {
      Logger.error('Failed to complete onboarding', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  };

  const perms = Platform.OS === 'android' ? PermissionService.PERMISSIONS.android : PermissionService.PERMISSIONS.ios;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.progress}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.progressDot, { backgroundColor: theme.colors.accent }]} />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Almost done! 🎉
        </Text>
        
        <View style={[styles.progressCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}>
          <Text style={[styles.progressText, { color: theme.colors.accent }]}>
            {grantedCount}/{totalRequired} permissions granted
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.colors.accent, width: `${totalRequired > 0 ? (grantedCount / totalRequired) * 100 : 0}%` }]} />
          </View>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          SilentMode needs these permissions to draft replies without opening the app. Your privacy is protected - we never store your messages.
        </Text>

        <View style={[styles.privacyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}>
          <Text style={[styles.privacyTitle, { color: theme.colors.accent }]}>
            🛡️ Privacy Promise
          </Text>
          <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
            • Messages processed in real-time only{'\n'}
            • Nothing stored on our servers{'\n'}
            • Your data stays on your device{'\n'}
            • No one else can read your messages{'\n'}
            • Contacts are never uploaded
          </Text>
        </View>

        <View style={styles.permissionList}>
          {Object.entries(perms).map(([key, perm]) => {
            const isGranted = permissions[key] || false;
            const isRequired = perm.required;
            
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.permissionItem,
                  {
                    backgroundColor: isGranted ? theme.colors.surfaceLight : theme.colors.surface,
                    borderColor: isGranted ? theme.colors.accent : theme.colors.border,
                    borderWidth: isGranted ? 2 : 1,
                  },
                ]}
                onPress={() => !isGranted && handleGrantPermission(key)}
                disabled={isGranted}
              >
                <View style={styles.permissionLeft}>
                  <Text style={styles.permissionEmoji}>
                    {isGranted ? '✅' : isRequired ? '🔴' : '🟡'}
                  </Text>
                  <View style={styles.permissionInfo}>
                    <Text style={[styles.permissionName, { color: theme.colors.text }]}>
                      {perm.name}
                      {isRequired && <Text style={[styles.requiredBadge, { color: theme.colors.error }]}> *Required</Text>}
                    </Text>
                    <Text style={[styles.permissionDesc, { color: theme.colors.textSecondary }]}>
                      {perm.description}
                    </Text>
                  </View>
                </View>
                {!isGranted && (
                  <Text style={[styles.grantButton, { color: theme.colors.accent }]}>Grant →</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        {grantedCount < totalRequired && (
          <TouchableOpacity
            style={[styles.grantAllButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleGrantAll}
            activeOpacity={0.8}
          >
            <Text style={[styles.grantAllText, { color: theme.colors.black }]}>
              Grant All Permissions
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.finishButton,
            {
              backgroundColor: grantedCount >= 1 ? theme.colors.accent : theme.colors.surface,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleFinish}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.finishText,
              { color: grantedCount >= 1 ? theme.colors.black : theme.colors.textSecondary },
            ]}
          >
            {loading ? 'Setting up...' : grantedCount >= totalRequired ? 'All Set! Finish Setup 🚀' : 'Continue Anyway'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: theme.colors.textSecondary }]}>
          You can change these anytime in Settings
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 40 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 16 },
  progressCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  progressText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  subtitle: { fontSize: 16, marginBottom: 20, lineHeight: 24 },
  privacyCard: { padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 24 },
  privacyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  privacyText: { fontSize: 13, lineHeight: 20 },
  permissionList: { gap: 12, marginBottom: 24 },
  permissionItem: { padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  permissionLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  permissionEmoji: { fontSize: 20, marginRight: 12, marginTop: 2 },
  permissionInfo: { flex: 1 },
  permissionName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  requiredBadge: { fontSize: 12 },
  permissionDesc: { fontSize: 13, lineHeight: 18 },
  grantButton: { fontSize: 14, fontWeight: '700', marginLeft: 12 },
  footer: { gap: 12, paddingBottom: 32 },
  grantAllButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  grantAllText: { fontSize: 18, fontWeight: '700' },
  finishButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  finishText: { fontSize: 18, fontWeight: '700' },
  note: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});