# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (runs on :3000, falls back to :3001)
npm run build    # Production build + TypeScript check
npm run lint     # ESLint
```

After editing product images, clear Next.js image cache to avoid stale renders:
```bash
rm -rf .next/cache/images
```

## Architecture

**One-page marketing site** for Suitsberry (premium men's suits). No e-commerce — goal is lead generation via contact form.

### Data layer
`data/products.ts` is the single source of truth for all products. Each product has `heroImage` (used on card) and `images[]` (used in modal gallery). **heroImage must always show the full person including face** — detail/close-up shots go in `images[]` only.

### Component flow
`app/page.tsx` → assembles all section components linearly. `Collection.tsx` is a `'use client'` component that manages `selectedProduct` state and renders `ProductModal` as a portal-style overlay.

### Styling
- Tailwind v4 with shadcn. Design tokens live in `app/globals.css` under `:root`.
- Color palette: `#0A0A0A` (bg), `#F0EDE8` (text), `#C9A96E` (gold accent), `#888580` (muted).
- Fonts: Cormorant Garamond (display/headings) + Inter (body). Apply display font inline: `style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}`.
- Sections alternate between `bg-[#0A0A0A]` and `bg-[#111111]`.

### Product images
Stored in `public/products/<id>/`. CDN images from suitsberry.cz are served as 1024×1024 squares with white padding — must be trimmed with PIL before use:
```python
from PIL import Image
# detect non-white bbox and crop
```
After replacing image files, always clear `.next/cache/images` and restart the dev server.

### Contact form
`app/api/contact/route.ts` is a mock POST handler — logs to console, returns JSON. Ready to connect to Resend/SendGrid or CRM. No external services configured yet.
