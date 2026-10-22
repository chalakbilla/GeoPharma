import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db/index.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normEmail = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const normName = (v) => (typeof v === "string" ? v.trim().slice(0, 80) : "");

router.post("/signup", rateLimit({ windowMs: 60_000, max: 10, name: "signup" }), async (req, res) => {
  const name = normName(req.body?.name);
  const email = normEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are all required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password needs to be at least 8 characters" });
  }

  try {
    const existing = await query("select id from users where lower(email) = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      "insert into users (name, email, password_hash) values ($1, $2, $3) returning id, name, email",
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error("Signup failed:", err.message);
    res.status(500).json({ error: "Could not create account, please try again" });
  }
});

router.post("/login", rateLimit({ windowMs: 60_000, max: 15, name: "login" }), async (req, res) => {
  const email = normEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await query("select * from users where lower(email) = $1", [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).json({ error: "Login failed, please try again" });
  }
});

// Lets the client confirm a stored token is still valid on page load.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

export default router;
