/**
 * App config. VITE_* vars are set at build time (see .env and DEPLOYMENT.md).
 */
function trimTrailingSlash(v: string) {
  return v.replace(/\/+$/, '');
}

function normalizeApiPath(pathname: string) {
  // If someone configured "/mdpl-qa/api", keep only the API mount path.
  const apiIdx = pathname.indexOf('/api');
  if (apiIdx >= 0) return pathname.slice(apiIdx) || '/api';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

  if (!raw) {
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;
    return 'http://localhost:4000';
  }

  // Absolute URL (http/https)
  try {
    const parsed = new URL(raw);
    parsed.pathname = normalizeApiPath(parsed.pathname || '/api');
    return trimTrailingSlash(parsed.toString());
  } catch {
    // Not an absolute URL.
  }

  // Relative forms like "api", "./api", "/mdpl-qa/api", "/api"
  const cleaned = raw.replace(/^\.\//, '');
  const path = normalizeApiPath(cleaned.startsWith('/') ? cleaned : `/${cleaned}`);
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return trimTrailingSlash(path);
}

export const API_BASE = resolveApiBase();
