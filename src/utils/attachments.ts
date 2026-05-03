import { API_BASE } from '../config';

function getServerBaseUrl(): string {
  try {
    const parsed = new URL(API_BASE);
    // Keep configured API path (e.g. /api) for deployments where uploads
    // are also served behind that same prefix.
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return API_BASE.replace(/\/+$/, '');
  }
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function resolveAttachmentUrl(rawUrl?: string | null, opts?: { feeRequestId?: string | null }): string | null {
  if (!rawUrl) return null;
  const serverBase = getServerBaseUrl();

  let parsed: URL;
  try {
    parsed = new URL(rawUrl, serverBase);
  } catch {
    return null;
  }

  let pathname = parsed.pathname || '';
  pathname = pathname.replace(/^\/api\/uploads\//i, '/uploads/');
  pathname = pathname.replace(/\\/g, '/');

  const proofsPrefix = '/uploads/payment-proofs/';
  if (pathname.startsWith(proofsPrefix)) {
    const rest = pathname.slice(proofsPrefix.length);
    const parts = rest.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const [folderId, ...fileParts] = parts;
      const fileName = fileParts.join('/');
      const fallbackFeeId = opts?.feeRequestId?.trim();
      const normalizedFolder = looksLikeUuid(folderId)
        ? folderId
        : (fallbackFeeId && looksLikeUuid(fallbackFeeId) ? fallbackFeeId : folderId);
      pathname = `${proofsPrefix}${normalizedFolder}/${fileName}`;
    } else if (parts.length === 1 && opts?.feeRequestId && looksLikeUuid(opts.feeRequestId)) {
      pathname = `${proofsPrefix}${opts.feeRequestId}/${parts[0]}`;
    }
  }

  return `${serverBase}${pathname}`;
}

