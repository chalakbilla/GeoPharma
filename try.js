import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs'; // Standard fs for createReadStream
import { promises as fsPromises } from 'fs'; // Promises for async operations
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// OCR.Space API credentials
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || 'K89505440888957';
const OCR_SPACE_API_ENDPOINT = 'https://api.ocr.space/parse/image';

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
mkdir(uploadsDir, { recursive: true }).catch(err => {
  console.error('Error creating uploads directory:', err.message);
});

// Set up CORS to allow all origins
app.use(cors({ origin: '*' }));

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware to parse JSON
app.use(express.json());

// Basic medical keyword check for text
const medicalKeywords = [
  'patient', 'diagnosis', 'prescription', 'medicine', 'medication',
  'doctor', 'hospital', 'clinic', 'symptom', 'disease', 'treatment',
  'therapy', 'drug', 'dosage', 'pharmacy', 'medical', 'health',
  'breast', 'lung', 'lymphnode', 'metastasis', 'vertebra', 'chest',
];

// Route to handle file upload or text input and process medical report
app.post('/ocr', upload.single('file'), async (req, res) => {
  let extractedText = '';
  let filePath = req.file?.path;

  try {
    // Handle text input if provided
    if (req.body.text) {
      extractedText = req.body.text.trim();
      console.log('Received Text:', extractedText);
    } 
    // Handle file upload
    else if (req.file) {
      // Extract text from the image using OCR.Space API
      const ocrFormData = new FormData();
      ocrFormData.append('file', fs.createReadStream(req.file.path)); // Use standard fs
      ocrFormData.append('apikey', OCR_SPACE_API_KEY);
      ocrFormData.append('language', 'eng');
      ocrFormData.append('isOverlayRequired', 'false');

      const ocrResponse = await axios.post(OCR_SPACE_API_ENDPOINT, ocrFormData, {
        headers: {
          ...ocrFormData.getHeaders(),
        },
      });

      const ocrResult = ocrResponse.data;
      if (ocrResult.IsErroredOnProcessing) {
        throw new Error('OCR.Space processing failed: ' + ocrResult.ErrorMessage.join(', '));
      }

      extractedText = ocrResult.ParsedResults[0]?.ParsedText.trim() || '';
      console.log('Extracted Text:', extractedText);
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    // Check if the extracted text is medical
    const isTextMedical = medicalKeywords.some(keyword =>
      extractedText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!isTextMedical) {
      return res.json({
        extractedText,
        error: 'Not a medical text. Please provide a medical report.',
        diseases: [],
      });
    }

    // Use OpenRouter API to analyze extracted text
    const openRouterPayload = {
      model: 'deepseek/deepseek-r1:free',
      messages: [
        {
          role: 'user',
          content: `
            You are a medical assistant. Based on the following text extracted from a medical report: "${extractedText}",
            identify potential diseases, suggest appropriate medications, and provide links to purchase these medications from reputable online pharmacies with comparable prices.
            Return the response in JSON format with fields:
            - extractedText: string (the text from the report)
            - diseases: array of objects with name (string), medicines (array of strings), and purchaseLinks (array of strings)
            If no diseases are identified, return an empty diseases array.
          `,
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

    // Validate API response status and structure
    if (openRouterResponse.status !== 200) {
      throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${openRouterResponse.statusText}`);
    }

    if (!openRouterResponse.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenRouter API response structure');
    }

    const medicalDataRaw = openRouterResponse.data.choices[0].message.content;
    console.log('Raw OpenRouter Response:', medicalDataRaw);

    // Extract the first valid JSON object from the response
    const jsonRegex = /\{[\s\S]*?\}(?=\s|$)/;
    const match = medicalDataRaw.match(jsonRegex);
    if (!match) {
      throw new Error('Could not extract JSON from OpenRouter response');
    }

    let parsedMedicalData;
    try {
      parsedMedicalData = JSON.parse(match[0]);
      // Validate parsed data structure
      if (!parsedMedicalData || typeof parsedMedicalData !== 'object') {
        throw new Error('Parsed OpenRouter response is not a valid object');
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      throw new Error(`Failed to parse extracted JSON: ${parseError.message}`);
    }

    // Prepare response
    const responseData = {
      extractedText: parsedMedicalData.extractedText || extractedText,
      diseases: parsedMedicalData.diseases || [],
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error during processing:', {
      message: error.message,
      stackTrace: error.stack,
      rawResponse: error.response?.data,
    });
    res.status(500).json({ error: 'Error during processing', details: error.message });
  } finally {
    // Clean up uploaded file if it exists
    if (filePath) {
      try {
        await fsPromises.unlink(filePath); // Use fsPromises for unlink
        console.log('File cleaned up:', filePath);
      } catch (err) {
        console.warn('Error cleaning up file:', err.message);
      }
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});