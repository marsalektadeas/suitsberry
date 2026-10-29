import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Collection from "@/components/Collection";
import WhySuitsberry from "@/components/WhySuitsberry";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CtaBlock from "@/components/CtaBlock";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CartProvider from "@/components/cart/CartProvider";
import { getVisibleProducts } from "@/lib/products-store";

export default async function Home() {
  const products = await getVisibleProducts();

  return (
    <CartProvider products={products}>
      <Header />
      <main>
        <Hero />
        <About />
        <Collection products={products} />
        <WhySuitsberry />
        <HowItWorks />
        <Testimonials />
        <CtaBlock />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </CartProvider>
  );
}
