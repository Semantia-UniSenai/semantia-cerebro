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
