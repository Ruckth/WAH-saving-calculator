# Cloudflare Workers Deploy

This app is deployed from `savings-vision/` using Bun and Wrangler.

## Dashboard settings

- Path: `/savings-vision`
- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`
- Build variable: `BUN_VERSION=1.3.4`

## Required files

- `wrangler.jsonc`
- `vite.config.ts`
- `package.json`

## Notes

- Worker name must match `wah-saving-calculator`
- Static assets are deployed from `dist/`
- SPA routing is enabled with `assets.not_found_handling = "single-page-application"`

## Local checks

```bash
cd savings-vision
bun run build
bunx wrangler deploy --dry-run
```
