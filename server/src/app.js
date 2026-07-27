import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import ocrRoutes from "./routes/ocr.js";
import drugRoutes from "./routes/drugs.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/drugs", drugRoutes);

// last-resort error handler, keeps a bad route from ever crashing the function
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end" });
});

export default app;
