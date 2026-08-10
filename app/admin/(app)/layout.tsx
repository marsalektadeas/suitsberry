import { redirect } from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { isStorageConfigured } from "@/lib/products-store";

/**
 * Druhá obrana za proxy.ts — kdyby matcher někdy přestal sedět,
 * stránka se stejně nevykreslí bez platné session.
 */
export default async function AdminAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminHeader />

      {!isStorageConfigured() && (
        <div
          role="alert"
          className="border-b border-[#C8A028]/30 bg-[#C8A028]/10 px-6 py-3"
        >
          <p className="mx-auto max-w-5xl text-sm leading-relaxed text-[#E3C766]">
            <strong className="font-medium">Úložiště není připojené.</strong>{" "}
            Vidíte výchozí kolekci a můžete si vše prohlédnout, ale uložení
            zatím neprojde. Ve Vercelu chybí Blob store a proměnná{" "}
            <code>BLOB_READ_WRITE_TOKEN</code>.
          </p>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-14">{children}</main>
    </>
  );
}
