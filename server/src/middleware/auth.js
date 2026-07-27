import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

function getTokenFromHeader(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Same idea, but doesn't reject the request if there's no token —
// useful for routes like /ocr that work for guests too.
export function attachUserIfPresent(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, secret);
  } catch (err) {
    // ignore bad/expired token, just treat as guest
  }
  next();
}
