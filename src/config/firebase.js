import { initializeApp } from '@react-native-firebase/app';
import Config from 'react-native-config';

let firebaseConfig;
try {
  const rawConfig = Config.FIREBASE_CONFIG;
  firebaseConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
  if (!firebaseConfig || typeof firebaseConfig !== 'object') {
    throw new Error('FIREBASE_CONFIG is not set or is invalid');
  }
} catch (error) {
  console.error('Failed to parse Firebase config:', error);
  throw new Error('Invalid FIREBASE_CONFIG environment variable');
}

const requiredFields = ['apiKey', 'projectId', 'appId'];
requiredFields.forEach(field => {
  if (!firebaseConfig[field]) {
    throw new Error(`Missing required Firebase config field: ${field}`);
  }
});

export const app = initializeApp(firebaseConfig);