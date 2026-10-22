// Best-effort per-IP limiter. On Vercel each warm instance keeps its own counters,
// so this blunts abuse of the (paid) AI endpoints rather than guaranteeing a hard cap.
const buckets = new Map();

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim();
  return ip || req.socket?.remoteAddress || "unknown";
}

export function rateLimit({ windowMs = 60_000, max = 30, name = "global" } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${name}:${clientIp(req)}`;
    let bucket = buckets.get(key);

    if (!bucket || bucket.reset <= now) {
      bucket = { count: 0, reset: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
    }

    if (bucket.count > max) {
      res.set("Retry-After", String(Math.ceil((bucket.reset - now) / 1000)));
      return res.status(429).json({ error: "Too many requests — please wait a moment and try again." });
    }
    next();
  };
}
