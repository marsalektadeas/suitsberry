# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (:3000, falls back to :3001/3002 if occupied)
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
`data/products.ts` is the single source of truth for all products. Each product has:
- `heroImage` — used on the collection card. Must show the full person including face.
- `images[]` — used in the modal gallery. Can include detail/close-up shots.
- `hidden?: boolean` — set to `true` to hide a product from the collection without deleting it.

### Component flow
`app/page.tsx` → assembles all section components linearly in page order.

`Collection.tsx` is `'use client'` — manages `selectedProduct` state and renders `ProductModal` as a full-screen overlay. Filter for `hidden` products happens here: `products.filter((p) => !p.hidden)`.

`ProductModal.tsx` has two separate layouts rendered via Tailwind breakpoints:
- **Mobile** (`md:hidden`): fullscreen, swipeable carousel (`snap-x snap-mandatory` via ref + `scrollTo`), dot indicators, scrollable details below.
- **Desktop** (`hidden md:flex`): 65 % image panel + 35 % details panel side by side. Images use `object-contain` on dark background so full photo is always visible.

### Styling
- Tailwind v4 with shadcn. Design tokens live in `app/globals.css` under `:root`.
- Gold accent used consistently in hover states, active indicators, CTA buttons: `#C8A028`.
- Color palette: `#0A0A0A` (bg), `#F0EDE8` (text), `#C8A028` (gold), `#888580` (muted).
- Fonts: Cormorant Garamond (display/headings) + Inter (body). Apply display font inline with `style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}` — do not use a Tailwind class for this.
- Sections alternate between `bg-[#0A0A0A]` and `bg-[#111111]`.

### Product images
Stored in `public/products/<slug>/`. CDN images from suitsberry.cz are 1024×1024 squares with white padding — trim with PIL before use:
```python
from PIL import Image
img = Image.open("input.jpg")
bbox = img.convert("RGB").getbbox()  # or detect non-white region
img.crop(bbox).save("output.jpg")
```
After replacing image files, clear `.next/cache/images` and restart the dev server.

### Contact form
`app/api/contact/route.ts` is a mock POST handler — logs to console, returns JSON. Ready to connect to Resend/SendGrid or CRM. No external services configured yet.

### Deploy
Git → GitHub (`marsalektadeas/suitsberry`) → Vercel auto-deploy on push to `main`. Project is linked via `.vercel/project.json`. For manual production deploy: `vercel --prod`.
