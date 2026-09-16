---
id: ADR-005
status: aceita
proposta: 2026-08-12
decisores: [Foyth]
relaciona: [ADR-001, ADR-004]
---

# ADR-005 — qualidade de entrada ASR e promoção de modelo por evidência

## Contexto

Um incidente real de aula produziu uma janela nominal de cinco segundos com 51 palavras e texto sem relação confiável com a fala. O áudio foi descartado corretamente pela retenção zero, portanto o incidente comprova uma saída suspeita, mas não permite calcular WER nem atribuir causalidade a microfone, ruído, janela, decoder ou modelo.

O worker atual usa `faster-whisper small`, CPU, `int8`, `beam_size=5`, duas threads, uma inferência concorrente, janelas contíguas de cinco segundos, residual mínimo de 250 ms, sem VAD, hotwords ou contexto textual anterior. `medium` e `large-v3-turbo` são challengers possíveis, mas modelos maiores podem trocar erro lexical por fila e atraso em CPU.

## Decisão

1. O baseline aceito permanece `small/cpu/int8/beam=5/5s/no-hotwords` até um challenger passar todos os gates pré-registrados.
2. Cada hipótese parte do mesmo checkpoint e altera uma variável por vez.
3. A comparação usa os mesmos bytes PCM16 mono/16 kHz, referência, normalizador, endpoint, janela, hardware, threads e concorrência.
4. Cada rodada descarta um warm-up e mede pelo menos três execuções, com WER, substituições, exclusões, inserções, p50/p95, RTF, CPU, memória, janelas completas e residual.
5. TTS sintético é somente regressão reproduzível. Promoção exige corpus humano pt-BR consentido e pareado.
6. Relatórios não armazenam PCM/base64. Áudio temporário é removido após destilação das métricas.
7. `medium` e `large-v3-turbo` são challengers, nunca defaults por intuição.
8. Hotwords, VAD e LLM corretor não serão usados como remendo de uma saída corrompida.
9. Sinais não textuais do Whisper devem atravessar worker, API, persistência e realtime para classificar a entrada como `usable | suspect | unknown`.
10. Entrada `suspect` preserva o literal, recebe indicação explícita e não chama o provider de adaptação.
11. Um experimento rejeitado permanece local; somente tooling seguro ou candidato vencedor pode ser publicado, após autorização explícita.

## Gates de promoção

Um challenger só substitui o baseline quando cumprir simultaneamente:

- redução relativa de WER de pelo menos 10% no corpus humano pareado;
- intervalo bootstrap de 95% inteiramente favorável;
- nenhuma condição acústica com piora absoluta superior a dois pontos percentuais;
- nenhum aumento de erro semântico crítico;
- zero termo/frase não falada em silêncio e ruído;
- `RTF p95 <= 0,80` no envelope KVM 4 e `<= 1,00` no KVM 2;
- pico RSS `<= 4 GiB` no KVM 4;
- fila, ACK, retry, idempotência, ordenação, drain e retenção zero sem regressão.

## Experimento `medium` — 2026-08-12

### Isolamento

- checkpoint API/ASR: `9e0ba3404220be4471f35e819320bf3603ae3e12`;
- tag local anotada: `qa/asr-card08-baseline-2026-08-12`;
- branch/worktree local: `exp/asr-medium-benchmark`;
- nenhum ref experimental publicado remotamente;
- mesma imagem ASR, volume de modelos, endpoint, duas CPUs, `int8`, duas threads, uma concorrência e `beam_size=5`;
- Small com limite de 3 GiB; Medium com limite experimental de 5 GiB;
- corpus sintético pt-BR controlado: dois fixtures, 57 palavras por rodada, três rodadas medidas e uma de warm-up.

### Resultado pareado

| Métrica | Small | Medium |
|---|---:|---:|
| WER agregado | 15,79% | 15,79% |
| substituições/exclusões/inserções | 15 / 6 / 6 | 9 / 9 / 9 |
| RTF p50 | 0,374 | 1,123 |
| RTF p95 | 0,729 | 2,477 |
| RTF p95 das janelas completas do Medium | — | 1,668 |
| RTF p95 do residual de 2.384 ms do Medium | — | 2,477 |
| pico de memória observado do Medium | — | 2,615 GiB |
| CPU observada do Medium durante inferência | — | aproximadamente 200% |
| OOM/restart | não | não |

O Medium carregou e respondeu corretamente, mas não reduziu WER no corpus sintético e excedeu tempo real tanto nas janelas completas quanto no residual. O p95 foi aproximadamente 3,4 vezes o Small.

### Decisão do experimento

`REJECT_OPERATIONAL`.

O Medium não foi promovido nem deixado no runtime. O container candidato foi encerrado e o Small original voltou ao endpoint `8108`, com `/ready` confirmando `faster-whisper/small`. O modelo Medium permanece apenas no cache local para eventual reteste em KVM 4 ou hardware superior.

## Consequências

### Positivas

- evita disponibilizar ao usuário uma legenda que acumularia atraso;
- preserva rollback imediato e estabilidade do runtime atual;
- cria harness reproduzível independente do modelo;
- separa evidência sintética de aceitação humana;
- permite seguir para o gate de qualidade da entrada sem depender de trocar o modelo.

### Custos e limites

- o corpus atual tem somente dois fixtures sintéticos;
- equivalência de WER não prova equivalência em fala humana, ruído ou reverberação;
- `large-v3-turbo` ainda não foi medido;
- throughput de duas sessões, fila e KVM 4 permanecem pendentes;
- o harness precisa evoluir para manifest privado fail-closed, condições degradadas e protocolo humano.

## Reavaliação

Reavaliar o Medium somente com uma destas mudanças isoladas:

- hardware KVM 4/CPU mais rápido;
- corpus humano consentido e pareado disponível;
- backend com aceleração aprovada;
- nova versão do runtime que altere materialmente o desempenho.

Não reavaliar junto com decoder, janela, VAD, hotwords ou contexto; cada variável requer sua própria hipótese.
