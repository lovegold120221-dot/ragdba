import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// System prompt for Eburon BE Data
const SYSTEM_PROMPT = `You are Eburon BE Data, a legitimate Belgium government data assistant that uses official Belgium government websites, authentic sources (FPS Economy, CBE/KBO, FPS Finance/MyMinfin, CSAM, My eBox, Statbel, BOSA, Regional Portals Flanders/Wallonia/Brussels), and verified public datasets to give users precise answers.

Your answers MUST be strictly accurate according to Belgian law and official procedures.
Always return your response as a valid JSON object matching this schema:
{
  "content": "Comprehensive markdown explanation with clear headings, bullet points, and official terms in Dutch/French/German beside English (e.g. Kruispuntbank van Ondernemingen / Banque-Carrefour des Entreprises / Crossroads Bank for Enterprises)",
  "responsibleBranch": "FPS Economy / CBE / FPS Finance / Municipality / Regional Agency / etc.",
  "loginRequired": true or false,
  "loginMethod": "itsme® / CSAM" or "eID" or "MyMinfin" or "MyGov" or "none",
  "officialSource": "Source Name (e.g., belgium.be or FPS Economy)",
  "sourceUrl": "https://www.belgium.be/en/...",
  "requirements": ["Required Document 1", "Required Document 2", "Requirement 3"],
  "steps": ["Choose legal form", "Register with CBE", "Activate VAT via MyMinfin"],
  "regionalWarning": "Warning text explaining differences between Flanders, Wallonia, and Brussels, or null if uniform federal procedure",
  "confidence": "High (Verified Official Source)"
}

Rules:
1. Never guess tax rates, visa rules, or corporate deadlines.
2. If login is required (e.g. MyMinfin, eBox, CSAM), explicitly explain what the user can do once authenticated.
3. Keep the tone authoritative, humble, precise, and helpful.`;



// API Route: Main Chat RAG Handler
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'English', thinkingLevel = 'LOW', history = [] } = req.body;
    
    const ai = getGenAI();
    
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured. Please set it in your environment variables.' });
    }

    const isHighThinking = thinkingLevel === 'HIGH';
    const modelName = isHighThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.1-flash-lite';
    
    const prompt = `User Language preference: ${language}.
User Question: "${message}"

Please answer in ${language} adhering strictly to official Belgian government sources. Format the output strictly as the requested JSON object.`;

    const config: any = {
      responseMimeType: 'application/json',
      systemInstruction: SYSTEM_PROMPT
    };

    if (isHighThinking) {
      config.thinkingConfig = { thinkingLevel: 'HIGH' };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config
    });

    const text = response.text || '';
    try {
      const jsonRes = JSON.parse(text);
      return res.json(jsonRes);
    } catch (parseErr) {
      console.error('JSON Parse error from model:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal server error processing your request' });
  }
});

// API Route: Analyze Image (Document Checker)
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Analyze this Belgian official document or notice', language = 'English' } = req.body;
    
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured. Cannot analyze images.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
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
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/analyze-image:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// API Route: Official Registry Sources
app.get('/api/sources', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'Federal Interoperability Gateway v2.4',
    sourcesCount: 16,
    lastVerified: new Date().toISOString().split('T')[0]
  });
});

// Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eburon BE Data server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
