 # Copilot Instructions

## Project shape
- This is a **Next.js 14 (App Router) SaaS** for psychologists, built with **TypeScript + Tailwind CSS**.
- The original landing page was migrated from a single `index.html` (preserved in `_legacy/`) to `src/app/page.tsx`.
- Architecture: Landing page (public), Admin panel (`/admin`), Patient portal (`/portal`), Blog (`/blog`), Auth (`/login`, `/registro`).
- Database: **Neon** (serverless Postgres) via **Drizzle ORM**.
- Auth: **NextAuth.js** with credentials provider.
- Hosting: **Vercel** (auto-deploy from `main` branch).
- The page sections (`#jornada`, `#sobre`, `#servicos`, `#agendamento`, `#sala-espera`, `#grupos`, `#blog`, `#contato`) are preserved in the landing page component.

## Development workflow — OBRIGATÓRIO
- **Sempre crie tudo via terminal CLI** (npm, npx, etc.).
- **Sempre audite e teste** cada módulo após criação — `npm run build`, `npm run lint`, verificação manual de rotas.
- **Nunca pule testes** — rode `npm run build` antes de cada commit para validar que não há erros.
- **Integração WhatsApp**: NÃO implementar API de WhatsApp (nem oficial Meta Cloud API, nem não-oficial Evolution/Baileys) neste momento. Manter apenas links `wa.me/` estáticos.
- Ao criar novos módulos, siga o padrão existente de organização em `src/app/`, `src/components/`, `src/lib/`, `src/db/`.
- Testes E2E e unitários devem ser escritos para funcionalidades críticas (auth, CRUD pacientes, agendamentos).

## Professional identity
- The professional is **Beatriz (Bea)**, a clinical psychologist who brands as **Psicolobia** / **@psicolobiaa**.
- **CRP 06/173961** — Conselho Regional de Psicologia de São Paulo.
- **Formação**: Universidade do Oeste Paulista — UNOESTE.
- **Certificação**: Transtorno Ansioso e Depressivo — Faculdade Israelita Albert Einstein (ago/2023).
- **Competências**: Terapia de Aceitação e Compromisso (ACT), Terapia para Tratamento de Traumas.
- Tagline: "Especialista no emocional de quem vive da internet".
- Key proof point: **+3.500 atendimentos realizados**.
- WhatsApp: `+55 11 98884-0525` → link `https://wa.me/5511988840525`.
- Social: Instagram `@psicolobiaa`, TikTok `@psicolobiaa`, Linktree `linktr.ee/psicolobiaa`.

### Experiência profissional
1. **Psicóloga Clínica — Autônoma** (ago/2024 – presente): 35 atendimentos semanais, público adulto, remoto (São Paulo). Especialidades: ACT e tratamento de traumas.
2. **Psicóloga Clínica — Privacy** (fev/2022 – ago/2024): 35-40 atendimentos semanais, criadores de conteúdo digital. Colunista semanal de psicologia no blog da empresa.
3. **Psicóloga — CRAS** (ago/2021 – fev/2022): Atenção a vulnerabilidade social, grupos, oficinas, visitas domiciliares, rede intersetorial (Tarabai-SP).
4. **Acompanhante Terapêutica — Colégio APOGEU** (fev/2019 – mai/2021): Inclusão escolar de criança autista (Presidente Prudente-SP).

## Content and design conventions
- The site copy is in pt-BR and uses Beatriz's warm, humanized brand voice ("sem pressa, sem moldes, sem máscaras"). Preserve that tone in headings, CTA labels, chatbot replies, and toast messages. Refer to the professional as "Bea" or "Beatriz" in informal/chatbot contexts and "Psicolobia" for the brand.
- Reuse the design tokens in `:root` and the shared classes like `.btn`, `.section-label`, `.section-title`, and `.reveal` before adding one-off styles.
- Most visual behavior is inline in the same file, including responsive breakpoints at `1024px` and `768px`; check both layouts after structural edits.
- Accessibility/SEO details are already embedded in `index.html`: skip link, `:focus-visible`, reduced-motion handling, print rules, canonical/OG metadata, and JSON-LD. Keep those intact when changing layout or metadata.

## JavaScript patterns
- All interactivity is vanilla JS at the bottom of `index.html`; it manipulates the DOM directly with ids/classes and existing inline `onclick` handlers.
- The scheduling UI is fully client-side. Its state lives in the globals `schedMonth`, `schedYear`, `schedSelDate`, `schedSelSlot`, and `schedSelDateStr`; changes usually need to keep `renderSchedCalendar()`, `renderSchedSlots()`, and `updateSchedSummary()` in sync.
- The waiting-room flow uses `wrSeconds` and `wrInterval` for a 15-minute countdown, then swaps the status and reveals the join button.
- The chatbot behavior is defined by the `botResponses` object. New intents should follow the same `{ msg, opts }` shape and use the existing `showOpts()` / `handleOpt()` flow.
- The contact and scheduling forms are currently mock interactions only: `submitContact()` and `submitScheduling()` show a toast and reset local UI state. There is no backend, `fetch()`, or persistence layer in this repo.

## Assets and external dependencies
- Local images live at the repo root (`bia.png`, `bia2.png`, `d8c8b95a-66b4-4772-9b12-585389398176_IMG-4019.webp`).
- Several cards use remote Unsplash images, and typography comes from Google Fonts.
- `.vercel/` is ignored, and the canonical URL points to `https://psicolobia.vercel.app`; assume static hosting rather than a server-rendered app.

## Working in this repo
- O projeto usa `npm` como gerenciador de pacotes. Comandos principais: `npm run dev`, `npm run build`, `npm run lint`.
- Para verificação local, use `npm run dev` e acesse `http://localhost:3000`.
- Variáveis de ambiente ficam em `.env.local` (nunca commitar). Use `.env.local.example` como referência.
- `README.md` contém instruções de setup e documentação da API.
- `_legacy/index.html` preserva a versão original do site estático para referência.

## Commit & deploy — OBRIGATÓRIO após toda alteração
- **Sempre** execute `git add -A && git commit -m "<msg>" && git push origin main` ao final de cada tarefa.
- O Vercel detecta o push em `main` e faz o redeploy automaticamente em `https://psicolobia.vercel.app`.
- Mensagem de commit deve seguir o padrão: `feat|fix|chore|style|content: descrição curta em pt-BR`.
- Nunca encerre uma tarefa sem confirmar que o push foi bem-sucedido.
