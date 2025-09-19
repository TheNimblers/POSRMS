import NavBar from "@/components/landing/NavBar";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import ProductShowcase from "@/components/landing/ProductShowcase";
import Gallery from "@/components/landing/Gallery";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-400/20 blur-3xl" />
      </div>

      <NavBar />
      <Hero />
      <Benefits />
      <ProductShowcase />
      <Gallery />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}
