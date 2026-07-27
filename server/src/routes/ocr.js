import { Router } from "express";
import multer from "multer";
import { analyzePrescriptionImage, analyzePrescriptionText } from "../lib/vertexAI.js";
import { searchDrugs } from "../lib/drugDatabase.js";
import { attachUserIfPresent } from "../middleware/auth.js";
import { query } from "../db/index.js";

// Only looks up medicines the model actually read off the prescription — never
// something inferred from a diagnosis. If a disease has no medicines listed,
// it stays empty; we don't go looking for what "should" treat it.
async function attachProductMatches(diseases) {
  if (!Array.isArray(diseases)) return diseases;

  return Promise.all(
    diseases.map(async (disease) => {
      const names = Array.isArray(disease.medicines) ? disease.medicines : [];
      const medicines = await Promise.all(
        names.map(async (name) => {
          try {
            const matches = await searchDrugs(name, 1);
            return { name, product: matches[0] || null };
          } catch (err) {
            console.error(`Drug lookup failed for "${name}":`, err.message);
            return { name, product: null };
          }
        })
      );
      return { ...disease, medicines };
    })
  );
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, matches the guide text on the upload page
});

const router = Router();

router.post("/", attachUserIfPresent, upload.single("file"), async (req, res) => {
  const { text } = req.body;
  const file = req.file;

  if (!file && !text) {
    return res.status(400).json({ error: "Please attach a prescription image or provide text" });
  }

  try {
    const result = file
      ? await analyzePrescriptionImage(file.buffer.toString("base64"), file.mimetype)
      : await analyzePrescriptionText(text);

    result.diseases = await attachProductMatches(result.diseases);

    if (req.user) {
      await query(
        "insert into prescriptions (user_id, extracted_text, diseases) values ($1, $2, $3)",
        [req.user.id, result.extractedText || null, JSON.stringify(result.diseases || [])]
      );
    }

    res.json(result);
  } catch (err) {
    console.error("OCR failed:", err);
    res.status(500).json({
      error: "Couldn't analyze the prescription",
      details: err.message,
    });
  }
});

export default router;
