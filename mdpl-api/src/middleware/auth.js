import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) return res.status(401).json({ error: "missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.auth = { userId: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}
