declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushDataLayer(event: string, details: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...details });
}
