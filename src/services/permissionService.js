import { Platform, PermissionsAndroid, Alert, Linking, NativeModules } from 'react-native';
import Logger from '../utils/logger';

class PermissionService {
  // All permissions needed by the app
  static PERMISSIONS = {
    android: {
      notifications: {
        name: 'Notification Access',
        permission: PermissionsAndroid.PERMISSIONS.BIND_NOTIFICATION_LISTENER_SERVICE,
        description: 'Allows SilentMode to read incoming messages and generate replies',
        required: true,
        category: 'messages',
      },
      overlay: {
        name: 'Overlay Window',
        permission: 'android.permission.SYSTEM_ALERT_WINDOW',
        description: 'Shows quick approve/skip popup over other apps',
        required: true,
        category: 'display',
      },
      contacts: {
        name: 'Contacts',
        permission: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        description: 'Identifies VIP contacts only. We never upload your contacts.',
        required: false,
        category: 'contacts',
      },
      accessibility: {
        name: 'Accessibility Service',
        permission: 'android.permission.BIND_ACCESSIBILITY_SERVICE',
        description: 'Auto-pastes approved replies into messaging apps',
        required: false,
        category: 'accessibility',
      },
      microphone: {
        name: 'Microphone',
        permission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        description: 'For transcribing voice notes sent to you',
        required: false,
        category: 'audio',
      },
    },
    ios: {
      notifications: {
        name: 'Notifications',
        description: 'Allows SilentMode to suggest replies in notifications',
        required: true,
        category: 'notifications',
      },
      microphone: {
        name: 'Microphone',
        description: 'For transcribing voice notes',
        required: false,
        category: 'audio',
      },
    },
  };

  // Check all permissions status
  static async checkAllPermissions() {
    const status = {};
    
    if (Platform.OS === 'android') {
      for (const [key, perm] of Object.entries(this.PERMISSIONS.android)) {
        try {
          if (key === 'overlay') {
            status[key] = await this.checkOverlayPermission();
          } else if (key === 'accessibility') {
            status[key] = await this.checkAccessibilityPermission();
          } else if (key === 'notifications') {
            status[key] = await this.checkNotificationPermission();
          } else {
            status[key] = await PermissionsAndroid.check(perm.permission);
          }
        } catch (error) {
          status[key] = false;
        }
      }
    } else {
      // iOS permissions
      for (const [key, perm] of Object.entries(this.PERMISSIONS.ios)) {
        status[key] = true; // iOS handles through system dialogs
      }
    }

    return status;
  }

  // Check notification listener permission
  static async checkNotificationPermission() {
    try {
      const NotificationBridge = NativeModules?.NotificationBridge;
      if (NotificationBridge) {
        return await NotificationBridge.requestPermission();
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Check overlay permission
  static async checkOverlayPermission() {
    try {
      if (Platform.OS === 'android') {
        return await PermissionsAndroid.check('android.permission.SYSTEM_ALERT_WINDOW');
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Check accessibility permission
  static async checkAccessibilityPermission() {
    try {
      // Accessibility can't be checked programmatically on all devices
      return true; // Will be handled by the service
    } catch (error) {
      return false;
    }
  }

  // Request a specific permission
  static async requestPermission(permissionKey) {
    if (Platform.OS === 'android') {
      const perm = this.PERMISSIONS.android[permissionKey];
      if (!perm) return false;

      try {
        switch (permissionKey) {
          case 'notifications':
            return await this.requestNotificationPermission();
          case 'overlay':
            return await this.requestOverlayPermission();
          case 'accessibility':
            return await this.requestAccessibilityPermission();
          case 'contacts':
            return await this.requestContactsPermission();
          case 'microphone':
            return await this.requestMicrophonePermission();
          default:
            const result = await PermissionsAndroid.request(perm.permission);
            return result === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (error) {
        Logger.error(`Failed to request ${permissionKey} permission`, error);
        return false;
      }
    }
    return true;
  }

  // Request notification access
  static async requestNotificationPermission() {
    const NotificationBridge = NativeModules?.NotificationBridge;
    if (NotificationBridge) {
      try {
        const result = await NotificationBridge.startNotificationListener();
        if (!result) {
          // Guide user to settings
          Alert.alert(
            'Notification Access Required',
            'SilentMode needs notification access to read incoming messages and generate replies.\n\nPlease enable SilentMode in:\nSettings → Apps → Special Access → Notification Access',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
        return result;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  // Request overlay permission
  static async requestOverlayPermission() {
    try {
      const hasPermission = await PermissionsAndroid.check('android.permission.SYSTEM_ALERT_WINDOW');
      if (!hasPermission) {
        Alert.alert(
          'Overlay Permission Required',
          'SilentMode needs overlay permission to show quick approve/skip buttons over other apps.\n\nPlease enable in:\nSettings → Apps → SilentMode → Overlay',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return hasPermission;
    } catch (error) {
      return false;
    }
  }

  // Request accessibility permission
  static async requestAccessibilityPermission() {
    Alert.alert(
      'Accessibility Service (Optional)',
      'For full auto-reply capability, SilentMode can use Accessibility Service to paste approved replies automatically.\n\nEnable in:\nSettings → Accessibility → Installed Apps → SilentMode',
      [
        { text: 'Skip', style: 'cancel' },
        { text: 'Open Settings', onPress: () => {
          const intent = { action: 'android.settings.ACCESSIBILITY_SETTINGS' };
          // Open accessibility settings
          Linking.openSettings();
        }},
      ]
    );
    return false;
  }

  // Request contacts permission
  static async requestContactsPermission() {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'SilentMode can identify your VIP contacts for breakthrough mode. Your contacts are never uploaded or stored on our servers.',
          buttonPositive: 'Allow',
          buttonNegative: 'Skip',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      return false;
    }
  }

  // Request microphone permission
  static async requestMicrophonePermission() {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'SilentMode needs microphone access to transcribe voice notes that people send you.',
          buttonPositive: 'Allow',
          buttonNegative: 'Skip',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      return false;
    }
  }

  // Request all required permissions at once
  static async requestAllRequiredPermissions() {
    const results = {};
    const permissions = Platform.OS === 'android' ? this.PERMISSIONS.android : this.PERMISSIONS.ios;

    for (const [key, perm] of Object.entries(permissions)) {
      if (perm.required) {
        results[key] = await this.requestPermission(key);
      }
    }

    return results;
  }

  // Get missing required permissions
  static async getMissingPermissions() {
    const status = await this.checkAllPermissions();
    const permissions = Platform.OS === 'android' ? this.PERMISSIONS.android : this.PERMISSIONS.ios;
    const missing = [];

    for (const [key, perm] of Object.entries(permissions)) {
      if (perm.required && !status[key]) {
        missing.push({
          key,
          name: perm.name,
          description: perm.description,
          category: perm.category,
        });
      }
    }

    return missing;
  }

  // Open app-specific settings
  static openAppSettings() {
    Linking.openSettings();
  }

  // Open notification access settings (Android)
  static openNotificationSettings() {
    if (Platform.OS === 'android') {
      const intent = { action: 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS' };
      // Open directly if possible
      Linking.openSettings();
    }
  }
}

export default PermissionService;