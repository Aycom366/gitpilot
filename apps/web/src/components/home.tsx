import { CTA } from "./home/cta";
import { Features } from "./home/features";
import { Footer } from "./home/footer";
import { Hero } from "./home/hero";
import { HowItWorks } from "./home/how-it-works";
import { Navbar } from "./home/navbar";
import { Pricing } from "./home/pricing";

export function Home() {
  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
