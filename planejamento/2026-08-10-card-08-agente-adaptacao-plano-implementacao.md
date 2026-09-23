---
title: Card 08 — plano de implementação do agente de adaptação
status: concluido
atualizado: 2026-09-16
integrado_em: 2026-09-23
clickup: 86e2j4w7h
repositorios:
  - semantia-api
  - semantia-web
  - semantia-cerebro
branch_api: feat/card08-integration
branch_web: feat/card08-integration
branch_cerebro: docs/card08-integration
pull_requests:
  api: https://github.com/Semantia-UniSenai/semantia-api/pull/15
  web: https://github.com/Semantia-UniSenai/semantia-web/pull/15
  web_correcao_pos_merge: https://github.com/Semantia-UniSenai/semantia-web/pull/16
  cerebro: https://github.com/Semantia-UniSenai/semantia-cerebro/pull/13
merge_shas:
  api_dev: 632e0167edd0f8bf142d59514856f43bf36aa371
  web_dev: 02db9446e87c479a388e9fc4f978b0d6c2e47bad
depende:
  - card-04
  - card-07
---

# Card 08 — Plano de implementação do agente de adaptação

## Reintegração autorizada em 2026-09-16

Os PRs originais do Card 08 foram mergeados apenas nas branches intermediárias do Card 07 depois que
essas bases já haviam sido integradas em `dev`. Por isso, o GitHub registrou os PRs como mergeados, mas
o módulo `src/modules/transcript-adaptation`, o evento `transcript:adapted` e o consumo frontend não
chegaram à branch integrada. Foyth autorizou concluir o Card 08 em loop sem reimplementar o histórico.

### Bases e promoção

1. criar `feat/card08-integration` na API e web a partir de `origin/dev` pós-Card 13;
2. fazer merge histórico de `origin/feat/agente-adaptacao-transcricao` na API;
3. fazer merge da branch local `feat/transcript-adaptado` na web para incluir também `88174e7`;
4. resolver conflitos preservando simultaneamente admissão, encerramento canônico/LiveKit e adaptação;
5. não incorporar `feat/asr-quality-gate`, artefatos experimentais ou `uv.lock` não rastreado.

### Tracer bullets obrigatórios

1. **API composta:** os testes de `live.gateway` devem falhar se a promoção remover emissão de mídia,
   encerramento terminal ou adaptação literal-first. Resolver somente após reproduzir os conflitos.
2. **Frontend composto:** os testes de `LiveRoomView` devem provar que mídia, captura e contexto continuam
   funcionais enquanto `useLiveSession` hidrata/bufferiza adaptação sem duplicar o literal.
3. **Entrada suspeita:** primeiro criar RED no caso de uso garantindo que qualidade `suspect` não chama o
   provider e produz fallback literal auditável. A promoção não inclui a branch experimental de ASR; se o
   contrato de qualidade ainda não existir em `dev`, registrar como dependência bloqueante sem inventar sinal.
4. **Riscos do modelo:** testar todos os valores de risco não nulos; qualquer risco deve terminar em
   literal/bypass, nunca em texto adaptado persistido.
5. **Salvar contexto:** teste frontend de falha 4xx/5xx/offline mantém formulário aberto e não apresenta
   configuração como salva.

### Gates da API

- `pnpm install --frozen-lockfile` e `pnpm prisma:generate`;
- testes focados após cada RED/GREEN e suíte Jest completa;
- ESLint check-only, build Nest, Prisma validate e `git diff --check`;
- migrations fresh e N-1 reais em PostgreSQL scratch, com fixture canônica preservada;
- E2E PostgreSQL/Socket.IO: literal antes do adaptado, mesmo ID/seq, fallback, replay sem reinferência,
  queue-full, restart e health sem segredo;
- corpus sintético completo e provider fake; Groq real somente se já houver chave no ambiente e sem imprimir
  conteúdo, prompt ou segredo;
- `/docs-json` final e regeneração Orval a partir desse runtime.

### Gates da web

- testes focados de `useLiveSession`, contexto e `LiveRoomView`;
- suíte Vitest completa, `vue-tsc`/build e `git diff --check`;
- E2E no artefato final com host e participante, falha/retry do contexto, seletor literal/adaptado e mídia
  do Card 13 intacta;
- escolha individual começa no literal, persiste somente a preferência de apresentação e usa literal quando
  a adaptação está ausente, em fallback ou em bypass.

### Fechamento

- autorrevisão determinística em duas passagens: contrato/privacidade/lifecycle e added-lines adversarial;
- atualizar este diário, ADR, requisitos e registro do Card 08 com evidência real;
- publicar PRs finais API/web para `dev` e cérebro para `main`, mantendo-os em revisão e sem auto-merge;
- ClickUp só muda após leitura do task ID `86e2j4w7h` e verificação pós-reload.

## Fechamento técnico da reintegração — 2026-09-16

- API promovida para a base pós-Card 13, com literal-first, snapshot coerente de contexto/versão e mesmo
  `segmentId/seq` no derivado;
- prompt imutável `pt-br-accessible-v1` preservado e `pt-br-accessible-v2` adicionado como default registrado;
- riscos `urgent`, `ambiguous` e `preservation-risk` nunca materializam texto adaptado como sucesso;
- densidade acima de 360 palavras/min marca `SUSPECT_DENSITY`, não chama o provider e persiste bypass
  `SUSPECT_INPUT`, sem áudio ou hipótese bruta armazenados;
- falha ao salvar contexto mantém o modal e a intenção para retry, sem iniciar captura; contexto inicial
  parcial é rejeitado antes de formar snapshot inválido;
- participante alterna entre literal e adaptado; fallback/bypass continuam mostrando o literal;
- package Nest/Docker inclui o Prisma gerado, lock/overrides autocontidos e `start:prod` executável;
- clean database: 10 migrations; N-1 preservou adaptação `FALLBACK/TIMEOUT` e adicionou o enum novo;
- API: 51 suítes, 265 testes; E2E `disabled` e `fake`; corpus sintético 100/100 sem divergências;
- web: 27 arquivos de teste, 226 testes; Playwright final 22 passes, quatro skips deliberados e zero falhas;
- OpenAPI foi recapturado após o DTO final e Orval/build passaram; imagem final iniciou com health `ready`.

### Limites honestos

- não houve chamada Groq real nem envio de transcript real nesta reintegração;
- benefício de compreensão continua sem promoção até avaliação pareada com pessoas surdas/especialistas;
- um encerramento abrupto exatamente entre persistir o literal e criar a linha `PENDING` pode deixar o
  derivado ausente; o literal permanece íntegro, mas o fechamento durável dessa janela exige outbox/job
  transacional e fica registrado como evolução de confiabilidade;
- PRs não autorizam merge automático.

### Integração autorizada — 2026-09-23

Foyth autorizou merge e pull. API #15 foi integrada em `dev` no SHA `632e016`; web #15 havia sido
integrada em `5ce05e0`, e o gate pós-merge encontrou resíduos do conflito no seletor literal/adaptado e em
fixtures TypeScript. A correção TDD web #16 foi integrada em `02db944`. Após o pull das refs de destino:

- API: 51 suítes, 270/270 testes, ESLint e build aprovados;
- web: 27 arquivos, 233/233 testes, typecheck e build aprovados;
- a árvore do squash web final é idêntica à validada no Playwright: 22 passes, quatro skips deliberados e
  zero falhas.

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
9. consumir `transcript:adapted` e oferecer escolha individual literal/adaptado com fallback literal;
10. criar corpus/harness e executar Groq apenas se a chave estiver disponível por env;
11. executar gates, revisão em duas passadas, docs e PRs;
12. mover ClickUp para `EM REVISÃO`, sem auto-merge.

## Fora do escopo

- visualização simultânea dos dois textos e explicação visual detalhada de cada código de fallback;
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
