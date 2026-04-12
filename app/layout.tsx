import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

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
  metadataBase: new URL("https://suitsberry.cz"),
  title: "Suitsberry — Prémiové pánské obleky",
  description:
    "Suitsberry je značka prémiových pánských obleků pro muže, kteří chtějí zanechat správný dojem. Osobní přístup, dokonalý střih, elegantní styl.",
  alternates: {
    canonical: "https://suitsberry.cz",
  },
  openGraph: {
    title: "Suitsberry — Prémiové pánské obleky",
    description:
      "Prémiové pánské obleky pro muže, kteří chtějí zanechat správný dojem.",
    type: "website",
    url: "https://suitsberry.cz",
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
      <body className="min-h-full">
        {children}
        <CookieBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Suitsberry",
              url: "https://suitsberry.cz",
              logo: "https://suitsberry.cz/logo.png",
              description:
                "Prémiové pánské obleky pro muže, kteří chtějí zanechat správný dojem.",
              telephone: "+420731152421",
              address: {
                "@type": "PostalAddress",
                addressCountry: "CZ",
              },
              sameAs: [],
            }),
          }}
        />
      </body>
    </html>
  );
}
