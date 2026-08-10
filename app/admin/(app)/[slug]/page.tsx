import Link from "next/link";

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
    console.error("[admin/detail] načtení kolekce selhalo:", error);
    return null;
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const document = await loadDocument();

  if (!document) {
    return (
      <div className="rounded-sm border border-[#E5847B]/40 bg-[#E5847B]/10 px-6 py-10 text-center text-sm leading-relaxed text-[#A09C97]">
        Kolekci se nepodařilo načíst. Zkuste stránku načíst znovu.
      </div>
    );
  }

  const product = document.products.find((item) => item.id === slug);

  if (!product) {
    return (
      <div className="rounded-sm border border-white/10 px-6 py-14 text-center">
        <h1
          className="text-2xl font-light text-[#F0EDE8]"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Tenhle oblek už v kolekci není
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#888580]">
          Nejspíš byl mezitím smazaný nebo se změnil jeho odkaz.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex h-10 items-center rounded-sm border border-[#C8A028] px-5 text-sm text-[#C8A028] transition-colors duration-200 hover:bg-[#C8A028] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028]"
        >
          Zpět na kolekci
        </Link>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      product={product}
      allProducts={document.products}
      updatedAt={document.updatedAt}
    />
  );
}
