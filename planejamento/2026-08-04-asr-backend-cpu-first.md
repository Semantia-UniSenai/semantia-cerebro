# ASR Backend CPU-first — plano de implementação

> **Execução:** inline, sem agentes auxiliares. Cada mudança comportamental segue RED → GREEN → REFACTOR e termina em evidência reproduzível.

**Objetivo:** substituir o final Whisper pesado no navegador por um final canônico de alta precisão produzido no backend, sem exigir GPU e cabendo em VPS Hostinger equivalente a KVM 2/KVM 4 (2–4 vCPU, 8–16 GB RAM).

**Arquitetura:** Vosk permanece no navegador somente para parciais rápidos e endpointing. Cada final preliminar fecha um segmento PCM mono, que é normalizado para 16 kHz/16-bit e enviado pelo Socket.IO autenticado. A API valida papel/sessão/limites, serializa trabalhos por sala, chama um serviço ASR Python interno e persiste exatamente um final idempotente. O serviço usa provider abstrato; `faster-whisper small` CPU/int8 é o padrão, com provider determinístico apenas em testes e provedores externos desabilitados por padrão.

**Stack:** Vue 3/Vite/AudioWorklet/Vosk, NestJS/Socket.IO/Prisma/PostgreSQL, Python 3.11/FastAPI/faster-whisper 1.2.1/CTranslate2, Docker Compose.

## Restrições globais

- Produção deve funcionar sem GPU em 2–4 vCPU e 8–16 GB RAM.
- Modelo padrão: Whisper `small`, device `cpu`, compute type `int8`, uma inferência concorrente por worker.
- Nenhuma LLM participa da transcrição literal; o futuro agente consome apenas texto final.
- Áudio é efêmero, mantido em memória e descartado após resposta/falha; retenção padrão zero.
- Somente `HOST` autenticado e presente em sessão `LIVE` envia áudio.
- Um `clientSegmentId` identifica captura, retry, inferência e persistência.
- Somente a API publica e persiste o final canônico; texto final vindo do navegador é rejeitado no modo backend.
- Nenhum fallback para provedor externo ocorre sem configuração/consentimento explícito.
- Fila de áudio no navegador e no backend é limitada; sobrecarga deve falhar de forma observável.
- PRs atuais permanecem abertos e sem merge automático.

---

## Task 1 — Serviço ASR independente

**Criar:**
- `semantia-api/asr-service/pyproject.toml`
- `semantia-api/asr-service/asr_service/{config,contracts,providers,service,main}.py`
- `semantia-api/asr-service/tests/`
- `semantia-api/asr-service/Dockerfile`

**Contrato produzido:**
- `GET /health`: processo vivo.
- `GET /ready`: provider/modelo disponível.
- `POST /v1/transcriptions`: corpo PCM16 little-endian, mono, 16 kHz; headers de request id e duração; resposta com texto, engine, modelo e tempo.
- Erros estáveis: `INVALID_AUDIO`, `AUDIO_TOO_SHORT`, `AUDIO_TOO_LONG`, `QUEUE_FULL`, `MODEL_UNAVAILABLE`, `INFERENCE_FAILED`.

**TDD:**
- [x] RED: config segura, limites e provider obrigatório.
- [x] GREEN: settings CPU-first.
- [x] RED: PCM inválido/curto/longo nunca chega ao provider.
- [x] GREEN: validação de áudio.
- [x] RED: concorrência serial e fila limitada.
- [x] GREEN: coordenador de inferência.
- [x] RED: provider Whisper converte PCM para float sem gravar arquivo.
- [x] GREEN: adapter lazy `faster-whisper`.
- [x] RED: health/readiness/endpoint e redaction de erros.
- [x] GREEN: FastAPI e container não-root.

## Task 2 — Cliente ASR e coordenação na API

**Criar/modificar:**
- `src/modules/asr/` para contrato, cliente HTTP, coordenação por sessão e use case.
- `TranscriptRepository.findByClientSegmentId` para replay antes da inferência.
- `LiveGateway` para `transcription:audio`.
- `LiveModule`, `SessionsModule`, `.env.example`, Compose e README.

**Contrato produzido:**
- Payload: `{ clientSegmentId, pcm16, sampleRate: 16000, durationMs }`.
- ACK: `{ ok, seq, replayed, engine, model, inferenceMs }`.
- Eventos de status: `transcription:status` (`queued`, `processing`, `retrying`, `failed`).
- Evento final continua `transcript:final` e mantém o contrato dos consumidores.

**TDD:**
- [x] RED: convidado/moderador/não ingressado/sala encerrada são rejeitados antes do cliente ASR.
- [x] GREEN: autorização centralizada.
- [x] RED: codec, sample rate, duração e bytes inconsistentes são rejeitados.
- [x] GREEN: parser/limites.
- [x] RED: retry de segmento já persistido não infere de novo.
- [x] GREEN: lookup idempotente.
- [x] RED: duplicata concorrente compartilha a mesma Promise e salas diferentes não se bloqueiam.
- [x] GREEN: coordenador por sessão.
- [x] RED: apenas resultado ASR válido chega ao append/broadcast.
- [x] GREEN: use case vertical.
- [x] RED: final textual do cliente é rejeitado quando `ASR_MODE=backend`.
- [x] GREEN: feature flag com backend como padrão.

## Task 3 — Captura e fila de segmentos no frontend

**Criar/modificar:**
- encoder PCM16 puro e testado.
- fila `useBackendTranscription` limitada, serial, com retry do mesmo id.
- `useMeetingTranscription` sempre usa Vosk para captura/partial e fecha PCM no final Vosk.
- `useLiveSession` envia áudio binário e expõe status/fila.
- `LiveRoomView` e `MicControl` exibem preparação, fila, processamento, falha e privacidade real.
- preservar Transformers.js/Whisper Worker somente como rollback explícito, sem inicializá-lo no modo backend.

**TDD:**
- [x] RED: float→PCM16 satura extremos e preserva silêncio.
- [x] GREEN: encoder.
- [x] RED: cada final Vosk consome exatamente o áudio desde o final anterior e envia um id novo.
- [x] GREEN: segmentação por callbacks existentes.
- [x] RED: fila é serial, limitada, expira e retry reutiliza id/bytes.
- [x] GREEN: transporte backend.
- [x] RED: stop/unmount limpa PCM e impede envio tardio; request já aceito no backend pode finalizar canonicamente.
- [x] GREEN: lifecycle.
- [x] RED: UI comunica áudio efêmero no backend e engine/estado sem prometer precisão.
- [x] GREEN: UX.

## Task 4 — Runtime VPS e privacidade

- [x] Compose de dependências com `asr`/`postgres`, healthchecks e limites; API no host conforme padrão do repositório e ASR em loopback no desenvolvimento.
- [x] Modelo cacheado em volume; startup não baixa a cada reinício.
- [x] Configuração KVM 2 e KVM 4 documentada, incluindo uma inferência concorrente e backpressure.
- [x] Logs somente com ids, bytes, duração, engine e timings; nunca samples/texto.
- [x] TLS/reverse proxy, timeout, body limit e rate limit documentados.
- [x] Cloud provider permanece desabilitado e sem credenciais no frontend/banco.

## Task 5 — Verificação e publicação

- [x] Suites focais RED/GREEN e suites completas web/API/Python.
- [x] Builds, lint check-only, Prisma generate/validate, audit e `git diff --check`.
- [x] Docker build do ASR e Compose efetivo.
- [x] Smoke real: host envia fixture PCM → ASR → persistência → broadcast; convidado é rejeitado; retry não reinfere/duplica.
- [x] Benchmark no mesmo áudio: latência CPU, pico de RAM e WER quando houver referência alinhada.
- [x] Provar retenção zero: nenhum WAV/PCM em banco, volume, filesystem ou logs.
- [x] Atualizar ADR, arquitetura, requisitos, README, histórico e evidências.
- [x] Commits coerentes, push nos três PRs e comentário ClickUp com resultados; sem merge.

## Critérios de aceite

- Um e somente um final persistido/broadcast por `clientSegmentId`.
- Zero final canônico produzido pelo Vosk no modo backend.
- Zero inferência repetida em replay confirmado e duplicata concorrente na mesma instância.
- Áudio inválido, acima do limite ou de ator sem permissão não chega ao ASR.
- Operação comprovada sem GPU.
- Serviço cabe em 8 GB RAM no benchmark isolado; 16 GB é recomendado para margem operacional.
- WER do roteiro real é reportado por categoria, sem inventar alinhamento.
- Falha/ocupação é visível e nunca troca silenciosamente para cloud.

## Validação humana externa pendente

- [ ] Foyth lê o roteiro pt-BR no fluxo publicado para medir WER humano comparável. A ausência dessa gravação não bloqueia a implementação/publicação e nenhum valor foi inventado.
