import firestore from '@react-native-firebase/firestore';
import { useAppStore } from '../store/appStore';
import Logger from '../utils/logger';

const REMOTE_CONFIG_DOC = 'config/active';

class RemoteConfigService {
  static listeners = [];
  static cachedConfig = null;
  static lastFetch = 0;
  static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async fetchConfig() {
    try {
      const now = Date.now();
      if (this.cachedConfig && (now - this.lastFetch < this.CACHE_TTL)) {
        return this.cachedConfig;
      }

      const doc = await firestore().collection('config').doc('active').get();
      if (doc.exists) {
        this.cachedConfig = doc.data();
        this.lastFetch = now;
        return this.cachedConfig;
      }
      return this.getDefaultConfig();
    } catch (error) {
      Logger.error('Failed to fetch remote config', error);
      return this.getDefaultConfig();
    }
  }

  static getDefaultConfig() {
    return {
      monetization: {
        enabled: false,
        mode: 'none', // 'none', 'tips', 'subscription', 'hybrid'
        tipJarEnabled: true,
        subscriptionEnabled: false,
        subscriptionPrice: '$4.99/month',
        subscriptionFeatures: ['premium_tones', 'unlimited_voice', 'priority_ai', 'scheduled_modes'],
        freeTrialDays: 14,
        coffeeOptions: [
          { amount: 3, label: 'Small Coffee' },
          { amount: 5, label: 'Medium Latte' },
          { amount: 10, label: 'Large Cappuccino' },
        ],
        premiumFeatures: {
          premium_tones: { enabled: true, name: 'Premium Tone Packs', price: '$1.99/month' },
          unlimited_voice: { enabled: true, name: 'Unlimited Voice Notes', price: '$2.99/month' },
          priority_ai: { enabled: false, name: 'Priority AI Processing', price: '$3.99/month' },
          scheduled_modes: { enabled: true, name: 'Scheduled Modes', price: '$1.99/month' },
          everything: { enabled: true, name: 'SilentMode Pro', price: '$4.99/month' },
        },
      },
      features: {
        maxVipContacts: 50,
        maxScheduledModes: 10,
        maxCustomModes: 5,
        maxTemplates: 20,
        draftLogRetentionDays: 30,
        replyDelayEnabled: true,
        replyDelayMaxSeconds: 300,
        voiceNotesEnabled: true,
        voiceNotesDailyLimit: 10,
        statsEnabled: true,
        scheduledModesEnabled: true,
        templatesEnabled: true,
        incognitoModeEnabled: true,
        perContactTonesEnabled: true,
      },
      ai: {
        defaultTone: 'informal',
        defaultTextLength: 'medium',
        maxContextMessages: 5,
        maxReplyLength: 500,
        fallbackEnabled: true,
      },
      app: {
        minVersion: '1.0.0',
        latestVersion: '2.0.0',
        updateRequired: false,
        updateUrl: 'https://silentmode.app/update',
        maintenanceMode: false,
        maintenanceMessage: 'SilentMode is undergoing maintenance. We\'ll be back shortly!',
        supportEmail: 'support@silentmode.app',
        feedbackEnabled: true,
        betaFeaturesEnabled: false,
      },
      updatedAt: null,
      updatedBy: null,
    };
  }

  static listenToConfig(callback) {
    const unsubscribe = firestore()
      .collection('config')
      .doc('active')
      .onSnapshot(
        doc => {
          if (doc.exists) {
            this.cachedConfig = doc.data();
            this.lastFetch = Date.now();
            callback(this.cachedConfig);
          }
        },
        error => Logger.error('Config listener error', error)
      );

    this.listeners.push(unsubscribe);
    return () => {
      unsubscribe();
      this.listeners = this.listeners.filter(l => l !== unsubscribe);
    };
  }

  static cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export default RemoteConfigService;