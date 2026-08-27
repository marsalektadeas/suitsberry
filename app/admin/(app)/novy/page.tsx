import ProductForm from "@/components/admin/ProductForm";
import {
  readProductsDocument,
  type ProductsDocument,
} from "@/lib/products-store";

export const dynamic = "force-dynamic";

async function loadDocument(): Promise<ProductsDocument | null> {
  try {
    return await readProductsDocument();
  } catch (error) {
    console.error("[admin/novy] načtení kolekce selhalo:", error);
    return null;
  }
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ copyFrom?: string }>;
}) {
  const document = await loadDocument();
  const { copyFrom: copyFromId } = await searchParams;

  if (!document) {
    return (
      <div className="rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-6 py-10 text-center text-sm leading-relaxed text-[#A09C97]">
        Kolekci se nepodařilo načíst, takže do ní teď nejde nic přidat. Zkuste
        stránku načíst znovu.
      </div>
    );
  }

  // Předloha pro tlačítko „Kopírovat“ v seznamu — neplatné/smazané ID prostě
  // ignorujeme a formulář zůstane prázdný, ať se nic nerozbije.
  const copyFrom = copyFromId
    ? (document.products.find((item) => item.id === copyFromId) ?? null)
    : null;

  return (
    <ProductForm
      mode="create"
      product={null}
      copyFrom={copyFrom}
      allProducts={document.products}
      updatedAt={document.updatedAt}
    />
  );
}
