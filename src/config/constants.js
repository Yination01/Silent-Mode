export const TONE_PRESETS = [
  { 
    id: 'professional', 
    label: 'Professional', 
    emoji: '💼', 
    description: 'For work & formal chats',
    shortDesc: 'Clean, direct, respectful',
  },
  { 
    id: 'chill', 
    label: 'Chill', 
    emoji: '😌', 
    description: 'Low effort, unbothered',
    shortDesc: 'Relaxed, minimal, cool',
  },
  { 
    id: 'warm', 
    label: 'Warm', 
    emoji: '💛', 
    description: 'Caring but busy',
    shortDesc: 'Friendly, kind, thoughtful',
  },
  { 
    id: 'spicy', 
    label: 'Spicy', 
    emoji: '🌶️', 
    description: "Savage, annoyed, or 'leave me alone' mode",
    shortDesc: 'Bold, direct, no-nonsense',
  },
  { 
    id: 'sarcastic', 
    label: 'Sarcastic', 
    emoji: '🙄', 
    description: 'Witty eye-roll energy',
    shortDesc: 'Dry humor, playful annoyance',
  },
  { 
    id: 'culture', 
    label: 'Culture', 
    emoji: '🌍', 
    description: 'Nigerian Auntie style',
    shortDesc: 'Warm, familial, expressive',
  },
];

export const VIBE_INTENSITY_DEFAULTS = {
  professional: 3,
  chill: 3,
  warm: 3,
  spicy: 3,
  sarcastic: 3,
  culture: 3,
};

export const VIBE_INTENSITY_LABELS = {
  1: 'Subtle',
  2: 'Light',
  3: 'Medium',
  4: 'Strong',
  5: 'Maximum',
};

export const TEXT_LENGTHS = [
  { id: 'short', label: 'Short texter', emoji: '✏️', example: '1-2 lines max' },
  { id: 'medium', label: 'Medium texter', emoji: '📝', example: '2-3 lines normally' },
  { id: 'long', label: 'Long texter', emoji: '📖', example: 'Detailed responses' },
  { id: 'not_sure', label: 'Not sure', emoji: '🤔', example: 'Take a quick survey' },
];

export const DEFAULT_MODES = [
  { id: 'focus', name: 'Focus Mode', type: 'focus', autoMessage: 'In deep work mode. Will reply after 5pm.', active: false, icon: '🎯', color: '#00FF88' },
  { id: 'social_battery_low', name: 'Social Battery Low', type: 'social_battery_low', autoMessage: 'Recharging today. Love you but can we text tomorrow?', active: false, icon: '🔋', color: '#FFD700' },
  { id: 'sleep', name: 'Sleep Mode', type: 'sleep', autoMessage: 'Sleeping. Up at 7am, will reply then.', active: false, icon: '😴', color: '#4488FF' },
];

export const SURVEY_QUESTIONS = [
  { q: "Someone texts 'wyd'. You reply:", a: ["Nm u?", "Not much, just chilling. You?", "Not much at the moment, how about yourself?"], mapping: ['short', 'medium', 'long'] },
  { q: "Your boss says 'Can you send report?'. You reply:", a: ["On it", "Sure, sending over now!", "Absolutely, I'll prepare and send it right away."], mapping: ['short', 'medium', 'long'] },
  { q: "Friend cancels plans. You reply:", a: ["k", "No worries! Raincheck?", "That's completely fine, we can reschedule for another time."], mapping: ['short', 'medium', 'long'] },
];

export const RATE_LIMITS = { MAX_REQUESTS_PER_DAY: 14400, QUEUE_RETRY_DELAY: 1000, MAX_RETRIES: 3 };

export const URLS = {
  GITHUB_REPO: 'https://github.com/silentmodeapp/silentmode',
  BUY_ME_COFFEE: 'https://www.buymeacoffee.com/silentmode',
  PRIVACY_POLICY: 'https://silentmode.app/privacy',
  TERMS_OF_SERVICE: 'https://silentmode.app/terms',
  SUPPORT_EMAIL: 'support@silentmode.app',
  LEGAL_EMAIL: 'legal@silentmode.app',
};

export const APP_VERSION = '2.1.0';