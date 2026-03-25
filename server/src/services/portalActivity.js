/**
 * In-memory last activity time for portal (student) JWT users.
 * Used to approximate "currently active" on the admin dashboard.
 * Resets on server restart; window is configurable via env.
 */

const activityByUserId = new Map();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

export function getActivityWindowMs() {
  const raw = process.env.PORTAL_ACTIVITY_WINDOW_MINUTES;
  if (raw == null || raw === "") return DEFAULT_WINDOW_MS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_WINDOW_MS;
  return Math.min(Math.floor(n * 60 * 1000), 24 * 60 * 60 * 1000);
}

/**
 * Call after JWT auth when the user is a student portal account (not admin-only).
 */
export function touchPortalUserActivity(auth) {
  if (!auth?.userId) return;
  const roles = auth.roles || [];
  if (!roles.includes("STUDENT")) return;
  if (roles.includes("ADMIN") || roles.includes("SUPER_ADMIN")) return;
  activityByUserId.set(String(auth.userId), Date.now());
}

/**
 * How many of the given user IDs had portal API activity within the window.
 */
export function countActivePortalUserIds(userIds, windowMs = getActivityWindowMs()) {
  const cutoff = Date.now() - windowMs;
  let n = 0;
  for (const uid of userIds) {
    if (!uid) continue;
    const t = activityByUserId.get(String(uid));
    if (t != null && t >= cutoff) n += 1;
  }
  return n;
}
