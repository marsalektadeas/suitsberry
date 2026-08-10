import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Správa kolekce — Suitsberry",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {children}
    </div>
  );
}
