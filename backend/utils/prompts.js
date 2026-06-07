const TONE_STYLES = {
  professional: "Use professional language. Clean, direct, respectful.",
  chill: "Use relaxed, minimal language. Low effort, unbothered tone.",
  warm: "Use friendly, kind language. Caring but concise.",
  spicy: "Use bold, direct language. Savage but not cruel.",
  sarcastic: "Use witty, dry humor. Eye-roll energy. Funny but not mean. Never target protected groups.",
  culture: "Use warm Nigerian auntie tone. Add 'my dear', no pidgin unless user uses it.",
};

const INTENSITY_MODIFIERS = {
  sarcastic: {
    1: "Lightly dry/sarcastic. Subtle eye-roll tone. 1 sentence. Ex: 'Sure, just super free right now. Text later'",
    2: "Playful sarcasm with softener. Ex: 'Oh totally not busy at all 😅 brb'",
    3: "Standard sarcastic. Use 🙄, 'wow', 'sure'. 1 sentence. Ex: 'Oh sure, let me drop everything 🙄 text u later'",
    4: "Heavy sarcasm. Short + biting but not cruel. Ex: 'Shocking. Can't talk.'",
    5: "Maximum sarcasm / deadpan. Brutal wit. 3-7 words. Ex: 'Wow. Groundbreaking.', 'Cool story. Busy.' No emoji unless mocking. Never punch down.",
  },
  professional: {
    1: "Brief and polite. Short acknowledgment. Ex: 'Thank you. Will follow up.'",
    2: "Professional but efficient. Ex: 'Got it. Will respond soon.'",
    3: "Standard professional. Clear and courteous. Ex: 'Received. I'll review and get back to you.'",
    4: "Formal and thorough. Ex: 'Acknowledged. Response forthcoming.'",
    5: "Maximum formality. Comprehensive and polished. Ex: 'Understood. I will provide a comprehensive response at my earliest convenience.'",
  },
  chill: {
    1: "Minimal. 1-3 words. Ex: 'cool', 'k', 'bet'",
    2: "Very brief. 1 sentence max. Ex: 'yeah cool, later'",
    3: "Relaxed. Short sentence. Ex: 'yeah sounds good, text u later'",
    4: "Ultra casual. Can be dismissive. Ex: 'bet. busy rn.'",
    5: "Bare minimum. 1 word acceptable. Ex: 'k.', 'seen.'",
  },
  warm: {
    1: "Friendly but brief. Ex: 'Hey! Busy but thinking of you 💛'",
    2: "Warm with one emoji. Ex: 'Aww thanks! Swamped rn but text soon 💛'",
    3: "Caring and expressive. Ex: 'That's so sweet! Tied up rn but let's catch up later 💛'",
    4: "Very warm, multiple emojis. Ex: 'You're the best! Super busy but sending love 💛✨'",
    5: "Overflowing warmth. Multiple sentences with emojis. Ex: 'My heart is full! I'm drowning in work but you made my day 💛💛💛'",
  },
  spicy: {
    1: "Firm but polite. Ex: 'Not right now.'",
    2: "Direct. Short sentences. Ex: 'Busy. Later.'",
    3: "Bold. Can be slightly aggressive. Ex: 'Read the room. I'm busy.'",
    4: "Heavy spice. Confrontational tone. Ex: 'Did I stutter? Busy.'",
    5: "Maximum spice. Intense and unapologetic. Ex: 'Leave. Me. Alone. 🌶️'",
  },
  culture: {
    1: "Light Nigerian auntie warmth. Ex: 'My dear, I dey busy small. I go reply you.'",
    2: "Standard auntie. Ex: 'Ah ah my dear, I dey work now o. Later na.'",
    3: "Full auntie mode. Ex: 'My darling, abeg give me small time. I go call you back proper.'",
    4: "Heavy auntie energy. Ex: 'Ehn ehn! You sef know say I dey busy now. No vex!'",
    5: "Maximum Nigerian auntie. Expressive, warm, dramatic. Ex: 'CHAI! My own don finish! I go reply you when I free, my dear. No kill me with plenty message o!'",
  },
};

function createSmartTriagePrompt(tonePreset, message) {
  return `Classify this message for a user in ${tonePreset} mode: '${message}'. Return ONLY one word: Urgent, Work, Friends, Family, Spam, or CanWait`;
}

function createAutoDraftPrompt(tonePreset, textLength, activeModeMessage, last5Messages, incomingText, intensity = 3) {
  const toneStyle = TONE_STYLES[tonePreset] || TONE_STYLES.professional;
  
  // Get intensity modifier
  const modifiers = INTENSITY_MODIFIERS[tonePreset] || {};
  const intensityGuide = modifiers[intensity] || `Standard ${tonePreset} tone.`;
  
  const lengthGuide = textLength === 'short' 
    ? 'Keep reply to 1-2 lines maximum.' 
    : textLength === 'long' 
      ? 'You can write 2-3 lines.' 
      : 'Write a normal length reply.';
  
  const modeContext = activeModeMessage 
    ? `The user has set this away message: "${activeModeMessage}". Reflect this in your reply.` 
    : '';
  
  const contextStr = last5Messages && last5Messages.length > 0 
    ? `Recent conversation context: ${JSON.stringify(last5Messages)}` 
    : '';

  return `You are texting as the user.
Tone: ${toneStyle}
Intensity Guide: ${intensityGuide}
Length: ${lengthGuide}
${modeContext}
${contextStr}
Incoming message: '${incomingText}'
Write a natural reply. No quotes, no explanations. Follow the intensity guide exactly.`;
}

function getFallbackReply(tonePreset, intensity = 3) {
  const fallbacks = {
    professional: {
      1: "Thank you. I'll follow up.",
      3: "Thank you for your message. I will respond at my earliest convenience.",
      5: "I acknowledge receipt of your message and will provide a comprehensive response shortly.",
    },
    chill: {
      1: "cool.",
      3: "Hey! I'll get back to you soon 😊",
      5: "k.",
    },
    warm: {
      1: "Hey! Busy but thinking of you 💛",
      3: "Hey! I'll get back to you soon 😊",
      5: "You're the sweetest! Swamped rn but I love you 💛💛💛",
    },
    spicy: {
      1: "Not now.",
      3: "Busy. Will reply when I can.",
      5: "I said I'm busy. Leave me alone. 🌶️",
    },
    sarcastic: {
      1: "Sure thing. Later.",
      3: "Oh sure, let me drop everything 🙄 text u later",
      5: "Wow. Groundbreaking.",
    },
    culture: {
      1: "My dear, I go reply you soon.",
      3: "My dear, I go reply you soon. No vex 😊",
      5: "CHAI! My own don finish o! I go reply you when I free proper. No vex my darling!",
    },
  };

  const toneFallbacks = fallbacks[tonePreset] || fallbacks.professional;
  // Return closest intensity match
  const availableIntensities = Object.keys(toneFallbacks).map(Number).sort((a, b) => a - b);
  const closestIntensity = availableIntensities.reduce((prev, curr) => 
    Math.abs(curr - intensity) < Math.abs(prev - intensity) ? curr : prev
  );
  
  return toneFallbacks[closestIntensity] || toneFallbacks[3] || "I'll get back to you soon!";
}

module.exports = { createSmartTriagePrompt, createAutoDraftPrompt, getFallbackReply, TONE_STYLES, INTENSITY_MODIFIERS };