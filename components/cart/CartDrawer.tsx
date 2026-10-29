"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";

import { MAX_ITEM_QUANTITY, sumItems } from "@/lib/lead-schema";
import { withCount } from "@/lib/plural";
import { formatCzk } from "@/lib/price";
import ApprovalSteps from "./ApprovalSteps";
import CheckoutForm, { type OrderConfirmation } from "./CheckoutForm";
import { useCart, type ResolvedCartLine } from "./CartProvider";

type Step = "cart" | "checkout" | "success";

const SUIT_FORMS = ["oblek", "obleky", "obleků"] as const;

const primaryButton =
  "w-full inline-flex items-center justify-center px-6 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028] transition-colors duration-200";
const secondaryButton =
  "w-full inline-flex items-center justify-center px-6 py-4 border border-white/20 text-[#F0EDE8] text-sm tracking-[0.15em] uppercase hover:border-white/40 focus-visible:border-[#C8A028] focus-visible:outline-none transition-colors duration-200";

/**
 * Košík jako panel z boku: přehled → kontaktní údaje → potvrzení.
 * Zůstává připojený i zavřený, aby vyplněné údaje nezmizely.
 */
export default function CartDrawer() {
  const { lines, itemCount, isOpen, closeCart, add, remove, clear } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [lastRemoved, setLastRemoved] = useState<ResolvedCartLine | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { totalCzk, hasUnpricedItems } = sumItems(
    lines.map((line) => ({
      quantity: line.quantity,
      unitPriceCzk: line.product.priceCzk ?? null,
    })),
  );

  function handleClose() {
    closeCart();
    setLastRemoved(null);
    if (step === "success") setStep("cart");
  }

  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") handleClose();
  });

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  function handleRemove(line: ResolvedCartLine) {
    remove(line.key);
    setLastRemoved(line);
  }

  function undoRemove() {
    if (!lastRemoved) return;
    add({
      productId: lastRemoved.productId,
      color: lastRemoved.color,
      size: lastRemoved.size,
      quantity: lastRemoved.quantity,
    });
    setLastRemoved(null);
  }

  function handleSubmitted(result: OrderConfirmation) {
    clear();
    setConfirmation(result);
    setStep("success");
  }

  function browseCollection() {
    handleClose();
    requestAnimationFrame(() => {
      document.getElementById("kolekce")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  const title = step === "success" ? "Objednávka odeslána" : step === "checkout" ? "Vaše údaje" : "Košík";
  const isEmpty = lines.length === 0;

  return (
    <div
      hidden={!isOpen}
      className="fixed inset-0 z-[130]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-[#141414] border-l border-white/8 flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between gap-4 px-6 h-16 md:h-20 border-b border-white/8">
          <h2
            className="text-3xl font-light text-white"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center border border-white/40 text-white hover:border-white focus-visible:border-[#C8A028] focus-visible:outline-none transition-colors duration-200"
            aria-label="Zavřít košík"
          >
            ✕
          </button>
        </div>

        {step === "success" && confirmation ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-10 h-px bg-[#C8A028] mb-6" />
            {confirmation.orderNumber && (
              <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-3">
                Objednávka {confirmation.orderNumber}
              </p>
            )}
            <p
              className="text-3xl font-light text-white leading-tight mb-4"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Děkujeme. Objednávka teď čeká na naše schválení.
            </p>
            <p className="text-[#A09C97] text-base leading-relaxed mb-8">
              Zatím nic neplaťte. Do 24 hodin vám zavoláme na číslo{" "}
              <span className="text-[#F0EDE8] whitespace-nowrap">{confirmation.phone}</span>{" "}
              a domluvíme platbu, dopravu a případně doladíme velikost.
              {confirmation.confirmationSent && (
                <> Shrnutí objednávky jsme poslali na {confirmation.email}.</>
              )}
            </p>
            <button type="button" onClick={handleClose} className={secondaryButton}>
              Zpět na web
            </button>
          </div>
        ) : isEmpty ? (
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-[#F0EDE8] text-lg mb-2">Košík je zatím prázdný.</p>
            <p className="text-[#A09C97] text-base leading-relaxed mb-8">
              Vyberte si oblek v kolekci — v detailu zvolte velikost a přidejte ho do košíku.
            </p>
            {lastRemoved && <UndoRemove line={lastRemoved} onUndo={undoRemove} />}
            <button type="button" onClick={browseCollection} className={primaryButton}>
              Prohlédnout kolekci
            </button>
          </div>
        ) : step === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {lastRemoved && <UndoRemove line={lastRemoved} onUndo={undoRemove} />}
              <ul className="divide-y divide-white/8">
                {lines.map((line) => (
                  <CartLineRow key={line.key} line={line} onRemove={() => handleRemove(line)} />
                ))}
              </ul>
              <ApprovalSteps className="mt-6" />
            </div>

            <div className="flex-shrink-0 border-t border-white/8 p-6 flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm tracking-[0.2em] uppercase text-[#A09C97]">Celkem</span>
                <span className="text-xl text-[#F0EDE8]">
                  {totalCzk > 0 ? formatCzk(totalCzk) : "Cena na dotaz"}
                </span>
              </div>
              {hasUnpricedItems && totalCzk > 0 && (
                <p className="-mt-2 text-xs text-[#888580] text-right">
                  + položky s cenou na dotaz, upřesníme po telefonu
                </p>
              )}
              <button type="button" onClick={() => setStep("checkout")} className={primaryButton}>
                Pokračovat k objednávce
              </button>
            </div>
          </>
        ) : null}

        {!isEmpty && step !== "success" && (
          <CheckoutForm
            hidden={step !== "checkout"}
            lines={lines}
            summary={`${withCount(itemCount, SUIT_FORMS)}${totalCzk > 0 ? ` · ${formatCzk(totalCzk)}` : ""}`}
            onBack={() => setStep("cart")}
            onSubmitted={handleSubmitted}
          />
        )}
      </div>
    </div>
  );
}

function CartLineRow({ line, onRemove }: { line: ResolvedCartLine; onRemove: () => void }) {
  const { setQuantity } = useCart();
  const { product } = line;
  const variant = [line.color, `velikost ${line.size}`].filter(Boolean).join(" · ");
  const quantityButton =
    "w-9 h-9 flex items-center justify-center border border-white/15 text-[#F0EDE8] hover:border-[#C8A028] focus-visible:border-[#C8A028] focus-visible:outline-none disabled:opacity-30 disabled:hover:border-white/15 transition-colors duration-200";

  return (
    <li className="flex gap-4 py-5 first:pt-0">
      <div className="relative w-16 h-20 flex-shrink-0 bg-[#0A0A0A] overflow-hidden">
        <Image src={product.heroImage} alt="" fill className="object-cover object-top" sizes="64px" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[#F0EDE8] text-base truncate">{product.name}</p>
          <p className="text-[#F0EDE8] text-sm whitespace-nowrap">
            {product.priceCzk ? formatCzk(product.priceCzk * line.quantity) : "Cena na dotaz"}
          </p>
        </div>
        <p className="text-[#A09C97] text-sm mt-0.5">{variant}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center" role="group" aria-label={`Počet kusů ${product.name}`}>
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity - 1)}
              disabled={line.quantity <= 1}
              className={quantityButton}
              aria-label="Ubrat kus"
            >
              −
            </button>
            <span className="w-9 text-center text-[#F0EDE8] text-sm" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              disabled={line.quantity >= MAX_ITEM_QUANTITY}
              className={quantityButton}
              aria-label="Přidat kus"
            >
              +
            </button>
          </div>
          {line.quantity >= MAX_ITEM_QUANTITY && (
            <span className="text-xs text-[#888580]">Víc kusů po telefonu</span>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-[#888580] hover:text-[#E5847B] focus-visible:text-[#E5847B] focus-visible:outline-none focus-visible:underline transition-colors duration-200"
          >
            Odebrat
          </button>
        </div>
      </div>
    </li>
  );
}

function UndoRemove({ line, onUndo }: { line: ResolvedCartLine; onUndo: () => void }) {
  return (
    <div role="status" className="mb-5 flex items-center justify-between gap-3 border border-white/10 px-4 py-3 text-sm">
      <span className="text-[#A09C97]">
        {line.product.name} ({line.size}) odebrán.
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="text-[#C8A028] hover:underline focus-visible:underline focus-visible:outline-none underline-offset-4"
      >
        Vrátit
      </button>
    </div>
  );
}
