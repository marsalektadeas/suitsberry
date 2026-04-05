import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Collection from "@/components/Collection";
import WhySuitsberry from "@/components/WhySuitsberry";
import HowItWorks from "@/components/HowItWorks";
import CtaBlock from "@/components/CtaBlock";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Collection />
        <WhySuitsberry />
        <HowItWorks />
        <CtaBlock />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
