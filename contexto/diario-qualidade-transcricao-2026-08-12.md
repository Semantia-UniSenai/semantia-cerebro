---
title: Diário de qualidade da transcrição
data-inicio: 2026-08-12
atualizado: 2026-08-13
status: em-execucao
plano: ../planejamento/2026-08-12-melhoria-transcricao-whisper-agente-v2.md
---

# Diário de qualidade da transcrição — 2026-08-12/13

## Objetivo autorizado

Foyth autorizou a execução do plano de melhoria do Whisper e do agente. A ordem obrigatória é medir antes de promover modelo, carregar sinais de qualidade até o backend, classificar `usable | suspect | unknown` e impedir que entrada suspeita seja enviada ao agente.

## Checkpoint e isolamento

- base API/ASR do Card 08: `9e0ba3404220be4471f35e819320bf3603ae3e12`;
- tag local anotada: `qa/asr-card08-baseline-2026-08-12`;
- worktree experimental: `/home/foyth/semantia/.worktrees/semantia-api-asr-medium`;
- branch local: `exp/asr-medium-benchmark`;
- runtime aceito preservado em sua worktree original;
- nenhuma branch/tag experimental foi enviada ao GitHub;
- nenhum PCM, MP3, token, transcript real ou credencial foi versionado.

## Slice M1.1 — harness WER

### RED

O primeiro teste importou `asr_service.evaluation.wer` e falhou com `ModuleNotFoundError`, comprovando que o contrato ainda não existia.

### GREEN

Foram implementados:

- normalização pt-BR estável, sem remover diacríticos nem converter números;
- Levenshtein com backtrace de substituições, exclusões e inserções;
- segmentação PCM16 idêntica ao produto: janelas de 5.000 ms e residual mínimo de 250 ms;
- runner HTTP usando o endpoint real e IDs determinísticos;
- relatório sem PCM/base64 e com texto somente sob flag explícita para corpus controlado;
- escrita atômica e recusa de sobrescrita;
- comparador baseline/candidato;
- um warm-up descartado, N rodadas, p50/p95 e RTF.

Commits locais do tooling:

- `606d21e` — harness comparativo de qualidade;
- `ce9b38c` — comparação candidato/baseline;
- `cc72d4e` — warm-up, percentis e RTF.

Gates no final do slice: 28 testes Python e Ruff aprovados. O tooling não altera o runtime.

## Slice M1.2 — fixture sintética controlada

A primeira tentativa via provider de voz sem locale explícito produziu reconhecimento incompatível e foi invalidada antes da comparação. Os fixtures foram regenerados com voz `pt-BR-FranciscaNeural`, convertidos para PCM16 mono/16 kHz e congelados temporariamente por hash. Isso evita atribuir ao Whisper um erro de idioma do sintetizador.

Corpus controlado usado no smoke:

- dois roteiros sintéticos, geral e Python;
- 57 palavras de referência por rodada;
- 1 warm-up descartado + 3 rodadas medidas;
- mesmos bytes, normalizador, endpoint, decoder e hardware para os dois modelos.

O áudio permaneceu em `/tmp` e não integra a evidência versionada.

## Slice M1.3 — Medium/int8

### Preload

O candidato `medium` foi iniciado isoladamente com duas CPUs, 5 GiB, duas threads, uma concorrência, `int8` e o mesmo cache de modelos. O primeiro preload demorou porque o arquivo principal foi baixado do Hugging Face sem autenticação; o container permaneceu vivo, sem OOM ou restart, e atingiu `/ready` como `faster-whisper/medium`.

### Resultado

| Métrica | Small | Medium |
|---|---:|---:|
| WER agregado | 15,79% | 15,79% |
| RTF p50 | 0,374 | 1,123 |
| RTF p95 | 0,729 | 2,477 |
| pico de memória observado | — | 2,615 GiB |
| CPU durante inferência | — | aproximadamente 200% |

No Medium, janelas completas tiveram RTF p95 `1,668`; o residual de 2.384 ms teve RTF p95 `2,477`. Ele consumiu as duas CPUs disponíveis e não acompanhou tempo real. A qualidade lexical sintética não melhorou.

### Decisão

`REJECT_OPERATIONAL`.

O Medium não foi promovido. O candidato foi parado e o Small original voltou ao endpoint `8108`; `/ready` confirmou `faster-whisper/small`. API e web continuaram saudáveis. O cache local do modelo foi mantido para possível reteste em hardware KVM 4 ou superior.

Evidência sanitizada: `../evidencias/card-08/asr-small-vs-medium-2026-08-13.json`.

## Limites honestos

- o corpus desta rodada é sintético e pequeno;
- não houve fala humana consentida;
- não houve matriz de silêncio, ruído, reverberação e concorrência;
- não houve soak de duas sessões;
- `large-v3-turbo` ainda não foi medido;
- igualdade de WER sintético não prova equivalência em usuários reais.

## Próximo slice

1. propagar `language_probability`, `avg_logprob`, `no_speech_prob`, `compression_ratio` e contagens no contrato Python;
2. criar a política `asr-input-quality-v1` no Nest;
3. persistir qualidade no mesmo insert do literal;
4. bloquear adaptação para `suspect` antes da fila/provider;
5. manter `unknown` conservador até decisão validada;
6. executar fresh/N-1, E2E Socket.IO e retenção zero.
