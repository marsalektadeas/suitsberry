"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Vrací jen bezpečné interní cesty — `?next=` nesmí posloužit k odchodu na cizí web. */
function safeRedirect(target: string | null): string {
  if (!target) return "/admin";
  if (!target.startsWith("/admin") || target.startsWith("//")) return "/admin";
  return target;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Přihlášení se nezdařilo.");
        setPassword("");
        return;
      }

      router.replace(safeRedirect(searchParams.get("next")));
      router.refresh();
    } catch {
      setError("Nepodařilo se spojit se serverem. Zkontrolujte připojení.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm text-[#A09C97]">
          Heslo
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          autoFocus
          disabled={isSubmitting}
          aria-invalid={error !== null}
          aria-describedby={error ? "login-error" : undefined}
          className="h-11 text-base"
        />
      </div>

      {error && (
        <p
          id="login-error"
          role="alert"
          className="text-sm text-[#E5847B] leading-relaxed"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || password.length === 0}
        className="w-full h-11 rounded-sm bg-[#C8A028] text-[#0A0A0A] text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-200 hover:bg-[#D4AF40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Přihlašuji…" : "Přihlásit se"}
      </button>
    </form>
  );
}
