import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Load API keys
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || 'K89505440888957';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OCR_SPACE_API_ENDPOINT = 'https://api.ocr.space/parse/image';
const OPENROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// Ensure upload directory exists
const uploadsDir = 'uploads';
mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Keywords to detect medical content
const medicalKeywords = [
  'patient', 'diagnosis', 'prescription', 'medicine', 'medication',
  'doctor', 'hospital', 'clinic', 'symptom', 'disease', 'treatment',
  'therapy', 'drug', 'dosage', 'pharmacy', 'medical', 'health',
  'breast', 'lung', 'lymphnode', 'metastasis', 'vertebra', 'chest',
];

// Helper to clean malformed JSON
function cleanOpenRouterResponse(rawContent) {
  return rawContent
    .replace(/```(?:json)?/g, '')        // remove markdown code fences
    .replace(/[\x00-\x1F\x7F]/g, '')     // remove control characters
    .replace(/,(\s*[\]}])/g, '$1')       // remove trailing commas
    .trim();
}

// OCR + AI Analysis route
app.post('/ocr', upload.single('file'), async (req, res) => {
  let extractedText = '';
  let filePath = req.file?.path;

  try {
    if (req.body.text) {
      extractedText = req.body.text.trim();
      console.log('Received Text:', extractedText);
    } else if (req.file) {
      const ocrFormData = new FormData();
      ocrFormData.append('file', fs.createReadStream(req.file.path));
      ocrFormData.append('apikey', OCR_SPACE_API_KEY);
      ocrFormData.append('language', 'eng');
      ocrFormData.append('isOverlayRequired', 'false');

      const ocrResponse = await axios.post(OCR_SPACE_API_ENDPOINT, ocrFormData, {
        headers: { ...ocrFormData.getHeaders() },
      });

      const ocrResult = ocrResponse.data;
      if (ocrResult.IsErroredOnProcessing) {
        throw new Error('OCR failed: ' + ocrResult.ErrorMessage.join(', '));
      }

      extractedText = ocrResult.ParsedResults[0]?.ParsedText.trim() || '';
      console.log('Extracted Text:', extractedText);
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    // Quick keyword check
    const isTextMedical = medicalKeywords.some(keyword =>
      extractedText.toLowerCase().includes(keyword)
    );
    if (!isTextMedical) {
      return res.json({
        extractedText,
        error: 'Not a medical text. Please provide a valid medical report.',
        diseases: [],
      });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(401).json({ error: 'Missing OpenRouter API key' });
    }

    // Build OpenRouter request
    const openRouterPayload = {
      model: 'deepseek/deepseek-r1:free',
      messages: [
        {
          role: 'user',
          content: `You are a medical assistant. Based on the following text from a medical report:

"${extractedText}"

Identify potential diseases, suggest appropriate medications, and provide links to purchase these medicines from reputable online pharmacies.

Respond ONLY in this strict JSON format:

{
  "extractedText": "string",
  "diseases": [
    {
      "name": "string",
      "medicines": ["string"],
      "purchaseLinks": ["string"]
    }
  ]
}

If no diseases found, return:

{
  "extractedText": "...",
  "diseases": []
}`,
        },
      ],
      response_format: { type: 'json_object' },
    };

    const openRouterResponse = await axios.post(OPENROUTER_API_ENDPOINT, openRouterPayload, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Medico App',
      },
    });

    const rawContent = openRouterResponse.data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Invalid OpenRouter response structure');
    }

    const cleaned = cleanOpenRouterResponse(rawContent);
    console.log('Cleaned AI Response:\n', cleaned);

    const parsed = JSON.parse(cleaned);

    res.json({
      extractedText: parsed.extractedText || extractedText,
      diseases: parsed.diseases || [],
    });

  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      rawResponse: error.response?.data,
      rawContent: error.response?.data?.choices?.[0]?.message?.content || null,
    };

    console.error('Error during processing:', errorDetails);
    res.status(500).json({ error: 'Processing failed', details: errorDetails });
  } finally {
    if (filePath) {
      try {
        await fsPromises.unlink(filePath);
        console.log('Temporary file deleted:', filePath);
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError.message);
      }
    }
  }
});

// Start server
app.listen(port, () => {
  console.log(`🩺 Medico Server is running at http://localhost:${port}`);
});
