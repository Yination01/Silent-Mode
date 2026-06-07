// Add intensity to the API call:
const vibeIntensity = useAppStore.getState().vibeIntensity;
const effectiveIntensity = vibeIntensity[effectiveTone] || 3;

const result = await apiCall(
  endpoints.draftReply,
  {
    userId,
    platform,
    sender,
    incomingText,
    context,
    overrideTone: effectiveTone,
    intensity: effectiveIntensity,
  },
  token,
  15000
);