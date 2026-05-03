import pages from './pages.json';

export type SeoPageConfig = {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  robots: string;
  ogType: string;
};

export const SEO_PAGES: SeoPageConfig[] = pages as SeoPageConfig[];

export function getSeoConfigForPathname(pathname: string): SeoPageConfig {
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  const exact = SEO_PAGES.find((p) => p.path === normalized);
  if (exact) return exact;
  return SEO_PAGES.find((p) => p.path === '') ?? SEO_PAGES[0];
}
