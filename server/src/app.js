import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import ocrRoutes from "./routes/ocr.js";
import drugRoutes from "./routes/drugs.js";
import chatRoutes from "./routes/chat.js";
import prescriptionRoutes from "./routes/prescriptions.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Frontend and API share one origin on Vercel, so CORS only matters for local tooling.
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    ai: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    db: Boolean(process.env.DATABASE_URL),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// last-resort error handler, keeps a bad route from ever crashing the function
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end" });
});

export default app;
