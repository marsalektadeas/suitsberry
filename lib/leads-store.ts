import "server-only";

import { neon } from "@neondatabase/serverless";

import type { Lead, LeadSource, LeadStatus, LeadUpdate } from "./lead-schema";

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("Databáze poptávek není připojená. Ve Vercelu chybí proměnná DATABASE_URL.");
    this.name = "DatabaseNotConfiguredError";
  }
}

/** Poptávku mezitím změnil někdo jiný — přepis by tiše zahodil jeho úpravu. */
export class StaleLeadError extends Error {
  constructor() {
    super("Poptávka byla mezitím upravena.");
    this.name = "StaleLeadError";
  }
}

export class LeadNotFoundError extends Error {
  constructor() {
    super("Poptávka neexistuje.");
    this.name = "LeadNotFoundError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  return neon(url);
}

type LeadRow = {
  id: string;
  created_at: Date;
  updated_at: Date;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  phone: string | null;
  email: string | null;
  product_id: string | null;
  product_name: string | null;
  color: string | null;
  size: string | null;
  message: string | null;
  internal_note: string;
};

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    source: row.source,
    status: row.status,
    name: row.name,
    phone: row.phone,
    email: row.email,
    productId: row.product_id,
    productName: row.product_name,
    color: row.color,
    size: row.size,
    message: row.message,
    internalNote: row.internal_note,
  };
}

export type NewLead = {
  source: LeadSource;
  name: string;
  phone?: string;
  email?: string;
  productId?: string;
  productName?: string;
  color?: string;
  size?: string;
  message?: string;
};

export async function createLead(lead: NewLead): Promise<Lead> {
  const rows = (await db()`
    insert into leads (source, name, phone, email, product_id, product_name, color, size, message)
    values (
      ${lead.source}, ${lead.name}, ${lead.phone ?? null}, ${lead.email ?? null},
      ${lead.productId ?? null}, ${lead.productName ?? null}, ${lead.color ?? null},
      ${lead.size ?? null}, ${lead.message ?? null}
    )
    returning *
  `) as LeadRow[];
  return toLead(rows[0]);
}

/** Objem je malý (jednotky až desítky měsíčně) — filtruje se až v adminu. */
export async function listLeads(): Promise<Lead[]> {
  const rows = (await db()`
    select * from leads order by created_at desc limit 1000
  `) as LeadRow[];
  return rows.map(toLead);
}

export async function countNewLeads(): Promise<number> {
  const rows = (await db()`
    select count(*)::int as count from leads where status = 'new'
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

/**
 * Uloží stav a interní poznámku. `update.updatedAt` je razítko, se kterým
 * admin pracoval — když nesedí, změnil poptávku mezitím někdo jiný.
 */
export async function updateLead(id: string, update: LeadUpdate): Promise<Lead> {
  const sql = db();
  const rows = (await sql`
    update leads
    set status = ${update.status}, internal_note = ${update.internalNote}, updated_at = now()
    -- Postgres drží mikrosekundy, JS Date jen milisekundy — porovnáváme na ms.
    where id = ${id}
      and date_trunc('milliseconds', updated_at) = ${update.updatedAt}::timestamptz
    returning *
  `) as LeadRow[];

  if (rows[0]) return toLead(rows[0]);

  const exists = (await sql`select 1 from leads where id = ${id}`) as unknown[];
  throw exists.length > 0 ? new StaleLeadError() : new LeadNotFoundError();
}

export async function deleteLead(id: string): Promise<void> {
  const rows = (await db()`delete from leads where id = ${id} returning id`) as unknown[];
  if (rows.length === 0) throw new LeadNotFoundError();
}
