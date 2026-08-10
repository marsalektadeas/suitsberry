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
Products live in Vercel Blob as a single JSON document, managed through the admin at `/admin`.

`lib/products-store.ts` is the access layer:
- Each save writes a **new** blob at `data/products/<timestamp>.json` instead of overwriting. Public blob URLs sit behind a CDN, so a fresh path is the only way to guarantee no stale read. The 5 newest versions are kept as backups; older ones are pruned.
- `getVisibleProducts()` — cached under tag `products`, filters out hidden products. Used by the public page.
- `readProductsDocument()` — uncached, includes hidden products. Used by admin pages and API routes.
- `writeProductsDocument(products, expectedUpdatedAt)` — rejects the write with `StaleWriteError` when `expectedUpdatedAt` no longer matches, so two open tabs can't silently overwrite each other. Invalidates the cache with `revalidateTag(PRODUCTS_TAG, { expire: 0 })` — `expire: 0` means immediate, not stale-while-revalidate.
- Without `BLOB_READ_WRITE_TOKEN` reads fall back to `data/products.ts` and writes throw `StorageNotConfiguredError`. The admin shows a banner in that state.

`data/products.ts` holds the `Product` type plus the default set. It is no longer edited by hand — it seeds the first save and serves as fallback when the Blob is unreachable. Each product has:
- `heroImage` — used on the collection card. Must show the full person including face. Schema enforces it is one of `images[]`.
- `images[]` — used in the modal gallery. Can include detail/close-up shots.
- `hidden?: boolean` — set to `true` to hide a product from the collection without deleting it.

### Admin
`/admin`, protected by a single password. No user accounts.
- `proxy.ts` (Next 16 replacement for `middleware.ts`) guards `/admin/*`. API routes re-check the session themselves — the proxy is not the only gate.
- `lib/admin-auth.ts` — Web Crypto HMAC, so it also runs in the Edge proxy. Session is a signed `<expiry>.<hmac>` in an httpOnly cookie, valid 7 days.
- `lib/admin-session.ts` — cookie check for server components and route handlers (uses `next/headers`, so it must stay out of the proxy import graph).
- `lib/product-schema.ts` — zod validation shared by client form and server route. Image sources are restricted to `/products/…` or our own blob host.
- Photos are downscaled in the browser first (`lib/image-resize.ts`, 1600 px / JPEG q82 → typically under 400 KB), then POSTed as `multipart/form-data` to `/api/admin/upload`, which validates type and size server-side and calls `put()`. Client-side direct upload was rejected on purpose: `generateClientTokenFromReadWriteToken` uses the read-write token as its HMAC signing key, so it would force a long-lived `BLOB_READ_WRITE_TOKEN` even where OIDC would otherwise do. Vercel's 4.5 MB request body cap is not a problem because only the already-resized image is ever sent.
- Deleting a product or removing a photo does **not** delete blobs. Orphaned images accumulate; both confirmation dialogs say so.

Required env vars: `BLOB_READ_WRITE_TOKEN` (added by Vercel when the Blob store is connected), `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

### Component flow
`app/page.tsx` → assembles all section components linearly in page order.

`Collection.tsx` is `'use client'` — manages `selectedProduct` state and renders `ProductModal` as a full-screen overlay. It receives `products` as a prop from the server page; hidden products are already filtered out by `getVisibleProducts()`.

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
