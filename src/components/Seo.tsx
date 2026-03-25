import React from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoConfigForPathname } from '../seo/config';

const SITE_ORIGIN = (import.meta.env.VITE_PUBLIC_SITE_ORIGIN || 'https://kreatorbox.com').replace(/\/$/, '');
const BASE_PATH = (import.meta.env.VITE_PUBLIC_BASE_PATH || '/mdpl-qa').replace(/\/$/, '');

function canonicalForPath(routePath: string) {
  if (!routePath) return `${SITE_ORIGIN}${BASE_PATH}/`;
  return `${SITE_ORIGIN}${BASE_PATH}/${routePath.replace(/^\//, '')}`;
}

function buildJsonLd(
  page: ReturnType<typeof getSeoConfigForPathname>,
  canonicalUrl: string
): Record<string, unknown> {
  const siteUrl = `${SITE_ORIGIN}${BASE_PATH}/`;
  if (!page.path) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'MyDojo', url: siteUrl },
        { '@type': 'WebSite', name: 'MyDojo', url: siteUrl, description: page.description },
      ],
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'MyDojo', url: siteUrl },
  };
}

function setMetaAttr(selector: string, attr: string, value: string) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const m = /^meta\[property="([^"]+)"\]$/.exec(selector);
    const n = /^meta\[name="([^"]+)"\]$/.exec(selector);
    if (m) el.setAttribute('property', m[1]);
    else if (n) el.setAttribute('name', n[1]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLinkCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Keeps document head in sync when users navigate inside the SPA (after first load).
 * First paint for listed routes comes from prerendered HTML (see scripts/prerender-seo.mjs).
 */
export function Seo() {
  const location = useLocation();
  const pathname = location.pathname.replace(/^\/+|\/+$/g, '');

  React.useEffect(() => {
    const page = getSeoConfigForPathname(pathname);
    const canonicalUrl = canonicalForPath(page.path);
    const ogImage = `${SITE_ORIGIN}${BASE_PATH}/og-image.png`;

    document.title = page.title;

    setMetaAttr('meta[name="description"]', 'content', page.description);
    if (page.keywords) {
      setMetaAttr('meta[name="keywords"]', 'content', page.keywords);
    }
    setMetaAttr('meta[name="robots"]', 'content', page.robots);

    setLinkCanonical(canonicalUrl);

    setMetaAttr('meta[property="og:type"]', 'content', page.ogType);
    setMetaAttr('meta[property="og:title"]', 'content', page.title);
    setMetaAttr('meta[property="og:description"]', 'content', page.description);
    setMetaAttr('meta[property="og:url"]', 'content', canonicalUrl);
    setMetaAttr('meta[property="og:image"]', 'content', ogImage);

    setMetaAttr('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaAttr('meta[name="twitter:title"]', 'content', page.title);
    setMetaAttr('meta[name="twitter:description"]', 'content', page.description);
    setMetaAttr('meta[name="twitter:image"]', 'content', ogImage);

    const jsonLd = buildJsonLd(page, canonicalUrl);
    let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-jsonld';
      const firstModule = document.querySelector('script[type="module"]');
      if (firstModule?.parentNode) {
        firstModule.parentNode.insertBefore(script, firstModule);
      } else {
        document.head.appendChild(script);
      }
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [pathname]);

  return null;
}
