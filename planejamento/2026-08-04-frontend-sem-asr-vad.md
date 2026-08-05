---
title: Plano — remover ASR/VAD do frontend e integrar Card 06
data: 2026-08-04
status: em-execucao
adr: ../arquitetura/decisoes/ADR-002-captura-pcm-janelas-fixas.md
---

# Plano — frontend somente captura, backend único ASR

## Resultado esperado

Ao manter a transcrição ativa, o frontend captura o microfone selecionado, envia PCM16 mono/16 kHz em janelas contíguas de 5 segundos e não executa Vosk, Web Speech, Whisper local ou VAD. O backend produz o único texto e resultados vazios não geram erro nem persistência.

## Fatia 1 — captura PCM sem reconhecimento

- [x] RED: captura usa dispositivo exato, entrega frames e libera grafo/track.
- [x] GREEN: `usePcmAudioCapture` com AudioWorklet e fallback ScriptProcessor.
- [x] RED: troca de dispositivo reinicia somente captura.
- [x] GREEN: lifecycle sem worker/modelo de ASR.

## Fatia 2 — janelas fixas e flush

- [x] RED: 5 segundos fecham uma janela automaticamente sem callback textual.
- [x] GREEN: finalizador serial por contagem de frames.
- [x] RED: frames recebidos durante ACK formam a próxima janela e não se perdem.
- [x] GREEN: loop de flush não concorrente.
- [x] RED: stop manual envia residual >=250 ms e depois limpa.
- [x] GREEN: stop assíncrono; leave/end cancelam de forma explícita.

## Fatia 3 — remover frontend ASR

- [x] Remover Vosk, Web Speech e Whisper local, seus workers, testes, modelo e scripts.
- [x] Remover dependências `vosk-browser` e `@huggingface/transformers`.
- [x] Remover env/cópias/estados de prévia e modelo local.
- [x] Provar por busca e build que não há recognizer/modelo ASR no bundle.

## Fatia 4 — backend sem VAD e no-speech

- [x] RED: adapter não envia `vad_filter` ao faster-whisper.
- [x] GREEN: remover VAD explícito.
- [x] RED: resposta vazia é sucesso sem persistência/broadcast.
- [x] GREEN: contrato Python→Nest→gateway aceita no-speech.
- [x] Remover rollback `ASR_MODE=browser` e os handlers textuais do cliente.

## Fatia 5 — verificação e integração

- [x] Suites completas web/API/Python, typecheck, build e audit.
- [x] Lint, Prisma, Compose config e Docker build; imagem non-root `semantia`.
- [ ] Smoke navegador → janelas fixas → API → ASR → PostgreSQL → broadcast — stack mantida parada.
- [x] Provar ausência de parcial Vosk, áudio persistido e ASR frontend por busca/build/testes.
- [ ] Atualizar arquitetura, README, evidências e ClickUp.
- [ ] Push nos PRs #7/#6/#4 e merge autorizado.
- [ ] Criar e mergear PRs de integração para `dev` (web/API) e `main` (cérebro), sem incluir Card 04 paralelo.
