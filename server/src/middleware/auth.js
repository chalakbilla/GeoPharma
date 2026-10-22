import jwt from "jsonwebtoken";

// Read lazily so the secret is picked up no matter when dotenv runs.
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, getSecret(), {
    expiresIn: "7d",
  });
}

function getTokenFromHeader(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: "Please log in to continue" });
  }
  try {
    req.user = jwt.verify(token, getSecret());
    next();
  } catch (err) {
    return res.status(401).json({ error: "Your session expired — please log in again" });
  }
}

// Same idea, but doesn't reject the request if there's no token —
// used by routes that also work for guests (e.g. prescription upload).
export function attachUserIfPresent(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, getSecret());
  } catch (err) {
    // bad/expired token: treat as guest
  }
  next();
}
