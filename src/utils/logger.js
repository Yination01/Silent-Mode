import * as Sentry from '@sentry/react-native';

const levels = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

class Logger {
  static log(level, message, extra = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (__DEV__) {
      switch (level) {
        case levels.ERROR: console.error(logMessage, extra); break;
        case levels.WARN: console.warn(logMessage, extra); break;
        default: console.log(logMessage, extra);
      }
    }

    if (level === levels.ERROR && !__DEV__) {
      Sentry.captureMessage(message, { level: 'error', extra });
    }
  }

  static debug(message, extra) { this.log(levels.DEBUG, message, extra); }
  static info(message, extra) { this.log(levels.INFO, message, extra); }
  static warn(message, extra) { this.log(levels.WARN, message, extra); }
  static error(message, error, extra = {}) {
    this.log(levels.ERROR, message, { ...extra, error: error?.message });
    if (!__DEV__) Sentry.captureException(error);
  }
}

export default Logger;