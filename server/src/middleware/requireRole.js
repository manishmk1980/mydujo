export function requireRole(allowedRoles = []) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [];
  return function requireRoleMiddleware(req, res, next) {
    const roles = req?.auth?.roles || [];
    const ok = allowed.some((r) => roles.includes(r));
    if (!ok) {
      return res.status(403).json({ error: "not authorized" });
    }
    return next();
  };
}

