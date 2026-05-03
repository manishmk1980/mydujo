/**
 * App config. VITE_* vars are set at build time (see .env and DEPLOYMENT.md).
 *
 * Production: omit VITE_API_URL so the client uses `${window.location.origin}/api`
 * (same origin). Apache/nginx must not send /api through a cross-host canonical
 * redirect (e.g. www→apex): a 301/302 there often retries POST as GET and breaks
 * auth/register. Exclude /api from RewriteRule host redirects and proxy /api on the
 * same host as the SPA (e.g. ProxyPass /api/ http://127.0.0.1:4000/).
 *
 * Temporary QA (kreatorbox): SPA may load on https://www.kreatorbox.com/mdpl-qa while
 * Apache still redirects www /api to apex. Until that is fixed, we force API calls to
 * https://kreatorbox.com/api so POSTs hit Node without that redirect. Backend CORS
 * must allow https://www.kreatorbox.com. Remove FORCE_QA_APEX_API when www /api is fixed.
 */
const FORCE_QA_APEX_API = 'https://kreatorbox.com/api';

function trimTrailingSlash(v: string) {
  return v.replace(/\/+$/, '');
}

/** Avoid mixing 127.0.0.1 and localhost for API — browsers treat them as different origins for cookies. */
function canonicalizeLocalApiHost(url: string): string {
  return url.trim().replace(/^http:\/\/127\.0\.0\.1(?=:\d)/i, 'http://localhost');
}

function normalizeApiPath(pathname: string) {
  // If someone configured "/mdpl-qa/api", keep only the API mount path.
  const apiIdx = pathname.indexOf('/api');
  if (apiIdx >= 0) return pathname.slice(apiIdx) || '/api';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function resolveApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'www.kreatorbox.com' || host === 'kreatorbox.com') {
      return FORCE_QA_APEX_API;
    }
  }

  const rawEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const raw = rawEnv ? canonicalizeLocalApiHost(rawEnv) : '';

  if (!raw) {
    // Local Vite dev: call the API directly (no /api proxy) unless production same-origin.
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      return 'http://localhost:4000';
    }
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;
    return 'http://localhost:4000';
  }

  // Absolute URL (http/https)
  try {
    const parsed = new URL(canonicalizeLocalApiHost(raw));
    const apiPath = normalizeApiPath(parsed.pathname || '/api');
    parsed.pathname = apiPath;
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
