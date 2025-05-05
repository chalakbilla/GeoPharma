import express from 'express';  // Use import instead of require
import multer from 'multer';
import vision from '@google-cloud/vision';
import path from 'path';

const app = express();
const port = 5000;

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Create an instance of the Google Cloud Vision API client
const client = new vision.ImageAnnotatorClient();

// Middleware to parse JSON
app.use(express.json());

// Route to handle file upload
app.post('/ocr', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    // Perform OCR on the uploaded image
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;

    if (detections.length > 0) {
      const extractedText = detections[0].description;
      res.json({ text: extractedText });
    } else {
      res.status(404).send('No text detected');
    }
  } catch (error) {
    console.error('Error during OCR:', error);
    res.status(500).send('Error during OCR processing');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
