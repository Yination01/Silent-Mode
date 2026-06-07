import { useAppStore } from '../store/appStore';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Logger from '../utils/logger';

class StatsService {
  static lastSyncTime = 0;
  static SYNC_THROTTLE = 5 * 60 * 1000;

  static async getStats() {
    const localStats = useAppStore.getState().stats;
    const userId = auth().currentUser?.uid;
    try {
      const doc = await firestore().collection('users').doc(userId).collection('stats').doc('current').get();
      if (doc.exists) {
        const serverStats = doc.data();
        return {
          ...serverStats,
          totalDraftsApproved: (serverStats.totalDraftsApproved || 0) + (localStats.totalDraftsApproved || 0),
          totalDraftsSkipped: (serverStats.totalDraftsSkipped || 0) + (localStats.totalDraftsSkipped || 0),
          totalMessagesProcessed: (serverStats.totalMessagesProcessed || 0) + (localStats.totalMessagesProcessed || 0),
        };
      }
    } catch (error) { Logger.error('Failed to get server stats', error); }
    return localStats;
  }

  static async syncStats() {
    const now = Date.now();
    if (now - this.lastSyncTime < this.SYNC_THROTTLE) return;
    this.lastSyncTime = now;
    const userId = auth().currentUser?.uid;
    const localStats = useAppStore.getState().stats;
    try {
      await firestore().collection('users').doc(userId).collection('stats').doc('current').set(localStats, { merge: true });
      useAppStore.getState().resetStats();
      Logger.info('Stats synced to server');
    } catch (error) { Logger.error('Failed to sync stats', error); }
  }

  static calculateTimeSaved(stats) {
    if (!stats) return { hours: 0, minutes: 0, totalReplies: 0 };
    const avgReplyTime = 30;
    const totalReplies = stats.totalDraftsApproved || 0;
    const totalSeconds = totalReplies * avgReplyTime;
    return { hours: Math.floor(totalSeconds / 3600), minutes: Math.floor((totalSeconds % 3600) / 60), totalReplies };
  }

  static calculateMostActiveMode(stats) {
    if (!stats?.activeModeMinutes) return null;
    const modeMinutes = stats.activeModeMinutes;
    let maxMode = null, maxMinutes = 0;
    Object.entries(modeMinutes).forEach(([mode, minutes]) => {
      if (minutes > maxMinutes) { maxMinutes = minutes; maxMode = mode; }
    });
    return maxMode;
  }
}

export default StatsService;