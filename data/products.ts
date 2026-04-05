export type ProductColor = {
  name: string
  hex: string
}

export type Product = {
  id: string
  name: string
  hidden?: boolean
  tagline: string
  description: string
  heroImage: string
  images: string[]
  category: string
  occasion: string
  specs: {
    barva: string
    strich: string
    zapinani: string
    vzor: string
    material: string
    velikosti: string
  }
  colors: ProductColor[]
}

export const products: Product[] = [
  {
    id: "domenico",
    name: "Domenico",
    tagline: "Klasika redefinovaná",
    description:
      "Domenico byl stvořen pro velké okamžiky. Čistý minimalistický design ve světlých tónech — z něj dělá ideální volbu pro svatby a slavnostní příležitosti za denního světla.",
    heroImage: "/products/slim-fit/1.jpg",
    images: [
      "/products/slim-fit/1.jpg",
      "/products/slim-fit/2.jpg",
      "/products/slim-fit/3.jpg",
      "/products/slim-fit/4.jpg",
    ],
    category: "Svatební / Formální",
    occasion: "Svatba · Slavnostní",
    specs: {
      barva: "Světle modrá",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Jednobarevný, bez vzoru",
      material: "65% Polyamid, 30% Viskóza, 5% Lycra",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Světle modrá", hex: "#8FAFC5" }],
  },
  {
    id: "claudio",
    name: "Claudio",
    tagline: "Temná elegance",
    description:
      "Claudio je oblek pro muže, kteří neodolávají kompromisům. Espresso hnědá v slim fit střihu akcentuje siluetu bez přehnanosti — ideální pro večerní příležitosti a moderní business prostředí.",
    heroImage: "/products/espresso/2.jpg",
    images: [
      "/products/espresso/2.jpg",
      "/products/espresso/1.jpg",
      "/products/espresso/3.jpg",
      "/products/espresso/4.jpg",
      "/products/espresso/5.jpg",
    ],
    category: "Večerní / Společenský",
    occasion: "Večírek · Business",
    specs: {
      barva: "Espresso hnědá",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Hladký, bez vzoru",
      material: "65% Polyamid, 30% Viskóza, 5% Lycra",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Espresso", hex: "#3D2B1F" }],
  },
  {
    id: "alessandro",
    name: "Alessandro",
    tagline: "Síla v každém detailu",
    description:
      "Alessandro spojuje nadčasový business styl s precizním zpracováním. Tmavý pruhovaný vzor z kvalitní vlny s viskózou dává jasný signál — bez zbytečných slov.",
    heroImage: "/products/stripe-db/1.jpg",
    images: [
      "/products/stripe-db/1.jpg",
      "/products/stripe-db/2.jpg",
      "/products/stripe-db/3.jpg",
      "/products/stripe-db/4.jpg",
      "/products/stripe-db/5.jpg",
      "/products/stripe-db/6.jpg",
    ],
    category: "Business / Formální",
    occasion: "Business · Prezentace",
    specs: {
      barva: "Tmavě modrá s proužkem",
      strich: "Regular Fit",
      zapinani: "Dvouřadý",
      vzor: "Jemný proužek",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Tmavě modrá", hex: "#1E2D4A" }],
  },
  {
    id: "ignacio",
    name: "Ignacio",
    tagline: "Výjimečný dojem",
    description:
      "Ignacio není oblek pro každého. Je pro muže, který hledá originalitu, sebedůvěru a eleganci mimo konvenční volby. Červená barva mluví sama za sebe.",
    heroImage: "/products/red/3.jpg",
    images: [
      "/products/red/3.jpg",
      "/products/red/1.jpg",
      "/products/red/2.jpg",
      "/products/red/4.jpg",
    ],
    category: "Společenský / Premium",
    occasion: "Slavnostní · Premium",
    specs: {
      barva: "Červená",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Hladký",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Červená", hex: "#8B1A1A" }],
  },
  {
    id: "javier",
    name: "Javier",
    tagline: "Odvaha být jiný",
    description:
      "Javier byl stvořen pro muže s charakterem. Smaragdová zelená v slim fit střihu — elegantní, sebevědomý, zapamatovatelný. Styl nad konvencí.",
    heroImage: "/products/green/1.jpg",
    images: [
      "/products/green/1.jpg",
      "/products/green/2.jpg",
      "/products/green/3.jpg",
      "/products/green/4.jpg",
      "/products/green/5.jpg",
      "/products/green/6.jpg",
    ],
    category: "Společenský / Formální",
    occasion: "Svatba · Večírek",
    specs: {
      barva: "Smaragdová zelená",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Hladký",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Smaragdová", hex: "#1F4D3A" }],
  },
  {
    id: "lorenzo",
    name: "Lorenzo",
    tagline: "Síla a jistota",
    description:
      "Lorenzo je klasická volba pro muže, kteří chtějí vyjádřit spolehlivost a profesionalitu. Královská modrá v slim fit střihu — pro business schůzky, prezentace i formální večery.",
    heroImage: "/products/blue/3.jpg",
    images: [
      "/products/blue/3.jpg",
      "/products/blue/1.jpg",
      "/products/blue/2.jpg",
      "/products/blue/4.jpg",
      "/products/blue/5.jpg",
      "/products/blue/6.jpg",
    ],
    category: "Business / Formální",
    occasion: "Business · Formální",
    specs: {
      barva: "Královská modrá",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Hladký",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Královská modrá", hex: "#1A3A6B" }],
  },
  {
    id: "enzo",
    name: "Enzo",
    tagline: "Prémiový výraz",
    description:
      "Enzo přináší teplou eleganci v jedinečné zlatavé karamelové barvě. Klasický slim fit střih z prémiové vlny s viskózou — pro muže, kteří vědí, jak zaujmout.",
    heroImage: "/products/camel/2.jpg",
    images: [
      "/products/camel/2.jpg",
      "/products/camel/1.jpg",
      "/products/camel/3.jpg",
      "/products/camel/4.jpg",
      "/products/camel/5.jpg",
    ],
    category: "Business / Společenský",
    occasion: "Business · Společenský",
    specs: {
      barva: "Karamelová / zlatavá",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Hladký",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Camel", hex: "#B8885A" }],
  },
  {
    id: "pietro",
    name: "Pietro",
    tagline: "Moderní klasik",
    description:
      "Pietro kombinuje tradiční eleganci dvouřadého zapínání s neutrální béžovou barvou. Precizní AMF stehování z prémiové 100% vlny — pro formální příležitosti i denní nošení.",
    heroImage: "/products/beige/3.jpg",
    images: [
      "/products/beige/3.jpg",
      "/products/beige/1.jpg",
      "/products/beige/2.jpg",
      "/products/beige/4.jpg",
    ],
    category: "Formální / Společenský",
    occasion: "Formální · Společenský",
    specs: {
      barva: "Béžová",
      strich: "Regular Fit",
      zapinani: "Dvouřadý",
      vzor: "Hladký, AMF stehování",
      material: "100% Vlna",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Béžová", hex: "#C4AA85" }],
  },
  {
    id: "ricardo",
    name: "Ricardo",
    tagline: "Charakter v každé linii",
    description:
      "Ricardo nabízí rafinovaný proužkový vzor pro muže, kteří chtějí vyniknout v business prostředí. Dvouřadé zapínání s precizními klopami — pro formální přednášky i obchodní večeře.",
    heroImage: "/products/stripe/1.jpg",
    images: [
      "/products/stripe/1.jpg",
      "/products/stripe/2.jpg",
      "/products/stripe/3.jpg",
      "/products/stripe/4.jpg",
    ],
    category: "Business / Formální",
    occasion: "Business · Formální",
    specs: {
      barva: "Tmavá s proužkem",
      strich: "Slim Fit",
      zapinani: "Dvouřadý",
      vzor: "Hrubý proužek",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Antracit", hex: "#2A2A35" }],
  },
  {
    id: "santiago",
    name: "Santiago",
    hidden: true,
    tagline: "Absolutní elegance",
    description:
      "Santiago je oblek pro muže, kteří nepotřebují barvy, aby zaujali. Klasická černá v slim fit střihu — pro business schůzky, galavečery i formální večeře.",
    heroImage: "/products/black/hero.jpg",
    images: [
      "/products/black/hero.jpg",
      "/products/black/alt.jpg",
      "/products/black/santiago-1-orig.jpg",
      "/products/black/santiago-2-orig.jpg",
    ],
    category: "Formální / Večerní",
    occasion: "Gala · Večerní",
    specs: {
      barva: "Černá",
      strich: "Slim Fit",
      zapinani: "Jednořadý",
      vzor: "Hladký",
      material: "100% Vlna, 100% Viskóza",
      velikosti: "46 – 66",
    },
    colors: [{ name: "Černá", hex: "#1A1818" }],
  },
]
