 # Copilot Instructions

## Project shape
- This repository is a static marketing site; nearly all implementation lives in `index.html`.
- Keep changes surgical inside the existing single-file structure unless the user explicitly asks for a refactor or build tooling.
- The page is organized as anchored sections (`#jornada`, `#sobre`, `#servicos`, `#agendamento`, `#sala-espera`, `#grupos`, `#blog`, `#contato`). If you rename a section id, update matching links in the header, mobile menu, and footer.

## Professional identity
- The professional is **Beatriz (Bea)**, a clinical psychologist who brands as **Psicolobia** / **@psicolobiaa**.
- Tagline: "Especialista no emocional de quem vive da internet".
- Key proof point: **+3 500 atendimentos realizados**.
- WhatsApp: `+55 11 98884-0525` → link `https://wa.me/5511988840525`.
- Social: Instagram `@psicolobiaa`, TikTok `@psicolobiaa`, Linktree `linktr.ee/psicolobiaa`.
- CRP number, university, and specific certifications are **not yet confirmed**; placeholders marked `<!-- PREENCHER -->` exist in `index.html` and should be filled when the data is available.

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
- There is no `package.json`, build pipeline, or automated test suite. Do not invent npm commands in changes or documentation.
- For manual verification, open `index.html` in a browser or use a lightweight static server only if the task needs one.
- Prefer preserving the current one-file architecture; only split HTML/CSS/JS into separate files when the user explicitly wants that tradeoff.
- `README.md` is currently minimal, so treat `index.html` as the source of truth for structure, copy, and behavior.

## Commit & deploy — OBRIGATÓRIO após toda alteração
- **Sempre** execute `git add -A && git commit -m "<msg>" && git push origin main` ao final de cada tarefa.
- O Vercel detecta o push em `main` e faz o redeploy automaticamente em `https://psicolobia.vercel.app`.
- Mensagem de commit deve seguir o padrão: `feat|fix|chore|style|content: descrição curta em pt-BR`.
- Nunca encerre uma tarefa sem confirmar que o push foi bem-sucedido.
