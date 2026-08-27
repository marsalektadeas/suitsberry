"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Product, ProductColor } from "@/data/products";
import { saveProducts } from "@/lib/admin-client";
import { productSchema, slugify } from "@/lib/product-schema";

type ProductFormProps = {
  mode: "create" | "edit";
  /** Editovaný oblek, nebo `null` při zakládání nového. */
  product: Product | null;
  /**
   * Předloha pro předvyplnění nového obleku (jen `mode: "create"`).
   * Vlastní identifikátor se nekopíruje — vygeneruje se z názvu jako obvykle.
   */
  copyFrom?: Product | null;
  /** Celá kolekce — ukládá se najednou a hlídá se z ní jedinečnost identifikátoru. */
  allProducts: Product[];
  updatedAt: string;
};

type Draft = Omit<Product, "id">;

const FORM_ID = "product-form";

const EMPTY_DRAFT: Draft = {
  name: "",
  tagline: "",
  description: "",
  heroImage: "",
  images: [],
  category: "",
  occasion: "",
  specs: {
    barva: "",
    strih: "",
    zapinani: "",
    vzor: "",
    material: "100% Vlna, 100% Viskóza",
    velikosti: "46 – 66",
  },
  colors: [],
  hidden: false,
};

const SPEC_LABELS: Record<keyof Draft["specs"], string> = {
  barva: "Barva",
  strih: "Střih",
  zapinani: "Zapínání",
  vzor: "Vzor",
  material: "Materiál",
  velikosti: "Velikosti",
};

function toDraft(product: Product): Draft {
  return {
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    heroImage: product.heroImage,
    images: product.images,
    category: product.category,
    occasion: product.occasion,
    specs: product.specs,
    colors: product.colors,
    hidden: product.hidden ?? false,
  };
}

/**
 * Předvyplní nový formulář z existujícího obleku. Na rozdíl od `toDraft`
 * dopíše do názvu „(kopie)“ a kopii schová, ať se omylem nezveřejní dřív,
 * než ji autor projde — pořadí, fotky i parametry se přebírají beze změny.
 */
function toCopyDraft(source: Product): Draft {
  return {
    ...toDraft(source),
    name: `${source.name} (kopie)`.slice(0, 80),
    hidden: true,
  };
}

/** Doplní pořadové číslo, pokud identifikátor odvozený z názvu už existuje. */
function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

export default function ProductForm({
  mode,
  product,
  copyFrom,
  allProducts,
  updatedAt,
}: ProductFormProps) {
  const router = useRouter();

  const initialDraft = useMemo(() => {
    if (product) return toDraft(product);
    if (copyFrom) return toCopyDraft(copyFrom);
    return EMPTY_DRAFT;
  }, [product, copyFrom]);

  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pendingLeave, setPendingLeave] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );

  // Záchrana proti zavření karty s rozdělanou prací.
  useEffect(() => {
    if (!isDirty) return;

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSpec(key: keyof Draft["specs"], value: string) {
    setDraft((current) => ({
      ...current,
      specs: { ...current.specs, [key]: value },
    }));
  }

  function updateColor(index: number, patch: Partial<ProductColor>) {
    setDraft((current) => ({
      ...current,
      colors: current.colors.map((color, position) =>
        position === index ? { ...color, ...patch } : color,
      ),
    }));
  }

  function buildProduct(): Product {
    const takenIds = new Set(
      allProducts
        .filter((item) => item.id !== product?.id)
        .map((item) => item.id),
    );

    const id =
      mode === "edit" && product
        ? product.id
        : uniqueId(slugify(draft.name) || "oblek", takenIds);

    return { id, ...draft };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const candidate = buildProduct();
    const parsed = productSchema.safeParse(candidate);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) errors[path] = issue.message;
      }
      setFieldErrors(errors);
      setFormError("Formulář ještě není kompletní — chybějící pole jsou označená.");
      return;
    }

    setIsSaving(true);

    const nextProducts =
      mode === "edit"
        ? allProducts.map((item) =>
            item.id === candidate.id ? candidate : item,
          )
        : [...allProducts, candidate];

    const result = await saveProducts(nextProducts, updatedAt);
    setIsSaving(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  function leave() {
    router.push("/admin");
  }

  function handleBack() {
    if (isDirty) {
      setPendingLeave(true);
      return;
    }
    leave();
  }

  const heading = mode === "create" ? "Nový oblek" : draft.name || "Úprava obleku";

  return (
    <>
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="pb-32"
      >
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[#888580] transition-colors duration-200 hover:text-[#C8A028] focus-visible:outline-none focus-visible:text-[#C8A028] focus-visible:underline"
        >
          ← Zpět na kolekci
        </button>

        <h1
          className="mt-4 text-4xl font-light text-[#F0EDE8]"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          {heading}
        </h1>

        {formError && (
          <div
            role="alert"
            className="mt-6 rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-4 py-3 text-sm leading-relaxed text-[#E5847B]"
          >
            {formError}
          </div>
        )}

        <section className="mt-10 space-y-5">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#888580]">
            Základ
          </h2>

          <Field label="Název" error={fieldErrors.name}>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              maxLength={80}
              className={inputClass(fieldErrors.name)}
              autoFocus={mode === "create"}
            />
          </Field>

          <Field
            label="Podtitulek"
            hint="Krátká věta pod názvem, např. „Klasika redefinovaná“."
            error={fieldErrors.tagline}
          >
            <input
              type="text"
              value={draft.tagline}
              onChange={(event) => update("tagline", event.target.value)}
              maxLength={120}
              className={inputClass(fieldErrors.tagline)}
            />
          </Field>

          <Field
            label="Popis"
            hint="Text v detailu obleku. Komu je určený a na jakou příležitost."
            error={fieldErrors.description}
          >
            <textarea
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              rows={5}
              maxLength={2000}
              className={`${inputClass(fieldErrors.description)} h-auto py-2 leading-relaxed`}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Kategorie"
              hint="Např. „Business / Formální“."
              error={fieldErrors.category}
            >
              <input
                type="text"
                value={draft.category}
                onChange={(event) => update("category", event.target.value)}
                maxLength={80}
                className={inputClass(fieldErrors.category)}
              />
            </Field>

            <Field
              label="Příležitost"
              hint="Např. „Svatba · Slavnostní“."
              error={fieldErrors.occasion}
            >
              <input
                type="text"
                value={draft.occasion}
                onChange={(event) => update("occasion", event.target.value)}
                maxLength={80}
                className={inputClass(fieldErrors.occasion)}
              />
            </Field>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-[#888580]">
            Galerie
          </h2>
          <ImageUploader
            images={draft.images}
            heroImage={draft.heroImage}
            slug={product?.id ?? slugify(draft.name)}
            disabled={isSaving}
            onChange={(images, heroImage) =>
              setDraft((current) => ({ ...current, images, heroImage }))
            }
          />
          {(fieldErrors.images || fieldErrors.heroImage) && (
            <p role="alert" className="mt-2 text-sm text-[#E5847B]">
              {fieldErrors.images ?? fieldErrors.heroImage}
            </p>
          )}
        </section>

        <section className="mt-12 space-y-5">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#888580]">
            Parametry
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {(Object.keys(SPEC_LABELS) as Array<keyof Draft["specs"]>).map(
              (key) => (
                <Field
                  key={key}
                  label={SPEC_LABELS[key]}
                  error={fieldErrors[`specs.${key}`]}
                >
                  <input
                    type="text"
                    value={draft.specs[key]}
                    onChange={(event) => updateSpec(key, event.target.value)}
                    maxLength={200}
                    className={inputClass(fieldErrors[`specs.${key}`])}
                  />
                </Field>
              ),
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#888580]">
            Barevné varianty{" "}
            <span className="normal-case tracking-normal text-[#666]">
              — nepovinné
            </span>
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            Kolečka s barvou v detailu obleku. Bez vyplnění se sekce nezobrazí.
          </p>

          <div className="mt-4 space-y-3">
            {draft.colors.map((color, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-[#888580]">
                    Název barvy
                  </label>
                  <input
                    type="text"
                    value={color.name}
                    onChange={(event) =>
                      updateColor(index, { name: event.target.value })
                    }
                    maxLength={60}
                    className={inputClass(fieldErrors[`colors.${index}.name`])}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#888580]">
                    Odstín
                  </label>
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(event) =>
                      updateColor(index, { hex: event.target.value })
                    }
                    aria-label={`Odstín barvy ${color.name || index + 1}`}
                    className="h-11 w-16 cursor-pointer rounded-sm border border-white/10 bg-transparent p-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "colors",
                      draft.colors.filter((_, position) => position !== index),
                    )
                  }
                  className="h-11 rounded-sm px-3 text-sm text-[#A09C97] transition-colors duration-200 hover:text-[#E5847B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5847B]"
                >
                  Odebrat
                </button>
              </div>
            ))}
          </div>

          {draft.colors.length < 6 && (
            <button
              type="button"
              onClick={() =>
                update("colors", [...draft.colors, { name: "", hex: "#C8A028" }])
              }
              className="mt-3 h-10 rounded-sm border border-white/15 px-4 text-sm text-[#F0EDE8] transition-colors duration-200 hover:border-[#C8A028] hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028]"
            >
              Přidat barvu
            </button>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#888580]">
            Viditelnost
          </h2>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={draft.hidden ?? false}
              onChange={(event) => update("hidden", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028]"
            />
            <span className="text-sm leading-relaxed text-[#A09C97]">
              Skrýt na webu
              <span className="block text-xs text-[#666]">
                Oblek zůstane uložený, ale návštěvníci ho v kolekci neuvidí.
              </span>
            </span>
          </label>
        </section>
      </form>

      {/* Ukládací lišta mimo scroll — akce jsou vždy po ruce. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#666]" aria-live="polite">
            {isDirty ? "Máte neuložené změny." : "Vše je uložené."}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDraft(initialDraft)}
              disabled={!isDirty || isSaving}
              className="h-11 rounded-sm border border-white/15 px-5 text-sm text-[#F0EDE8] transition-colors duration-200 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:opacity-40"
            >
              Zahodit změny
            </button>
            {/* Lišta stojí mimo <form>, `form` atribut je propojuje. */}
            <button
              type="submit"
              form={FORM_ID}
              disabled={isSaving}
              className="h-11 rounded-sm bg-[#C8A028] px-6 text-sm font-medium uppercase tracking-[0.15em] text-[#0A0A0A] transition-colors duration-200 hover:bg-[#D4AF40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:opacity-40"
            >
              {isSaving
                ? "Ukládám…"
                : mode === "create"
                  ? "Přidat do kolekce"
                  : "Uložit změny"}
            </button>
          </div>
        </div>
      </div>

      {pendingLeave && (
        <ConfirmDialog
          title="Odejít bez uložení?"
          body={
            <p>
              Rozepsané změny se ztratí. Uložený oblek na webu zůstane tak, jak
              je teď.
            </p>
          }
          confirmLabel="Zahodit a odejít"
          cancelLabel="Zůstat a dopsat"
          onConfirm={leave}
          onCancel={() => setPendingLeave(false)}
        />
      )}
    </>
  );
}

function inputClass(error?: string): string {
  return `h-11 w-full rounded-sm border bg-transparent px-3 text-sm text-[#F0EDE8] transition-colors duration-200 placeholder:text-[#666] focus-visible:outline-none ${
    error
      ? "border-[#E5847B] focus-visible:border-[#E5847B]"
      : "border-white/10 focus-visible:border-[#C8A028]"
  }`;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-[#F0EDE8]">{label}</span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-[#666]">{hint}</span>
      )}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-[#E5847B]">
          {error}
        </span>
      )}
    </label>
  );
}
