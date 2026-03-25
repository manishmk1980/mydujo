# MyDojo (MDP脚) — Shared Server Deployment

**Target URL:** http://kreatorbox.com/mdpl/

This guide covers building and deploying the MyDojo app to a shared server with all students and super admin activated.

**Remote server (production): Apache.** This project is deployed behind **Apache** with `mod_rewrite` enabled. The app relies on **`build/.htaccess`** (copied from `public/.htaccess`) for SPA routing and for serving **prerendered SEO HTML** under routes like `/mdpl-qa/login/` → `build/login/index.html`. Keep `.htaccess` in place when uploading `build/` manually; Nginx snippets in this doc are optional reference only.

---

## 1. Build

### Prerequisites

- Node.js 18+
- `.env` file with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### Build command

```bash
npm install
npm run build
```

Output goes to the `build/` folder.

---

## 2. Deploy to shared hosting

1. Upload the **contents** of `build/` to the server folder for `/mdpl/` (e.g. `public_html/mdpl/` or `htdocs/mdpl/`).
2. Resulting layout:

   ```
   mdpl/
   ├── index.html
   ├── favicon.svg
   ├── sitemap.xml
   ├── rss.xml
   ├── robots.txt
   ├── .htaccess
   └── assets/
       └── index-*.js, index-*.css
   ```

3. Ensure Apache `mod_rewrite` is enabled and `.htaccess` is allowed.
4. **Optional:** Add `og-image.png` (1200×630 px) to the same folder for social previews; otherwise OG/Twitter image meta points to `/mdpl/og-image.png`.

### Apache Virtual Host (if you have config access)

If you can edit the virtual host, add:

```apache
# Serve the build folder at /mdpl/
# Important: Replace /var/www/html/mdpl/build with YOUR actual path where build/ contents are deployed
Alias /mdpl /var/www/html/mdpl/build
<Directory /var/www/html/mdpl/build>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
    # SPA fallback: send index.html for routes
    FallbackResource /mdpl/index.html
</Directory>

# Ensure correct MIME types for JS and CSS
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
</IfModule>
```

**Important:** Point `Alias` and `<Directory>` to the actual directory where the `build/` output is deployed (e.g. `public_html/mdpl`, `htdocs/mdpl`, or `/var/www/kreatorbox.com/mdpl`).

---

## 3. Supabase: activate students & super admin

Run in **Supabase SQL Editor** (`Dashboard → SQL Editor`):

```sql
-- Activate all students
UPDATE public.students
SET status = 'approved',
    validated_at = COALESCE(validated_at, now()),
    validated_by = (SELECT user_id FROM public.admin_users LIMIT 1)
WHERE status IS NULL OR status IN ('pending', 'rejected', 'draft');
```

---

## 4. Super admin credentials

### Create super admin (first time)

With Node.js and `.env` set, run:

```bash
node scripts/setup-admin.js
```

This creates the auth user and adds it to `admin_users`.

### Default super admin

| Field    | Value             |
|----------|-------------------|
| **Email**    | `admin@mydojo.com` |
| **Password** | `AdminPassword123!` |

Admin panel: http://kreatorbox.com/mdpl/admin

Change the password immediately after first login.

### If super admin already exists

Run `fix-admin.cjs`:

```bash
node fix-admin.cjs
```

This ensures the admin user is in the `admin_users` table.

---

## 5. URLs

| Purpose        | URL                                |
|----------------|------------------------------------|
| App            | http://kreatorbox.com/mdpl/        |
| Admin login    | http://kreatorbox.com/mdpl/admin/login |
| Student login  | http://kreatorbox.com/mdpl/login   |

---

## 6. SEO, Sitemap & RSS

- **Meta:** `index.html` includes title, description, canonical, Open Graph, Twitter Card, and geo (India) tags.
- **Sitemap:** `build/sitemap.xml` is generated; crawlers can use `https://kreatorbox.com/mdpl/sitemap.xml`.
- **RSS:** `build/rss.xml` is the feed; link `https://kreatorbox.com/mdpl/rss.xml` for subscribers.
- **robots.txt:** Points to the sitemap; deployed as `build/robots.txt`.

---

## 7. Quick checklist

- [ ] `npm run build` runs without errors
- [ ] `build/` contents (including `.htaccess`, `sitemap.xml`, `rss.xml`, `robots.txt`, `favicon.svg`) uploaded to `/mdpl/`
- [ ] Add `og-image.png` (1200×630) for social sharing if desired
- [ ] Supabase SQL run to activate all students
- [ ] Super admin created via `scripts/setup-admin.js` (or already in `admin_users`)
- [ ] Password changed after first login
