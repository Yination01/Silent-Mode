import { useAppStore } from '../store/appStore';
import { updateModeActive } from './userService';
import auth from '@react-native-firebase/auth';
import Logger from '../utils/logger';
import { format } from 'date-fns';

class SchedulerService {
  static intervalId = null;
  static currentActiveMode = null;

  static checkScheduledModes() {
    const scheduledModes = useAppStore.getState().scheduledModes || [];
    const now = new Date();
    const currentDay = format(now, 'EEEE').toLowerCase();
    const currentTime = format(now, 'HH:mm');

    scheduledModes.forEach((scheduled) => {
      if (!scheduled.enabled) return;

      const timeInRange = scheduled.startTime <= scheduled.endTime
        ? (currentTime >= scheduled.startTime && currentTime <= scheduled.endTime)
        : (currentTime >= scheduled.startTime || currentTime <= scheduled.endTime);

      const shouldActivate = scheduled.days.includes(currentDay) && timeInRange;

      if (shouldActivate && this.currentActiveMode !== scheduled.modeId) {
        const userId = auth().currentUser?.uid;
        if (userId) {
          updateModeActive(userId, scheduled.modeId, true);
          this.currentActiveMode = scheduled.modeId;
          Logger.info('Scheduled mode activated', { mode: scheduled.modeId, schedule: scheduled.id });
        }
      }
    });
  }

  static startPeriodicCheck() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.checkScheduledModes(), 60000);
    this.checkScheduledModes();
    Logger.info('Scheduler started');
  }

  static stopPeriodicCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      Logger.info('Scheduler stopped');
    }
  }
}

export default SchedulerService;