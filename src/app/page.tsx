import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Journey } from "@/components/landing/Journey";
import { About } from "@/components/landing/About";
import { Services } from "@/components/landing/Services";
import { Scheduling } from "@/components/landing/Scheduling";
import { WaitingRoom } from "@/components/landing/WaitingRoom";
import { Groups } from "@/components/landing/Groups";
import { Testimonials } from "@/components/landing/Testimonials";
import { Blog } from "@/components/landing/Blog";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { Chatbot } from "@/components/landing/Chatbot";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Journey />
        <About />
        <Services />
        <Scheduling />
        <WaitingRoom />
        <Groups />
        <Testimonials />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
      <Chatbot />
    </>
  );
}
