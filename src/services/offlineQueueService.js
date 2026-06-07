import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { generateDraftReply } from './aiService';
import Logger from '../utils/logger';

const QUEUE_KEY = '@silentmode_offline_queue';

class OfflineQueueService {
  static async addToQueue(draft) {
    try {
      const queue = await this.getQueue();
      queue.push({ ...draft, timestamp: Date.now() });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      Logger.info('Added to offline queue', { queueLength: queue.length });
    } catch (error) {
      Logger.error('Failed to add to offline queue', error);
    }
  }

  static async getQueue() {
    try {
      const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (error) {
      Logger.error('Failed to parse offline queue', error);
      return [];
    }
  }

  static async processQueue() {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;
    const queue = await this.getQueue();
    if (queue.length === 0) return;
    Logger.info('Processing offline queue', { queueLength: queue.length });
    const BATCH_SIZE = 10;
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      const batch = queue.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(item => this.processItem(item)));
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          queue.splice(i + index, 1);
        }
      });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  }

  static async processItem(item) {
    if (!item?.userId || !item?.sender || !item?.incomingText) {
      Logger.warn('Invalid queue item skipped', { item });
      return false;
    }
    await generateDraftReply(item.userId, item.platform, item.sender, item.incomingText, item.context);
    return true;
  }

  static async clearQueue() {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  static async getQueueLength() {
    const queue = await this.getQueue();
    return queue.length;
  }
}

export default OfflineQueueService;