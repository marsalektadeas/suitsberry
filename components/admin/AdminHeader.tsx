"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-white/8 sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-xl font-light text-[#F0EDE8] hover:text-[#C8A028] transition-colors duration-200"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Suitsberry<span className="text-[#C8A028]">.</span>
          <span className="ml-3 align-middle text-[0.65rem] tracking-[0.25em] uppercase text-[#888580]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Správa kolekce
          </span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-[#A09C97] hover:text-[#C8A028] transition-colors duration-200 focus-visible:outline-none focus-visible:text-[#C8A028] focus-visible:underline"
          >
            Zobrazit web ↗
          </a>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-[#A09C97] hover:text-[#C8A028] transition-colors duration-200 focus-visible:outline-none focus-visible:text-[#C8A028] focus-visible:underline disabled:opacity-50"
          >
            {isLoggingOut ? "Odhlašuji…" : "Odhlásit"}
          </button>
        </div>
      </div>
    </header>
  );
}
