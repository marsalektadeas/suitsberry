import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { firstIssueMessage, productsPayloadSchema } from "@/lib/product-schema";
import {
  readProductsDocument,
  StaleWriteError,
  StorageNotConfiguredError,
  writeProductsDocument,
} from "@/lib/products-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  try {
    return NextResponse.json(await readProductsDocument());
  } catch (error) {
    console.error("[admin/products] GET selhalo:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst produkty z úložiště." },
      { status: 502 },
    );
  }
}

/**
 * Ukládá celou kolekci najednou — přidání, úprava, mazání i změna pořadí
 * jsou z pohledu úložiště jedna a ta samá operace nad jedním JSON dokumentem.
 */
export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný formát dat." }, { status: 400 });
  }

  const parsed = productsPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const document = await writeProductsDocument(
      parsed.data.products,
      parsed.data.updatedAt,
    );
    return NextResponse.json({ success: true, updatedAt: document.updatedAt });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof StaleWriteError) {
      return NextResponse.json(
        {
          error:
            "Kolekci mezitím upravilo jiné okno nebo zařízení. Načtěte stránku znovu, ať nepřepíšete cizí změnu.",
        },
        { status: 409 },
      );
    }

    console.error("[admin/products] PUT selhalo:", error);
    return NextResponse.json(
      { error: "Uložení se nezdařilo. Zkuste to prosím znovu." },
      { status: 502 },
    );
  }
}
