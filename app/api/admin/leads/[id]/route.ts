import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { leadUpdateSchema } from "@/lib/lead-schema";
import {
  DatabaseNotConfiguredError,
  deleteLead,
  LeadNotFoundError,
  StaleLeadError,
  updateLead,
} from "@/lib/leads-store";

type Context = { params: Promise<{ id: string }> };

const idSchema = z.uuid();

function errorResponse(error: unknown, action: string) {
  if (error instanceof DatabaseNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof LeadNotFoundError) {
    return NextResponse.json(
      { error: "Poptávka už neexistuje — nejspíš ji mezitím někdo smazal." },
      { status: 404 },
    );
  }
  if (error instanceof StaleLeadError) {
    return NextResponse.json(
      {
        error:
          "Poptávku mezitím upravilo jiné okno nebo zařízení. Načtěte stránku znovu, ať nepřepíšete cizí změnu.",
      },
      { status: 409 },
    );
  }
  console.error(`[admin/leads] ${action} selhalo:`, error);
  return NextResponse.json(
    { error: "Akce se nezdařila. Zkuste to prosím znovu." },
    { status: 502 },
  );
}

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const id = idSchema.safeParse((await params).id);
  if (!id.success) {
    return NextResponse.json({ error: "Neplatná poptávka." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný formát dat." }, { status: 400 });
  }

  const parsed = leadUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data nejsou platná." },
      { status: 422 },
    );
  }

  try {
    return NextResponse.json({ lead: await updateLead(id.data, parsed.data) });
  } catch (error) {
    return errorResponse(error, "PATCH");
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const id = idSchema.safeParse((await params).id);
  if (!id.success) {
    return NextResponse.json({ error: "Neplatná poptávka." }, { status: 400 });
  }

  try {
    await deleteLead(id.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "DELETE");
  }
}
