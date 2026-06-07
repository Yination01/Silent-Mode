import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export async function trackEvent(eventName, properties = {}) {
  try {
    const sanitizedProps = {
      timestamp: new Date(),
      platform: Platform.OS,
      appVersion: DeviceInfo.getVersion(),
      ...properties,
    };

    await firestore()
      .collection('analytics')
      .doc(eventName)
      .collection('events')
      .add(sanitizedProps);
  } catch (error) {
    console.debug('Analytics error:', error);
  }
}

export const AnalyticsEvents = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  DRAFT_APPROVED: 'draft_approved',
  DRAFT_SKIPPED: 'draft_skipped',
  MODE_ACTIVATED: 'mode_activated',
  VIP_ADDED: 'vip_added',
  COFFEE_BOUGHT: 'coffee_bought',
};