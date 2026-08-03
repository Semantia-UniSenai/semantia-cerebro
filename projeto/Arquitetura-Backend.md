# 🏗️ Arquitetura do Backend — Semantia

> **Status em 2026-07-29:** este documento registra decisões de stack que continuam válidas e a
> evolução implementada até a sala ao vivo. Os nomes `PROFESSOR`, `ALUNO`, turma e aula são
> fundação legada a generalizar. O contrato de produto atual está em
> [`../produto/contrato-mvp-transcricao-tempo-real.md`](../produto/contrato-mvp-transcricao-tempo-real.md);
> o estado exato implementado versus planejado está em
> [`../requisitos/mvp-transcricao-tempo-real.md`](../requisitos/mvp-transcricao-tempo-real.md).

> Decisão tomada em **2026-06-28** (contexto: MVP para apresentação na banca em 29/06).
> Registrada aqui pela regra de ouro do cérebro. Ver também `Desafio-Interdisciplinar-Semantia.md`.

## Decisão de stack

| Camada | Escolha | Por quê |
|---|---|---|
| Backend | **NestJS + TypeScript** (strict) | Familiaridade do Cauê (ZapSuite/Ludus), ecossistema maduro, Swagger nativo p/ orval |
| ORM | **Prisma** | DX, migrations, type-safety |
| Banco | **PostgreSQL** (Neon no deploy, Postgres via docker-compose no dev) | Pedido no Canvas; Neon é serverless free |
| Docs/contrato | **Swagger** (`/docs` + `/docs-json`) | Gera o client **orval** no front |
| Pacotes | **pnpm** | Padrão do Cauê |
| Infra local | **Docker Compose** (Postgres) | `docker` = infra de dev, **não** é o caminho de deploy |
| Git hooks | **Husky** (pre-commit: lint + test) | Qualidade |
| Auth | **JWT + bcryptjs** | Simples, sem build nativo (deploy limpo no Render) |

## Filosofia

**Clean Architecture + Repository Pattern.** Usecases contêm a regra de negócio e dependem de
uma **interface** de repositório (não do Prisma direto). A implementação Prisma fica em
`repositories/`. Controllers são finos: validam DTO → chamam usecase → retornam.

## Estrutura de pastas (canônica)

```
src/
├── database/                 # PrismaService (módulo global)
├── modules/
│   ├── auth/
│   │   ├── dtos/  entities/  repositories/  usecases/
│   │   ├── auth.controller.ts + .spec.ts
│   │   └── auth.module.ts
│   ├── games/                # feature gated (treino datilologia + ranking)
│   │   ├── dtos/  entities/  repositories/  usecases/
│   │   ├── games.controller.ts + .spec.ts
│   │   └── games.module.ts
│   ├── classes/              # turmas (professor cria, aluno entra)
│   ├── sessions/             # sessões ao vivo, transcript, chat (usecases compartilhados REST+socket)
│   └── live/                 # gateway Socket.IO /live (fino, delega pros usecases de sessions)
├── shared/
│   ├── filters/   guards/   decorators/   enums/
└── health/
```

> **Evolução 2026-07-02/04:** sala de aula ao vivo (roles PROFESSOR/ALUNO, turmas, sessões,
> transcript com filtro de disfluências no usecase, chat, fila de mãos) — arquitetura e
> protocolo em [`../arquitetura/sala-ao-vivo.md`](../arquitetura/sala-ao-vivo.md).

## Modelo de dados (futureproof)

- **User**: id, name, email (unique), passwordHash, timestamps.
- **Score**: id, userId, **gameKey** (string), points, accuracy?, durationMs?, createdAt.
  - `gameKey` permite **novos jogos sem mudar schema** — alinha com a visão futura de uma
    seção **"Jogos"** gamificada onde usuários competem.
- **Ranking** = melhor `points` por usuário para um `gameKey`, desc.

## Endpoints (sob `/api`)

- `POST /auth/signup`, `POST /auth/signin`, `GET /auth/me` (guard)
- `POST /games/scores`, `GET /games/scores/me`, `GET /games/ranking?gameKey=` — **todos atrás de JwtAuthGuard** (o login é a trava da feature)
- `GET /health`

## Feature gated escolhida (MVP)

**Treino de datilologia + ranking.** Reaproveita o motor de soletração que já existe no front
(vídeo da letra). Usuário soletra → pontua → score salvo por usuário → ranking geral.
Valor do login é óbvio (sua pontuação/ranking só existem logado) e a banca pode se cadastrar
ao vivo e aparecer no ranking. Visão futura: vira a seção **"Jogos"**.

## Deploy (solução temporária p/ a banca)

- **Front** Vue/Vite → **Vercel**. **API** Nest → **Render** (free). **Banco** → **Neon**.
- Integração front↔back **via orval** (gera client a partir do `/docs-json`).
- Cold start do Render free (~50s após 15min) mitigado com **ping cron-job.org a cada 10min**.

## Fora de escopo p/ a banca (TODOs futuros)

- **MCP na API** (integração nativa com IA) — adiado, não compete com o prazo.
- Visão computacional (MediaPipe/Python) — fase de pesquisa futura.
- Matriz completa de testes (integração+E2E em tudo) — hoje: unit nos usecases + 1 E2E happy-path.
