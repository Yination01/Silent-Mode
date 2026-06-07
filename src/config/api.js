import Config from 'react-native-config';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.select({
      android: 'http://10.0.2.2:3000/api',
      ios: 'http://localhost:3000/api',
      default: 'http://localhost:3000/api',
    })
  : Config.API_URL || 'https://silentmode-api.vercel.app/api';

export const endpoints = {
  draftReply: `${API_BASE_URL}/draft-reply`,
  transcribe: `${API_BASE_URL}/transcribe`,
  setMode: `${API_BASE_URL}/set-mode`,
};

export async function apiCall(url, body, authToken, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API call failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}