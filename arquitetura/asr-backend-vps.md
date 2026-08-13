---
title: ASR backend CPU-first — operação em VPS
status: validado-humanamente-estavel-em-revisao
atualizado: 2026-08-13
adr: ./decisoes/ADR-001-asr-backend-cpu-first.md
---

# ASR backend CPU-first — operação em VPS

## Topologia

```text
Internet/TLS
  → reverse proxy
  → web estática
  → API NestJS + Socket.IO /live
       ├─ PostgreSQL
       └─ rede privada → semantia-asr:8000
                         └─ volume de cache do modelo
```

O navegador nunca acessa a porta Python diretamente. A API recebe PCM no Socket.IO autenticado, aplica autorização/idempotência e chama o ASR pela rede privada.

## Perfil padrão

| Item | Valor |
|---|---|
| provider | `faster-whisper` |
| modelo | `small` |
| device | `cpu` |
| compute | `int8` |
| concorrência | 1 inferência |
| fila ASR | 4 requests |
| fila por sessão/API | 8 segmentos |
| fila no navegador | 8 segmentos, TTL 60 s |
| segmento recebido | janela fixa de 5000 ms; residual de 250–5000 ms no stop |
| segmentação | controle explícito + contagem de frames, sem ASR/VAD no cliente |
| decoder | hotwords vazias; `condition_on_previous_text=False`; `beam_size=5` |
| PCM máximo | 960000 bytes |
| Socket.IO máximo | 1100000 bytes |
| retenção de áudio | zero |

## KVM 2 — 2 vCPU / 8 GB RAM

Configuração inicial conservadora:

```dotenv
ASR_MODEL=small
ASR_DEVICE=cpu
ASR_COMPUTE_TYPE=int8
ASR_CPU_THREADS=2
ASR_MAX_CONCURRENCY=1
ASR_MAX_QUEUE=2
ASR_HOTWORDS=
```

API, PostgreSQL e ASR podem compartilhar o host apenas no MVP de baixo volume. Não prometer mais de uma reunião com fala ativa sem medir RTF, p95 e memória no plano real da Hostinger.

## KVM 4 — 4 vCPU / 16 GB RAM

Configuração inicial:

```dotenv
ASR_MODEL=small
ASR_DEVICE=cpu
ASR_COMPUTE_TYPE=int8
ASR_CPU_THREADS=3
ASR_MAX_CONCURRENCY=1
ASR_MAX_QUEUE=4
ASR_HOTWORDS=
```

Manter uma inferência concorrente até o benchmark provar que duas não pioram p95, RTF e disponibilidade da API. O quarto vCPU fica como margem para Node/PostgreSQL/sistema.

## Benchmark local com limites Docker — 2026-08-04

O benchmark abaixo usa uma fala pt-BR sintética controlada de 5,112 s e o mesmo container `small/int8`. Ele comprova funcionamento e orienta o rollout, mas **não equivale a um soak na Hostinger nem ao WER da voz humana de Foyth**.

| Perfil emulado | Threads | p50 | p95 | RTF p50 | RTF p95 | Pico de memória |
|---|---:|---:|---:|---:|---:|---:|
| KVM 2, 2 vCPU/3 GiB para ASR | 2 | 2085 ms | 2581 ms | 0,408 | 0,505 | 814,1 MiB |
| KVM 4, 4 vCPU/4 GiB para ASR | 3 | 1716 ms | 1978 ms | 0,336 | 0,387 | 822,1 MiB |

- dez de dez requisições sequenciais passaram em cada perfil;
- três requisições simultâneas foram serializadas e concluídas;
- no perfil KVM 2, seis requisições simultâneas com capacidade total cinco produziram cinco `200` e um `429 QUEUE_FULL` explícito;
- o cold start inicial, incluindo download e load do modelo, ficou ready após 110,04 s; restarts com volume aquecido foram muito menores;
- a amostra controlada teve WER `0%` (11 palavras), mas isso não substitui a leitura humana do roteiro;
- evidência: `../evidencias/card-06/asr-backend-benchmark-2026-08-04.json`.

O rollout KVM 2 continua com fila recomendada `2`, mais conservadora que a fila `4` usada para testar o limite. KVM 4 pode iniciar com fila `4`. Em ambos, manter uma inferência por processo.

## Challenger Medium no KVM 2 emulado — 2026-08-13

O `medium/int8` foi baixado, carregado e medido no mesmo endpoint, com duas CPUs, duas threads,
uma inferência concorrente, `beam_size=5`, janelas de 5 s, sem hotwords e sem VAD. O teste usou dois
fixtures sintéticos pt-BR controlados, um warm-up descartado e três rodadas medidas. TTS é somente
regressão; não substitui o corpus humano pareado.

| Modelo | WER sintético | RTF p50 | RTF p95 | Pico observado |
|---|---:|---:|---:|---:|
| `small` | 15,79% | 0,374 | 0,729 | não medido nesta rodada |
| `medium` | 15,79% | 1,123 | 2,477 | 2,615 GiB |

O Medium não reduziu WER e excedeu tempo real. Em janelas completas, o RTF p95 foi `1,668`; no
residual de 2.384 ms, `2,477`. A decisão foi `REJECT_OPERATIONAL`: o container candidato foi parado,
o Small voltou a `/ready` e o default não mudou. Detalhes e limites estão na
[ADR-005](decisoes/ADR-005-qualidade-entrada-asr-e-promocao-modelo.md) e na
[evidência sanitizada](../evidencias/card-08/asr-small-vs-medium-2026-08-13.json).

## Decoder neutro e checkpoint estável — 2026-08-06

`ASR_HOTWORDS` é vazio por padrão. Hotwords são viés de decoder, não dicionário inofensivo: o valor
técnico antigo podia transformar silêncio, ruído ou fala ambígua em termos do projeto que não foram
ditos. O PR API #9 removeu esse default e preservou o opt-in exclusivamente para benchmark com áudio
alvo. O runtime verificado retornou vazio para silêncio com hotwords vazias.

O checkpoint operacional imutável é a tag `card06-transcription-stable-2026-08-06`:

- API/ASR: `e64231989fc90e1134a6304114b8909cae8b372d`;
- web: `613f81382df35349f0fdf48a813da522a385c2bb`.

Rollback significa recriar cada componente pela própria tag, nunca resetar branches canônicas. Após
recriar, verificar `/ready`, `/api/health`, frontend HTTP, autorização `HOST`/`LIVE`, uma persistência e
um broadcast para o mesmo `clientSegmentId`, replay sem duplicação e zero áudio no filesystem/banco.

## Deploy

O `docker-compose.yml` do repositório é de desenvolvimento e expõe ASR somente em `127.0.0.1:8000`. Em produção:

1. remover o mapeamento `ports` do serviço `asr`;
2. manter `api` e `asr` na mesma rede privada;
3. montar `asr_models:/models` para evitar novo download a cada restart;
4. usar secret/env para JWT e qualquer credencial futura;
5. aplicar TLS no reverse proxy;
6. configurar limite de upgrade/WebSocket maior que 1,1 MB, porém sem liberar body ilimitado;
7. iniciar ASR antes de liberar tráfego e aguardar `GET /ready`;
8. aplicar migrations e iniciar a API;
9. executar smoke host/convidado/replay;
10. confirmar que nenhum arquivo WAV/PCM apareceu em volumes, banco ou logs.

Comandos locais equivalentes, com portas ajustáveis para não colidir com outros projetos:

```bash
docker compose build asr
COMPOSE_PROJECT_NAME=semantia-card06 POSTGRES_PORT=55435 ASR_PORT=8000 \
  docker compose up -d postgres asr
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:8000/ready
pnpm prisma:generate
pnpm db:deploy
pnpm start:dev
```

## Observabilidade permitida

Registrar somente:

- `clientSegmentId`/request id;
- quantidade de bytes e duração;
- estado da fila;
- engine/modelo;
- tempo de inferência e tempo total;
- classe/código de erro.

Nunca registrar samples, base64, texto reconhecido, hotwords sensíveis ou paths internos. Métricas futuras: RTF, p50/p95/p99, rejeições `ASR_BUSY`, fila, RSS, CPU e throughput por minuto.

## Falha e backpressure

- payload inválido é rejeitado antes do ASR;
- cliente mantém no máximo oito segmentos por 60 s, inclusive se permanecer offline sem reconectar;
- API mantém no máximo oito trabalhos por sessão;
- worker aceita somente fila limitada;
- `ASR_BUSY`, timeout e indisponibilidade são retryable até três tentativas com o mesmo id;
- falha definitiva remove o áudio da memória e fica visível;
- resultado vazio é no-speech bem-sucedido, não cria transcript e mantém replay idempotente em cache
  efêmero por 120 s;
- não existe ASR/VAD/fallback textual no navegador;
- sessão encerrada limpa fila e impede novas inferências.

A coordenação é em memória e atende uma instância de API. Escala horizontal futura exige fila/lock distribuído ou job persistido sem persistir o áudio bruto.

## Privacidade e LGPD

Áudio é dado transitório para execução do serviço e tem retenção zero por padrão. A interface informa que segmentos são enviados e descartados. O teste isolado do microfone não envia áudio. Qualquer retenção futura exige finalidade, base legal, consentimento quando aplicável, política, prazo, exclusão e novo ADR.

## Provider cloud

O contrato aceita evolução por adapter, mas nenhum provider cloud está implementado ou habilitado. Deepgram/alternativa só entra após:

- benchmark com o mesmo áudio pt-BR;
- avaliação de custo/minuto, região, DPA e retenção;
- configuração exclusivamente por env no backend;
- consentimento/política por tenant;
- proibição de fallback silencioso.

## Futuro agente

O agente/LLM consome eventos de transcript final. Ele deve rodar separado do ASR, preservar o literal e registrar qualquer versão corrigida/adaptada como derivada. Em 2–4 vCPU, não hospedar ASR e uma LLM relevante concorrendo sem benchmark e isolamento.

## Gate de promoção

Promover modelo/configuração somente quando o mesmo corpus medir:

- WER por categoria e global;
- p50/p95 e RTF;
- CPU/RSS/pico de memória;
- uma e duas sessões concorrentes;
- fila/rejeições;
- custo mensal/minuto;
- zero duplicação e zero retenção de áudio.
