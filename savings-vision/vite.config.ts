import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// `base` is configurable via env var so the same build can ship to:
//   • Cloudflare Pages / Netlify / Vercel / custom domain (root path: '/')
//   • GitHub Pages on a project URL (subpath: '/<repo-name>/')
//
// Default '/' works for all root-served hosts. For GitHub Pages set
//   VITE_BASE_PATH=/<repo-name>/ npm run build
// or set it as a repo-level Variable in GitHub Settings → Secrets and variables.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH ?? '/',
})
