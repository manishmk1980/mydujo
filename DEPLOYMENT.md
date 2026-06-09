# MyDojo (MDPL) — Production Deployment

**Production site:** https://mydojo.co.in  
**API:** https://mydojo.co.in/api (Node + PM2)  
**Frontend root:** `/var/www/html/`  
**API root:** `/var/www/mdpl-api/`

This guide is the definitive reference for deploying MyDojo to the production VPS. The stack is **Apache** (static SPA + prerendered SEO pages) and **PM2** (Node API).

---

## Architecture

| Layer | Location | Notes |
|-------|----------|-------|
| Frontend build | `build/` (local) → `/var/www/html/` | Uploaded via `deploy.ps1` |
| API | `/var/www/mdpl-api/` | `git pull`, PM2 process `mdpl-api` |
| Database | MySQL `mdpl_db` | Connection via server `.env` only |
| Secrets | Server `.env` only | Never commit or upload `SMTP_PASS`, DB passwords, JWT secrets |

Apache serves the SPA using `build/.htaccess` (copied from `public/.htaccess`). Prerendered routes (e.g. `/login/`) ship as `build/login/index.html`.

---

## 1. Local prerequisites

- Node.js 18+
- `.env.production` locally (for `VITE_*` build vars only — no server secrets in git)
- SSH access: `DEPLOY_HOST`, `DEPLOY_USER` for `deploy.ps1`

### Build

```bash
npm install
npm run build
```

`npm run build` runs, in order:

1. `optimize:images` — generates WebP variants from `src/assets/images/` (hero, etc.)
2. `vite build` — outputs to `build/` (hashed assets, SVG URLs, WebP via `<picture>`)
3. `prerender-seo.mjs` — static HTML for key routes

Validate before release:

```bash
npm run validate:release   # lint + build + API smoke tests
```

---

## 2. Server environment (`.env`)

On the server, maintain `/var/www/mdpl-api/.env` **separately** from the repo. Copy from `.env.example` and set production values:

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | yes | `production` |
| `DATABASE_URL` | yes | `mysql://user:pass@host:3306/mdpl_db` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | yes | Min 32 chars |
| `CORS_ORIGIN` | yes | `https://mydojo.co.in` |
| `COOKIE_SECURE` | yes | `true` |
| `SMTP_USER` / `SMTP_PASS` | yes for email | Gmail **App Password** in `SMTP_PASS` — inject on server only |
| `ADMIN_NOTIFICATION_EMAIL` | yes | Admin inbox for registrations, fees, contact |

Verify SMTP after editing:

```bash
grep '^SMTP_PASS=.' /var/www/mdpl-api/.env
pm2 restart mdpl-api --update-env
```

Email is skipped if `SMTP_PASS` is empty (`mdpl-api/src/services/mail.js` logs a warning).

---

## 3. Pre-deployment backup

Before any cutover, on the **production server**:

```bash
sudo bash /var/www/mdpl-api/scripts/pre-deploy-backup.sh
```

Creates `/var/backups/mdpl/<timestamp>/` with:

- `html.tar.gz` — `/var/www/html`
- `mdpl-api.tar.gz` — `/var/www/mdpl-api` (excludes `node_modules`)
- `mdpl_db.sql` — MySQL dump from `DATABASE_URL`
- Symlink `last-known-good` → latest backup

Also keep a **local** `.sql` dump before cutover as an extra safety net.

### Fast rollback

```bash
cd /var/backups/mdpl/last-known-good
sudo tar -xzf html.tar.gz -C /var/www
sudo tar -xzf mdpl-api.tar.gz -C /var/www
cd /var/www/mdpl-api && pm2 restart mdpl-api --update-env
```

---

## 4. Cutover sequence

Run in this order when the client confirms the maintenance window:

| Step | Action | Command |
|------|--------|---------|
| 0 | Backup | `sudo bash scripts/pre-deploy-backup.sh` |
| 1 | Maintenance mode | `sudo bash scripts/maintenance-mode.sh on` |
| 2 | API deploy | `bash scripts/deploy-api-production.sh` |
| 3 | Frontend deploy | `.\deploy.ps1` (from dev machine) |
| 4 | Smoke test | See §5 (while maintenance is on) |
| 5 | Go live | `sudo bash scripts/maintenance-mode.sh off` |

### API deploy (`scripts/deploy-api-production.sh`)

```bash
cd /var/www/mdpl-api
bash scripts/deploy-api-production.sh
# optional: bash scripts/deploy-api-production.sh /var/www/mdpl-api mdpl-api
```

Does: `git pull`, `npm install --omit=dev`, `prisma migrate deploy`, `pm2 restart mdpl-api`, `pm2 flush`.

### Frontend deploy (`deploy.ps1`)

```powershell
$env:DEPLOY_HOST = "your.server.ip"
$env:DEPLOY_USER = "your_ssh_user"
.\deploy.ps1
```

Builds locally and uploads `build/*` to `/var/www/html/` via SCP. Does not change the API.

### Maintenance page

`scripts/maintenance-mode.sh on` backs up `index.html` → `index.html.live` and serves `scripts/maintenance.html`. The API remains reachable for smoke tests.

---

## 5. Post-deploy smoke test

| Test | Verification |
|------|----------------|
| API health | `curl -s https://mydojo.co.in/api/health` → 200 |
| Registration | Submit test registration; check PM2 logs + admin email |
| Login | Admin and student login |
| Fee notification | Create fee for test student; in-app notification + email |
| Hero image | Homepage loads WebP hero; SVG logos render |

Automated API tests (on server):

```bash
cd /var/www/mdpl-api && npm run test:api
```

(`EMAIL_ENABLED=false` in smoke tests — email must be verified manually.)

---

## 6. PM2 operations

```bash
pm2 status mdpl-api
pm2 logs mdpl-api --lines 80
pm2 restart mdpl-api --update-env
pm2 flush                    # clear logs before/after cutover
pm2 save
```

---

## 7. Assets: images, WebP, SVG

- **Hero and raster images:** place sources in `src/assets/images/`. Run `npm run optimize:images` (included in `build`) to generate `.webp` companions.
- **SVG logos:** keep in `src/assets/logo/` or `public/brand/`; import as `import logo from '@/assets/logo/foo.svg'` for bundler-hashed URLs.
- **UI usage:** `ResponsivePicture` serves WebP with PNG fallback via `<picture>`.

---

## 8. SEO artifacts

Deployed under `build/`:

- `sitemap.xml`, `rss.xml`, `robots.txt`
- Prerendered HTML per route (`login/index.html`, etc.)
- Optional: `og-image.png` (1200×630) for social previews

---

## 9. Pre-go-live checklist

- [ ] `npm run validate:release` passes locally
- [ ] Server `/var/www/mdpl-api/.env` has production `DATABASE_URL` and `SMTP_PASS`
- [ ] `scripts/pre-deploy-backup.sh` run; `last-known-good` symlink exists
- [ ] Local `mdpl_db` SQL dump saved
- [ ] `pm2 flush` before cutover
- [ ] Maintenance → API → frontend → smoke → go-live sequence understood
- [ ] Rollback path tested or documented for partner/client

---

## Scripts reference

| Script | Purpose |
|--------|---------|
| `deploy.ps1` | Build + SCP frontend to `/var/www/html/` |
| `scripts/deploy-api-production.sh` | API pull, install, migrate, PM2 restart |
| `scripts/pre-deploy-backup.sh` | Rollback archives + DB dump |
| `scripts/maintenance-mode.sh` | `on` / `off` maintenance page |
| `scripts/maintenance.html` | Static maintenance content |
| `scripts/optimize-images.mjs` | PNG → WebP for `src/assets/images/` |
| `scripts/prerender-seo.mjs` | Post-build SEO HTML |

**Note:** `scripts/deploy-backend-pm2.sh` targets the legacy `server/` layout. Use `deploy-api-production.sh` for `mdpl-api/`.
