import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import Logger from '../utils/logger';

const NotificationBridge = NativeModules?.NotificationBridge;
const OverlayBridge = NativeModules?.OverlayBridge;

export async function startNotificationListener() {
  if (Platform.OS !== 'android' || !NotificationBridge) return false;
  try {
    await NotificationBridge.startNotificationListener();
    Logger.info('Notification listener started');
    return true;
  } catch (error) {
    Logger.error('Failed to start notification listener', error);
    return false;
  }
}

export async function showOverlayPopup(draftReply) {
  if (Platform.OS !== 'android' || !OverlayBridge) return false;
  try {
    await OverlayBridge.showOverlay(draftReply);
    Logger.info('Overlay popup shown');
    return true;
  } catch (error) {
    Logger.error('Failed to show overlay', error);
    return false;
  }
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    try {
      const result = await NotificationBridge?.requestPermission();
      return result ?? false;
    } catch (error) {
      Logger.error('Permission request error', error);
      return false;
    }
  }
  return true;
}

export async function checkAllPermissions() {
  const permissions = { notificationListener: false, overlay: false, contacts: false };
  if (Platform.OS === 'android') {
    permissions.notificationListener = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BIND_NOTIFICATION_LISTENER_SERVICE).catch(() => false);
    permissions.overlay = await PermissionsAndroid.check('android.permission.SYSTEM_ALERT_WINDOW').catch(() => false);
    permissions.contacts = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).catch(() => false);
  }
  return permissions;
}