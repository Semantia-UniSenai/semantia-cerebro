---
title: Diário do Card 08 — agente de adaptação
status: em-execucao
data: 2026-08-10
clickup: 86e2j4w7h
---

# Diário do Card 08 — 2026-08-10

## Início autorizado

Foyth aprovou a execução do plano do agente de adaptação com Groq temporária e arquitetura preparada
para troca de provedor.

## Branches empilhadas

- API: `feat/agente-adaptacao-transcricao`, base `fix/pipeline-disfluencias` em `07ab0d7`;
- web: `feat/transcript-adaptado`, base `chore/card07-sync-transcript-contract` em `12a436b`;
- cérebro: `docs/card08-agente-adaptacao`, base `docs/card07-transcript-canonico` em `6deeffd`.

Os PRs do Card 07 permaneciam abertos, mergeáveis e sem checks remotos. O Card 08 não pode ser integrado
antes deles.

## Baseline

- API `pnpm install --frozen-lockfile`: aprovado;
- API Prisma generate: aprovado;
- API unitários: 21 suítes, 120/120;
- API build: aprovado;
- API audit de produção: sem vulnerabilidade conhecida;
- API lint check-only: dois erros preexistentes do head do Card 07, um type assertion desnecessário e um
  formato Prettier; serão corrigidos isoladamente;
- web install: aprovado;
- web: 18 arquivos, 94/94 testes;
- web build: aprovado;
- web audit de produção: sem vulnerabilidade conhecida;
- web não possui script `lint` nesta branch.

## Infraestrutura scratch

Foi criado o banco local descartável `semantia_card08_test` no Postgres preservado
`semantia-card06-postgres-1`, exposto somente em `127.0.0.1:55435`. Nenhum container ou banco de outro
projeto foi interrompido.

O script `pnpm db:migrate` usa `prisma migrate dev` e abriu prompt para nomear migration depois de aplicar
as seis migrations existentes. A execução foi encerrada sem gerar arquivo. O gate foi corrigido para
`prisma migrate deploy`, não interativo.

## Próximo slice

1. concluir baseline E2E;
2. restaurar lint check-only;
3. RED/GREEN para `audienceContextVersion` e atualização em `LIVE`;
4. validar migration fresh e N-1 antes do provider.

Nenhuma chave Groq foi lida, persistida ou publicada. Dados reais não serão enviados durante o
desenvolvimento inicial.

## Slice 1 — contexto versionado

### RED

- o teste unitário que passou a exigir atualização em `LIVE` falhou com
  `Context cannot be changed after the session has started`;
- o teste de repositório falhou porque o update Prisma não enviava `audienceContextVersion: { increment: 1 }`;
- o E2E falhou com `P2022` porque a coluna ainda não existia no banco scratch;
- mutação controlada trocando incremento por atribuição fixa fez o E2E concorrente retornar `[1,1]`
  em vez de `[2,3]`.

### GREEN

- contexto pode ser atualizado pelo host em `PREPARING` e `LIVE`; `ENDED` continua rejeitado;
- `audienceContextVersion` inicia em zero e é incrementado atomicamente junto do JSON;
- DTO, entidade, repositório, snapshot e E2E carregam a versão;
- duas atualizações concorrentes reais retornaram versões distintas `2` e `3`;
- unitários: 22 suítes, 121/121;
- E2E real PostgreSQL/Socket.IO: 1/1;
- build, Prisma validate e ESLint check-only aprovados.

### Migration

- fresh: sete migrations aplicadas; coluna `NOT NULL DEFAULT 0`;
- uma primeira tentativa chamada N-1 foi descartada porque o Prisma resolveu as sete migrations pelo
  cwd novo, apesar do `--schema` antigo;
- N-1 válido: banco separado criado pela worktree Card 07 com exatamente seis migrations, coluna ausente,
  fixture sintética inserida, migration candidata aplicada isoladamente;
- resultado N-1: mesmo `id`, mesmo JSON e versão `0`.

### Privacidade e escopo

A fixture usa conteúdo sintético e domínio `.invalid`. Nenhum serviço de outro projeto foi interrompido e
nenhum provider externo foi chamado.

## Slice 2 — persistência separada da adaptação

### RED

- a suíte começou falhando por inexistência da entidade e do repositório de adaptação;
- o contrato de teste exigiu `upsert` idempotente, transição terminal condicionada a `PENDING` e recuperação
  explícita de pendências interrompidas.

### GREEN

- entidade e repositório de domínio não dependem de Groq;
- `TranscriptAdaptation` é one-to-one com `TranscriptSegment` e não altera o literal;
- estados: `PENDING`, `SUCCEEDED`, `FALLBACK` e `BYPASSED`;
- motivos auditáveis incluem disabled, misconfigured, no-context, high-risk, queue-full, circuit-open,
  timeout, rate-limit, capacity, provider-error, invalid-response, preservation-failed e process-interrupted;
- update terminal usa guarda `status = PENDING`, preservando idempotência;
- recuperação de restart transforma pendências antigas em fallback explícito, sem reinferência.

### Migration

- N-1 real começou com sete migrations e um segmento literal sintético existente;
- após a migration, o literal, `seq` e `cleaningStrategyVersion` permaneceram intactos e a nova tabela vazia;
- banco vazio recebeu oito migrations e confirmou PK, unique one-to-one, índice `(status, createdAt)` e FK;
- a FK usa cascade apenas da exclusão do segmento para o derivado; o derivado nunca substitui o canônico.

### Gates

- unitários: 23 suítes, 124/124;
- build, Prisma validate, `git diff --check` e ESLint check-only aprovados;
- nenhuma API externa foi chamada.

## Slice 3 — contrato, prompt, fake e guardas semânticas

### RED

- schema começou ausente e os testes exigiram objeto estrito, enums fechados e limite de 5.000 caracteres;
- prompt começou ausente e os testes exigiram byte-estabilidade, isolamento de prompt injection e minimização;
- providers offline começaram ausentes e os testes exigiram modos determinísticos e timeout abortável;
- três suítes de preservação começaram ausentes e cobriram invariantes, modalidade, negação e alto risco.

### GREEN

- `zod` é dependência runtime e valida saída estrita `{ adaptedText, decision, risk }`;
- JSON Schema correspondente usa `additionalProperties: false` e três campos obrigatórios;
- prompt `pt-br-accessible-v1` põe instruções estáticas antes do JSON não confiável e não recebe IDs,
  tokens, histórico, áudio ou timestamp;
- fake suporta `success`, `timeout`, `error` e `invalid-response`, conta chamadas e não usa rede;
- disabled falha localmente com código explícito;
- extração preserva multiconjuntos de dinheiro, percentual, data, horário, unidade, telefone, URL, e-mail,
  identificador, nome capitalizado, sigla, termo citado, negação, modalidade e números;
- validator aceita mudança de pontuação/segmentação, mas rejeita alteração ou item protegido novo;
- `decision=literal` exige igualdade byte a byte;
- detector conservador identifica fogo/evacuação, emergência médica, violência/ameaça e ordem urgente.

### Gates

- testes do módulo: sete suítes, 39/39;
- suíte API completa, build, ESLint check-only, audit de produção e varredura de segredo aprovados;
- nenhum provider externo foi chamado e nenhum conteúdo real foi usado.
