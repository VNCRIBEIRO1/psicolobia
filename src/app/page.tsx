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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Psicolobia",
  description: "Beatriz (Bea) — Psicóloga Clínica. Especialista no emocional de quem vive da internet. +3500 atendimentos realizados.",
  url: "https://psicolobia.vercel.app",
  telephone: "+5511988840525",
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  priceRange: "$$",
  image: "https://psicolobia.vercel.app/bia.png",
  sameAs: [
    "https://www.instagram.com/psicolobiaa",
    "https://www.tiktok.com/@psicolobiaa",
    "https://linktr.ee/psicolobiaa",
  ],
  founder: {
    "@type": "Person",
    name: "Beatriz",
    jobTitle: "Psicóloga Clínica",
    description: "CRP 06/173961 — UNOESTE. Especialista em Terapia de Aceitação e Compromisso (ACT) e Terapia para Tratamento de Traumas.",
    sameAs: ["https://www.instagram.com/psicolobiaa"],
  },
  areaServed: { "@type": "Country", name: "BR" },
  serviceType: ["Terapia Individual Online", "Ansiedade & Depressão", "Tratamento de Traumas", "Criadores de Conteúdo", "Terapia de Casal", "Grupo Terapêutico"],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
