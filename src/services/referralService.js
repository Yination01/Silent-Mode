import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Logger from '../utils/logger';
import VipService from './vipService';

class ReferralService {
  // Generate a unique referral code for a user
  static async generateReferralCode(userId) {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) return null;

      const existingCode = userDoc.data()?.referralCode;
      if (existingCode) return existingCode;

      // Generate unique code from user ID + random chars
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `SM${userId.substring(0, 4).toUpperCase()}${randomPart}`;

      await firestore().collection('users').doc(userId).update({
        referralCode: code,
        referralCodeCreatedAt: firestore.Timestamp.fromDate(new Date()),
      });

      // Also add to referral codes collection for lookup
      await firestore().collection('referralCodes').doc(code).set({
        code,
        userId,
        totalReferrals: 0,
        successfulReferrals: 0,
        rewardsEarned: 0,
        createdAt: firestore.Timestamp.fromDate(new Date()),
      });

      Logger.info('Referral code generated', { userId, code });
      return code;
    } catch (error) {
      Logger.error('Failed to generate referral code', error);
      return null;
    }
  }

  // Get user's referral code
  static async getReferralCode(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (doc.exists && doc.data()?.referralCode) {
        return doc.data().referralCode;
      }
      return await this.generateReferralCode(userId);
    } catch (error) {
      Logger.error('Failed to get referral code', error);
      return null;
    }
  }

  // Apply a referral code (called when new user signs up with a referral)
  static async applyReferralCode(newUserId, referralCode) {
    try {
      const codeString = referralCode.toUpperCase().trim();

      // Find the referral code
      const codeDoc = await firestore().collection('referralCodes').doc(codeString).get();
      if (!codeDoc.exists) {
        return { success: false, error: 'Invalid referral code.' };
      }

      const codeData = codeDoc.data();
      const referrerId = codeData.userId;

      // Prevent self-referral
      if (referrerId === newUserId) {
        return { success: false, error: 'You cannot use your own referral code.' };
      }

      // Check if this new user was already referred
      const newUserDoc = await firestore().collection('users').doc(newUserId).get();
      if (newUserDoc.exists && newUserDoc.data()?.referredBy) {
        return { success: false, error: 'You have already been referred by someone.' };
      }

      // Get VIP config for reward amounts
      const vipConfig = await VipService.getVipConfig();
      const referralReward = vipConfig.referralReward || { referrerRewardDays: 7, referredRewardDays: 7 };

      // Mark the new user as referred
      await firestore().collection('users').doc(newUserId).update({
        referredBy: referrerId,
        referralCodeUsed: codeString,
        referredAt: firestore.Timestamp.fromDate(new Date()),
      });

      // Give VIP to the referred user
      await VipService.setUserVip(newUserId, referralReward.referredRewardDays, 'referral');

      // Give reward to the referrer
      await VipService.extendUserVip(referrerId, referralReward.referrerRewardDays);

      // Update referral stats
      await firestore().collection('referralCodes').doc(codeString).update({
        totalReferrals: firestore.FieldValue.increment(1),
        successfulReferrals: firestore.FieldValue.increment(1),
        rewardsEarned: firestore.FieldValue.increment(referralReward.referrerRewardDays),
        lastReferralAt: firestore.Timestamp.fromDate(new Date()),
      });

      // Log the referral
      await firestore().collection('referrals').add({
        referrerId,
        referredId: newUserId,
        code: codeString,
        referrerRewardDays: referralReward.referrerRewardDays,
        referredRewardDays: referralReward.referredRewardDays,
        createdAt: firestore.Timestamp.fromDate(new Date()),
      });

      Logger.info('Referral applied', { newUserId, referrerId, code: codeString });
      return {
        success: true,
        message: `🎉 Welcome! You've received ${referralReward.referredRewardDays} days of VIP access!`,
        rewardDays: referralReward.referredRewardDays,
      };
    } catch (error) {
      Logger.error('Failed to apply referral code', error);
      return { success: false, error: 'Failed to apply referral code. Please try again.' };
    }
  }

  // Get user's referral stats
  static async getReferralStats(userId) {
    try {
      const codeDoc = await firestore()
        .collection('referralCodes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (codeDoc.empty) return { totalReferrals: 0, successfulReferrals: 0, rewardsEarned: 0 };

      const data = codeDoc.docs[0].data();
      return {
        totalReferrals: data.totalReferrals || 0,
        successfulReferrals: data.successfulReferrals || 0,
        rewardsEarned: data.rewardsEarned || 0,
        referralCode: data.code,
      };
    } catch (error) {
      Logger.error('Failed to get referral stats', error);
      return { totalReferrals: 0, successfulReferrals: 0, rewardsEarned: 0 };
    }
  }

  // Get leaderboard (top referrers)
  static async getLeaderboard(limit = 10) {
    try {
      const snapshot = await firestore()
        .collection('referralCodes')
        .orderBy('successfulReferrals', 'desc')
        .limit(limit)
        .get();

      const leaderboard = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const userDoc = await firestore().collection('users').doc(data.userId).get();
        leaderboard.push({
          userId: data.userId,
          email: userDoc.exists ? userDoc.data()?.email?.split('@')[0] : 'Anonymous',
          referrals: data.successfulReferrals,
          rewardsEarned: data.rewardsEarned,
        });
      }

      return leaderboard;
    } catch (error) {
      Logger.error('Failed to get leaderboard', error);
      return [];
    }
  }
}

export default ReferralService;