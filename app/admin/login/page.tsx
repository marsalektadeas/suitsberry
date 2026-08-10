import Link from "next/link";
import { Suspense } from "react";

import LoginForm from "@/components/admin/LoginForm";
import { isAdminConfigured } from "@/lib/admin-auth";

export default function LoginPage() {
  const configured = isAdminConfigured();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-3xl font-light text-[#F0EDE8] hover:text-[#C8A028] transition-colors duration-200"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Suitsberry
        </Link>
        <p className="mt-2 mb-10 text-center text-xs tracking-[0.25em] uppercase text-[#888580]">
          Správa kolekce
        </p>

        {configured ? (
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="rounded-sm border border-[#C8A028]/30 bg-[#141414] p-5 text-sm leading-relaxed text-[#A09C97]">
            <p className="text-[#F0EDE8] mb-2">Admin ještě není nastavený.</p>
            <p>
              Ve Vercelu chybí proměnné{" "}
              <code className="text-[#C8A028]">ADMIN_PASSWORD</code> a{" "}
              <code className="text-[#C8A028]">ADMIN_SESSION_SECRET</code>. Po
              jejich doplnění a novém nasazení se tady objeví přihlášení.
            </p>
          </div>
        )}

        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[#888580] hover:text-[#C8A028] transition-colors duration-200"
          >
            ← Zpět na web
          </Link>
        </p>
      </div>
    </main>
  );
}
