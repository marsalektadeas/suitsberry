import "server-only";

import { cookies } from "next/headers";

import { ADMIN_COOKIE, isValidSessionToken } from "./admin-auth";

/**
 * Ověření přihlášení pro server komponenty a API routy.
 * Odděleno od `admin-auth.ts`, protože `next/headers` nejde použít v proxy.ts.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

/** Odpověď pro nepřihlášené volání API. */
export function unauthorizedResponse() {
  return Response.json(
    { error: "Nejste přihlášeni. Přihlaste se prosím znovu." },
    { status: 401 },
  );
}
