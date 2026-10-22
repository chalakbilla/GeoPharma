import { Router } from "express";
import { searchDrugs } from "../lib/drugDatabase.js";
import { getMedicineInfo, suggestMedicines } from "../lib/analyzer.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { cacheGet, cacheSet } from "../lib/cache.js";

const router = Router();

// Search box: catalogue first, AI suggestions as a fallback so it's never empty.
router.get("/search", rateLimit({ windowMs: 60_000, max: 40, name: "drug-search" }), async (req, res) => {
  const q = (req.query.q || "").toString().trim().slice(0, 60);
  if (q.length < 2) return res.json({ results: [] });

  const key = `search:${q.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ results: cached });

  let results = [];
  try {
    const hits = await searchDrugs(q, 8);
    results = hits.map((d) => ({
      id: String(d.id ?? d.product_name),
      name: d.product_name,
      generic: "",
      note: [d.manufacturer, d.atc_code].filter(Boolean).join(" · "),
    }));
  } catch (err) {
    console.warn("Catalogue search failed:", err.message);
  }

  if (results.length === 0) {
    try {
      const ai = await suggestMedicines(q);
      results = ai.map((r, i) => ({ id: `ai-${i}-${r.name}`, ...r }));
    } catch (err) {
      console.warn("AI search fallback failed:", err.message);
    }
  }

  cacheSet(key, results);
  res.json({ results });
});

// Medicine explorer page: plain-language details for one medicine.
router.get("/info", rateLimit({ windowMs: 60_000, max: 15, name: "drug-info" }), async (req, res) => {
  const name = (req.query.name || "").toString().trim().slice(0, 80);
  if (name.length < 2) return res.status(400).json({ error: "Please provide a medicine name" });

  const key = `info:${name.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ medicine: cached });

  try {
    const medicine = await getMedicineInfo(name);
    cacheSet(key, medicine, 60 * 60 * 1000);
    res.json({ medicine });
  } catch (err) {
    console.error("Medicine info failed:", err.message, err.detail || "");
    res.status(500).json({ error: "Couldn't load details for this medicine. Please try again." });
  }
});

export default router;
