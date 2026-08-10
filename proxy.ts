import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isValidSessionToken,
} from "@/lib/admin-auth";

/**
 * Brána adminu. V Next 16 nahradil `proxy.ts` dřívější `middleware.ts`.
 *
 * Tohle je první obrana, ne jediná — API routy si přihlášení ověřují samy,
 * aby přímé volání endpointu nešlo obejít.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // Bez env proměnných se přihlásit nedá; login stránka to uživateli vysvětlí.
  if (!isAdminConfigured()) {
    return isLoginPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const isLoggedIn = await isValidSessionToken(
    request.cookies.get(ADMIN_COOKIE)?.value,
  );

  if (isLoginPage) {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
