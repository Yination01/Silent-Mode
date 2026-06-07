// Update the draft prompt call to include intensity:
const vibeIntensity = req.body.intensity || 3;
const draftPrompt = createAutoDraftPrompt(
  effectiveTone, 
  userData.textLength, 
  activeModeMessage, 
  context, 
  incomingText,
  vibeIntensity
);

let draft = await callWithFallback(draftPrompt, { maxTokens: 60, temperature: 0.8 });
if (!draft) draft = getFallbackReply(effectiveTone, vibeIntensity);