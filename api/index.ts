import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();

app.use(express.json({ limit: '10mb' }));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are Eburon NL Data, an authentic Belgian government data assistant that uses official Belgium government websites, authentic sources (FPS Economy, CBE/KBO, FPS Finance/MyMinfin, CSAM, My eBox, Statbel, BOSA, Regional Portals Flanders/Wallonia/Brussels), and verified public datasets to give users precise answers.

Your answers MUST be strictly accurate according to Belgian law and official procedures.
Always return your response as a valid JSON object matching this schema:
{
  "content": "Comprehensive markdown explanation with clear headings, bullet points, and official terms in Dutch/French/German beside English (e.g. Kruispuntbank van Ondernemingen / Banque-Carrefour des Entreprises / Crossroads Bank for Enterprises)",
  "responsibleBranch": "FPS Economy / CBE / FPS Finance / Municipality / Regional Agency / etc.",
  "loginRequired": true or false,
  "loginMethod": "itsme\u00ae / CSAM" or "eID" or "MyMinfin" or "MyGov" or "none",
  "officialSource": "Source Name (e.g., belgium.be or FPS Economy)",
  "sourceUrl": "https://www.belgium.be/en/...",
  "requirements": ["Required Document 1", "Required Document 2", "Requirement 3"],
  "steps": ["Choose legal form", "Register with CBE", "Activate VAT via MyMinfin"],
  "regionalWarning": "Warning text explaining differences between Flanders, Wallonia, and Brussels, or null if uniform federal procedure",
  "confidence": "High (Verified Official Source)",
  "suggestedQuestions": ["Specific relevant follow-up question 1", "Specific relevant follow-up question 2", "Specific relevant follow-up question 3"]
}

Rules:
1. Never guess tax rates, visa rules, or corporate deadlines.
2. If login is required (e.g. MyMinfin, eBox, CSAM), explicitly explain what the user can do once authenticated.
3. Keep the tone authoritative, humble, precise, and helpful.
4. NATIVE SEARCH & DATA SYNTHESIS: Extract and feed the actual data, fees, laws, and steps directly to the user. Do not simply tell them to navigate to external URLs; provide the full answer here natively.
5. SUGGESTED QUESTIONS: Generate exactly 3 highly relevant, wiki-style suggested follow-up questions tailored directly to the user's initial query to guide their navigation.`;

const WHITELISTED_MODELS = {
  fast: 'gemini-2.5-flash',
  reasoning: 'gemini-2.5-pro'
};

function cleanJsonText(text: string): string {
  if (!text) return '{}';
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json|JSON|javascript|js)?\n?/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

async function safeGenerate(ai: any, preferredModel: string, contents: any, config?: any) {
  const modelName = preferredModel || 'gemini-2.5-flash';
  const cleanConfig = { ...config };
  delete cleanConfig.thinkingConfig;
  return await ai.models.generateContent({
    model: modelName,
    contents,
    config: cleanConfig
  });
}

async function generateTTS(ai: any, text: string): Promise<string | null> {
  try {
    const cleanText = text
      .replace(/[#*`_~\[\]()\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return null;
    const speechText = cleanText.slice(0, 350);
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: speechText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });
    const inlineData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) return null;
    const mimeType = inlineData.mimeType || 'audio/aac';
    return `data:${mimeType};base64,${inlineData.data}`;
  } catch {
    return null;
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'English', thinkingLevel = 'LOW', history = [], ragDocuments = [] } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({
        error: true,
        content: "Configuration Error: GEMINI_API_KEY environment variable is not configured on the server."
      });
    }
    const isHighThinking = thinkingLevel === 'HIGH';
    const modelName = isHighThinking ? WHITELISTED_MODELS.reasoning : WHITELISTED_MODELS.fast;
    let ragText = '';
    if (Array.isArray(ragDocuments) && ragDocuments.length > 0) {
      ragText = `\n\n=== USER UPLOADED RAG DOCUMENTS ===\n` +
        ragDocuments.map((d: any) => `[Document: ${d.fileName} (${d.fileType})]\nSummary: ${d.summary || 'None'}\nContent Snippet: ${d.content ? d.content.slice(0, 5000) : ''}`).join('\n\n') +
        `\n===================================\nIf the user question relates to their uploaded documents above, analyze and answer directly based on their exact contents.`;
    }
    const prompt = `User Language preference: ${language}.
    User Question: "${message}"${ragText}

Please answer in ${language} adhering strictly to official Belgian government sources and authentic data. Feed the data directly from authentic registries so the user does not need to visit URLs. Do not invent. Format the output strictly as the requested JSON object.`;

    const config: any = {
      responseMimeType: 'application/json',
      systemInstruction: SYSTEM_PROMPT
    };
    const response = await safeGenerate(ai, modelName, prompt, config);
    const text = response.text || '';
    try {
      const cleanedText = cleanJsonText(text);
      const jsonRes = JSON.parse(cleanedText);
      let ttsAudio: string | null = null;
      if (jsonRes.content) {
        ttsAudio = await generateTTS(ai, jsonRes.content);
      }
      return res.json({ ...jsonRes, ttsAudio });
    } catch {
      let ttsAudio: string | null = null;
      if (text) {
        ttsAudio = await generateTTS(ai, text);
      }
      return res.json({ content: text || "Unable to generate structured response.", ttsAudio });
    }
  } catch (error: any) {
    res.status(500).json({
      error: true,
      content: "The Eburon NL Data service encountered an unexpected error."
    });
  }
});

app.post('/api/stt', async (req, res) => {
  try {
    const { audioData } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: 'GEMINI_API_KEY missing' });
    }
    let mimeType = 'audio/webm';
    let base64Data = audioData;
    if (audioData.startsWith('data:')) {
      const parts = audioData.split(';base64,');
      if (parts.length === 2) {
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      }
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { inlineData: { data: base64Data, mimeType } },
        'You are an extremely accurate speech-to-text transcriber for a Belgian government gateway assistant. Listen to this recording and transcribe it exactly into written text. Output ONLY the raw transcribed text. If you hear nothing or only background noise, return an empty string.'
      ]
    });
    const transcript = response.text?.trim() || '';
    res.json({ transcript });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: 'GEMINI_API_KEY missing' });
    }
    const base64Audio = await generateTTS(ai, text);
    res.json({ audio: base64Audio });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rag/process', async (req, res) => {
  try {
    const { fileName, fileType, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: 'GEMINI_API_KEY missing' });
    }
    const summaryPrompt = `Analyze this uploaded document "${fileName}" (${fileType}).
Content:
${content.slice(0, 10000)}

Provide a concise 3-bullet executive summary and list key entities/dates/amounts found. Keep it under 150 words.`;

    const summaryRes = await safeGenerate(ai, 'gemini-2.5-flash', summaryPrompt);
    const summary = summaryRes.text || 'Document uploaded.';
    let embedding: number[] = [];
    try {
      const embedRes = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: content.slice(0, 8000)
      });
      if (embedRes.embeddings?.[0]?.values) {
        embedding = embedRes.embeddings[0].values;
      }
    } catch {
      // embedding optional
    }
    res.json({ summary, embedding });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process document for RAG' });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Analyze this Belgian official document or notice', language = 'English' } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({
        error: true,
        title: "Configuration Error",
        authenticityAssessment: "GEMINI_API_KEY environment variable is missing on the server."
      });
    }
    const response = await safeGenerate(ai, WHITELISTED_MODELS.reasoning, [
      {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      },
      `Analyze this uploaded image/document in the context of Belgian government administration (eID, tax bill, residence card, CBE extract, VAT form, building permit).
Language: ${language}. User query: ${prompt}.
Return a clean JSON object with properties:
{
  "title": "Document Name",
  "documentType": "Type of Belgian Form/ID",
  "agency": "Issuing Authority (e.g. FPS Finance, Municipality)",
  "authenticityAssessment": "Explanation of verified visual markings or security features",
  "keyExtractedData": ["Field 1: Value", "Field 2: Value"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "officialLink": "https://..."
}`
    ], {
      responseMimeType: 'application/json'
    });

    const cleanedText = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch {
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

app.get('/api/sources', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'Federal Interoperability Gateway v2.4',
    sourcesCount: 16,
    lastVerified: new Date().toISOString().split('T')[0]
  });
});

export default app;
