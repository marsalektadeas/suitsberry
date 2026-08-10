/**
 * Přihlášení do adminu: jedno heslo, žádné uživatelské účty.
 *
 * Po ověření hesla dostane prohlížeč httpOnly cookie s podepsaným tokenem
 * `<expiraceVMs>.<hmacSha256>`. Token nenese žádná data — jen datum platnosti,
 * které nejde zfalšovat bez znalosti `ADMIN_SESSION_SECRET`.
 *
 * Web Crypto místo `node:crypto`, protože tenhle kód běží i v proxy.ts (Edge).
 */

export const ADMIN_COOKIE = "sb_admin";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
} as const;

function requireEnv(name: "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Chybí proměnná prostředí ${name}. Nastav ji ve Vercelu i v .env.local.`,
    );
  }
  return value;
}

/** Je admin vůbec nakonfigurovaný? Bez toho nemá smysl ukazovat přihlašovací formulář. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

const encoder = new TextEncoder();

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(requireEnv("ADMIN_SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Porovnání nezávislé na délce shody — brání odvození podpisu po znacích. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = requireEnv("ADMIN_PASSWORD");
  // Podepsání srovná délky, takže i špatně dlouhé heslo trvá stejně dlouho.
  return timingSafeEqual(await sign(candidate), await sign(expected));
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${await sign(expiresAt)}`;
}

export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  if (!Number.isFinite(Number(expiresAt)) || Number(expiresAt) < Date.now()) {
    return false;
  }

  return timingSafeEqual(signature, await sign(expiresAt));
}
