"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  title: string;
  /** Co se stane a co se neztratí — konkrétně, ne „opravdu?". */
  body: React.ReactNode;
  /** Popisuje akci, ne „OK" — uživatel musí vědět, co tlačítko udělá. */
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = "Zpět",
  tone = "danger",
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Výchozí fokus na bezpečné tlačítko — Enter omylem nic nesmaže.
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-sm border border-white/10 bg-[#141414] p-6 shadow-2xl"
      >
        <h2
          id="confirm-title"
          className="text-2xl font-light text-[#F0EDE8]"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          {title}
        </h2>

        <div className="mt-3 space-y-2 text-sm leading-relaxed text-[#A09C97]">
          {body}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="h-10 rounded-sm border border-white/15 px-5 text-sm text-[#F0EDE8] transition-colors duration-200 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={`h-10 rounded-sm px-5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:opacity-50 ${
              tone === "danger"
                ? "bg-[#8B1A1A] text-[#F5E9E7] hover:bg-[#A32020] focus-visible:ring-[#E5847B]"
                : "bg-[#C8A028] text-[#0A0A0A] hover:bg-[#D4AF40] focus-visible:ring-[#C8A028]"
            }`}
          >
            {isBusy ? "Pracuji…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
