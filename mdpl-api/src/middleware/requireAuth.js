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

    req.auth = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired access token",
      details: err.message,
    });
  }
}
