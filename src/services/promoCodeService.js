import firestore from '@react-native-firebase/firestore';
import Logger from '../utils/logger';
import VipService from './vipService';

class PromoCodeService {
  // Create a new promo code (admin only)
  static async createPromoCode(data) {
    try {
      const code = {
        id: `promo_${Date.now()}`,
        code: data.code.toUpperCase().trim(),
        description: data.description || '',
        type: data.type || 'vip', // 'vip', 'premium', 'discount_percent', 'discount_fixed', 'extend_days'
        value: data.value || 30, // days for vip/premium, percentage for discount, fixed amount for discount_fixed
        maxUses: data.maxUses || 100,
        currentUses: 0,
        minTier: data.minTier || 'free', // 'free', 'vip', 'premium' - who can use this
        isActive: true,
        expiresAt: data.expiresAt ? firestore.Timestamp.fromDate(new Date(data.expiresAt)) : null,
        neverExpires: data.neverExpires || false,
        createdBy: data.createdBy,
        createdAt: firestore.Timestamp.fromDate(new Date()),
        updatedAt: firestore.Timestamp.fromDate(new Date()),
        usedBy: [],
        metadata: data.metadata || {},
      };

      await firestore().collection('promoCodes').doc(code.id).set(code);
      Logger.info('Promo code created', { code: code.code, type: code.type });
      return { success: true, code };
    } catch (error) {
      Logger.error('Failed to create promo code', error);
      return { success: false, error: error.message };
    }
  }

  // Validate and redeem a promo code
  static async redeemPromoCode(userId, codeString) {
    try {
      const code = codeString.toUpperCase().trim();
      
      // Find the promo code
      const snapshot = await firestore()
        .collection('promoCodes')
        .where('code', '==', code)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { success: false, error: 'Invalid or expired promo code.' };
      }

      const promoDoc = snapshot.docs[0];
      const promo = { id: promoDoc.id, ...promoDoc.data() };

      // Check if code has expired
      if (promo.neverExpires !== true && promo.expiresAt) {
        const expiryDate = promo.expiresAt.toDate ? promo.expiresAt.toDate() : new Date(promo.expiresAt);
        if (expiryDate < new Date()) {
          return { success: false, error: 'This promo code has expired.' };
        }
      }

      // Check max uses
      if (promo.currentUses >= promo.maxUses) {
        return { success: false, error: 'This promo code has reached its usage limit.' };
      }

      // Check if user already used this code
      if (promo.usedBy?.includes(userId)) {
        return { success: false, error: 'You have already used this promo code.' };
      }

      // Check minimum tier requirement
      const userTier = await VipService.getUserTier(userId);
      const tierHierarchy = { free: 0, vip: 1, premium: 2 };
      if (tierHierarchy[userTier.tier] < tierHierarchy[promo.minTier || 'free']) {
        return { success: false, error: 'Your account is not eligible for this promo code.' };
      }

      // Apply the promo
      let result;
      switch (promo.type) {
        case 'vip':
          result = await VipService.setUserVip(userId, promo.value, `promo_${code}`);
          break;
        case 'premium':
          result = await VipService.setUserPremium(userId, 'pro', promo.value);
          break;
        case 'extend_days':
          result = await VipService.extendUserVip(userId, promo.value);
          break;
        case 'discount_percent':
          // Store discount for future subscription purchase
          result = await this.storeDiscount(userId, promo.value, 'percent', code);
          break;
        case 'discount_fixed':
          result = await this.storeDiscount(userId, promo.value, 'fixed', code);
          break;
        default:
          return { success: false, error: 'Invalid promo code type.' };
      }

      if (result?.success !== false) {
        // Increment usage
        await firestore().collection('promoCodes').doc(promo.id).update({
          currentUses: firestore.FieldValue.increment(1),
          usedBy: firestore.FieldValue.arrayUnion(userId),
          updatedAt: firestore.Timestamp.fromDate(new Date()),
        });

        Logger.info('Promo code redeemed', { userId, code, type: promo.type });
        return { success: true, message: this.getSuccessMessage(promo), result };
      }

      return result;
    } catch (error) {
      Logger.error('Failed to redeem promo code', error);
      return { success: false, error: 'Failed to redeem promo code. Please try again.' };
    }
  }

  static async storeDiscount(userId, value, type, code) {
    try {
      const discount = {
        userId,
        value,
        type,
        code,
        isUsed: false,
        createdAt: new Date(),
        expiresAt: null,
      };
      await firestore().collection('discounts').add(discount);
      return { success: true };
    } catch (error) {
      Logger.error('Failed to store discount', error);
      return { success: false };
    }
  }

  static getSuccessMessage(promo) {
    switch (promo.type) {
      case 'vip': return `🎉 ${promo.value} days of VIP access activated!`;
      case 'premium': return `🌟 ${promo.value} days of Premium access activated!`;
      case 'extend_days': return `⏰ Your VIP/Premium has been extended by ${promo.value} days!`;
      case 'discount_percent': return `💰 ${promo.value}% discount saved to your account!`;
      case 'discount_fixed': return `💰 $${promo.value} discount saved to your account!`;
      default: return 'Promo code applied successfully!';
    }
  }

  // Get all promo codes (admin)
  static async getAllPromoCodes() {
    try {
      const snapshot = await firestore().collection('promoCodes').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      Logger.error('Failed to get promo codes', error);
      return [];
    }
  }

  // Update promo code (admin)
  static async updatePromoCode(promoId, updates) {
    try {
      await firestore().collection('promoCodes').doc(promoId).update({
        ...updates,
        updatedAt: firestore.Timestamp.fromDate(new Date()),
      });
      return { success: true };
    } catch (error) {
      Logger.error('Failed to update promo code', error);
      return { success: false, error: error.message };
    }
  }

  // Deactivate promo code (admin)
  static async deactivatePromoCode(promoId) {
    return this.updatePromoCode(promoId, { isActive: false });
  }

  // Delete promo code (admin)
  static async deletePromoCode(promoId) {
    try {
      await firestore().collection('promoCodes').doc(promoId).delete();
      return { success: true };
    } catch (error) {
      Logger.error('Failed to delete promo code', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's available discounts
  static async getUserDiscounts(userId) {
    try {
      const snapshot = await firestore()
        .collection('discounts')
        .where('userId', '==', userId)
        .where('isUsed', '==', false)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      Logger.error('Failed to get user discounts', error);
      return [];
    }
  }
}

export default PromoCodeService;