---
title: Card 06 — captura de fala robusta e transporte em tempo real
status: em-revisao
atualizado: 2026-08-04
clickup: 86e2j4w0k
---

# Card 06 — captura de fala robusta e transporte em tempo real

> Implementado nas branches `feat/captura-fala-robusta` (web) e
> `feat/protocolo-transcricao` (API), empilhadas sobre `feat/salas-comunicacao`.
> Revisão aberta no [semantia-web #7](https://github.com/Semantia-UniSenai/semantia-web/pull/7),
> [semantia-api #6](https://github.com/Semantia-UniSenai/semantia-api/pull/6) e no PR documental desta
> branch. A entrega não está integrada em `dev` e não possui merge automático.

## Situação após a evolução de 2026-08-04

> **Contrato local-first parcialmente superado pela [ADR-001](./decisoes/ADR-001-asr-backend-cpu-first.md).**
> A partir desta evolução, Vosk continua apenas como parcial/endpointing; PCM16 efêmero segue ao
> backend e `faster-whisper small/int8` produz o único final canônico. Os resultados, arquivos e
> medições abaixo permanecem como registro fiel da implementação anterior e como baseline, não como
> descrição do runtime vigente.

## Resultado histórico local-first

Na versão validada em 2026-08-03, o navegador do anfitrião era a única origem de transcrição. O
pipeline usava reconhecimento local por capacidade, mantinha parciais textuais efêmeras e escolhia
exatamente um final canônico. Naquela versão nenhum áudio era enviado à API Semantia, Socket.IO,
OpenAI, Groq ou outro provedor STT.

```text
microfone do anfitrião
  │
  ├─ SpeechRecognition on-device pt-BR, somente quando o browser comprova a capacidade
  │    └─ parcial/final textual local
  │
  └─ fallback cross-browser
       getUserMedia → AudioContext → AudioWorklet
          ├─ Vosk pt-BR local → parcial de baixa latência + final preliminar
          └─ espelho PCM opt-in, só dentro do browser
                → Worker Transformers.js + Whisper Small q8/WASM
                → final refinado OU fallback para o final Vosk

único final escolhido → fila limitada → ACK/retry/reconexão → Socket.IO textual
                      → autorização HOST → idempotência PostgreSQL → broadcast
```

O caminho Web Speech não é selecionado por user-agent: ele só é usado quando a implementação oferece
`available({ langs: ['pt-BR'], processLocally: true })` e confirma o idioma local. Ausência da API,
indisponibilidade local, falha de start, erro de rede ou cinco reinícios vazios transferem a captura
para o Vosk. Firefox/Zen é atendido pelo fallback por capacidades reais.

## Contrato do reconhecimento local

- Vosk usa `/models/vosk-model-small-pt-0.3.model` same-origin para texto rápido.
- Parciais são normalizadas, suprimidas quando repetidas e limitadas a uma janela de 250 ms.
- O `AudioWorklet` mantém o transporte direto quando suportado e troca para processamento compatível
  quando áudio audível não produz hipótese.
- PCM só é espelhado quando o finalizador local está ativo; não entra em estado Vue, REST ou
  Socket.IO.
- O Whisper roda em `Worker` com `@huggingface/transformers@3.7.5`, modelo
  `onnx-community/whisper-small`, `dtype: q8`, `device: wasm` e áudio preparado em 16 kHz.
- Os dois principais ONNX q8 medidos somam 249.077.005 bytes, aproximadamente 237,5 MiB; metadados,
  tokenizer e artefatos auxiliares podem aumentar o download.
- O modelo pode ser sobrescrito por `VITE_WHISPER_MODEL_ID`.
- O buffer local é limitado aos 35 segundos mais recentes. Cada final Vosk consome o buffer atual.
- O deadline de inferência é 20 segundos. Resultado vazio, erro ou timeout preserva o texto Vosk.
- Erro/timeout termina o Worker e expõe fallback; não mantém uma inferência órfã.
- `stop`, troca de dispositivo, saída da rota e unmount invalidam a geração, limpam PCM, terminam
  Worker Whisper, reconhecedor/modelo Vosk, tracks, portas, grafo de áudio, timers e Promises
  pendentes. Um load antigo não pode desmontar uma captura reiniciada.

## Transporte, idempotência e autorização

| Propriedade | Contrato validado |
|---|---|
| parcial | textual, efêmera, não persistida, throttle de 250 ms |
| final | um `clientSegmentId` por final canônico |
| ACK | timeout de 5 s |
| retry | atraso de 1 s, máximo de 3 tentativas |
| fila offline | máximo de 50 finais em memória |
| expiração | final pendente expira após 120 s |
| reconexão | flush somente depois de reentrada confirmada na sessão |
| deduplicação frontend | final normalizado repetido em até 2 s é suprimido |
| deduplicação backend | índice único por `(sessionId, clientSegmentId)` |
| publicação | somente `HOST`, validado no frontend, gateway e use case |
| encerramento/saída | cancela ACKs, retries e fila; não publica resultado tardio |

A migration `20260803233000_add_transcript_idempotency` preenche registros legados com
`legacy-<id>`, torna `clientSegmentId` obrigatório e cria o índice único composto. O repositório
Prisma trata conflito de unicidade como replay e tenta novamente a alocação de sequência quando dois
finais diferentes concorrem.

## UX honesta

A interface distingue:

- preparação/carga do modelo local com progresso;
- captura rápida local confirmada;
- modelo de precisão carregado;
- refinamento do último final;
- fallback Vosk por carga, vazio, erro ou timeout;
- erro de permissão, captura, modelo ou reconhecimento;
- fila cheia, expiração e falha de entrega.

O controle de microfone só existe para o anfitrião autorizado enquanto a reunião está `LIVE`. Não há
recomendação para trocar de navegador nem promessa de precisão universal.

## Benchmark controlado de 2026-08-03

Roteiro sintético pt-BR com 45 palavras, 20,856 s (21,036 s na reverberação), cinco condições e WER
normalizado por palavras. Resultados brutos estão em
[`../evidencias/card-06/asr-benchmark-2026-08-03.json`](../evidencias/card-06/asr-benchmark-2026-08-03.json).

| Cenário | Vosk WER | Vosk último resultado | Whisper WER | Whisper inferência |
|---|---:|---:|---:|---:|
| limpo | 2,2% | 4.294 ms | 0,0% | 12.685 ms |
| ruído rosa leve | 4,4% | 4.394 ms | 0,0% | 12.663 ms |
| ruído rosa forte | 17,8% | 5.375 ms | 0,0% | 12.635 ms |
| fala concorrente | 33,3% | 5.891 ms | 2,2% | 12.599 ms |
| reverberação | 28,9% | 6.956 ms | 4,4% | 12.591 ms |

`modelLoadMs` foi 513 ms para Vosk e 2.012 ms para Whisper em cache aquecido; não representa cold
start. O benchmark alimenta o áudio mais rápido que tempo real, portanto o tempo Vosk mede chegada do
último resultado no harness, não p95 de parcial ao vivo. A janela de emissão parcial do produto é 250
ms.

O limiar de engenharia para esta fixture controlada é WER final canônico ≤ 10% em fala limpa, ruído
leve e reverberação, sem perder o final. O Whisper passou nos três cenários e também nos dois cenários
de estresse. Esse limiar não autoriza afirmar acessibilidade universal: sotaques, nomes próprios,
microfones, salas, fala espontânea e hardware diferente exigem validação humana/full-stack no Card
11. A leitura humana anterior do Vosk teve WER aproximado de 24,4% e não é apagada pelo resultado
sintético.

## Evidência de runtime

O resumo sanitizado está em
[`../evidencias/card-06/runtime-validation-2026-08-03.json`](../evidencias/card-06/runtime-validation-2026-08-03.json).

- Brave Browser 150 / Chromium 150, artefato `dist`: captura iniciou e parou; 50 frames WebSocket
  textuais, sendo 48 parciais e um final canônico; zero frames binários, zero corpo HTTP de áudio,
  zero track viva e nenhum transcript adicional depois do stop.
- Firefox 153 com WAV entregue por fonte PulseAudio temporária: `AudioWorklet`, `mediaDevices`, WASM e
  Worker disponíveis; sem SpeechRecognition; fallback Vosk capturou e o Worker Whisper chegou a
  “Precisão local aprimorada pronta”, sem erro; captura parou e a fonte padrão foi restaurada.
- E2E Socket.IO: host e convidado entram; convidado é rejeitado em parcial/final; retry retorna replay;
  reconnect não duplica; houve um broadcast e um segmento persistido.
- PostgreSQL 16: backup custom de 25.330 bytes com SHA-256 registrado; quatro migrations em dia;
  `clientSegmentId` `NOT NULL`; zero nulos/duplicados; um índice único e uma migration Card 06
  aplicada. O executor bloqueou `DROP DATABASE` scratch, então a prova final foi read-only sobre o
  banco QA previamente respaldado.
- Gates finais: web com 22 arquivos/155 testes, build e auditoria de produção sem vulnerabilidade
  moderada ou superior; API com 15 suítes/64 testes, lint, build, Prisma validate e auditoria de
  produção sem vulnerabilidade moderada ou superior. `git diff --check` passou nos dois repositórios.

O browser baixa pesos e metadados dos modelos quando eles não estão em cache. Isso é tráfego de
modelo, não upload de áudio. A auditoria interceptou `WebSocket.send`, `fetch` e XHR antes da
inicialização da página; somente envelopes Socket.IO textuais saíram do contexto da página. O Worker
de produção não contém `fetch`, XHR, `MediaRecorder`, OpenAI, Groq ou endpoint de transcrição; recebe
PCM por `postMessage` local e executa WASM.

## Limitações explícitas

- o custo de cold start do Whisper Small pode ser alto em rede/dispositivo sem cache;
- 237,5 MiB de ONNX principal pode pressionar memória em aparelhos modestos;
- a inferência medida de cerca de 12,6 s melhora o final, mas não é legenda parcial; Vosk mantém a
  resposta rápida;
- hardware mais lento pode atingir o deadline de 20 s e receber o final Vosk;
- a fila é somente memória; reload/fechamento deliberado descarta pendências em vez de persistir áudio
  ou texto local indefinidamente;
- WER sintético não substitui testes de fala espontânea e pessoas reais;
- o Card 06 não implementa adaptação por IA, retenção automática, escala para 50 pessoas ou garantia
  de quatro horas.

## Reproduzir o benchmark

Os harnesses e fixtures versionados estão em [`../evidencias/card-06/harness/`](../evidencias/card-06/harness/).
Eles dependem das dependências do `semantia-web` e do modelo Vosk same-origin. As instruções exatas
estão no README do harness. Resultados novos devem ser salvos como outro arquivo datado; não se deve
sobrescrever a evidência de 2026-08-03 nem extrapolar os números para outros ambientes.
