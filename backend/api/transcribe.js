const { HfInference } = require('@huggingface/inference');
const { auth } = require('../utils/firebaseAdmin');

const hf = process.env.HF_API_KEY ? new HfInference(process.env.HF_API_KEY) : null;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!hf) return res.status(500).json({ error: 'Transcription service not configured' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try { await auth.verifyIdToken(authHeader.split('Bearer ')[1]); }
  catch (error) { return res.status(401).json({ error: 'Invalid token' }); }

  try {
    const { audioBase64 } = req.body;
    if (!audioBase64) return res.status(400).json({ error: 'No audio data provided' });
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const result = await hf.automaticSpeechRecognition({ model: 'openai/whisper-tiny', data: audioBuffer });
    res.json({ text: result.text });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
};