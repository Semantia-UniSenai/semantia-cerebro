---
id: ADR-001
status: aceita-complementada-por-ADR-002
atualizado: 2026-08-04
decisores: [Foyth]
---

# ADR-001 — ASR backend CPU-first com áudio efêmero

## Contexto

O Card 06 implementou Vosk e Whisper Small no navegador para preservar áudio local. O teste humano de 2026-08-04 mostrou degradação severa e indícios de fallback Vosk após carga/timeout. O produto será hospedado em VPS CPU-only equivalente a KVM 2/KVM 4, com 2–4 vCPU e 8–16 GB RAM. Foyth autorizou explicitamente o envio do áudio ao backend para transcrição.

## Decisão

1. O navegador não executa ASR nem VAD: captura PCM enquanto o anfitrião mantém a transcrição explicitamente ligada, fecha janelas contíguas de 5 segundos e envia o residual ao parar.
2. O final literal canônico será produzido exclusivamente no backend.
3. O frontend enviará segmentos PCM mono 16 kHz/16-bit por Socket.IO autenticado, identificados por `clientSegmentId`.
4. A API NestJS valida identidade, papel, sessão, limites e idempotência; ela não executa ML no event loop.
5. Um serviço Python interno fornece o contrato ASR e usa `faster-whisper small`, CPU, `int8`, uma inferência concorrente por worker.
6. O áudio permanece somente em memória e é descartado após processamento; retenção padrão zero.
7. Provedores cloud serão adapters opcionais e opt-in. Não haverá fallback silencioso.
8. A futura LLM/agente será um serviço separado e consumirá texto final, não áudio bruto.

## Por que `small`, não `large-v3-turbo`

`large-v3-turbo` é adequado a GPU, mas não é o default responsável em uma VPS compartilhada de 2–4 vCPU. `small` int8 oferece compromisso melhor entre português, memória, tempo de cold start e concorrência limitada. O provider/modelo permanecem configuráveis para benchmark futuro.

## Alternativas rejeitadas nesta etapa

- **Whisper no navegador:** download e memória altos, timeout dependente do dispositivo e inconsistência cross-browser.
- **LLM de áudio:** mais pesada e menos previsível que ASR especializado.
- **Whisper Turbo CPU como padrão:** risco de latência/backlog em 2–4 vCPU.
- **Cloud-only:** custo por minuto, lock-in e nova fronteira LGPD sem necessidade para o default.
- **Áudio persistido para retry:** amplia risco de privacidade; retry permanece limitado à memória do navegador.

## Consequências

### Positivas

- final consistente entre navegadores;
- modelo e otimizações centralizados;
- melhor observabilidade por segmento;
- operação possível sem GPU;
- evolução para cloud/novo modelo sem reescrever o frontend.

### Custos e riscos

- áudio passa pela rede e exige revisão do aviso de privacidade;
- CPU limita reuniões simultâneas;
- uma queda/reload pode descartar áudio ainda não aceito;
- o modelo precisa ser aquecido e cacheado no deploy;
- escala horizontal futura exige coordenação distribuída além da instância única.

## Guardas obrigatórias

- TLS em produção;
- ASR não exposto diretamente à internet;
- o frontend não contém engine, modelo ou fallback de ASR e não faz VAD;
- o gateway não expõe eventos para texto parcial/final fornecido pelo cliente;
- somente HOST em sessão LIVE envia PCM em janelas fixas;
- fila/bytes/duração limitados;
- logs sem áudio e sem texto;
- idempotência por `clientSegmentId`;
- nenhuma credencial cloud no cliente, banco ou documentação;
- somente o ASR interno pode originar texto final canônico.

## Reavaliação

Reavaliar modelo e infraestrutura após benchmark com o áudio real pt-BR em KVM 2 e KVM 4. Parakeet e Deepgram podem entrar como challengers, mas não alteram este contrato de provider.

## Evidência de validação local — 2026-08-04

- imagem Docker construída e executada como UID/GID `10001`, com `/ready` em `faster-whisper/small`;
- smoke Brave real: `getUserMedia` sintético → AudioWorklet/Vosk → PCM16 → Socket.IO → NestJS → FastAPI → Prisma → final visível;
- final controlado exato: “Semantia conecta pessoas por meio de comunicação acessível em tempo real.”;
- KVM 2 emulado: RTF p95 `0,505`, pico `814,1 MiB`;
- KVM 4 emulado: RTF p95 `0,387`, pico `822,1 MiB`;
- replay do mesmo `clientSegmentId` não reinferiu nem duplicou o final;
- nenhuma extensão de áudio encontrada em `/app`, `/tmp` ou `/models`; banco sem coluna binária;
- o WER comparável da fala humana permanece para a nova leitura do roteiro, porque a gravação anterior não foi localizada. Nenhum valor substituto foi fabricado.

Os números locais mantêm a decisão `small/int8`, uma inferência e backpressure. A decisão será reavaliada após a leitura humana e um soak no plano Hostinger real.
