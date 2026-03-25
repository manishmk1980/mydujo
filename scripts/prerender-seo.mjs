/**
 * Post-build: emit one index.html per public SEO route with correct <head>
 * so crawlers and link previews see title, meta, canonical, OG, Twitter, JSON-LD
 * without executing JavaScript.
 *
 * Production uses Apache: public/.htaccess (→ build/.htaccess) must route these paths
 * to each folder's index.html before falling back to the SPA shell.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BUILD = join(ROOT, 'build');

config({ path: join(ROOT, '.env') });

const SITE_ORIGIN = (process.env.VITE_PUBLIC_SITE_ORIGIN || 'https://kreatorbox.com').replace(/\/$/, '');
const BASE_PATH = (process.env.VITE_PUBLIC_BASE_PATH || '/mdpl-qa').replace(/\/$/, '');

const pages = JSON.parse(readFileSync(join(ROOT, 'src', 'seo', 'pages.json'), 'utf8'));

function canonicalForPath(routePath) {
  if (!routePath) return `${SITE_ORIGIN}${BASE_PATH}/`;
  return `${SITE_ORIGIN}${BASE_PATH}/${routePath.replace(/^\//, '')}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(text) {
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildJsonLd(page, canonicalUrl) {
  const siteUrl = `${SITE_ORIGIN}${BASE_PATH}/`;
  if (!page.path) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'MyDojo',
          url: siteUrl,
        },
        {
          '@type': 'WebSite',
          name: 'MyDojo',
          url: siteUrl,
          description: page.description,
        },
      ],
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'MyDojo',
      url: siteUrl,
    },
  };
}

function replaceSiteUrls(html) {
  const wrong = /https:\/\/kreatorbox\.com\/mdpl_qa/gi;
  return html.replace(wrong, `${SITE_ORIGIN}${BASE_PATH}`);
}

function injectSeo(html, page) {
  const canonicalUrl = canonicalForPath(page.path);
  const ogImage = `${SITE_ORIGIN}${BASE_PATH}/og-image.png`;
  const jsonLd = buildJsonLd(page, canonicalUrl);
  const jsonLdTag = `\n    <script type="application/ld+json" id="seo-jsonld">${JSON.stringify(jsonLd)}</script>`;

  let out = replaceSiteUrls(html);

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);

  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(page.description)}" />`
  );

  if (page.keywords) {
    out = out.replace(
      /<meta name="keywords" content="[^"]*"\s*\/?>/,
      `<meta name="keywords" content="${escapeAttr(page.keywords)}" />`
    );
  }

  out = out.replace(
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${escapeAttr(page.robots)}" />`
  );

  out = out.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
  );

  out = out.replace(
    /<meta property="og:type" content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${escapeAttr(page.ogType)}" />`
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`
  );
  out = out.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
  );
  out = out.replace(
    /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`
  );

  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeAttr(page.title)}" />`
  );
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeAttr(page.description)}" />`
  );
  out = out.replace(
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`
  );

  out = out.replace(/\s*<script type="application\/ld\+json"[^>]*id="seo-jsonld"[^>]*>[\s\S]*?<\/script>/gi, '');
  out = out.replace(/(\s*)(<script type="module")/, `${jsonLdTag}$1$2`);

  return out;
}

function main() {
  if (!existsSync(BUILD)) {
    console.error('prerender-seo: build/ not found. Run vite build first.');
    process.exit(1);
  }

  const templatePath = join(BUILD, 'index.html');
  const template = readFileSync(templatePath, 'utf8');

  for (const page of pages) {
    const html = injectSeo(template, page);
    if (!page.path) {
      writeFileSync(templatePath, html, 'utf8');
      console.log('prerender-seo: wrote build/index.html (home)');
      continue;
    }

    const dir = join(BUILD, page.path);
    mkdirSync(dir, { recursive: true });
    const outFile = join(dir, 'index.html');
    writeFileSync(outFile, html, 'utf8');
    console.log(`prerender-seo: wrote build/${page.path}/index.html`);
  }
}

main();
