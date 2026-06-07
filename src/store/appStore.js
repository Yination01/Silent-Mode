import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import Logger from '../utils/logger';

export const useAppStore = create(
  persist(
    (set) => ({
      // Statistics
      stats: {
        totalDraftsApproved: 0,
        totalDraftsSkipped: 0,
        totalMessagesProcessed: 0,
        activeModeMinutes: {},
        lastResetDate: new Date().toISOString(),
      },

      // Vibe Intensity (1-5 for each vibe)
      vibeIntensity: {
        professional: 3,
        chill: 3,
        warm: 3,
        spicy: 3,
        sarcastic: 3,
        culture: 3,
      },

      // Scheduled Modes
      scheduledModes: [],

      // Custom Tones
      customTones: [],

      // Per-Contact Settings
      contactSettings: {},

      // Incognito Contacts
      incognitoContacts: [],

      // App Settings
      settings: {
        autoDeleteDraftsDays: 30,
        replyDelay: 0,
        soundEnabled: true,
        vibrationEnabled: true,
        hapticEnabled: true,
        notificationsEnabled: true,
        betaChannel: false,
        themeMode: 'dark',
      },

      // Toast Notifications
      toast: {
        visible: false,
        message: '',
        type: 'success',
      },

      // ===== ACTIONS =====

      incrementStats: (type) =>
        set((state) => ({
          stats: {
            ...state.stats,
            totalMessagesProcessed: (state.stats.totalMessagesProcessed || 0) + 1,
            [type]: (state.stats[type] || 0) + 1,
          },
        })),

      setVibeIntensity: (vibeId, level) =>
        set((state) => ({
          vibeIntensity: {
            ...state.vibeIntensity,
            [vibeId]: Math.max(1, Math.min(5, level)),
          },
        })),

      addScheduledMode: (scheduledMode) =>
        set((state) => ({
          scheduledModes: [...state.scheduledModes, scheduledMode],
        })),

      removeScheduledMode: (id) =>
        set((state) => ({
          scheduledModes: state.scheduledModes.filter((m) => m.id !== id),
        })),

      addCustomTone: (tone) =>
        set((state) => ({
          customTones: [...state.customTones, tone],
        })),

      setContactSetting: (contactId, setting) =>
        set((state) => ({
          contactSettings: {
            ...state.contactSettings,
            [contactId]: {
              ...(state.contactSettings[contactId] || {}),
              ...setting,
            },
          },
        })),

      addIncognitoContact: (contact) =>
        set((state) => ({
          incognitoContacts: [...state.incognitoContacts, contact],
        })),

      removeIncognitoContact: (contact) =>
        set((state) => ({
          incognitoContacts: state.incognitoContacts.filter((c) => c !== contact),
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),

      resetStats: () =>
        set({
          stats: {
            totalDraftsApproved: 0,
            totalDraftsSkipped: 0,
            totalMessagesProcessed: 0,
            activeModeMinutes: {},
            lastResetDate: new Date().toISOString(),
          },
        }),

      showToast: (message, type) =>
        set({
          toast: {
            visible: true,
            message: message || '',
            type: type || 'success',
          },
        }),

      hideToast: () =>
        set({
          toast: {
            visible: false,
            message: '',
            type: 'success',
          },
        }),
    }),
    {
      name: 'silentmode-storage',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          Logger.info('Store rehydrated from storage');
        }
      },
    }
  )
);