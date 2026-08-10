import ProductList from "@/components/admin/ProductList";
import {
  readProductsDocument,
  type ProductsDocument,
} from "@/lib/products-store";

// Admin musí vidět skutečný stav úložiště, ne obsah cache.
export const dynamic = "force-dynamic";

async function loadDocument(): Promise<ProductsDocument | null> {
  try {
    return await readProductsDocument();
  } catch (error) {
    console.error("[admin] načtení produktů selhalo:", error);
    return null;
  }
}

export default async function AdminProductsPage() {
  const document = await loadDocument();

  if (!document) {
    return (
      <div className="rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-6 py-10 text-center">
        <h1 className="text-2xl font-light text-[#F0EDE8]">
          Kolekci se nepodařilo načíst
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#A09C97]">
          Úložiště neodpovědělo. Web zatím návštěvníkům ukazuje poslední známou
          verzi kolekce, takže se nic nerozbilo. Zkuste stránku načíst znovu.
        </p>
      </div>
    );
  }

  return (
    <ProductList
      initialProducts={document.products}
      initialUpdatedAt={document.updatedAt}
    />
  );
}
