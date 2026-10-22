import { Router } from "express";
import multer from "multer";
import { analyzePrescription } from "../lib/analyzer.js";
import { attachUserIfPresent } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { query } from "../db/index.js";

// Vercel serverless functions reject request bodies above ~4.5MB, so cap at 4MB.
// The client compresses photos before sending, so real-world phone shots fit.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
    const err = new Error("Please upload a JPG, PNG, WEBP or PDF file");
    err.code = "UNSUPPORTED_TYPE";
    cb(err);
  },
});

// Turn multer failures into clean 4xx responses instead of a generic 500.
function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "That file is too large — please upload one under 4MB." });
    }
    if (err.code === "UNSUPPORTED_TYPE") {
      return res.status(415).json({ error: err.message });
    }
    console.error("Upload error:", err);
    return res.status(400).json({ error: "Couldn't read the uploaded file" });
  });
}

let resultColumnReady = false;
async function ensureResultColumn() {
  if (resultColumnReady) return;
  await query("alter table prescriptions add column if not exists result jsonb");
  resultColumnReady = true;
}

async function savePrescription(userId, result) {
  const run = () =>
    query(
      "insert into prescriptions (user_id, extracted_text, diseases, result) values ($1, $2, $3, $4) returning id",
      [
        userId,
        result.extractedText || null,
        JSON.stringify(result.diagnoses.map((name) => ({ name }))),
        JSON.stringify(result),
      ]
    );
  try {
    return (await run()).rows[0].id;
  } catch (err) {
    // 42703 = column doesn't exist yet (schema not re-applied) — add it and retry once.
    if (err.code === "42703") {
      await ensureResultColumn();
      return (await run()).rows[0].id;
    }
    throw err;
  }
}

const router = Router();

router.post(
  "/",
  rateLimit({ windowMs: 60_000, max: 8, name: "ocr" }),
  attachUserIfPresent,
  handleUpload,
  async (req, res) => {
    const file = req.file;
    const text = typeof req.body?.text === "string" ? req.body.text.trim().slice(0, 8000) : "";

    if (!file && !text) {
      return res.status(400).json({ error: "Please attach a prescription image or provide text" });
    }

    try {
      const result = await analyzePrescription({ file, text });

      // History is a bonus — a DB hiccup must never lose the analysis the user waited for.
      let id = null;
      if (req.user) {
        try {
          id = await savePrescription(req.user.id, result);
        } catch (err) {
          console.error("Could not save prescription:", err.message);
        }
      }

      res.json({ ...result, id });
    } catch (err) {
      console.error("OCR failed:", err.message, err.detail || "");
      const busy = err.status === 429 || err.status === 503;
      res.status(busy ? 503 : 500).json({
        error: busy
          ? "Our AI is busy right now — please try again in a few seconds."
          : "Couldn't analyze the prescription. Please try a clearer photo.",
      });
    }
  }
);

export default router;
