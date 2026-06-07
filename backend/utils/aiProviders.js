const { Groq } = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGROQ(prompt, maxTokens = 60, temperature = 0.8) {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-70b-versatile', max_tokens: maxTokens, temperature,
  });
  return completion.choices[0]?.message?.content?.trim();
}

async function callGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function callWithFallback(prompt, options = {}) {
  try { return await callGROQ(prompt, options.maxTokens, options.temperature); }
  catch (groqError) {
    console.error('GROQ failed, falling back to Gemini:', groqError.message);
    try { return await callGemini(prompt); }
    catch (geminiError) { console.error('Both AI providers failed:', geminiError.message); return null; }
  }
}

module.exports = { callWithFallback, callGROQ, callGemini };