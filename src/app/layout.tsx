import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Psicolobia — Beatriz | Psicóloga Clínica Online",
  description:
    "Beatriz (Bea) — Psicóloga Clínica. Especialista no emocional de quem vive da internet. +3500 atendimentos. Terapia online acolhedora, escuta sensível e autoconhecimento.",
  metadataBase: new URL("https://psicolobia.vercel.app"),
  openGraph: {
    title: "Psicolobia — Beatriz | Psicóloga Clínica Online",
    description:
      "Beatriz (Bea) — Especialista no emocional de quem vive da internet. +3500 atendimentos. Terapia online acolhedora e escuta sensível.",
    url: "https://psicolobia.vercel.app",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
