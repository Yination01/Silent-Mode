import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Logger from '../utils/logger';

class AdminService {
  static async isSuperUser() {
    try {
      const user = auth().currentUser;
      if (!user) return false;

      const doc = await firestore().collection('admin').doc('superusers').get();
      if (!doc.exists) return false;

      const data = doc.data();
      return data.users?.includes(user.uid) || data.emails?.includes(user.email) || false;
    } catch (error) {
      Logger.error('Admin check failed', error);
      return false;
    }
  }

  static async addSuperUser(uid, email, addedBy) {
    try {
      const docRef = firestore().collection('admin').doc('superusers');
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({ users: [uid], emails: [email], createdAt: new Date(), createdBy: addedBy });
      } else {
        await docRef.update({
          users: firestore.FieldValue.arrayUnion(uid),
          emails: firestore.FieldValue.arrayUnion(email),
        });
      }
      Logger.info('Superuser added', { uid, email });
      return true;
    } catch (error) {
      Logger.error('Failed to add superuser', error);
      return false;
    }
  }

  static async removeSuperUser(uid, email) {
    try {
      const docRef = firestore().collection('admin').doc('superusers');
      await docRef.update({
        users: firestore.FieldValue.arrayRemove(uid),
        emails: firestore.FieldValue.arrayRemove(email),
      });
      return true;
    } catch (error) {
      Logger.error('Failed to remove superuser', error);
      return false;
    }
  }

  static async updateRemoteConfig(config, userId) {
    try {
      await firestore().collection('config').doc('active').set({
        ...config,
        updatedAt: new Date(),
        updatedBy: userId,
      });
      Logger.info('Remote config updated', { userId });
      return true;
    } catch (error) {
      Logger.error('Failed to update remote config', error);
      return false;
    }
  }

  static async getRemoteConfig() {
    try {
      const doc = await firestore().collection('config').doc('active').get();
      return doc.exists ? doc.data() : RemoteConfigService.getDefaultConfig();
    } catch (error) {
      Logger.error('Failed to get remote config', error);
      return RemoteConfigService.getDefaultConfig();
    }
  }

  static async getSuperUsers() {
    try {
      const doc = await firestore().collection('admin').doc('superusers').get();
      if (!doc.exists) return { users: [], emails: [] };
      return doc.data();
    } catch (error) {
      Logger.error('Failed to get superusers', error);
      return { users: [], emails: [] };
    }
  }

  static async getAppStats() {
    try {
      const usersSnapshot = await firestore().collection('users').count().get();
      const totalUsers = usersSnapshot.data()?.count || 0;

      const analyticsDoc = await firestore().collection('admin').doc('analytics').get();
      const analytics = analyticsDoc.exists ? analyticsDoc.data() : {};

      return {
        totalUsers,
        totalDraftsGenerated: analytics.totalDraftsGenerated || 0,
        totalDraftsApproved: analytics.totalDraftsApproved || 0,
        totalCoffeeBought: analytics.totalCoffeeBought || 0,
        totalRevenue: analytics.totalRevenue || 0,
        activeUsersToday: analytics.activeUsersToday || 0,
        activeUsersThisWeek: analytics.activeUsersThisWeek || 0,
      };
    } catch (error) {
      Logger.error('Failed to get app stats', error);
      return { totalUsers: 0, totalDraftsGenerated: 0, totalDraftsApproved: 0, totalCoffeeBought: 0, totalRevenue: 0, activeUsersToday: 0, activeUsersThisWeek: 0 };
    }
  }

  static async setUserPremiumStatus(userId, isPremium, premiumType = 'pro', expiresAt = null) {
    try {
      await firestore().collection('users').doc(userId).update({
        isPremium,
        premiumType,
        premiumExpiresAt: expiresAt,
        premiumUpdatedAt: new Date(),
      });
      return true;
    } catch (error) {
      Logger.error('Failed to set premium status', error);
      return false;
    }
  }

  static async isUserPremium(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (!doc.exists) return false;
      const data = doc.data();
      if (!data.isPremium) return false;
      if (data.premiumExpiresAt && data.premiumExpiresAt.toDate() < new Date()) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getPremiumFeatures() {
    try {
      const config = await this.getRemoteConfig();
      return config?.monetization?.premiumFeatures || {};
    } catch (error) {
      return {};
    }
  }
}

export default AdminService;