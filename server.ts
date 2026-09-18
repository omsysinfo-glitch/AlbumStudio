import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support large payload for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Google GenAI SDK client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API endpoint: Generate Image with Gemini 3.1 Flash Image
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '3:2', eventTag = 'Event Photo', title } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();

    // Map common album aspect ratios to valid Gemini Image aspect ratios
    // Supported values: "1:1", "3:4", "4:3", "9:16", "16:9"
    let targetRatio = '4:3';
    if (aspectRatio === '16:9' || aspectRatio === '3:2') {
      targetRatio = '16:9';
    } else if (aspectRatio === '3:4' || aspectRatio === '2:3') {
      targetRatio = '3:4';
    } else if (aspectRatio === '1:1') {
      targetRatio = '1:1';
    } else if (aspectRatio === '4:3') {
      targetRatio = '4:3';
    } else if (aspectRatio === '9:16') {
      targetRatio = '9:16';
    }

    // Try primary model gemini-3.1-flash-image-preview / gemini-3.1-flash-image, fallback to gemini-3.1-flash-lite-image
    const modelsToTry = [
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
    ];

    let generatedImageUrl: string | null = null;
    let usedModel = modelsToTry[0];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: targetRatio,
              imageSize: '1K',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            usedModel = model;
            break;
          }
        }

        if (generatedImageUrl) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next fallback:`, err?.message || err);
      }
    }

    if (!generatedImageUrl) {
      throw lastError || new Error('No image was returned by the model');
    }

    const isPortrait = targetRatio === '3:4' || targetRatio === '9:16';
    const width = isPortrait ? 3000 : 4500;
    const height = isPortrait ? 4500 : 3000;

    const newAsset = {
      id: `ai-gen-${Date.now()}`,
      title: title || `AI Generated: ${prompt.slice(0, 35)}...`,
      filename: `ai_photo_${Date.now()}.png`,
      url: generatedImageUrl,
      thumbUrl: generatedImageUrl,
      width,
      height,
      aspectRatio: width / height,
      orientation: isPortrait ? 'portrait' : 'landscape',
      timestamp: new Date().toISOString(),
      qualityScore: 98,
      eventTag: eventTag || 'AI Generated',
      isAiGenerated: true,
      promptUsed: prompt,
      modelUsed: usedModel,
      saliency: [
        {
          x: 0.25,
          y: 0.20,
          width: 0.50,
          height: 0.55,
          label: 'AI Primary Subject',
          confidence: 0.97,
        },
      ],
    };

    res.json({
      success: true,
      asset: newAsset,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Gemini image generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate image with Gemini',
      details: error.toString(),
    });
  }
});

// API endpoint: Edit existing photo with Gemini 3.1 Flash Image
app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, originalAsset } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    // Strip data URL prefix if present
    const rawBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const ai = getGenAI();

    const modelsToTry = [
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
    ];

    let editedImageUrl: string | null = null;
    let usedModel = modelsToTry[0];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: rawBase64,
                  mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const outMime = part.inlineData.mimeType || 'image/png';
            editedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
            usedModel = model;
            break;
          }
        }

        if (editedImageUrl) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Edit model ${model} failed, trying next:`, err?.message || err);
      }
    }

    if (!editedImageUrl) {
      throw lastError || new Error('No edited image was returned by the model');
    }

    const updatedAsset = {
      ...originalAsset,
      id: `ai-edit-${Date.now()}`,
      title: `${originalAsset?.title || 'Photo'} (AI Edited: ${prompt.slice(0, 25)})`,
      url: editedImageUrl,
      thumbUrl: editedImageUrl,
      isAiEdited: true,
      editPromptUsed: prompt,
      timestamp: new Date().toISOString(),
      qualityScore: 98,
    };

    res.json({
      success: true,
      asset: updatedAsset,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Gemini image edit error:', error);
    res.status(500).json({
      error: error.message || 'Failed to edit image with Gemini',
      details: error.toString(),
    });
  }
});

// API endpoint: Event-aware smart prompt suggestions
app.post('/api/gemini/suggest-prompts', async (req, res) => {
  try {
    const { eventType = 'indian_wedding', ceremony } = req.body;
    const ai = getGenAI();

    const promptText = `Provide 4 detailed photographic prompts for creating high-end, print-ready album spread photos for an ${eventType} event (specifically focusing on ${ceremony || 'key cultural and emotional moments'}).
Return a JSON array of 4 strings with no markdown backticks, where each string describes subject, lighting, attire, colors, camera lens angle, and composition.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const suggestions = JSON.parse(response.text?.trim() || '[]');
    res.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Suggest prompts error:', error);
    // Fallback default suggestions
    res.json({
      success: false,
      suggestions: [
        'Bride in royal crimson lehenga with gold zardozi embroidery and emerald necklace, looking towards camera, warm palace lighting',
        'Joyful Haldi ceremony moment with yellow marigold petals showering over the smiling bride and groom in raw silk kurtas',
        'Groom on royal white mare during Baraat with illuminated lanterns and friends dancing in sherwanis',
        'Sacred Saat Phere ceremony with couple walking around holy fire, soft smoke and golden temple bokeh',
      ],
    });
  }
});

// Vite middleware for development & static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FolioCraft server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
