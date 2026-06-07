import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Logger from '../utils/logger';

class VipService {
  // Check if user has active VIP/Premium status
  static async getUserTier(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (!doc.exists) return { tier: 'free', isVip: false, isPremium: false };

      const data = doc.data();
      const now = new Date();
      
      // Check premium first (highest tier)
      if (data.isPremium && data.premiumExpiresAt) {
        const expiresAt = data.premiumExpiresAt?.toDate ? data.premiumExpiresAt.toDate() : new Date(data.premiumExpiresAt);
        if (expiresAt > now) {
          return { tier: 'premium', isVip: true, isPremium: true, expiresAt, premiumType: data.premiumType };
        }
      }

      // Check VIP
      if (data.isVip && data.vipExpiresAt) {
        const expiresAt = data.vipExpiresAt?.toDate ? data.vipExpiresAt.toDate() : new Date(data.vipExpiresAt);
        if (expiresAt > now) {
          return { tier: 'vip', isVip: true, isPremium: false, expiresAt };
        }
      }

      // Check if VIP status exists but expired
      if (data.isVip && data.vipExpiresAt) {
        const expiresAt = data.vipExpiresAt?.toDate ? data.vipExpiresAt.toDate() : new Date(data.vipExpiresAt);
        if (expiresAt <= now) {
          return { tier: 'free', isVip: false, isPremium: false, expired: true, expiredAt: expiresAt };
        }
      }

      return { tier: 'free', isVip: false, isPremium: false };
    } catch (error) {
      Logger.error('Failed to get user tier', error);
      return { tier: 'free', isVip: false, isPremium: false };
    }
  }

  // Set user VIP status
  static async setUserVip(userId, durationDays = 30, source = 'default') {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await firestore().collection('users').doc(userId).update({
        isVip: true,
        isPremium: false,
        vipExpiresAt: firestore.Timestamp.fromDate(expiresAt),
        vipSource: source,
        vipActivatedAt: firestore.Timestamp.fromDate(new Date()),
        vipDurationDays: durationDays,
      });

      Logger.info('User set to VIP', { userId, durationDays, source });
      return { success: true, expiresAt };
    } catch (error) {
      Logger.error('Failed to set user VIP', error);
      return { success: false, error: error.message };
    }
  }

  // Remove VIP status
  static async removeUserVip(userId) {
    try {
      await firestore().collection('users').doc(userId).update({
        isVip: false,
        isPremium: false,
        vipExpiresAt: firestore.FieldValue.delete(),
        premiumExpiresAt: firestore.FieldValue.delete(),
        vipSource: firestore.FieldValue.delete(),
        premiumType: firestore.FieldValue.delete(),
      });

      Logger.info('VIP removed from user', { userId });
      return true;
    } catch (error) {
      Logger.error('Failed to remove VIP', error);
      return false;
    }
  }

  // Set user Premium status
  static async setUserPremium(userId, premiumType = 'pro', durationDays = 30) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await firestore().collection('users').doc(userId).update({
        isVip: true,
        isPremium: true,
        premiumType,
        premiumExpiresAt: firestore.Timestamp.fromDate(expiresAt),
        premiumActivatedAt: firestore.Timestamp.fromDate(new Date()),
      });

      Logger.info('User set to Premium', { userId, premiumType, durationDays });
      return { success: true, expiresAt };
    } catch (error) {
      Logger.error('Failed to set user premium', error);
      return { success: false, error: error.message };
    }
  }

  // Extend VIP/Premium duration
  static async extendUserVip(userId, additionalDays) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (!doc.exists) return { success: false, error: 'User not found' };

      const data = doc.data();
      const currentExpiry = data.vipExpiresAt?.toDate ? data.vipExpiresAt.toDate() : new Date();
      if (currentExpiry < new Date()) currentExpiry.setTime(Date.now());
      
      currentExpiry.setDate(currentExpiry.getDate() + additionalDays);

      await firestore().collection('users').doc(userId).update({
        vipExpiresAt: firestore.Timestamp.fromDate(currentExpiry),
        isVip: true,
      });

      return { success: true, newExpiresAt: currentExpiry };
    } catch (error) {
      Logger.error('Failed to extend VIP', error);
      return { success: false, error: error.message };
    }
  }

  // Get VIP features available to user
  static async getAvailableFeatures(userId) {
    const tier = await this.getUserTier(userId);
    const config = await this.getVipConfig();
    
    const features = {
      unlimitedVipContacts: tier.isVip,
      unlimitedScheduledModes: tier.isVip,
      unlimitedCustomModes: tier.isVip,
      unlimitedTemplates: tier.isVip,
      unlimitedVoiceNotes: tier.isPremium,
      priorityAI: tier.isPremium,
      premiumTones: tier.isPremium,
      noAds: tier.isVip,
      vipBadge: tier.isVip,
      extendedDraftRetention: tier.isVip,
      ...config?.featureOverrides || {},
    };

    return features;
  }

  // Get VIP configuration from remote config
  static async getVipConfig() {
    try {
      const doc = await firestore().collection('config').doc('vip').get();
      if (doc.exists) return doc.data();
      return this.getDefaultVipConfig();
    } catch (error) {
      return this.getDefaultVipConfig();
    }
  }

  static getDefaultVipConfig() {
    return {
      defaultTier: 'vip', // 'free', 'vip', 'premium'
      defaultVipDurationDays: 30,
      defaultPremiumDurationDays: 30,
      trialEnabled: true,
      trialDurationDays: 14,
      autoActivateVip: true,
      featureOverrides: {},
      referralReward: {
        enabled: true,
        referrerRewardDays: 7,
        referredRewardDays: 7,
        maxReferralRewards: 10,
      },
    };
  }
}

export default VipService;