import { Router } from "express";
import { searchDrugs } from "../lib/drugDatabase.js";

const router = Router();

router.get("/search", async (req, res) => {
  const q = (req.query.q || "").toString();
  if (!q.trim()) return res.json({ results: [] });

  try {
    const results = await searchDrugs(q, 8);
    res.json({ results });
  } catch (err) {
    console.error("Drug search failed:", err);
    res.status(500).json({ error: "Drug lookup failed, please try again" });
  }
});

export default router;
