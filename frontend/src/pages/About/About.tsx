import Header from '../../components/header';
import Footer from '../../components/footer';
import { AboutHero } from './components/about-hero';
import { OurStory } from './components/our-story';
import { OurTeam } from './components/our-team';
import { OurProcess } from './components/our-process';
import { Testimonials } from './components/testimonials';
import { ContactCta } from './components/contact-cta';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <AboutHero />
        <OurStory />
        <OurTeam />
        <OurProcess />
        <Testimonials />
        <ContactCta />
      </main>
      <Footer />
    </div>
  );
}
