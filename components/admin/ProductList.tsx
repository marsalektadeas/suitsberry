"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Product } from "@/data/products";
import { saveProducts } from "@/lib/admin-client";
import { withCount } from "@/lib/plural";

const FILTER_THRESHOLD = 8;

type ProductListProps = {
  initialProducts: Product[];
  initialUpdatedAt: string;
};

export default function ProductList({
  initialProducts,
  initialUpdatedAt,
}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const showFilter = products.length > FILTER_THRESHOLD;
  const isFiltering = query.trim().length > 0;

  const visibleRows = isFiltering
    ? products.filter((product) =>
        `${product.name} ${product.tagline} ${product.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : products;

  const hiddenCount = products.filter((product) => product.hidden).length;

  async function persist(next: Product[], busy: string) {
    setBusyId(busy);
    setError(null);

    const result = await saveProducts(next, updatedAt);
    if (result.ok) {
      setProducts(next);
      setUpdatedAt(result.updatedAt);
    } else {
      setError(result.error);
    }

    setBusyId(null);
    return result.ok;
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;

    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    void persist(next, products[index].id);
  }

  function toggleHidden(product: Product) {
    const next = products.map((item) =>
      item.id === product.id ? { ...item, hidden: !item.hidden } : item,
    );
    void persist(next, product.id);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    const next = products.filter((item) => item.id !== pendingDelete.id);
    if (await persist(next, pendingDelete.id)) {
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-4xl font-light text-[#F0EDE8]"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Kolekce
          </h1>
          <p className="mt-1 text-sm text-[#888580]">
            {products.length === 0
              ? "Zatím žádný oblek"
              : withCount(products.length, ["oblek", "obleky", "obleků"])}
            {hiddenCount > 0 &&
              `, z toho ${withCount(hiddenCount, ["skrytý", "skryté", "skrytých"])}`}
          </p>
        </div>

        <Link
          href="/admin/novy"
          className="inline-flex h-11 items-center justify-center rounded-sm bg-[#C8A028] px-6 text-sm font-medium uppercase tracking-[0.15em] text-[#0A0A0A] transition-colors duration-200 hover:bg-[#D4AF40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
        >
          Přidat oblek
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-4 py-3 text-sm leading-relaxed text-[#E5847B]"
        >
          {error}
        </div>
      )}

      {showFilter && (
        <div className="mt-8">
          <label htmlFor="filter" className="sr-only">
            Hledat v kolekci
          </label>
          <input
            id="filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hledat podle názvu nebo kategorie…"
            className="h-10 w-full max-w-sm rounded-sm border border-white/10 bg-transparent px-3 text-sm text-[#F0EDE8] placeholder:text-[#666] focus-visible:border-[#C8A028] focus-visible:outline-none"
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-lg text-[#F0EDE8]">V kolekci zatím není žádný oblek.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#888580]">
            Návštěvníkům se místo kolekce ukazuje výzva ke kontaktu. Přidejte
            první oblek a sekce se objeví.
          </p>
          <Link
            href="/admin/novy"
            className="mt-6 inline-flex h-10 items-center rounded-sm border border-[#C8A028] px-5 text-sm text-[#C8A028] transition-colors duration-200 hover:bg-[#C8A028] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
          >
            Přidat první oblek
          </Link>
        </div>
      ) : visibleRows.length === 0 ? (
        <p className="mt-10 rounded-sm border border-dashed border-white/15 px-6 py-10 text-center text-sm text-[#888580]">
          Hledání „{query}&ldquo; nic nenašlo. Zkuste jiný výraz nebo{" "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-[#C8A028] underline underline-offset-4 focus-visible:outline-none"
          >
            zrušte filtr
          </button>
          .
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-white/8 border-y border-white/8">
          {visibleRows.map((product) => {
            const index = products.indexOf(product);
            const isBusy = busyId === product.id;
            const isAnyBusy = busyId !== null;

            return (
              <li
                key={product.id}
                className={`flex flex-col gap-4 py-4 sm:flex-row sm:items-center ${isBusy ? "opacity-60" : ""}`}
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-[#1C1C1C]">
                  <Image
                    src={product.heroImage}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg text-[#F0EDE8]">{product.name}</span>
                    {product.hidden && (
                      <span className="rounded-sm border border-white/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-[#888580]">
                        Skrytý
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-[#888580]">
                    {product.tagline} · {product.category}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={isAnyBusy || isFiltering || index === 0}
                    title={
                      isFiltering
                        ? "Pořadí jde měnit jen bez zapnutého filtru."
                        : "Posunout výš v kolekci"
                    }
                    aria-label={`Posunout ${product.name} výš`}
                    className="flex h-9 w-9 items-center justify-center rounded-sm text-[#A09C97] transition-colors duration-200 hover:bg-white/5 hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] disabled:pointer-events-none disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={
                      isAnyBusy || isFiltering || index === products.length - 1
                    }
                    title={
                      isFiltering
                        ? "Pořadí jde měnit jen bez zapnutého filtru."
                        : "Posunout níž v kolekci"
                    }
                    aria-label={`Posunout ${product.name} níž`}
                    className="flex h-9 w-9 items-center justify-center rounded-sm text-[#A09C97] transition-colors duration-200 hover:bg-white/5 hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] disabled:pointer-events-none disabled:opacity-25"
                  >
                    ↓
                  </button>

                  <Link
                    href={`/admin/${product.id}`}
                    className="ml-2 flex h-9 items-center rounded-sm border border-white/15 px-3 text-sm text-[#F0EDE8] transition-colors duration-200 hover:border-[#C8A028] hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028]"
                  >
                    Upravit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleHidden(product)}
                    disabled={isAnyBusy}
                    className="flex h-9 items-center rounded-sm px-3 text-sm text-[#A09C97] transition-colors duration-200 hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] disabled:opacity-40"
                  >
                    {product.hidden ? "Zobrazit" : "Skrýt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(product)}
                    disabled={isAnyBusy}
                    className="flex h-9 items-center rounded-sm px-3 text-sm text-[#A09C97] transition-colors duration-200 hover:text-[#E5847B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5847B] disabled:opacity-40"
                  >
                    Smazat
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {products.length > 0 && (
        <p className="mt-6 text-xs leading-relaxed text-[#666]">
          Pořadí v seznamu určuje pořadí v kolekci na webu. Skryté obleky
          zůstávají uložené, jen se nezobrazují návštěvníkům.
        </p>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Smazat oblek ${pendingDelete.name}?`}
          body={
            <>
              <p>
                Zmizí z webu i z tohoto seznamu a text ani nastavení už nepůjde
                vrátit.
              </p>
              <p>
                Nahrané fotky zůstanou v úložišti — smazání obleku je nemaže.
              </p>
              <p className="text-[#F0EDE8]">
                Pokud ho chcete jen dočasně stáhnout z webu, zavřete tohle okno a
                zvolte <strong>Skrýt</strong>.
              </p>
            </>
          }
          confirmLabel="Smazat oblek"
          isBusy={busyId === pendingDelete.id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
