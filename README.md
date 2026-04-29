# WAH Saving Calculator

Thai/English savings calculator for Working Holiday makers comparing jobs,
hours, living costs, tax, super, DASP, and THB conversion.

## App

- Source app: `savings-vision/`
- Runtime data: AUD→THB exchange rate from `frankfurter.dev`
- Deployment target: Cloudflare Workers

## Local development

```bash
cd savings-vision
bun install
bun run dev
```

## Build

```bash
cd savings-vision
bun run build
```

## Deploy

Cloudflare Workers import settings:

- Path: `/savings-vision`
- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`
- Build variable: `BUN_VERSION=1.3.4`

Worker config lives in `savings-vision/wrangler.jsonc`.
