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

export default async function NewProductPage() {
  const document = await loadDocument();

  if (!document) {
    return (
      <div className="rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-6 py-10 text-center text-sm leading-relaxed text-[#A09C97]">
        Kolekci se nepodařilo načíst, takže do ní teď nejde nic přidat. Zkuste
        stránku načíst znovu.
      </div>
    );
  }

  return (
    <ProductForm
      mode="create"
      product={null}
      allProducts={document.products}
      updatedAt={document.updatedAt}
    />
  );
}
