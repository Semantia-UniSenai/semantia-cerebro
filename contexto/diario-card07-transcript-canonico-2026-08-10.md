---
title: Diário do Card 07 — transcript canônico
status: em-revisao
data: 2026-08-10
clickup: 86e2j4w4k
---

# Diário do Card 07 — 2026-08-10

## Objetivo executado

Consolidar a limpeza de disfluências como contrato canônico conservador, rastreável e versionado, sem
alterar o pipeline PCM/ASR do Card 06 e sem persistir texto bruto ou áudio.

## Branches

- API: `fix/pipeline-disfluencias`, base `origin/dev` em `8c1ba54`;
- web: `chore/card07-sync-transcript-contract`, base `origin/dev` em `6dfd4e4`;
- cérebro: `docs/card07-transcript-canonico`, base `origin/main`.

## Commits antes da publicação

### API

- `7ddd875` — alinha regressão do gateway ao transporte PCM;
- `7f86b58` — consolida limpeza canônica versionada;
- `a4d6b35` — persiste e propaga versão;
- `9f40b0b` — limita replay e corrige marcadores empilhados;
- `b65b9af` — cobre contrato em E2E e benchmark;
- `07ab0d7` — corrige vulnerabilidade transitiva de `js-yaml`.

### Web

- `90420fd` — sincroniza contrato canônico;
- `12a436b` — remove drift Orval fora do Card 07.

## Revisão final

A revisão foi feita em duas passadas: primeiro especificação, semântica, idempotência, concorrência e
lifecycle; depois scan adversarial do diff final. Achados corrigidos:

1. sequência de marcadores no início parava após uma remoção;
2. cache no-speech expirava, mas não limitava cardinalidade;
3. teste de ausência de broadcast usava espera fixa de 100 ms;
4. geração Orval trouxe contrato `audienceContext` fora do escopo;
5. audit de produção detectou `CVE-2026-59870` em `js-yaml` transitivo.

As correções foram acompanhadas por RED/GREEN quando comportamentais. A evicção do cache remove no
máximo uma entrada por inserção; a limpeza de marcadores empilhados usa uma passagem de regex, sem loop.
Scans não localizaram segredo, rede nova, áudio/PCM persistido, log de conteúdo, `eval` ou loop infinito.

## Evidência dos gates

- API: 21 suítes e 120/120 unitários sem cache;
- E2E real com PostgreSQL e Socket.IO: 1/1;
- web: 18 arquivos e 94/94 testes, typecheck e build;
- ASR: 15/15 e Ruff;
- Prisma validate e build API;
- audit de produção API/web sem vulnerabilidade conhecida após o override `js-yaml 4.3.1`;
- migration fresh e N−1 comprovada com fixture sintética e teardown dos bancos scratch;
- benchmark p95: 0,002458 ms normal, 0,065897 ms em remoção de 5.000 caracteres e 0,049767 ms em
  preservação de 5.000 caracteres, todos abaixo de 1 ms;
- `git diff --check` aprovado.

## Privacidade

- nenhum áudio, PCM ou texto bruto foi versionado;
- corpus automatizado é sintético;
- não havia corpus real anonimizado e autorizado, portanto a revisão humana com amostra real não foi
  executada;
- o resultado dessa validação deve ocorrer nos Cards 11/17 ou antes de ampliar a heurística.

## Estado operacional

A API temporária usada para gerar OpenAPI na porta 3103 foi encerrada e a porta confirmada livre. O
Card 07 deve permanecer `EM REVISÃO` enquanto os PRs estiverem abertos; nenhum merge automático foi
autorizado.

## Documentos gerados

- [`../arquitetura/transcript-canonico-card-07.md`](../arquitetura/transcript-canonico-card-07.md);
- [`../arquitetura/decisoes/ADR-003-transcript-canonico-versionado.md`](../arquitetura/decisoes/ADR-003-transcript-canonico-versionado.md);
- [`../evidencias/card-07/validation-2026-08-10.json`](../evidencias/card-07/validation-2026-08-10.json).
