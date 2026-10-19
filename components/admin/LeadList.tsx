"use client";

import { useState } from "react";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { removeLead, saveLead } from "@/lib/admin-client";
import {
  CLOSED_STATUSES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
} from "@/lib/lead-schema";
import { withCount } from "@/lib/plural";

const SEARCH_THRESHOLD = 8;

type Filter = "active" | "all" | LeadStatus;

const dateFormat = new Intl.DateTimeFormat("cs-CZ", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Prague",
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]";

function matchesFilter(lead: Lead, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "active") return !CLOSED_STATUSES.includes(lead.status);
  return lead.status === filter;
}

export default function LeadList({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newCount = leads.filter((lead) => lead.status === "new").length;
  const normalizedQuery = query.trim().toLowerCase();

  const visibleLeads = leads.filter(
    (lead) =>
      matchesFilter(lead, filter) &&
      (!normalizedQuery ||
        [lead.name, lead.phone, lead.email, lead.productName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)),
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "active", label: "Rozpracované" },
    ...LEAD_STATUSES.map((status) => ({
      value: status,
      label: LEAD_STATUS_LABELS[status],
    })),
    { value: "all", label: "Vše" },
  ];

  function replaceLead(updated: Lead) {
    setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)));
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setError(null);
    const result = await removeLead(pendingDelete.id);
    setIsDeleting(false);
    if (result.ok) {
      setLeads((prev) => prev.filter((lead) => lead.id !== pendingDelete.id));
      setPendingDelete(null);
    } else {
      setError(result.error);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div>
        <h1
          className="text-4xl font-light text-[#F0EDE8]"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Poptávky
        </h1>
        <p className="mt-1 text-sm text-[#888580]">
          {leads.length === 0
            ? "Zatím žádná poptávka"
            : withCount(leads.length, ["poptávka", "poptávky", "poptávek"])}
          {newCount > 0 &&
            `, z toho ${withCount(newCount, ["nová", "nové", "nových"])}`}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-4 py-3 text-sm leading-relaxed text-[#E5847B]"
        >
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-lg text-[#F0EDE8]">Zatím tu nic není.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#888580]">
            Jakmile někdo na webu klikne na „Objednat“ u obleku nebo pošle zprávu
            z kontaktního formuláře, objeví se tady a zároveň vám přijde e-mail.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtr podle stavu">
            {filters.map(({ value, label }) => {
              const count = leads.filter((lead) => matchesFilter(lead, value)).length;
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={isActive}
                  className={`h-9 rounded-sm border px-3 text-sm transition-colors duration-200 ${focusRing} ${
                    isActive
                      ? "border-[#C8A028] bg-[#C8A028]/10 text-[#C8A028]"
                      : "border-white/10 text-[#A09C97] hover:border-white/30 hover:text-[#F0EDE8]"
                  }`}
                >
                  {label} <span className="text-[#888580]">{count}</span>
                </button>
              );
            })}
          </div>

          {leads.length > SEARCH_THRESHOLD && (
            <div className="mt-4">
              <label htmlFor="lead-search" className="sr-only">
                Hledat v poptávkách
              </label>
              <input
                id="lead-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hledat podle jména, telefonu nebo obleku…"
                className="h-10 w-full max-w-sm rounded-sm border border-white/10 bg-transparent px-3 text-sm text-[#F0EDE8] placeholder:text-[#666] focus-visible:border-[#C8A028] focus-visible:outline-none"
              />
            </div>
          )}

          {visibleLeads.length === 0 ? (
            <div className="mt-8 rounded-sm border border-dashed border-white/15 px-6 py-10 text-center text-sm text-[#888580]">
              <p>V tomhle filtru nic není.</p>
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
                className={`mt-3 text-[#C8A028] underline-offset-4 hover:underline ${focusRing}`}
              >
                Zobrazit všechny poptávky
              </button>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {visibleLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onSaved={replaceLead}
                  onDelete={() => setPendingDelete(lead)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Smazat poptávku od ${pendingDelete.name}?`}
          body={
            <>
              Kontakt, zpráva i vaše poznámky zmizí natrvalo a nejde je vrátit.
              Upozornění, které vám přišlo e-mailem, ve schránce zůstane. Pokud
              jen nechcete poptávku vidět, nastavte jí raději stav „Dokončeno“
              nebo „Zrušeno“.
            </>
          }
          confirmLabel="Smazat poptávku"
          isBusy={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

type LeadCardProps = {
  lead: Lead;
  onSaved: (lead: Lead) => void;
  onDelete: () => void;
};

function LeadCard({ lead, onSaved, onDelete }: LeadCardProps) {
  const [note, setNote] = useState(lead.internalNote);
  const [busy, setBusy] = useState<"status" | "note" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isNoteDirty = note !== lead.internalNote;
  const details = [
    lead.color && `barva ${lead.color}`,
    lead.size && `velikost ${lead.size}`,
  ].filter(Boolean);

  async function save(status: LeadStatus, internalNote: string, kind: "status" | "note") {
    setBusy(kind);
    setError(null);
    setJustSaved(false);
    const result = await saveLead(lead.id, {
      status,
      internalNote,
      updatedAt: lead.updatedAt,
    });
    setBusy(null);
    if (result.ok) {
      onSaved(result.lead);
      if (kind === "note") setJustSaved(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <li
      className={`rounded-sm border bg-[#111111] p-5 md:p-6 ${
        lead.status === "new" ? "border-[#C8A028]/40" : "border-white/8"
      }`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg text-[#F0EDE8]">{lead.name}</h2>
            <span className="rounded-sm border border-white/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-[#888580]">
              {LEAD_SOURCE_LABELS[lead.source]}
            </span>
            {lead.status === "new" && (
              <span className="rounded-sm bg-[#C8A028] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[#0A0A0A]">
                Nová
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#888580]">
            <time dateTime={lead.createdAt}>{dateFormat.format(new Date(lead.createdAt))}</time>
          </p>

          {lead.productName && (
            <p className="mt-3 text-sm text-[#F0EDE8]">
              <span className="text-[#C8A028]">{lead.productName}</span>
              {details.length > 0 && (
                <span className="text-[#A09C97]"> · {details.join(" · ")}</span>
              )}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {lead.phone && (
              <a
                href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                className={`inline-flex h-10 items-center rounded-sm border border-[#C8A028] px-4 text-sm text-[#C8A028] transition-colors duration-200 hover:bg-[#C8A028] hover:text-[#0A0A0A] ${focusRing}`}
              >
                Zavolat {lead.phone}
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className={`inline-flex h-10 max-w-full items-center truncate rounded-sm border border-white/15 px-4 text-sm text-[#F0EDE8] transition-colors duration-200 hover:border-[#C8A028] hover:text-[#C8A028] ${focusRing}`}
              >
                {lead.email}
              </a>
            )}
          </div>

          {lead.message && (
            <p className="mt-4 whitespace-pre-line border-l border-white/10 pl-4 text-sm leading-relaxed text-[#A09C97]">
              {lead.message}
            </p>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 md:w-72">
          <div>
            <label
              htmlFor={`status-${lead.id}`}
              className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-[#888580]"
            >
              Stav {busy === "status" && <span className="normal-case tracking-normal">· ukládám…</span>}
            </label>
            <select
              id={`status-${lead.id}`}
              value={lead.status}
              disabled={busy !== null}
              onChange={(event) =>
                save(event.target.value as LeadStatus, lead.internalNote, "status")
              }
              className="h-10 w-full rounded-sm border border-white/10 bg-[#141414] px-3 text-sm text-[#F0EDE8] focus-visible:border-[#C8A028] focus-visible:outline-none disabled:opacity-50"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`note-${lead.id}`}
              className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-[#888580]"
            >
              Interní poznámka
            </label>
            <textarea
              id={`note-${lead.id}`}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setJustSaved(false);
              }}
              rows={3}
              placeholder="Domluvená cena, adresa, kdy volat znovu…"
              className="w-full resize-y rounded-sm border border-white/10 bg-transparent px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#666] focus-visible:border-[#C8A028] focus-visible:outline-none"
            />
            {isNoteDirty ? (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => save(lead.status, note, "note")}
                  disabled={busy !== null}
                  className={`h-9 rounded-sm bg-[#C8A028] px-4 text-sm font-medium text-[#0A0A0A] transition-colors duration-200 hover:bg-[#D4AF40] disabled:opacity-50 ${focusRing}`}
                >
                  {busy === "note" ? "Ukládám…" : "Uložit poznámku"}
                </button>
                <button
                  type="button"
                  onClick={() => setNote(lead.internalNote)}
                  disabled={busy !== null}
                  className={`h-9 rounded-sm px-3 text-sm text-[#A09C97] transition-colors duration-200 hover:text-[#F0EDE8] disabled:opacity-50 ${focusRing}`}
                >
                  Zahodit změny
                </button>
              </div>
            ) : (
              justSaved && <p className="mt-2 text-xs text-[#888580]">Poznámka uložena.</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm leading-relaxed text-[#E5847B]">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={busy !== null}
            className={`self-start text-sm text-[#888580] transition-colors duration-200 hover:text-[#E5847B] disabled:opacity-40 ${focusRing}`}
          >
            Smazat poptávku
          </button>
        </div>
      </div>
    </li>
  );
}
