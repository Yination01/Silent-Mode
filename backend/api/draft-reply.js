@'
const { db, auth } = require("../utils/firebaseAdmin");
const { callWithFallback } = require("../utils/aiProviders");
const { createSmartTriagePrompt, createAutoDraftPrompt, getFallbackReply } = require("../utils/prompts");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!db || !auth) {
    return res.status(500).json({ error: "Service unavailable" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { userId, platform, sender, incomingText, context, overrideTone, intensity } = req.body;

    if (userId !== decodedToken.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    if (userData.vipContacts && userData.vipContacts.includes(sender)) {
      return res.json({ draft: null, label: "VIP", action: "bypass" });
    }

    const modesSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("modes")
      .where("active", "==", true)
      .limit(1)
      .get();

    let activeModeMessage = null;
    if (!modesSnapshot.empty) {
      activeModeMessage = modesSnapshot.docs[0].data().autoMessage;
    }

    const effectiveTone = overrideTone || userData.tonePreset || "chill";
    const vibeIntensity = intensity || 3;

    const triagePrompt = createSmartTriagePrompt(effectiveTone, incomingText);
    const label = (await callWithFallback(triagePrompt, { maxTokens: 10, temperature: 0.3 })) || "CanWait";

    if (label === "Spam") {
      return res.json({ draft: null, label: "Spam", action: "skip" });
    }

    const draftPrompt = createAutoDraftPrompt(
      effectiveTone,
      userData.textLength,
      activeModeMessage,
      context,
      incomingText,
      vibeIntensity
    );

    let draft = await callWithFallback(draftPrompt, { maxTokens: 60, temperature: 0.8 });
    if (!draft) {
      draft = getFallbackReply(effectiveTone, vibeIntensity);
    }

    try {
      await db
        .collection("users")
        .doc(userId)
        .collection("draftLogs")
        .add({
          platform: platform || "unknown",
          sender: sender || "Unknown",
          incomingText,
          draftReply: draft,
          status: "sent",
          createdAt: new Date(),
        });
    } catch (logError) {
      console.error("Failed to log draft:", logError.message);
    }

    res.json({ draft, label, tone: effectiveTone });
  } catch (error) {
    console.error("Draft reply error:", error);
    res.status(500).json({ error: "Failed to generate reply" });
  }
};
'@ | Set-Content draft-reply.js
