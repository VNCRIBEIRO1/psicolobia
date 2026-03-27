# 🧠 Psicolobia — SaaS para Psicólogos

**Plataforma completa de gestão clínica** para Beatriz (@psicolobiaa), psicóloga clínica especializada no emocional de quem vive da internet.

🔗 **Live:** [psicolobia.vercel.app](https://psicolobia.vercel.app)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS 3 |
| Banco | Neon (serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js 4 (credentials + JWT) |
| Video | Jitsi Meet (meet.jit.si External API) |
| Deploy | Vercel |

## Setup Local

```bash
git clone https://github.com/VNCRIBEIRO1/psicolobia.git
cd psicolobia
npm install
cp .env.local.example .env.local
# Edite com suas credenciais Neon
npm run db:push
npm run db:seed
npm run dev
```

## Variáveis de Ambiente (.env.local)

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_SECRET=sua-chave-secreta
NEXTAUTH_URL=http://localhost:3000
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run db:push` | Push schema |
| `npm run db:seed` | Seed admin |
| `npm run db:studio` | Drizzle Studio |

## Features

- ✅ Landing page (14 seções) com JSON-LD
- ✅ Chatbot inteligente (12 intenções + texto livre)
- ✅ Agendamento + Sala de Espera com Jitsi Meet
- ✅ Admin: Dashboard, Pacientes, Agenda, Financeiro, Prontuários, Blog, Grupos, Config
- ✅ Portal do Paciente: Sessões, Pagamentos, Documentos
- ✅ Blog público SSR (/blog + /blog/[slug])
- ✅ Auth com roles + API protegida
- ✅ Responsivo + Acessível

## Admin Default

- **Email:** admin@psicolobia.com.br / **Senha:** Psicolobia@2026
