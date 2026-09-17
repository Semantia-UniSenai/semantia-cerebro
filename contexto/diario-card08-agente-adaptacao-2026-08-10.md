---
title: Diário do Card 08 — agente de adaptação
status: integracao-validada-aguardando-pr
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

## Slice 4 — Groq isolada e resiliência limitada

### RED

- configuração começou ausente e os testes exigiram não ler chave quando disabled, estado misconfigured e
  serialização pública sem segredo;
- adapter e mapper começaram ausentes e os testes cobriram request estrita, JSON inválido e HTTP
  400/401/403/422/429/498/5xx;
- factory começou ausente e os testes impediram construção do SDK em disabled/fake/misconfigured;
- retry, circuito e fila começaram ausentes e os testes fixaram deadline, uma repetição, half-open e capacidade.

### GREEN

- `groq-sdk` está confinado ao factory/adapter; retries internos do SDK ficam em zero;
- request usa modelo configurável, `stream=false`, `n=1`, temperatura 0,1, limite de 512 tokens,
  `include_reasoning=false`, `reasoning_effort=low`, sem tools e JSON Schema estrito;
- resposta passa por JSON parse e Zod antes de sair do adapter; somente contagens normalizadas são retornadas;
- 401/403 viram misconfigured sem retry; 400/422 viram invalid-response; 429/498/5xx são transitórios tipados;
- deadline total aborta a chamada; apenas erro retryable recebe no máximo uma repetição dentro do orçamento;
- circuito abre por falhas transitórias consecutivas, rejeita rápido e permite uma probe half-open;
- fila limita concorrência/espera, rejeita excesso com `QUEUE_FULL` e compartilha Promise por segmento;
- disabled/fake não leem nem recebem chave; Groq sem chave falha localmente.

### Configuração e segurança

- `.env.example` mantém `GROQ_API_KEY=` vazio e documenta apenas defaults não secretos;
- README registra minimização, literal soberano e ausência de fallback entre fornecedores;
- a primeira regex de secret scan produziu falso positivo porque `\\s*` atravessou newline após a chave vazia;
- a varredura válida foi repetida com espaços horizontais e retornou `secret-patterns=none`.

### Gates

- API: 36 suítes, 198/198;
- build, ESLint check-only e audit de produção aprovados;
- nenhum request Groq real foi executado.

## Slice 5 — orquestração, realtime, replay e health seguro

### RED

- o caso de uso começou ausente; seis testes fixaram bypass sem contexto, alto risco, sucesso,
  preservação semântica, erro do provider e idempotência terminal;
- o coordenador começou ausente; testes exigiram contexto/versionamento atual, Promise compartilhada e
  fallback persistido para fila cheia;
- o gateway ainda não emitia `transcript:adapted` nem carregava adaptação no snapshot;
- o serviço de recuperação, o módulo Nest e o health operacional começaram ausentes;
- novos REDs impediram chamada ao provider quando disabled e conservaram literal para `risk: urgent`.

### GREEN

- `AdaptTranscriptSegmentUseCase` reserva uma linha derivada, faz bypass/fallback auditável, executa
  provider sob circuito/deadline/retry, valida preservação e materializa literal somente no evento;
- `TranscriptAdaptationCoordinator` busca apenas contexto/versionamento da sessão, deduplica por
  `segment.id`, limita fila global e materializa `QUEUE_FULL` sem inferência;
- o gateway transmite/persiste `transcript:final` antes de agendar IA, não espera adaptação no ACK e
  agenda somente quando `created=true`;
- `transcript:adapted` usa o mesmo `segmentId`, `sessionId` e `seq`; replay de Socket/REST inclui a
  projeção persistida e nunca dispara inferência;
- sucesso retorna texto derivado; fallback/bypass usam o literal na projeção sem duplicá-lo no banco;
- pendências anteriores ao bootstrap viram `PROCESS_INTERRUPTED` sem reinferência;
- módulo Nest compõe config, provider, repository, circuito, fila, coordinator e recovery;
- health expõe somente enabled/provider/state/model/promptVersion, sem razão de segredo ou chave.

### Revisão de segurança

- input do provider continua limitado a literal final, `pt-BR`, contexto/versionamento e prompt;
- não há áudio, ASR bruto, histórico, usuário, token ou `joinToken` na camada de adaptação;
- erro assíncrono do gateway registra apenas nome da classe do erro, nunca texto/prompt/payload;
- varredura adversarial encontrou somente `audio` no teste/gateway literal e o nome de modelo
  `openai/gpt-oss-20b`; nenhum endpoint extra, fallback de provider ou segredo foi adicionado.

### Gates

- unidade/API: 42 suítes, 217/217;
- E2E PostgreSQL real: 1/1, cadeia de oito migrations, host e guest via Socket.IO;
- E2E provou `transcript:final → transcript:adapted`, mesmo id/seq, fallback disabled persistido,
  replay REST e health sem segredo;
- ESLint check-only, build, Prisma validate e audit de produção aprovados;
- nenhum request Groq real foi executado e nenhum conteúdo real foi usado.

## Slice 6 — consumo mínimo no frontend

### RED

- três testes falharam porque `useLiveSession` descartava `id/adaptation`, não escutava
  `transcript:adapted` e não preservava ordem fora do caminho nominal;
- o caso adversarial adicional provou que uma versão menor recebida antes do literal sobrescrevia a
  versão maior no buffer.

### GREEN

- `TranscriptEntry` mantém `text` literal e uma projeção `adaptation` opcional separada;
- snapshot persistido hidrata adaptação sem alterar o literal;
- `transcript:adapted` atualiza o mesmo segmento por `segmentId` ou `seq`, sem criar linha duplicada;
- evento recebido antes do literal fica somente em buffer efêmero por `segmentId`;
- eventos de outra sessão e versões/contextos anteriores são ignorados antes e depois do literal;
- eventos legados continuam sem propriedades opcionais artificiais, preservando compatibilidade;
- o buffer é limpo ao trocar/desconectar a sessão;
- nenhum seletor visual foi criado; a escolha literal/adaptado permanece no Card 05.

### Gates

- web: 18 arquivos, 97/97 testes;
- `vue-tsc`, build Vite e audit de produção aprovados;
- scan de segredo aprovado e nenhuma nova chamada de rede/áudio foi adicionada.

## Slice 7 — corpus e harness de avaliação sintética

### RED

- o carregador tipado começou ausente;
- a colisão de basename entre `.ts` e `.json` fez o resolvedor Jest carregar o JSON diretamente e foi
  eliminada com o nome `transcript-adaptation-corpus.synthetic.json`;
- quatro candidatos de instrução introduziam o span capitalizado `Depois` e foram recusados corretamente
  pelo guarda; o corpus foi corrigido sem afrouxar a validação;
- o avaliador de provider começou ausente e o teste exigiu bypass local dos casos urgentes.

### GREEN

- corpus estático `synthetic-pt-br-v1` com 100 casos, 20 categorias e cinco perfis válidos do domínio;
- Zod estrito valida idioma, versão, marca `syntheticOnly`, contexto, candidato e outcome;
- categorias incluem nomes, números, percentuais, dinheiro, datas, horários, negações, condições,
  instruções, comandos, alertas, urgência, termos técnicos, ambiguidades e manter literal;
- harness `guards`: 39 aceitos adaptados, 41 literais aceitos, 10 bypasses de alto risco, 10 fallbacks
  semânticos esperados e zero divergências;
- harness `provider=fake`: 10 bypasses locais, 90 chamadas seguras, 90 aceitas, zero fallback semântico e
  zero erro de provider;
- o resumo contém somente contadores, latências e tokens agregados; nenhum texto é emitido;
- provider desabilitado recusou a execução antes de chamadas com exit 2 e health público seguro;
- `GROQ_API_KEY_CONFIGURED=no`: smoke Groq real não executado, sem bloqueio para os gates offline;
- README documenta guards, fake e smoke Groq limitado, sempre com chave já presente no ambiente local.

### Aceitação humana

O corpus automatizado é gate defensivo, não prova qualidade linguística. A aceitação final continua
pendente de pessoa surda, intérprete ou especialista, sem alegar tradução para Libras.

## Gates finais e revisão adversarial

Executados após os commits funcionais, sem alterações posteriores nos worktrees de código:

- API: 44 suítes, 222/222 testes;
- API: ESLint check-only, build Nest, Prisma validate e audit de produção aprovados;
- web: 18 arquivos, 97/97 testes, `vue-tsc`, build Vite e audit aprovados;
- ASR inalterado: 15/15 testes e Ruff aprovados via `uv --extra test`;
- E2E real: oito migrations aplicadas em banco PostgreSQL descartável, 1/1 fluxo multiator aprovado;
- o E2E provou literal antes do adaptado, mesmo `segmentId/seq`, fallback disabled persistido, replay REST
  e health seguro; o database descartável foi removido após GREEN;
- corpus/harness: 100 casos, 20 categorias, zero divergências; fake com 90 aceitos, 10 bypasses e zero
  erro/fallback semântico;
- scans linha a linha: nenhum segredo, log textual, áudio/PCM/partial/identidade no módulo de adaptação,
  endpoint alternativo ou sobrescrita do literal;
- revisão frontend: nenhuma rede nova, cópia de áudio, segredo ou substituição de `entry.text`;
- dependências: audits de produção sem vulnerabilidades conhecidas;
- worktrees API/web limpos; arquivo `uv.lock` gerado apenas pela validação foi removido do escopo.

### Limites honestos

- smoke Groq real não foi executado porque `GROQ_API_KEY` não está configurada localmente;
- limites reais RPM/TPM/concurrency dependem da conta e não foram medidos;
- qualidade linguística não recebeu aceite humano especializado;
- nenhum merge automático será realizado.

## QA manual e relatório científico — 2026-08-12

### Runtime real

- stack do Card 08 iniciada em portas isoladas: web `5188`, API `3108`, ASR `8108` e PostgreSQL `55438`;
- oito migrations aplicadas; banco e ASR permaneceram saudáveis sem restart;
- health confirmou Groq `ready`, modelo `openai/gpt-oss-20b` e prompt `pt-br-accessible-v1`;
- smoke sintético vertical comprovou PCM → ASR → literal → Groq → adaptação/fallback persistido e eventos
  com mesmo segmento/seq;
- o runtime exigiu um mirror local `generated/prisma → dist/generated/prisma` após `prisma generate`, pois
  o build exclui `generated` e o import emitido falha em runtime; nenhuma alteração de código foi publicada.

### Incidente de aula de Python

- reunião real: 16 segmentos canônicos em cerca de 80 s;
- o arquivo exportado pelo usuário e o literal do PostgreSQL tiveram similaridade normalizada `1,0000`;
- 10 adaptações `SUCCEEDED`, seis idênticas ao literal e quatro com alteração; seis fallbacks
  `PRESERVATION_FAILED`;
- o palco exibiu somente `entry.text`, portanto o usuário viu o literal do ASR, não a adaptação;
- um segmento nominal de 5 s produziu 51 palavras/257 caracteres, densidade equivalente a 612 palavras/min,
  incompatível com fala normal e indicativa de alucinação;
- o contrato ASR não fornece sinal de qualidade além de engine/modelo/latência; a adaptação não possui gate
  de entrada suspeita;
- áudio ausente por retenção zero: WER e causa acústica não podem ser inferidos retrospectivamente.

### Documento recebido

- PDF de 28 páginas preservado em `referencias/`, SHA-256
  `1a83440560da40603691b68676b8630d3684881280a01a649e98052e2cd7c8f5`;
- camada textual completa; bibliografia nuclear normalizada resolvida via Crossref;
- o documento declara corretamente ser mapeamento profundo, não revisão sistemática PRISMA;
- decisões incorporadas: idade fora da intensidade automática, preferência individual, níveis por operações,
  glossário aprovado, guardas relacionais, fallback para qualquer risco e validação com pessoas surdas;
- síntese auditável em
  `referencias/2026-08-12-relatorio-surdez-acessibilidade-adaptacao-portugues-tempo-real.md`.

### Decisão

Não alterar modelo, janela, decoder ou hotwords com base neste único incidente. Construir reprodução humana
pareada e experimentar uma variável por vez. Até então, entrada ASR suspeita deve bloquear adaptação fluente,
e nenhuma alegação de benefício linguístico é permitida.

## Reintegração final na base pós-Card 13 — 2026-09-16

### Contrato fechado

- o transcript final limpo é persistido e emitido antes da adaptação;
- o agente recebe snapshot coerente de contexto e `audienceContextVersion` capturados com o segmento;
- `transcript:adapted` preserva `segmentId/sessionId/seq`; replay REST/Socket hidrata a projeção persistida;
- contexto inicial incompleto é rejeitado; falha de salvamento mantém modal, dados e retry sem capturar mídia;
- `pt-br-accessible-v1` ficou imutável; `pt-br-accessible-v2` virou default e aplica regras explícitas por
  simplificação, familiaridade, faixa etária, tipo de reunião e domínio;
- `urgent` faz bypass; `ambiguous` e `preservation-risk` fazem fallback literal;
- ASR acima de 360 palavras/min recebe `SUSPECT_DENSITY`; o provider não é chamado e a adaptação termina
  `BYPASSED/SUSPECT_INPUT`;
- o palco oferece escolha individual `Literal`/`Adaptado`; somente `succeeded` exibe texto derivado e os
  demais estados usam o literal canônico.

### Gates frescos

- API: 51 suítes e 265/265 unitários; ESLint, build, Prisma validate e `git diff --check` aprovados;
- E2E API passou com adaptação default `disabled` e com provider `fake/ready`;
- corpus defensivo: 100 casos, 20 categorias e zero divergências;
- PostgreSQL fresh: 10 migrations; N-1 preservou uma adaptação sintética `FALLBACK/TIMEOUT`, contexto versão
  1 e vínculo com o segmento ao adicionar `SUSPECT_INPUT`;
- package compilado e imagem Docker final iniciaram via `migrate deploy + start:prod`; health retornou banco
  conectado, provider fake `ready` e prompt v2;
- OpenAPI final foi recapturado após `SessionDto.requiresApproval`; Orval, typecheck e build web passaram;
- web: 27 arquivos de teste e 226/226 testes;
- Playwright no build final: 22 passes, quatro skips deliberados do caso LiveKit restrito ao Chromium e zero
  falhas em Chromium/Firefox/WebKit desktop, Chromium/WebKit mobile e autoplay bloqueado;
- added-lines scan: nenhum conflito, segredo real, chamada de provider no frontend, persistência de áudio ou
  log de transcript. Três matches de chave na API eram apenas `synthetic-test-secret` em specs.

### Correções de release descobertas pela validação

- `start:prod` apontava para `dist/main`, mas o Nest gera `dist/src/main`; script e Dockerfile foram alinhados;
- o Prisma gerado não era empacotado em `dist`; o build agora gera e copia o client de forma verificável;
- o Dockerfile não copiava a configuração de overrides do pnpm e `prune` reexecutava Husky já removido;
  `pnpm-workspace.yaml`, `--ignore-scripts` e OpenSSL tornaram a imagem reproduzível;
- o OpenAPI omitia `requiresApproval` na resposta de sessão; DTO e cliente gerado foram corrigidos;
- o modal de contexto excedia a viewport no iPhone/WebKit; ganhou altura dinâmica, safe areas e scroll interno.

### Limites e decisão

- Groq real não foi chamada e nenhum transcript real foi enviado nesta reintegração;
- a qualidade linguística continua sem aceite humano; não há alegação de tradução Libras nem de ganho de
  compreensão até avaliação com pessoas surdas/especialistas;
- existe uma janela rara de crash entre persistir o literal e criar `TranscriptAdaptation.PENDING`; o literal
  permanece íntegro, mas fechar a ausência auditável do derivado exige outbox/job transacional futuro;
- código está tecnicamente apto para PR e revisão; merge continua sem autorização.
