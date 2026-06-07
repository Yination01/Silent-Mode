import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useAppStore } from '../store/appStore';
import Logger from '../utils/logger';

class CleanupService {
  static cleanupInterval = null;

  static async autoDeleteOldDrafts() {
    const settings = useAppStore.getState().settings;
    if (!settings?.autoDeleteDraftsDays) return;
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.autoDeleteDraftsDays);
    try {
      const snapshot = await firestore().collection('users').doc(userId).collection('draftLogs').where('createdAt', '<', cutoffDate).get();
      if (snapshot.docs.length > 0) {
        for (let i = 0; i < snapshot.docs.length; i += 500) {
          const batch = firestore().batch();
          const chunk = snapshot.docs.slice(i, i + 500);
          chunk.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
        }
        Logger.info('Old drafts cleaned up', { count: snapshot.docs.length });
      }
    } catch (error) { Logger.error('Cleanup failed', error); }
  }

  static scheduleCleanup() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(() => this.autoDeleteOldDrafts(), 24 * 60 * 60 * 1000);
    this.autoDeleteOldDrafts();
  }

  static stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export default CleanupService;