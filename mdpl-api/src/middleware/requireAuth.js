import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.substring("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!payload || typeof payload !== "object" || typeof payload.sub !== "string" || !payload.sub) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }
    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((role) => typeof role === "string")
      : [];

    req.auth = {
      userId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : null,
      roles,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}
