import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { slugify } from "@/lib/product-schema";
import {
  isStorageConfigured,
  StorageNotConfiguredError,
} from "@/lib/products-store";

/**
 * Nahrání jedné fotky do Blobu.
 *
 * Fotka jde přes server, ne přímo z prohlížeče. Vercel sice omezuje tělo
 * požadavku na 4,5 MB, jenže prohlížeč fotku předtím zmenší na stovky kilobajtů
 * (`lib/image-resize.ts`), takže se do limitu pohodlně vejde. Výměnou za to
 * nepotřebujeme `BLOB_READ_WRITE_TOKEN` — serverový zápis zvládne OIDC —
 * a velikost i typ souboru kontroluje server, ne podepsaný token u klienta.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPE = "image/jpeg";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: new StorageNotConfiguredError().message },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neplatný formát dat." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Chybí soubor." }, { status: 422 });
  }

  if (file.type !== ALLOWED_TYPE) {
    return NextResponse.json(
      { error: "Přijímáme jen fotky zpracované prohlížečem." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fotka je i po zmenšení příliš velká. Zkuste jinou." },
      { status: 413 },
    );
  }

  const rawSlug = formData.get("slug");
  const slug =
    typeof rawSlug === "string" && slugify(rawSlug) ? slugify(rawSlug) : "bez-nazvu";

  try {
    const blob = await put(`products/${slug}/photo.jpg`, file, {
      access: "public",
      contentType: ALLOWED_TYPE,
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[admin/upload] selhalo:", error);
    return NextResponse.json(
      { error: "Nahrání fotky se nezdařilo. Zkuste to prosím znovu." },
      { status: 502 },
    );
  }
}
