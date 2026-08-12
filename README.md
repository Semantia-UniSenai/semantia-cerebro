# 🧠 semantia-cerebro

Biblioteca de **contexto** do projeto **Semantia** — para IAs e humanos.

Aqui mora **tudo** sobre o Semantia: cada pensamento, ideia, decisão, documento,
referência e material de estudo. É a memória de longo prazo do projeto. Antes de
qualquer agente de IA (ou pessoa nova) trabalhar no Semantia, o contexto vem **daqui**.

> **Regra de ouro:** decisão tomada → registrada aqui. Documento recebido → guardado aqui.
> Se não está no cérebro, é como se não tivesse acontecido.

## Comece pelo contrato atual

1. [Contrato canônico do MVP](produto/contrato-mvp-transcricao-tempo-real.md) — propósito,
   público, acesso, retenção, capacidade, prioridades e limites.
2. [Glossário canônico](produto/glossario.md) — sala, anfitrião, comunicador, participante e
   termos que substituem o domínio escolar.
3. [Requisitos, regras e casos de uso](requisitos/mvp-transcricao-tempo-real.md) — cada item
   marcado como implementado, parcial, planejado ou legado.
4. [Arquitetura da sala ao vivo](arquitetura/sala-ao-vivo.md) — fundação existente e migração
   para o contrato atual.
5. [UX acessível da sala ao vivo](produto/ux-sala-ao-vivo.md) — jornadas, estados, microcopy,
   responsividade, WCAG e handoff visual.
6. [Protótipo navegável e validação](prototipos/sala-ao-vivo/README.md) — variantes, cenários,
   evidências e limites de validação humana.
7. [ASR backend CPU-first — operação em VPS](arquitetura/asr-backend-vps.md) — arquitetura
   vigente, filas, privacidade, deploy e benchmark KVM 2/KVM 4.
8. [ADR-002 — captura PCM sem ASR/VAD no frontend](arquitetura/decisoes/ADR-002-captura-pcm-janelas-fixas.md)
   — janelas fixas, controle explícito e final exclusivo no backend.
9. [Captura de fala e transporte — Card 06](arquitetura/captura-fala-transporte-card-06.md)
   — contrato vigente e baseline local-first preservado como evidência histórica.
10. [Transcript canônico — Card 07](arquitetura/transcript-canonico-card-07.md)
    — limpeza conservadora, versionamento, replay de descarte, migration e gates finais.
11. [ADR-003 — transcript canônico versionado](arquitetura/decisoes/ADR-003-transcript-canonico-versionado.md)
    — decisão normativa sobre `pt-br-conservative-v1`, legado e privacidade.
12. [Evidência sanitizada do Card 07](evidencias/card-07/validation-2026-08-10.json).
13. [Evidências runtime do ASR backend](evidencias/card-06/asr-backend-runtime-2026-08-04.json)
   e [benchmark CPU](evidencias/card-06/asr-backend-benchmark-2026-08-04.json).

Documentos de junho em `projeto/` e as seções antigas do histórico continuam preservados como
evidência do TCC, mas **não substituem** os documentos canônicos acima.

## O que é o Semantia

Plataforma web de **comunicação acessível em tempo real** para aproximar pessoas ouvintes
que não sabem Libras e pessoas surdas em escolas, empresas, palestras, eventos e comunidade.
O núcleo é um pipeline de fala → texto → limpeza de disfluências → **adaptação por agente de
IA** → legenda karaokê, com escolha individual entre transcrição literal e adaptada.

A adaptação semântica continua sendo o diferencial, mas o produto não fica mais limitado a
conteúdo educacional ou sala de aula. TCC do curso de Análise e Desenvolvimento de Sistemas,
UNISENAI Joinville (jul–dez/2026), também submetido ao INOVA SENAI.

**Slogan:** _Inclusão não é adaptação, é o padrão._

## Estrutura

```
produto/        Contrato e vocabulário canônicos do produto atual
requisitos/     Requisitos, regras de negócio, casos de uso e rastreabilidade
projeto/        Documentos oficiais e snapshots históricos do TCC/INOVA
referencias/    Material de estudo e artigos científicos de base
identidade/     Logo e infográfico da marca
contexto/       Histórico cronológico de decisões e gotchas
arquitetura/    Fundação implementada e arquitetura-alvo explicitamente separadas
planejamento/   Backlogs, auditorias, planos e divisão de entregas do produto
prototipos/      Contratos visuais navegáveis e evidências de validação
evidencias/      Resultados sanitizados, fixtures e harnesses reproduzíveis
```

## Planejamento atual

- [Backlog do MVP de transcrição em tempo real](planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md).
- [Registro das 18 tasks cadastradas no ClickUp](planejamento/2026-07-29-registro-tasks-clickup-mvp-transcricao.md).
- [Auditoria documental dos 38 cards do Trello descontinuado](planejamento/2026-07-29-auditoria-backlog-legado-trello.md).

## Repositórios do Semantia (org `Semantia-UniSenai`)

- **semantia-web** — front-end da plataforma (Vue 3 + Vite).
- **semantia-api** — backend NestJS, PostgreSQL, REST/Socket.IO e pipeline de transcrição.
- **semantia-cerebro** — este repositório: contexto e memória do projeto.

## Como contribuir com o cérebro

- Markdown (`.md`) para pensamentos, decisões, specs e anotações.
- `.docx` / `.pdf` para documentos formais e referências.
- Imagens em `identidade/` ou junto do material que ilustram.
- Nomes descritivos. Quando registrar uma decisão, diga **o quê**, **por quê** e **quando**.
