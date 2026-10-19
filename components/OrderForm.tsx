"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { fieldErrors, orderSchema, type OrderInput } from "@/lib/lead-schema";

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  color: string;
  size: string;
  message: string;
  hp_field: string; // honeypot
};

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full bg-transparent border-b border-white/12 py-3 text-[#F0EDE8] placeholder-[#6f6b66] text-base focus:outline-none focus:border-[#C8A028] transition-colors duration-200";
const labelClass = "block text-sm tracking-[0.2em] uppercase text-[#A09C97] mb-2";
const optionalClass = "normal-case tracking-normal text-[#6f6b66]";

/**
 * Objednávka bez platby: zákazník nechá kontakt, my zavoláme a domluvíme
 * velikost, cenu i doručení. Zůstává připojená i zavřená, aby se vyplněné
 * údaje neztratily, když se zákazník vrátí na detail obleku.
 */
export default function OrderForm({ product, open, onClose, onDone }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    color: product.colors[0]?.name ?? "",
    size: "",
    message: "",
    hp_field: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload: OrderInput = {
      ...form,
      productId: product.id,
      productName: product.name,
    };
    const parsed = orderSchema.safeParse(payload);
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!consent) nextErrors.consent = "Bez souhlasu vám nemůžeme zavolat.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
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
      };

      if (!res.ok) {
        setErrors(data.fields ?? {});
        setErrorMsg(data.error ?? "Nastala chyba. Zkuste to prosím znovu.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Připojení selhalo. Zkuste to prosím znovu, nebo nám zavolejte.");
      setStatus("error");
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? (
      <p id={`order-${name}-error`} className="mt-2 text-sm text-red-400">
        {errors[name]}
      </p>
    ) : null;

  const errorProps = (name: string) =>
    errors[name]
      ? { "aria-invalid": true, "aria-describedby": `order-${name}-error` }
      : {};

  return (
    <div
      hidden={!open}
      className="fixed inset-0 z-[120] flex items-center justify-center md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Objednávka — ${product.name}`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full h-full md:h-auto md:max-h-[88vh] md:max-w-xl bg-[#141414] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-[#141414] border border-white/40 text-white hover:border-white focus-visible:border-[#C8A028] focus-visible:outline-none transition-colors duration-200"
          aria-label="Zpět na detail obleku"
        >
          ✕
        </button>

        <div className="p-6 md:p-10">
          {status === "success" ? (
            <div className="py-10 md:py-6">
              <div className="w-10 h-px bg-[#C8A028] mb-6" />
              <h2
                className="text-4xl font-light text-white mb-4 leading-tight"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Objednávku máme.
              </h2>
              <p className="text-[#A09C97] text-base leading-relaxed mb-10">
                Do 24 hodin vám zavoláme na číslo{" "}
                <span className="text-[#F0EDE8] whitespace-nowrap">{form.phone}</span>{" "}
                a domluvíme velikost, cenu i doručení obleku {product.name}.
              </p>
              <button
                type="button"
                onClick={onDone}
                className="inline-flex items-center justify-center px-6 py-4 border border-white/20 text-[#F0EDE8] text-sm tracking-[0.15em] uppercase hover:border-white/40 focus-visible:border-[#C8A028] focus-visible:outline-none transition-colors duration-200"
              >
                Zpět na kolekci
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              <div className="pr-12">
                <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-2">
                  Objednávka
                </p>
                <h2
                  className="text-4xl font-light text-white leading-tight"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {product.name}
                </h2>
                <p className="text-[#A09C97] text-sm leading-relaxed mt-3">
                  Nic neplatíte online. Do 24 hodin vám zavoláme a domluvíme
                  velikost, cenu i doručení.
                </p>
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
                <label htmlFor="order-name" className={labelClass}>Jméno</label>
                <input
                  ref={nameRef}
                  id="order-name"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <div>
                  <label htmlFor="order-phone" className={labelClass}>Telefon</label>
                  <input
                    id="order-phone"
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
                  <label htmlFor="order-email" className={labelClass}>
                    E-mail <span className={optionalClass}>(nepovinné)</span>
                  </label>
                  <input
                    id="order-email"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                {product.colors.length > 1 && (
                  <div>
                    <label htmlFor="order-color" className={labelClass}>Barva</label>
                    <select
                      id="order-color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className={`${inputClass} [&>option]:bg-[#141414]`}
                    >
                      {product.colors.map((color) => (
                        <option key={color.name} value={color.name}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor="order-size" className={labelClass}>
                    Velikost <span className={optionalClass}>(nepovinné)</span>
                  </label>
                  <input
                    id="order-size"
                    type="text"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="např. 50"
                    className={inputClass}
                    aria-describedby="order-size-hint"
                  />
                  <p id="order-size-hint" className="mt-2 text-sm text-[#6f6b66]">
                    Nabízíme {product.specs.velikosti}. Nevíte? Poradíme po telefonu.
                  </p>
                  {fieldError("size")}
                </div>
              </div>

              <div>
                <label htmlFor="order-message" className={labelClass}>
                  Poznámka <span className={optionalClass}>(nepovinné)</span>
                </label>
                <textarea
                  id="order-message"
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

              <div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="order-consent"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setErrors((prev) => ({ ...prev, consent: "" }));
                    }}
                    className="mt-1 accent-[#C8A028]"
                    {...errorProps("consent")}
                  />
                  <label htmlFor="order-consent" className="text-sm text-[#A09C97] leading-relaxed">
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

              {status === "error" && errorMsg && (
                <p role="alert" className="text-base text-red-400">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full inline-flex items-center justify-center px-6 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {status === "loading" ? "Odesílám…" : "Odeslat objednávku"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
