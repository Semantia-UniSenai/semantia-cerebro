# Experimentos de qualidade da transcrição do Card 06

> **Execução:** inline e sem agentes auxiliares. Cada hipótese usa TDD, benchmark isolado e commit próprio. Nenhum experimento altera ou reescreve os checkpoints estáveis.

**Objetivo:** testar melhorias de precisão do ASR sem aumentar perceptivelmente o atraso para a pessoa surda e promover somente as hipóteses comprovadas.

**Arquitetura:** o runtime estável continua em worktrees próprios. Os experimentos partem de tags imutáveis e usam branches separadas por hipótese; a mesma fixture PCM e o mesmo texto de referência medem baseline e candidato. Mudanças aprovadas são cherry-picked para uma branch de integração experimental; mudanças rejeitadas permanecem apenas como evidência.

**Stack:** Vue 3, Web Audio/AudioWorklet, Vitest, Socket.IO, NestJS, FastAPI, faster-whisper 1.2.1, CPU/int8, pytest e Docker KVM 4 equivalente.

## Restrições globais

- Sem Vosk, Web Speech, Whisper/Transformers.js ou qualquer ASR no navegador.
- Sem VAD no frontend e sem `vad_filter` no faster-whisper.
- Hotwords vazias por padrão; não usar blacklist textual nem prompt técnico.
- Captura explícita pelo anfitrião; áudio PCM16 mono/16 kHz estritamente efêmero.
- Uma inferência concorrente; `small`, CPU/int8; CPUs lógicas `0-3` no perfil KVM 4 local.
- Não armazenar áudio em repositório, banco, volume, browser storage ou logs.
- TTS serve apenas como regressão determinística; promoção final exige nova leitura humana pt-BR.
- Não aumentar a duração padrão para 8 s. A comparação de duração será somente 4 s versus 5 s.
- Não promover candidato cujo p95 de inferência piore mais de 10% sem redução semanticamente relevante de erros.
- Não promover candidato que aumente inserções, duplique finais, perca idempotência ou mude o sentido do texto literal.
- PR aberto mantém o card em revisão; sem merge ou auto-merge.

## Checkpoint estável

| Repositório | Ref imutável | Commit | Estado |
|---|---|---|---|
| `semantia-api` | `card06-transcription-stable-2026-08-06` | `e64231989fc90e1134a6304114b8909cae8b372d` | PR #9 aberto; ASR sem hotwords padrão |
| `semantia-web` | `card06-transcription-stable-2026-08-06` | `613f81382df35349f0fdf48a813da522a385c2bb` | captura PCM fixa de 5 s, sem ASR/VAD |
| `semantia-cerebro` | branch deste plano | `origin/main` em `9c7852d3d27450ec27ab4566c0adc56515a202da` antes do registro | documentação integrada do Card 06 |

O rollback operacional é recriar API/ASR e web a partir das duas tags acima. Os branches `dev` atuais contêm trabalhos posteriores e não serão resetados para esses commits.

## Critérios e métricas

Para cada variante registrar:

- texto esperado e texto reconhecido;
- substituições, deleções, inserções e WER normalizado;
- erros semânticos e erros de fronteira em coluna própria;
- duração da janela, bytes e número de chamadas;
- p50/p95, RTF, CPU/RSS e fila/rejeições;
- tempo browser para resample/encode;
- ausência de hotwords espúrias em silêncio e ruído baixo;
- zero arquivo/volume/coluna/log de áudio;
- resultado `promover`, `rejeitar` ou `inconclusivo` com motivo.

## Task 1 — Harness reproduzível e baseline de 5 s

**Arquivos:**
- Criar: `semantia-api/asr-service/scripts/benchmark_quality.py`
- Criar: `semantia-api/asr-service/tests/test_quality_metrics.py`
- Criar: `semantia-api/asr-service/tests/test_quality_benchmark.py`
- Criar: `semantia-cerebro/evidencias/card-06/qualidade-asr-experimentos-2026-08-06.json`

**Interface:**

```python
def normalize_words(text: str) -> list[str]: ...
def word_error_counts(reference: str, hypothesis: str) -> dict[str, int | float]: ...
def split_pcm16(pcm16: bytes, sample_rate: int, window_ms: int, overlap_ms: int = 0) -> list[bytes]: ...
```

- [ ] Escrever RED para normalização, distância de edição e cortes de 4/5 s.
- [ ] Executar os testes focais e confirmar falha pela ausência das funções.
- [ ] Implementar somente as funções necessárias e confirmar GREEN.
- [ ] Gerar uma fixture pt-BR sintética descartável fora do repositório, converter para PCM16/16 kHz e executar sempre os mesmos bytes.
- [ ] Medir o baseline `small/int8`, 3 threads, janela de 5 s, sem overlap, hotwords vazias e provider atual.
- [ ] Remover a fixture e preservar apenas texto/métricas sem conteúdo de áudio.
- [ ] Commitar harness e evidência sem selecionar vencedor.

## Task 2 — Reamostragem de maior qualidade

**Arquivos:**
- Criar: `semantia-web/src/live/resamplePcm.ts`
- Criar: `semantia-web/src/live/resamplePcm.spec.ts`
- Modificar: `semantia-web/src/live/useBackendAudioFinalizer.ts`
- Modificar: `semantia-web/src/live/useBackendAudioFinalizer.spec.ts`

**Interface:**

```ts
export function resamplePcm(
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number,
): Float32Array
```

- [ ] Escrever RED para frame count, identidade, finitude, preservação de tom em banda e atenuação acima de Nyquist.
- [ ] Confirmar que o algoritmo atual de média simples falha no gate de aliasing.
- [ ] Implementar FIR windowed-sinc curto e determinístico, sem dependência nova e sem arquivos/Blob.
- [ ] Integrar no finalizador preservando contrato PCM16/16 kHz e duração.
- [ ] Medir custo no navegador por janela e comparar WER usando exatamente a mesma fixture 48 kHz.
- [ ] Rejeitar se o custo bloquear AudioWorklet/UI ou se WER/erros semânticos não melhorarem.
- [ ] Commitar o experimento isolado.

## Task 3 — Perfis de processamento do microfone

**Arquivos:**
- Modificar: `semantia-web/src/live/useAudioInputDevices.ts`
- Modificar: `semantia-web/src/live/useAudioInputDevices.spec.ts`
- Modificar: `semantia-web/src/components/live/MicControl.vue`
- Modificar: `semantia-web/src/components/live/MicControl.spec.ts`

**Interface:**

```ts
export type AudioProcessingProfile = 'meeting' | 'close-mic'
export function buildAudioConstraints(
  deviceId: string | null,
  profile?: AudioProcessingProfile,
): MediaTrackConstraints
```

- [ ] Escrever RED garantindo que `meeting` preserve echo cancellation, noise suppression e AGC atuais.
- [ ] Escrever RED para `close-mic` desligar os três processamentos e preservar `deviceId`/mono.
- [ ] Implementar seleção experimental com rótulos humanos e default `meeting`; não prometer que um perfil é universalmente melhor.
- [ ] Provar mudança das constraints reais em fake `getUserMedia`, troca de device, cleanup e persistência apenas da preferência não sensível.
- [ ] Comparar ambos no mesmo microfone/roteiro em Chromium e Firefox; tratar resultado sem áudio humano pareado como inconclusivo.
- [ ] Commitar o experimento isolado; não promover UI se não houver benefício humano.

## Task 4 — Decoder determinístico e thresholds

**Arquivos:**
- Modificar: `semantia-api/asr-service/asr_service/config.py`
- Modificar: `semantia-api/asr-service/asr_service/providers/faster_whisper.py`
- Modificar: `semantia-api/asr-service/tests/test_config.py`
- Modificar: `semantia-api/asr-service/tests/test_faster_whisper_provider.py`

**Interface:**

```python
@dataclass(frozen=True, slots=True)
class DecoderSettings:
    temperature: float
    log_prob_threshold: float
    no_speech_threshold: float
```

- [ ] RED para parser finito e bounds de `ASR_TEMPERATURE`, `ASR_LOG_PROB_THRESHOLD` e `ASR_NO_SPEECH_THRESHOLD`.
- [ ] RED para provider passar parâmetros explícitos sem `vad_filter`, hotwords padrão ou previous-text conditioning.
- [ ] Implementar parâmetros opt-in preservando o baseline quando env estiver ausente.
- [ ] Comparar baseline, `temperature=0` e uma única variante conservadora; uma variável por execução.
- [ ] Rodar silêncio, ruído baixo e fala sintética, depois a leitura humana.
- [ ] Rejeitar variante que aumente deleções de fala baixa, WER ou p95 acima do gate.
- [ ] Commitar o experimento isolado.

## Task 5 — Overlap acústico pequeno e reconciliação

**Arquivos:**
- Modificar: `semantia-web/src/live/useBackendAudioFinalizer.ts`
- Modificar: `semantia-web/src/live/useBackendAudioFinalizer.spec.ts`
- Modificar: `semantia-api/src/modules/asr/usecases/transcribe-audio-segment.usecase.ts`
- Modificar: `semantia-api/src/modules/asr/usecases/transcribe-audio-segment.usecase.spec.ts`

**Interface experimental:**

```ts
interface UseBackendAudioFinalizerOptions {
  publish: (segment: BackendAudioSegment) => Promise<PublishResult>
  segmentSeconds?: number
  overlapMs?: number
}
```

```ts
function removeExactOverlap(previousText: string, currentText: string): string
```

- [ ] RED para a primeira janela não ter prefixo, janelas seguintes conterem somente a cauda configurada e residual/cleanup não reterem áudio.
- [ ] RED para reconciliar apenas tokens completos exatamente iguais, sem fuzzy matching, sem apagar repetições legítimas fora da fronteira e sem editar segmento já publicado.
- [ ] Implementar candidato de 300 ms sem atrasar o fechamento de 5 s.
- [ ] Provar idempotência, ACK/retry, uma linha/broadcast por segmento e zero retenção.
- [ ] Comparar erros de palavra cortada e duplicações no corpus.
- [ ] Rejeitar se fragmentos anteriores permanecerem ou se reconciliação ameaçar literalidade.
- [ ] Commitar o experimento isolado.

## Task 6 — Comparação de janela de 4 s versus 5 s

**Arquivos:**
- Modificar somente testes/harness se `segmentSeconds` existente for suficiente.
- Modificar produção apenas se uma configuração experimental explícita for necessária.

- [ ] Usar os mesmos bytes e o mesmo decoder vencedor ou baseline; não combinar mudança de janela com outra variável ainda não decidida.
- [ ] Medir WER, fronteiras, número de chamadas, p50/p95, RTF e fila para 4 s e 5 s.
- [ ] Preservar 5 s como default durante o experimento.
- [ ] Promover 4 s somente se reduzir atraso sem piorar erros semânticos, fronteiras ou backlog.
- [ ] Registrar 8 s como rejeitado por decisão de produto devido ao aumento de latência percebida.

## Task 7 — Integração somente dos vencedores

**Arquivos:**
- Atualizar os testes e documentos tocados pelos experimentos aprovados.
- Atualizar este plano, ADR-002, diário e evidência JSON com resultados reais.

- [ ] Classificar cada hipótese como promover/rejeitar/inconclusiva.
- [ ] Cherry-pick somente commits promovidos para branches de integração experimental baseadas nos checkpoints.
- [ ] Rodar web completo: Vitest, typecheck, build, audit e diff check.
- [ ] Rodar API completo: Jest, lint, build, Prisma validate, audit e diff check.
- [ ] Rodar Python completo: Ruff, format, pip check, pytest com warnings como erro e imagem Docker.
- [ ] Executar smoke host → Socket.IO → Nest → ASR → banco → broadcast e replay idempotente.
- [ ] Inspecionar filesystem, volumes, browser storage, banco e logs para zero PCM.
- [ ] Submeter a branch candidata à nova leitura humana; não usar TTS como aceite.
- [ ] Abrir/atualizar PRs para revisão sem merge automático.

## Rollback

1. Não resetar `dev`, `main` ou branches de outros trabalhos.
2. Parar somente o runtime experimental pelo `COMPOSE_PROJECT_NAME` próprio.
3. Recriar web e API/ASR a partir das tags `card06-transcription-stable-2026-08-06`.
4. Aguardar ASR `/ready`, API `/api/health`, frontend HTTP e Socket.IO.
5. Executar smoke idempotente e confirmar ausência de PCM persistido.
6. Registrar qual hipótese foi rejeitada e por quê; não apagar a evidência.
