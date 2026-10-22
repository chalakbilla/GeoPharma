import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { query } from "../db/index.js";

const router = Router();
router.use(requireAuth);

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// History list (newest first) — compact summaries only.
router.get("/", async (req, res) => {
  try {
    const { rows } = await query(
      `select id, created_at, result
         from prescriptions
        where user_id = $1 and result is not null
        order by created_at desc
        limit 50`,
      [req.user.id]
    );
    res.json({
      items: rows.map((row) => {
        const r = row.result || {};
        return {
          id: row.id,
          createdAt: row.created_at,
          isPrescription: r.isPrescription !== false,
          patient: r.patient?.name || "",
          doctor: r.doctor?.name || "",
          date: r.date || "",
          medicines: (r.medicines || []).map((m) => m.name).slice(0, 6),
          medicineCount: (r.medicines || []).length,
        };
      }),
    });
  } catch (err) {
    // 42703 = `result` column not added yet (db:init not re-run) — just show an empty history
    if (err.code === "42703") return res.json({ items: [] });
    console.error("Load history failed:", err.message);
    res.status(500).json({ error: "Couldn't load your prescriptions" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid prescription id" });
  try {
    const { rows } = await query(
      "select id, result from prescriptions where id = $1 and user_id = $2 and result is not null",
      [id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Prescription not found" });
    res.json({ ...rows[0].result, id: rows[0].id });
  } catch (err) {
    console.error("Load prescription failed:", err.message);
    res.status(500).json({ error: "Couldn't load that prescription" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid prescription id" });
  try {
    await query("delete from prescriptions where id = $1 and user_id = $2", [id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete prescription failed:", err.message);
    res.status(500).json({ error: "Couldn't delete that prescription" });
  }
});

export default router;
