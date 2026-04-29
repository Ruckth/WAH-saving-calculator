# Deploy & Maintain — Savings Vision

Static React/Vite app, ~72 KB gzipped. Pure client-side (no backend), uses
[frankfurter.dev](https://api.frankfurter.dev) at runtime for AUD→THB rates.

## TL;DR

Pick **one** of:

| Option | Setup | Cost | Why |
|---|---|---|---|
| **Cloudflare Pages** ⭐ | 15 min | $0 | Unlimited bandwidth, Bangkok POP for Thai users |
| **GitHub Pages** | 5 min | $0 | Single platform, no extra accounts (workflow already in `.github/workflows/deploy.yml`) |

Both auto-deploy on every push to `main`. Both give free HTTPS + custom domains.

---

## Option A — Cloudflare Pages (recommended)

### One-time setup

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free)
2. **Workers & Pages → Create → Connect to Git → GitHub → authorize → select your repo**
3. Configure build:
   - **Framework preset**: Vite
   - **Root directory**: `savings-vision` (preferred for this repo layout)
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Environment variables**: `BUN_VERSION=1.3.4`
4. If you do **not** set a root directory, use:
   - **Build command**: `bun install --cwd savings-vision && bun --cwd savings-vision run build`
   - **Build output directory**: `savings-vision/dist`
   - **Environment variables**: `BUN_VERSION=1.3.4`
5. Click **Save and Deploy**. First deploy ~90s.
6. You get a URL like `<project>.pages.dev`.

### Important: Pages vs Workers

This repo is a **static Vite SPA**, not a Worker-first app. If Cloudflare shows a
screen asking for a **deploy command** like `npx wrangler deploy`, you are in the
**Workers Builds** flow. That can work only after adding Wrangler config, but it is
unnecessary here. Prefer **Pages** for the simplest setup.

### Important: Bun + Node

This project now uses **Bun as the package manager**, and the scripts are written so
that `bun run build` executes Vite under Bun's runtime. If you intentionally run Vite
through Node instead, use **Node 20.19.0+** or **22.12.0+** because Vite 8 requires it.

## Option A2 — Cloudflare Workers Builds

This repo is now wired for Workers too, using Cloudflare's Vite plugin and a
checked-in `wrangler.jsonc`.

Use these settings in the **Workers** import flow:

1. **Path**: `/savings-vision`
2. **Build command**: `bun run build`
3. **Deploy command**: `bunx wrangler deploy`
4. **Build variable**: `BUN_VERSION=1.3.4`

Notes:
- The Worker config lives at `savings-vision/wrangler.jsonc`
- Built assets are deployed from `savings-vision/dist`
- SPA routing is enabled via `assets.not_found_handling = "single-page-application"`
- The Worker name is set to `wah-saving-calculator` and must match the dashboard Worker name before deploying

### Custom domain (optional, ~10 min)

1. Buy a short domain (suggested: `wahsavings.com`, `wah-thai.com`, or punycode of `ฝันเก็บเงิน`)
2. In Cloudflare Pages → **Custom Domains → Add**
3. SSL auto-provisioned in minutes.

### Branch previews (free)

Every git branch gets its own preview URL: `<branch>.<project>.pages.dev`.
Use this to validate changes against real production data before merging.

---

## Option B — GitHub Pages (already wired)

`.github/workflows/deploy.yml` is committed at the repo root. To enable:

1. **Repo Settings → Pages → Source → "GitHub Actions"**
2. **Repo Settings → Secrets and variables → Actions → Variables → New repository variable**:
   - Name: `VITE_BASE_PATH`
   - Value: `/<your-repo-name>/` (e.g. `/savings-vision/`) — only needed if your
     site lives at `https://<user>.github.io/<repo>/`. Skip this step if you
     have a custom domain or a `<user>.github.io` root site.
3. If you want GitHub Actions to use Bun too, update the workflow to install Bun before building.
4. Push to `main`. Workflow runs in ~60s. Site live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

For a custom domain:

1. **Settings → Pages → Custom domain** → enter your domain
2. Add the DNS records GitHub shows you
3. Either delete the `VITE_BASE_PATH` repo variable or set it to `/`
4. Push — site rebuilds at root path on your domain

---

## Pre-launch checklist

- [x] Favicon (emerald `$` SVG, `public/favicon.svg`)
- [x] OG / Twitter meta tags for social sharing (Facebook, LINE, Discord)
- [x] `public/_redirects` for SPA-safe routing (defensive)
- [x] `public/robots.txt`
- [x] Deploy-ready Vite config (`base` env-aware)
- [x] `.github/workflows/deploy.yml` for GitHub Pages alternative
- [ ] **Add an OG image** (1200×630 PNG) at `public/og-image.png`. Recommended:
      emerald background, big white "ฝันเก็บเงิน" + small "WAH Australia" subtitle,
      a tiny calculator/savings illustration.
- [ ] **Pick a domain** and configure DNS (Cloudflare Pages or GitHub Pages).
- [ ] **Add a feedback channel** (LINE OA, Google Form, or email) somewhere in
      the footer so early users can report issues.

---

## Maintenance plan

### Automatic
- HTTPS auto-renews
- CDN cache auto-purges on each deploy
- Frankfurter API runs daily, app falls back to cached/default if it goes down
- Vite + React 19 + Tailwind v4 are stable for years

### Quarterly (~30 min)
```bash
cd savings-vision
bun outdated
bun update          # patch/minor updates within ranges in bun.lock/package.json
bun run build       # verify nothing broke
git push            # ship
```

Or enable **Dependabot** (free on GitHub, auto-opens PRs for updates).

### When the data changes (manual, single-file edits)
| What changed | Edit | Trigger |
|---|---|---|
| ATO tax brackets | `src/calc.ts` (constants `WHV_TAX_*`) | When ATO updates schedules |
| National Minimum Wage | `src/data.ts` (`JOBS[].baseWage`) | Each July 1 (Fair Work annual review) |
| Lifestyle costs | `src/data.ts` (`LIFESTYLE_TIERS[].defaults`) | Annually |
| Visa rules | `index.html` description + `src/i18n.ts` warning copy | When DHA changes 462 process |
| Default exchange rate | `src/data.ts` (`DEFAULT_THB_PER_AUD`) | Rarely — Frankfurter overrides daily |

Each edit → push → preview-deploys for review → merge → live in ~60s.

### Monitoring (optional)
- **Cloudflare Pages dashboard**: traffic, errors, deploy history (free)
- **UptimeRobot** (free tier): pings every 5 min, emails if site down
- **Sentry** (free tier, add later if needed): browser console errors from real users

---

## Cost estimate

**Year 1**: $0 hosting + ~$10 for custom domain (annual).

**At scale** (1M monthly page views): still $0 — Cloudflare Pages bandwidth is unlimited.

---

## Local development

```bash
cd savings-vision
bun install
bun run dev          # http://localhost:5173 with HMR
bun run build        # production build → dist/
bun run preview      # serve the production build locally
```

Test the production-equivalent build locally before pushing major changes.

---

## File reference

| Path | Purpose |
|---|---|
| `savings-vision/src/data.ts` | Job catalog, lifestyle tiers, hours, defaults |
| `savings-vision/src/calc.ts` | Tax brackets (WAH 15/30/37/45%), Super (12%), DASP (65%) |
| `savings-vision/src/i18n.ts` | TH + EN dictionary |
| `savings-vision/src/exchangeRate.ts` | Frankfurter API integration |
| `savings-vision/src/App.tsx` | UI |
| `savings-vision/index.html` | Meta tags, fonts, OG |
| `savings-vision/public/` | Static assets (favicon, robots, _redirects) |
| `.github/workflows/deploy.yml` | GitHub Pages CI workflow |
| `vite.config.ts` | Build config (base path env-aware) |
