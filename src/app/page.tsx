import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import About from '@/components/landing/About';
import CTA from '@/components/landing/CTA';
import Contact from '@/components/landing/Contact';
import Technology from '@/components/landing/Technology';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Stats />
      <About />
      <Technology />
      <CTA />
      <Contact />
    </main>
  );
}
