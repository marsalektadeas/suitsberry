import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Suitsberry — Prémiové pánské obleky",
  description:
    "Suitsberry je značka prémiových pánských obleků pro muže, kteří chtějí zanechat správný dojem. Osobní přístup, dokonalý střih, elegantní styl.",
  openGraph: {
    title: "Suitsberry — Prémiové pánské obleky",
    description:
      "Prémiové pánské obleky pro muže, kteří chtějí zanechat správný dojem.",
    type: "website",
    locale: "cs_CZ",
    siteName: "Suitsberry",
  },
  keywords: [
    "pánské obleky",
    "prémiové obleky",
    "slim fit oblek",
    "elegantní oblek",
    "Suitsberry",
    "pánský styl",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${cormorant.className} ${inter.className} h-full antialiased`}
      style={
        {
          "--font-cormorant": cormorant.style.fontFamily,
          "--font-inter": inter.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
