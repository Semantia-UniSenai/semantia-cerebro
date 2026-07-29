# 🎓 Sala de Aula ao Vivo — arquitetura e protocolo

> Feature principal do MVP pós-banca, construída em **2026-07-02** (full-stack) e refinada até
> **2026-07-04**. Ver decisões em `../contexto/historico-e-decisoes.md` e a base do backend em
> `../projeto/Arquitetura-Backend.md`.

> **Status de produto (2026-07-29):** este documento descreve fielmente a fundação implementada,
> mas o enquadramento restrito a professor/aluno/turma foi substituído por salas genéricas de
> comunicação acessível. A migração e o backlog atual estão em
> [`../planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md`](../planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md).

## O que é

O professor abre uma **sessão ao vivo** de uma turma e fala normalmente; a fala vira **legenda
em tempo real** na tela de cada aluno (surdo ou não). Alunos entram por **join token**, têm
chat e **fila de mãos levantadas**. Tudo persiste (transcript e chat sobrevivem à sessão).

## Modelo de dados (Prisma)

- `User.role` (`Role`: `PROFESSOR` | `ALUNO`) — eixo de permissão.
- `SchoolClass` + `ClassMember` — turmas e vínculo aluno↔turma.
- `LiveSession` — sessão de aula: `joinToken` (unique), `status` (`SessionStatus`: `LIVE` |
  `ENDED`), dona = professor da turma.
- `TranscriptSegment` — frase final persistida com `seq` incremental por sessão.
- `ChatMessage` — chat da sala.

## Fluxo da transcrição

```
Professor (browser)                    API                          Alunos
Web Speech API ─ parcial ──▶ transcript:partial ──▶ broadcast ─▶ legenda cinza (literal)
   (throttle 150ms no front)          (não persiste)
Web Speech API ─ final ────▶ transcript:final ────▶ usecase ──▶ broadcast + persistência
                                       │  stripDisfluencies()
                                       │  100% ruído → null (nada emite/persiste)
```

- **STT no browser do professor** (Web Speech API) — sem custo de servidor no MVP.
  Gotcha real: **Brave** falha com `network` consecutivo → front trata como fatal e avisa o
  professor (fix 2026-07-02, `7f43c22`).
- **Parciais são efêmeras e literais** (é o "ao vivo cru"); só a **final** vira segmento.

## Gateway Socket.IO (`/live`) — fino de propósito

Autentica o JWT no handshake, mantém presença (`LiveRoomStateService`) e **delega toda decisão
de negócio aos usecases** — os mesmos da REST. Todo evento cliente→servidor é ackado com
`{ ok: true, ... }` ou `{ ok: false, error: { code, message } }`.

Eventos: `session:join/leave/end`, `transcript:partial/final`, `chat:send`,
`hand:raise/lower`. Broadcast por room `session:<id>`.

## Adaptação semântica em camadas (decisão 2026-07-04)

O "motor semântico" do TCC vira um **pipeline em camadas no backend**:

1. **Camada 1 — regex de disfluências** (`src/modules/sessions/usecases/disfluencies.ts`,
   FEITA): remove vícios de fala ("ééé", "né", "tipo assim"), gagueira/repetição e pontuação
   órfã. Conservadora: palavras ambíguas ("tipo", "então") ficam. Aplicada **dentro do
   `AppendTranscriptSegmentUseCase`** (depois das validações de acesso, antes do append).
   Frase 100% ruído → usecase retorna `null`, gateway acka `{ ok: true, seq: null }` **sem
   broadcast**. Gotcha de regex: `\b` do JS é ASCII → limites de palavra com lookarounds
   unicode (`(?<!\p{L})…(?!\p{L})`, flag `u`).
2. **Camada 2 — LLM rápido** (Haiku/Gemini Flash, A FAZER): reescreve a frase final adaptada
   (sinônimos mais simples, estrutura mais direta) e emite `transcript:adapted`, que substitui
   a frase na UI ~1s depois. Toggle literal/adaptado na tela do aluno. **ML próprio foi
   descartado**: não há corpus PT→PT-adaptado-pra-surdos e não cabe no prazo do TCC — vira
   trabalho futuro no artigo; o prompt engineering da camada 2 É a seção de metodologia.

**Regra de arquitetura (correção do Cauê, 2026-07-04):** as duas camadas moram **no backend** —
regra de negócio nunca no cliente (cliente alternativo publicaria texto sujo; o texto canônico
não pode depender do front). No front fica só **apresentação**: quebra em linhas de ≤7 palavras
(`captionLines.ts`) e o palco karaokê (`CaptionStage.vue`).

## UI do aluno — legendas karaokê (2026-07-04)

- Frases finais viram **linhas curtas (≤7 palavras) balanceadas** (9 palavras → 5+4, nunca 7+2).
- Linha corrente em destaque, anteriores esmaecem; entrada deslizando de baixo.
- **Scroll livre pra reler**: rolar pra cima solta o auto-scroll e mostra "↓ Voltar ao vivo".
- A−/A+ persistido em localStorage, `aria-live="polite"`, respeita `prefers-reduced-motion`.

## Estado dos testes (2026-07-04)

- API: **138 unit (jest)** — inclui specs do filtro, do `null` no usecase e no gateway.
- Front: **91 (vitest)** — inclui captionLines, CaptionStage (scroll/pin) e useLiveSession.
