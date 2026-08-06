---
title: Diário de execução — evolução Card 06 para ASR backend
data: 2026-08-04
status: concluido-em-revisao
---

# Diário do Card 06 — ASR backend CPU-first

> **Atualização posterior — ADR-002:** a decisão abaixo de manter Vosk para endpointing foi
> superada em 2026-08-04. O runtime atual não possui Vosk, ASR local ou VAD; usa janelas PCM fixas de
> 5 s e final exclusivamente no backend. Ver a seção “Decisão final sem ASR/VAD no frontend”.

Este arquivo registra decisões e mudanças da evolução autorizada por Foyth após o teste humano de precisão. Ele complementa o histórico; commits e evidências reproduzíveis continuam sendo a fonte técnica.

## 2026-08-04 — autorização e enquadramento

- **Entrada:** a aplicação será hospedada em VPS equivalente a Hostinger KVM 2/KVM 4, com 8–16 GB RAM e sem GPU garantida.
- **Autorização:** áudio pode sair do navegador e ser processado no backend.
- **Decisão:** adotar ASR backend CPU-first; `faster-whisper small` int8 como default inicial.
- **Separação:** ASR converte áudio em texto; futura LLM/agente processa texto e não substitui o ASR.
- **Privacidade:** áudio efêmero, retenção zero por padrão; cloud desabilitada e sem fallback implícito.
- **Compatibilidade:** Vosk permanece como parcial/endpointing e nunca como final canônico no modo backend.
- **Fluxo Git:** continuar nas branches/PRs abertos do Card 06, sem merge automático.
- **Plano:** `planejamento/2026-08-04-asr-backend-cpu-first.md`.
- **ADR:** `arquitetura/decisoes/ADR-001-asr-backend-cpu-first.md`.

## Registro de mudanças

### Slice 1 — serviço Python ASR

- Criado `asr-service/` com FastAPI, contrato PCM16, provider abstrato, adapter `faster-whisper`, coordenação concorrente e Dockerfile non-root.
- Defaults fixados em `small`, CPU, int8, duas threads, uma inferência e fila quatro.
- Áudio entra como bytes e é convertido diretamente para `numpy.float32`; nenhum arquivo temporário é criado.
- Contratos: `/health`, `/ready`, `/v1/transcriptions`; 250–30000 ms; 960000 bytes; request id obrigatório.
- Idempotência concorrente por request id dentro da instância do worker.
- Falhas não expõem exception/path; logs do endpoint usam id/classe, nunca áudio/texto.
- TDD/testes: validação PCM, fila, coalescing, HTTP, redaction, config e adapter.
- Correção descoberta por RED: `ASR_PRELOAD=sometimes` era aceito como `false`; parser passou a falhar fechado para boolean inválido.
- Suite atual do serviço: 15 testes, warnings tratados como erro.

### Slice 2 — API e gateway

- Criado `src/modules/asr/` com parser, cliente HTTP, coordenador por sessão e use case vertical.
- `TranscriptRepository.findByClientSegmentId` permite replay antes de inferir novamente.
- Novo evento `transcription:audio`; ACK inclui `seq`, replay, engine, modelo e inferência.
- Estados privados ao host: `processing`, `complete`, `failed`.
- `transcript:final` do cliente é recusado em `ASR_MODE=backend`; `browser` permanece apenas para rollback explícito.
- Autorização ocorre antes do cliente ASR: conta autenticada, participante presente, papel `HOST`, sessão `LIVE`.
- Segmentos da mesma sessão são seriais; sessões diferentes não se bloqueiam; duplicata concorrente compartilha Promise.
- Risco encontrado em revisão: o coordenador aceitava fila ilimitada de um cliente host malicioso. RED adicionado e limite server-side fixado em oito trabalhos por sessão com `ASR_BUSY` retryable.
- Socket.IO limitado a 1100000 bytes; parser PCM permanece mais estrito em 960000 bytes.
- Compose de desenvolvimento mantém o padrão do repo (dependências no Docker, API no host) e adiciona ASR/cache do modelo.

### Slice 3 — frontend e UX

- Criado `useBackendAudioFinalizer`: consome o espelho do AudioWorklet, trim/resample 16 kHz, satura PCM16 e limpa o buffer após cada fechamento.
- `useMeetingTranscription` força Vosk/AudioWorklet quando recebe `onAudioSegment`; Web Speech e Whisper local não podem fornecer o final nesse modo.
- Vosk permanece como parcial/endpointing. Um final Vosk fecha o áudio, mas seu texto nunca é enviado como final canônico.
- `useLiveSession` ganhou fila PCM não reativa: oito itens, TTL 60 s, ACK 50 s, três tentativas e mesmo `clientSegmentId`/bytes no retry.
- Bytes são descartados em sucesso, falha definitiva, expiração, stop, saída ou encerramento; nenhum IndexedDB/localStorage.
- `LiveRoomView` conecta captura → fila e combina status de fila/servidor.
- `MicControl` informa corretamente envio efêmero, retenção zero, motor/modelo/latência e ausência de fallback silencioso. O teste isolado do microfone continua local.

### Decisões e desvios do plano inicial

1. **Socket.IO existente, não segundo WebSocket:** reutilizado porque já possui autenticação, presença e ACK. O envelope tem limite explícito; o serviço Python continua privado.
2. **Segmentação pelo endpointing Vosk:** aproveita callbacks maduros do Card 06 e reduz escopo/CPU na primeira versão. VAD do Whisper continua habilitado dentro do segmento.
3. **Compose local não sobe API:** preservado o padrão existente do repositório; PostgreSQL e ASR são dependências, Node roda por `pnpm start:dev`.
4. **Cloud não implementada:** provider externo continua apenas decisão futura para não introduzir credencial, custo ou fronteira LGPD sem benchmark/consentimento.
5. **Whisper local preservado como código legado:** não é inicializado no fluxo vigente; fica somente para rollback controlado enquanto a evolução passa por revisão.
6. **Modelo padrão alterado da recomendação GPU para VPS:** `large-v3-turbo` foi descartado como default; `small/int8` é a configuração inicial CPU-first.

### Documentação atualizada

- ADR: `arquitetura/decisoes/ADR-001-asr-backend-cpu-first.md`.
- Operação VPS: `arquitetura/asr-backend-vps.md`.
- Arquitetura da sala: `arquitetura/sala-ao-vivo.md`.
- Relatório local-first marcado como histórico: `arquitetura/captura-fala-transporte-card-06.md`.
- READMEs web/API/ASR atualizados com contrato, privacidade, env e comandos.

### Estado antes dos gates finais

- Slices focais RED/GREEN aprovados.
- Nenhum merge executado; PRs #7 web, #6 API e #4 cérebro continuam abertos.
- Pendente neste diário: suites completas, builds/lint/audit/Prisma, Docker/Compose, smoke real, benchmark CPU e publicação dos commits/evidências.

### Slice 4 — hardening encontrado em runtime

- O primeiro container falhou como non-root porque `COPY` preservou modo restritivo dos fontes. Corrigido com `COPY --chown=semantia:semantia`; imagem final roda como UID/GID `10001`.
- O smoke realtime revelou que `ASR_TIMEOUT_MS` chegava como string do ambiente. `AbortSignal.timeout` lançava `TypeError` antes do HTTP e o cliente mascarava como `ASR_UNAVAILABLE`. Adicionados RED com timeout string e config inválida; o construtor agora converte e valida inteiro positivo.
- A fila PCM aplicava TTL durante flush/reconnect, mas podia ficar em memória enquanto offline. Adicionado timer independente do socket; RED/GREEN prova remoção e `AUDIO_EXPIRED` após 60 s.
- O browser smoke encontrou cópia conflitante no `CaptionStage` (“somente neste navegador”). Adicionado `backendAsr`, teste de regressão e texto que separa prévia local de final processado pelo servidor.
- Compose removeu `container_name` global, passou a bindar portas em loopback e aceita `POSTGRES_PORT`, `ASR_PORT`, CPU, memória, threads, concorrência e fila por env. Nenhum projeto vizinho foi interrompido.

### Slice 5 — gates e runtime completos

- Serviço ASR: 15 testes, warnings como erro, Ruff check/format, `pip check` e instalação limpa em venv temporário aprovados.
- API: Prisma generate/validate, quatro migrations aplicadas, 19 suites/85 testes, ESLint sem warnings, build, E2E e audit sem vulnerabilidades aprovados.
- Web: 23 arquivos/167 testes, `vue-tsc`, build Vite, integridade Vosk e audit sem vulnerabilidades aprovados.
- Imagem final construída (`sha256:dbeabee4c2dc2808afac51e5724f752a61b085703b7c503f2af08b3c4ad636eb`), healthy/ready e non-root.
- `/v1/transcriptions` real com `small/int8` transcreveu exatamente a frase controlada em 1996 ms para 5112 ms de áudio.
- Smoke Socket.IO: convidado recebeu `FORBIDDEN`; host recebeu `processing/complete`; primeiro ACK persistiu/broadcast; retry retornou replay; um único final ficou no banco.
- Smoke Brave real usou `MediaStream` sintético para não capturar áudio ambiente e percorreu captura, AudioWorklet, Vosk endpointing, PCM, API, ASR, banco e UI. O final exato ficou visível com engine/modelo/latência.
- Retenção zero: zero arquivos de áudio em `/app`, `/tmp` e `/models`; tabela `transcript_segments` tem somente ids, sequência, texto, timestamp e `clientSegmentId`; nenhuma coluna `bytea`.

### Benchmark

- KVM 2 emulado, 2 vCPU, 2 threads: p50 2085 ms, p95 2581 ms, RTF p95 0,505, pico 814,1 MiB.
- KVM 4 emulado, 4 vCPU, 3 threads: p50 1716 ms, p95 1978 ms, RTF p95 0,387, pico 822,1 MiB.
- Três chamadas concorrentes foram serializadas. Em KVM 2, capacidade total cinco rejeitou a sexta com `429 QUEUE_FULL`.
- WER controlado: 0% em 11 palavras. O áudio humano original não foi localizado; a comparação humana será feita na nova leitura de Foyth, sem inventar número.
- Evidências: `evidencias/card-06/asr-backend-runtime-2026-08-04.json` e `evidencias/card-06/asr-backend-benchmark-2026-08-04.json`.

### Publicação e backlog

- Commits publicados: web `39ca322`, API `b40a63b`, cérebro `b229300`.
- PRs #7, #6 e #4 receberam título/contexto/evidências atualizados via API REST; continuam abertos, sem merge/auto-merge.
- ClickUp `86e2j4w0k` foi corrigido de **EM PROGRESSO** para **EM REVISÃO** e recebeu comentário com gates, benchmark, privacidade, riscos e links.
- Implementação, runtime local, evidências e publicação estão concluídos. A única atividade seguinte é a validação humana por leitura do roteiro e eventual ajuste de modelo/configuração com base no WER real.

## Decisão final sem ASR/VAD no frontend

Em 2026-08-04, Foyth autorizou explicitamente os merges do Card 06 e decidiu remover Vosk sem
substituí-lo por VAD. A interação prioritária é presencial; o anfitrião controla a captura e aceita um
pequeno atraso para receber somente texto mais confiável do backend.

Implementação resultante:

- frontend sem `vosk-browser`, Transformers.js, Web Speech, modelos ou workers de ASR;
- controle explícito iniciar/parar; janelas contíguas de 5 s e residual ≥ 250 ms no stop;
- `AudioWorklet` somente captura frames e nível visual; não classifica voz/silêncio;
- nenhum `transcript:partial`, `publishPartial`, `publishFinal` ou `partialText` na web;
- gateway sem handlers cliente→servidor para texto parcial/final e sem `ASR_MODE` de rollback;
- `faster-whisper small`, CPU/int8, sem `vad_filter`, como único reconhecedor;
- resposta vazia do ASR é ACK/no-speech, não persiste segmento e mantém replay em cache efêmero por
  120 s;
- áudio continua efêmero e limitado por fila, TTL, retry, bytes, duração e idempotência.

Gates não-runtime executados após a mudança:

- web: 18 arquivos, 93 testes; typecheck; build; audit de produção sem vulnerabilidades conhecidas;
- API: 19 suítes, 86 testes; lint; build; Prisma validate/generate; audit sem vulnerabilidades conhecidas;
- Python: 15 testes e compileall aprovados.

A stack permaneceu parada. Docker/E2E com PostgreSQL e smoke real navegador→ASR→banco→broadcast só
podem ser registrados depois de executados; não são inferidos dos testes unitários.

### Pendências registradas antes da integração — resolvidas abaixo

As quatro ações abaixo eram o checklist pré-integração e foram concluídas em 2026-08-05/06:

- PRs #7 (web), #6 (API) e #4 (cérebro) atualizados e integrados por suas branches-pai;
- gates dependentes de runtime executados e registrados;
- pilhas `feat/salas-comunicacao` promovidas para `dev`/`main`;
- ClickUp mantido em `EM REVISÃO`, com links e SHAs finais registrados neste fechamento.

## Fechamento integrado — 2026-08-05 e 2026-08-06

- Em 2026-08-05, as branches empilhadas foram promovidas: web #7 → #8 para `dev`, API #6 → #7
  para `dev` e cérebro #4 → #5 para `main`.
- Foyth executou nova leitura e considerou o comportamento estável e bom para continuidade. Foram
  criadas as tags imutáveis `card06-transcription-stable-2026-08-06` na web (`613f813`) e API
  (`e642319`).
- A investigação identificou que hotwords técnicas padrão induziam palavras não faladas. O PR API #9
  removeu o valor padrão, preservou somente opt-in explícito e foi mergeado em `dev` no commit
  `8c1ba5449ac98f0399e90e6bc3820d9214b6d711` em 2026-08-06.
- Gate fresco do PR #9: NestJS 19/19 suítes e 86/86 testes, build/lint, Prisma generate/validate e
  audit aprovados; Python 15/15, Ruff check/format e `pip check` aprovados; imagem ASR reconstruída.
- No runtime, `ASR_HOTWORDS` estava vazio ou ausente, 5 s de silêncio retornaram texto vazio, a API
  confirmou banco saudável, o ASR estava ready e não havia artefato de áudio em `/app` ou `/tmp`.
- Experimentos sem ganho comprovado não foram promovidos e suas branches foram removidas local e
  remotamente. O runtime permanece no checkpoint de 5 s, sem overlap, VAD ou ASR no frontend.
- O Card 06 permanece `EM REVISÃO`: implementação e documentação estão integradas, mas a conclusão
  terminal segue o workflow de revisão do ClickUp.
