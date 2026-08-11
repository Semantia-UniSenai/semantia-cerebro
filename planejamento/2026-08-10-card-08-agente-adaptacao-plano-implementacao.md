---
title: Card 08 — plano de implementação do agente de adaptação
status: em-execucao
atualizado: 2026-08-10
clickup: 86e2j4w7h
repositorios:
  - semantia-api
  - semantia-web
  - semantia-cerebro
branch_api: feat/agente-adaptacao-transcricao
branch_web: feat/transcript-adaptado
branch_cerebro: docs/card08-agente-adaptacao
depende:
  - card-04
  - card-07
---

# Card 08 — Plano de implementação do agente de adaptação

## Objetivo

Adicionar uma derivação assíncrona do transcript literal canônico que produza português brasileiro mais
direto, identificado como adaptação automática e orientado pelo contexto versionado da sala. A camada
não pode sobrescrever, atrasar ou interromper o literal.

## Estado inicial comprovado em 2026-08-10

O Card 07 continua em revisão nos PRs API #10, web #10 e cérebro #8. As branches do Card 08 foram
criadas empilhadas sobre os respectivos heads:

- API `feat/agente-adaptacao-transcricao` sobre `fix/pipeline-disfluencias` em `07ab0d7`;
- web `feat/transcript-adaptado` sobre `chore/card07-sync-transcript-contract` em `12a436b`;
- cérebro `docs/card08-agente-adaptacao` sobre `docs/card07-transcript-canonico` em `6deeffd`.

Nenhum PR do Card 08 pode ser integrado antes do Card 07.

Baseline antes da feature:

- API: 21 suítes e 120/120 unitários; build e audit de produção aprovados;
- E2E é executado em PostgreSQL descartável `semantia_card08_test`, porta loopback 55435;
- lint check-only revelou dois erros preexistentes no head do Card 07, a corrigir isoladamente;
- web: 18 arquivos e 94/94 testes, build e audit aprovados;
- a branch web não possui script `lint`.

## Contrato arquitetural

```text
transcript literal canônico persistido
  → transcript:final imediato
  → fila local limitada, uma inferência por segmento/sala
  → TranscriptAdaptationProvider
      ├─ fake
      ├─ disabled
      └─ groq temporário
  → Zod + invariantes determinísticas
  → TranscriptAdaptation separada
  → transcript:adapted com o mesmo segmentId/seq
```

### Regras invariáveis

1. Somente `TranscriptSegment.text` final e limpo entra no agente.
2. Áudio, PCM, ASR bruto e partial não atravessam essa fronteira.
3. A adaptação nunca modifica `TranscriptSegment.text`.
4. Falha, timeout, 429, circuito aberto, fila cheia, resposta inválida ou violação semântica materializam
o literal no fluxo adaptado.
5. Não existe fallback silencioso para outro provedor.
6. Uma adaptação por segmento é compartilhada por todos os participantes da sala.
7. Chave só existe no ambiente backend/secret manager.
8. Prompt, modelo, contexto e comportamento são versionados; segredo e reasoning não são persistidos.
9. Português acessível não é descrito como tradução para Libras.
10. Qualidade linguística só é aceita após coavaliação com pessoas surdas.

## Provider temporário

O primeiro adapter hospedado será Groq. O candidato de spike é `openai/gpt-oss-20b`, configurado com
Structured Outputs estrito, reasoning baixo/oculto, resposta curta e sem ferramentas. O modelo não é
considerado aprovado até passar pelo mesmo corpus e pela revisão humana.

O domínio depende de `TranscriptAdaptationProvider`, não do SDK da Groq. Trocar fornecedor exige novo
adapter e configuração; não muda use case, persistência, eventos ou frontend.

## Débito prévio obrigatório

O contexto atual ainda não é versionado e `UpdateSessionContextUseCase` rejeita sessão `LIVE`, embora a
reunião instantânea já nasça `LIVE`. Antes da chamada externa:

- adicionar `audienceContextVersion`, começando em zero;
- primeira configuração recebe versão 1;
- permitir host atualizar em `PREPARING` ou `LIVE`;
- bloquear `ENDED` e atores sem permissão;
- capturar versão e snapshot usados pela adaptação.

## Persistência

Criar `TranscriptAdaptation` one-to-one com `TranscriptSegment`, contendo:

- texto adaptado somente em sucesso;
- status `PENDING | SUCCEEDED | FALLBACK | BYPASSED`;
- código de falha sem mensagem do provedor;
- versão e snapshot do contexto;
- versão do prompt, provider e modelo;
- latência, contagens de tokens e número de tentativas;
- timestamps.

`PENDING` interrompido por restart vira fallback `PROCESS_INTERRUPTED`; não ocorre reinferência silenciosa.

## Preservação semântica

JSON válido não prova fidelidade. O backend deve comparar, de forma determinística:

- números, moeda, percentuais, datas, horários e unidades;
- URLs, e-mails, telefones e identificadores;
- negações;
- obrigação, permissão, proibição e condição;
- siglas, termos citados e entidades detectáveis;
- itens protegidos introduzidos indevidamente.

Conteúdo urgente ou perigoso faz bypass conservador. Qualquer violação usa literal.

## Resiliência

- timeout inicial configurável: 2,5 s;
- no máximo um retry transitório dentro do deadline total;
- `Retry-After` respeitado apenas quando couber no deadline;
- circuit breaker `CLOSED/OPEN/HALF_OPEN` com relógio injetável;
- concorrência inicial 2 e fila inicial 32, ambas configuráveis;
- fila cheia nunca bloqueia o ACK/literal;
- deduplicação por `transcriptSegmentId` e replay sem nova inferência.

Uma sala com janelas contínuas de 5 s pode gerar 12 chamadas/min. O benchmark deve medir 1, 2 e 3 salas,
sem inferência por participante.

## Privacidade

A Groq permanece desabilitada por padrão. Durante desenvolvimento, somente corpus sintético. Antes de
dados reais, validar consentimento, retenção, ZDR, DPA/subprocessadores e transferência internacional no
Card 10. Métricas e logs nunca contêm transcript, prompt completo, token, JWT ou join token.

## Sequência TDD

1. restaurar baseline check-only;
2. versionar contexto e migration fresh/N-1;
3. persistir `TranscriptAdaptation` separada;
4. criar contrato, schema, prompt, fake e disabled;
5. implementar extração/validação de invariantes e detector de alto risco;
6. implementar adapter Groq e erros normalizados;
7. implementar timeout, retry, circuit breaker e fila;
8. integrar depois de `transcript:final` e persistir replay;
9. consumir `transcript:adapted` no web sem seletor visual;
10. criar corpus/harness e executar Groq apenas se a chave estiver disponível por env;
11. executar gates, revisão em duas passadas, docs e PRs;
12. mover ClickUp para `EM REVISÃO`, sem auto-merge.

## Fora do escopo

- seletor literal/adaptado, pertencente ao Card 05;
- renderização final/karaoke dual, pertencente ao Card 09;
- Libras, avatar ou substituição de intérprete;
- RAG, memória, ferramentas ou chatbot;
- Redis/outbox distribuído e múltiplas instâncias;
- fallback para outro fornecedor;
- uso de transcript real antes do gate de privacidade.

## Fontes externas

- Groq Structured Outputs: https://console.groq.com/docs/structured-outputs
- Groq models: https://console.groq.com/docs/models
- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq data controls: https://console.groq.com/docs/your-data
- W3C captions: https://www.w3.org/WAI/media/av/captions/
- Decreto nº 5.626/2005: https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/decreto/d5626.htm
- Lei nº 15.263/2025: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15263.htm
