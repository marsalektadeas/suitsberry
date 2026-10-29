"use client";

import { useEffect, useRef, useState } from "react";

import { fieldErrors, orderSchema, type OrderInput } from "@/lib/lead-schema";
import ApprovalSteps from "./ApprovalSteps";
import type { ResolvedCartLine } from "./CartProvider";

export type OrderConfirmation = {
  orderNumber: string | null;
  phone: string;
  email: string;
  confirmationSent: boolean;
};

type Props = {
  /** Skrytý formulář zůstává připojený, aby údaje přežily návrat do košíku. */
  hidden: boolean;
  lines: ResolvedCartLine[];
  summary: string;
  onBack: () => void;
  onSubmitted: (confirmation: OrderConfirmation) => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
  hp_field: string; // honeypot
};

type Status = "idle" | "loading" | "error";

const inputClass =
  "w-full bg-transparent border-b border-white/12 py-3 text-[#F0EDE8] placeholder-[#6f6b66] text-base focus:outline-none focus:border-[#C8A028] transition-colors duration-200";
const labelClass = "block text-sm tracking-[0.2em] uppercase text-[#A09C97] mb-2";
const optionalClass = "normal-case tracking-normal text-[#6f6b66]";

/** Jen kontakt — doprava ani platba se tu neřeší, domlouváme je po telefonu. */
export default function CheckoutForm({ hidden, lines, summary, onBack, onSubmitted }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
    hp_field: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hidden) nameRef.current?.focus();
  }, [hidden]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload: OrderInput = {
      ...form,
      items: lines.map((line) => ({
        productId: line.productId,
        color: line.color ?? undefined,
        size: line.size,
        quantity: line.quantity,
      })),
    };
    const parsed = orderSchema.safeParse(payload);
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!consent) nextErrors.consent = "Bez souhlasu vám nemůžeme zavolat.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.items) setErrorMsg("Košík se nepodařilo načíst. Vraťte se do košíku a zkuste to znovu.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string>;
        orderNumber?: string | null;
        confirmationSent?: boolean;
      };

      if (!res.ok) {
        setErrors(data.fields ?? {});
        setErrorMsg(data.error ?? "Nastala chyba. Zkuste to prosím znovu.");
        setStatus("error");
        return;
      }

      setStatus("idle");
      setForm((prev) => ({ ...prev, message: "" }));
      onSubmitted({
        orderNumber: data.orderNumber ?? null,
        phone: form.phone,
        email: form.email,
        confirmationSent: data.confirmationSent ?? false,
      });
    } catch {
      setErrorMsg("Připojení selhalo. Zkuste to prosím znovu, nebo nám zavolejte.");
      setStatus("error");
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? (
      <p id={`checkout-${name}-error`} className="mt-2 text-sm text-red-400">
        {errors[name]}
      </p>
    ) : null;

  const errorProps = (name: string) =>
    errors[name]
      ? { "aria-invalid": true, "aria-describedby": `checkout-${name}-error` }
      : {};

  return (
    <form hidden={hidden} onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-7">
        <div className="flex items-center justify-between gap-4 text-sm">
          <button
            type="button"
            onClick={onBack}
            className="text-[#C8A028] hover:underline focus-visible:underline focus-visible:outline-none underline-offset-4"
          >
            ← Zpět do košíku
          </button>
          <span className="text-[#A09C97]">{summary}</span>
        </div>

        {/* Honeypot — hidden from humans, bots fill this */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
          <input
            type="text"
            name="hp_field"
            value={form.hp_field}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="one-time-code"
          />
        </div>

        <div>
          <label htmlFor="checkout-name" className={labelClass}>Jméno</label>
          <input
            ref={nameRef}
            id="checkout-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jan Novák"
            autoComplete="name"
            className={inputClass}
            {...errorProps("name")}
          />
          {fieldError("name")}
        </div>

        <div>
          <label htmlFor="checkout-phone" className={labelClass}>Telefon</label>
          <input
            id="checkout-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+420 777 000 000"
            autoComplete="tel"
            className={inputClass}
            {...errorProps("phone")}
          />
          {fieldError("phone")}
        </div>

        <div>
          <label htmlFor="checkout-email" className={labelClass}>E-mail</label>
          <input
            id="checkout-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jan@example.cz"
            autoComplete="email"
            className={inputClass}
            {...errorProps("email")}
          />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor="checkout-message" className={labelClass}>
            Poznámka <span className={optionalClass}>(nepovinné)</span>
          </label>
          <textarea
            id="checkout-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Termín akce, kdy se vám hodí zavolat…"
            rows={3}
            className={`${inputClass} resize-none`}
            {...errorProps("message")}
          />
          {fieldError("message")}
        </div>

        <ApprovalSteps />

        <div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="checkout-consent"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setErrors((prev) => ({ ...prev, consent: "" }));
              }}
              className="mt-1 accent-[#C8A028]"
              {...errorProps("consent")}
            />
            <label htmlFor="checkout-consent" className="text-sm text-[#A09C97] leading-relaxed">
              Souhlasím se{" "}
              <a
                href="/zasady-ochrany-osobnich-udaju"
                target="_blank"
                className="underline hover:text-[#F0EDE8] transition-colors"
              >
                zpracováním osobních údajů
              </a>{" "}
              za účelem vyřízení objednávky.
            </label>
          </div>
          {fieldError("consent")}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-white/8 p-6 flex flex-col gap-3">
        {errorMsg && (
          <p role="alert" className="text-sm text-red-400">{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full inline-flex items-center justify-center px-6 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {status === "loading" ? "Odesílám…" : "Odeslat objednávku ke schválení"}
        </button>
      </div>
    </form>
  );
}
