# Melhoria da transcrição Whisper e do agente de adaptação — Plano de Implementação

> **Para execução no workflow Semantia:** executar este plano tarefa por tarefa, inline e sem agentes auxiliares. Cada mudança de comportamento segue RED → GREEN → revisão determinística em duas passagens → gate completo. Experimentos rejeitados permanecem locais; somente tooling seguro e candidatos promovidos podem ser publicados, após autorização explícita.

**Objetivo:** aumentar a fidelidade do transcript literal produzido pelo Whisper e a segurança/utilidade do português adaptado, sem permitir que a IA esconda erros do ASR, sem enfraquecer a retenção zero e sem alegar benefício para pessoas surdas antes de validação humana.

**Arquitetura:** manter quatro fronteiras independentes: captura PCM efêmera, ASR literal, classificação de qualidade da entrada e adaptação textual derivada. O literal continua soberano e é publicado primeiro. O agente `pt-br-accessible-v2` só processa segmentos classificados como utilizáveis; risco, ambiguidade ou preservação não comprovada materializam o literal com estado explícito. Modelo Whisper, decoder e janela são promovidos apenas por benchmark pareado no mesmo áudio e hardware.

**Tech Stack:** Vue 3/Vitest, Socket.IO, NestJS/Jest, Prisma/PostgreSQL 16, FastAPI/Python 3.11/Pytest, `faster-whisper==1.2.1`, Docker Compose, Groq com Structured Outputs, Zod 4.

## Resumo executivo

O trabalho será executado em cinco marcos independentes:

1. **M1 — Medição reproduzível:** harness de ASR, corpus sintético e fala humana consentida, baseline congelado e relatório sem áudio.
2. **M2 — Qualidade observável:** sinais do Whisper atravessam Python → Nest → banco → Socket.IO; política versionada classifica `usable | suspect | unknown`.
3. **M3 — ASR promovido por evidência:** comparação pareada de `small`, `medium` e `large-v3-turbo`; decoder e janela só entram depois, uma variável por experimento.
4. **M4 — Agente v2 fail-closed:** novo prompt/schema, contexto por preferências, snapshot correto, risco não nulo bloqueado, entrada suspeita sem chamada externa e guardas relacionais conservadoras.
5. **M5 — Produto verificável:** participante escolhe literal/adaptado/ambos; estados de fallback e transcrição incerta são visíveis; E2E, privacidade, carga e avaliação participativa fecham a promoção.

Nenhum marco depende de “corrigir” o incidente anterior: o áudio daquela reunião foi descartado corretamente. A reprodução usará exclusivamente material novo, consentido e controlado.

---

## Restrições globais

1. Não usar LLM como reconhecedor literal nem como corretor silencioso do Whisper.
2. Não enviar áudio, PCM, ASR bruto/parcial, JWT, identidade, prompt completo ou transcript real de reunião para a Groq.
3. QA externo usa somente conteúdo sintético. Fala humana consentida é usada localmente no benchmark de ASR e destruída após a destilação das métricas.
4. O literal é persistido e emitido antes da adaptação. `TranscriptSegment.text` nunca é sobrescrito.
5. Entrada classificada como suspeita permanece literal, recebe estado explícito e não chama o provider de adaptação.
6. `pt-br-accessible-v1` permanece imutável. A pesquisa entra somente em `pt-br-accessible-v2`.
7. Todo `risk !== 'none'` resulta em literal/fallback/bypass.
8. Sem fallback Groq → outro fornecedor.
9. No máximo um retry para erro transitório, dentro de um deadline total.
10. Idade cronológica, diagnóstico ou uso de Libras não controlam intensidade, léxico ou tom.
11. Termos técnicos são preservados. Explicação só vem de glossário aprovado e versionado.
12. Não usar hotwords por padrão. Hotwords de Python não entram como remendo do incidente.
13. Não introduzir VAD no fluxo canônico neste plano.
14. Retenção de áudio continua zero no produto. Fixtures de benchmark vivem apenas em diretório temporário/ignorado e são removidas depois da matriz.
15. Experimentos alteram uma variável por vez, sempre contra baseline adjacente no mesmo hardware.
16. Resultado aceitável de um experimento pode ser “nenhum vencedor; manter `small`”.
17. Nenhum merge automático. PR aberto continua `EM REVISÃO`.
18. API, web e cérebro permanecem em worktrees/branches separadas e empilhadas sobre os heads corretos enquanto os PRs-base estiverem abertos.
19. Nenhuma alegação de “pronto para pessoas surdas”, “sempre mais claro” ou “robusto” sem avaliação participativa.
20. A aplicação não é tradução para Libras e não substitui intérprete humano.

---

## Estado de partida confirmado em 2026-08-12

### ASR

- worker: `faster-whisper`;
- baseline: `small`, CPU, `int8`, `beam_size=5`;
- `condition_on_previous_text=false`;
- hotwords vazias no runtime real;
- uma inferência concorrente;
- janelas contíguas de 5 s e residual mínimo de 250 ms;
- resposta atual: `text`, `engine`, `model`, `inferenceMs`;
- sem `avg_logprob`, `no_speech_prob`, `compression_ratio`, probabilidade de língua ou classificação de qualidade;
- nenhum áudio retido após inferência.

### Adaptação

- prompt ativo: `pt-br-accessible-v1`;
- provider: Groq, modelo baseline `openai/gpt-oss-20b`;
- schema: `adaptedText`, `decision`, `risk`;
- riscos aceitos pelo schema: `none | urgent | ambiguous | preservation-risk`;
- somente `urgent` dispara bypass no caso de uso atual;
- guardas atuais são majoritariamente lexicais;
- contexto é carregado pelo coordenador quando a tarefa assíncrona começa, abrindo corrida temporal;
- o corpus sintético atual tem 100 casos;
- o frontend recebe `transcript:adapted`, mas `CaptionStage.vue` renderiza `entry.text`.

### Incidente que motiva o plano

- exportação do usuário e 16 segmentos literais do banco tiveram similaridade normalizada `1,0000`;
- uma janela nominal de 5 s gerou 51 palavras, equivalente a 612 palavras/min;
- isso prova entrada ASR suspeita, mas não identifica a causa acústica sem áudio/referência;
- 10 adaptações terminaram `SUCCEEDED`, seis idênticas ao literal e quatro alteradas;
- seis terminaram `PRESERVATION_FAILED`;
- a tela exibiu somente o literal.

---

## Critérios de promoção pré-registrados

### ASR — qualidade

Um modelo/decoder só substitui o baseline se cumprir simultaneamente:

1. redução relativa de WER de pelo menos 10% no corpus humano pareado completo;
2. intervalo bootstrap de 95% para `WER_candidato - WER_baseline` inteiramente abaixo de zero;
3. nenhuma condição acústica com piora superior a 2 pontos percentuais absolutos de WER;
4. nenhuma elevação no número de erros semânticos críticos;
5. zero termos técnicos ou frases não faladas nos fixtures de silêncio puro;
6. zero repetição degenerada nova nos fixtures de ruído e residual;
7. resultado separado para janelas completas e residuais;
8. nenhuma regressão em idempotência, ACK, retry, TTL, ordenação, drain ou retenção zero.

Se dois candidatos cumprirem os critérios e a diferença de WER entre eles for menor que 1 ponto percentual, vence o de menor p95/RTF/RSS.

### ASR — operação CPU-first

No envelope KVM 4 emulado:

- `RTF p95 <= 0,80` para uma sessão contínua;
- pico RSS do worker `<= 4 GiB`;
- fila sem expiração ou overflow em duas sessões simultâneas de captura contínua;
- readiness aquecida antes da rodada medida;
- modelo em volume cacheado, sem download durante benchmark.

No envelope KVM 2 emulado:

- `RTF p95 <= 1,00` para uma sessão;
- nenhuma queda do API/PostgreSQL;
- resultado usado para capacidade, mesmo que o vencedor fique restrito a KVM 4.

### Agente v2 — segurança automática

1. zero saída aceita com `risk !== 'none'`;
2. zero chamada ao provider quando `asrQuality.state === 'suspect'`;
3. zero violação crítica aceita nas categorias: agente/paciente, comando, negação, modalidade, condição, causalidade, ordem temporal, comparação, número e entidade;
4. `decision='literal'` exige igualdade exata;
5. provider/schema/guarda inválidos resultam em literal;
6. nenhuma saída adaptada contém termo não existente no literal ou em glossário aprovado;
7. p95 do provider `<= 1.500 ms` no corpus sintético, sem fila crescente no envelope testado;
8. v1 continua selecionável e byte-estável para rollback.

### Agente v2 — benefício

A promoção para usuários reais exige:

- avaliação cega e pareada com pessoas surdas;
- compreensão factual e inferencial não inferior ao literal;
- zero aumento de erro crítico;
- redução mensurável de esforço ou tempo, ou preferência consistente, no perfil em que a v2 for habilitada;
- piloto formativo primeiro; tamanho final calculado por poder estatístico a partir do piloto;
- revisão de linguagem e protocolo por pessoa surda/especialista.

---

## Mapa de arquivos

### API/ASR — novos

- `asr-service/asr_service/evaluation/__init__.py`
- `asr-service/asr_service/evaluation/normalization.py`
- `asr-service/asr_service/evaluation/wer.py`
- `asr-service/asr_service/evaluation/manifest.py`
- `asr-service/asr_service/evaluation/runner.py`
- `asr-service/asr_service/evaluation/cli.py`
- `asr-service/tests/test_evaluation_normalization.py`
- `asr-service/tests/test_evaluation_wer.py`
- `asr-service/tests/test_evaluation_manifest.py`
- `asr-service/tests/test_evaluation_runner.py`
- `asr-service/evaluation/reference-scripts/general-pt-br-v1.txt`
- `asr-service/evaluation/reference-scripts/python-pt-br-v1.txt`
- `asr-service/evaluation/manifests/corpus-publico-v1.example.json`
- `src/modules/asr/asr-quality.policy.ts`
- `src/modules/asr/asr-quality.policy.spec.ts`
- `src/modules/transcript-adaptation/prompts/pt-br-accessible-v2.prompt.ts`
- `src/modules/transcript-adaptation/prompts/pt-br-accessible-v2.prompt.spec.ts`
- `src/modules/transcript-adaptation/context/audience-context-policy.ts`
- `src/modules/transcript-adaptation/context/audience-context-policy.spec.ts`
- `src/modules/transcript-adaptation/validation/semantic-risk-profile.ts`
- `src/modules/transcript-adaptation/validation/semantic-risk-profile.spec.ts`
- `src/modules/transcript-adaptation/evaluation/transcript-adaptation-corpus.v2.synthetic.json`
- migration Prisma para qualidade ASR e preferências versionadas.

### API/ASR — modificados

- `asr-service/asr_service/config.py`
- `asr-service/asr_service/contracts.py`
- `asr-service/asr_service/providers/base.py`
- `asr-service/asr_service/providers/faster_whisper.py`
- `asr-service/asr_service/main.py`
- `asr-service/tests/test_config.py`
- `asr-service/tests/test_contracts.py`
- `asr-service/tests/test_faster_whisper_provider.py`
- `asr-service/tests/test_api.py`
- `docker-compose.yml`
- `package.json`
- `prisma/schema.prisma`
- `src/modules/asr/asr-client.ts`
- `src/modules/asr/http-asr.client.ts`
- `src/modules/asr/http-asr.client.spec.ts`
- `src/modules/asr/usecases/transcribe-audio-segment.usecase.ts`
- `src/modules/asr/usecases/transcribe-audio-segment.usecase.spec.ts`
- `src/modules/sessions/entities/transcript-segment.entity.ts`
- `src/modules/sessions/repositories/transcript.repository.ts`
- `src/modules/sessions/repositories/prisma-transcript.repository.ts`
- `src/modules/sessions/repositories/prisma-transcript.repository.spec.ts`
- `src/modules/sessions/usecases/append-transcript-segment.usecase.ts`
- `src/modules/sessions/usecases/append-transcript-segment.usecase.spec.ts`
- `src/modules/live/live.gateway.ts`
- specs do gateway/E2E correspondentes.
- `src/modules/transcript-adaptation/contracts/transcript-adaptation.types.ts`
- `src/modules/transcript-adaptation/validation/adaptation-output.schema.ts`
- `src/modules/transcript-adaptation/validation/adaptation-output.schema.spec.ts`
- `src/modules/transcript-adaptation/validation/semantic-preservation.validator.ts`
- `src/modules/transcript-adaptation/validation/semantic-preservation.validator.spec.ts`
- `src/modules/transcript-adaptation/entities/transcript-adaptation.entity.ts`
- `src/modules/transcript-adaptation/usecases/adapt-transcript-segment.usecase.ts`
- `src/modules/transcript-adaptation/usecases/adapt-transcript-segment.usecase.spec.ts`
- `src/modules/transcript-adaptation/services/transcript-adaptation-coordinator.ts`
- `src/modules/transcript-adaptation/services/transcript-adaptation-coordinator.spec.ts`
- `src/modules/transcript-adaptation/evaluation/transcript-adaptation-evaluator.ts`
- `src/modules/transcript-adaptation/evaluation/transcript-adaptation-evaluator.spec.ts`
- `scripts/evaluate-transcript-adaptation.ts`
- `test/app.e2e-spec.ts`

### Web — novos

- `src/live/useCaptionPreferences.ts`
- `src/live/useCaptionPreferences.spec.ts`
- opcionalmente `src/components/live/CaptionQualityNotice.vue`
- teste do novo componente, se ele for extraído.

### Web — modificados

- `src/live/types.ts`
- `src/live/useLiveSession.ts`
- `src/live/useLiveSession.spec.ts`
- `src/components/live/CaptionStage.vue`
- `src/components/live/CaptionStage.spec.ts`
- `src/views/LiveRoomView.vue`
- `src/views/LiveRoomView.spec.ts`

### Cérebro — novos/modificados durante execução

- `arquitetura/decisoes/ADR-005-qualidade-entrada-asr-e-promocao-modelo.md`
- `arquitetura/decisoes/ADR-006-pt-br-accessible-v2-e-fail-closed.md`
- `arquitetura/asr-backend-vps.md`
- `requisitos/mvp-transcricao-tempo-real.md`
- `contexto/historico-e-decisoes.md`
- `contexto/diario-qualidade-transcricao-2026-08-12.md`
- `referencias/2026-08-12-relatorio-surdez-acessibilidade-adaptacao-portugues-tempo-real.md`

---

# Plano tarefa por tarefa

## Tarefa 0 — Congelar baseline, branches e loop vermelho

**Objetivo:** garantir reprodução e rollback antes de experimentar.

**Arquivos:**

- Criar: `semantia-cerebro/arquitetura/decisoes/ADR-005-qualidade-entrada-asr-e-promocao-modelo.md`
- Criar: `semantia-cerebro/contexto/diario-qualidade-transcricao-2026-08-12.md`
- Copiar este plano para `semantia-cerebro/planejamento/2026-08-12-melhoria-transcricao-whisper-agente-v2.md`

**Interfaces:**

- Consome os heads atuais das branches do Card 08.
- Produz checkpoints imutáveis, branches locais por hipótese e um comando de benchmark capaz de ficar vermelho.

- [ ] **Passo 1: confirmar repositórios, remotes, branches, PRs e status limpo.**

Executar em API, web e cérebro:

```bash
git fetch --all --prune
git status --short --branch
git remote -v
git log --oneline -5
```

Esperado: nenhum arquivo não rastreado ou diff em API/web; remotes de `Semantia-UniSenai`; branches atuais identificadas explicitamente.

- [ ] **Passo 2: registrar os SHAs aceitos e criar tags locais anotadas.**

```bash
git tag -a qa/asr-card08-baseline-2026-08-12 <SHA_API> -m "Baseline local ASR Card 08"
git tag -a qa/web-card08-baseline-2026-08-12 <SHA_WEB> -m "Baseline local web Card 08"
```

Esperado: `git show-ref --tags` lista as duas tags. Não enviar tags ao remoto sem autorização explícita.

- [ ] **Passo 3: criar worktrees locais isoladas.**

Branches recomendadas:

```text
exp/asr-benchmark-tooling
exp/asr-model-small
exp/asr-model-medium
exp/asr-model-large-v3-turbo
feat/asr-quality-gate
feat/transcript-adaptation-v2
feat/caption-mode-adapted
```

Cada hipótese ASR parte do mesmo SHA. Nenhuma branch rejeitada é publicada.

- [ ] **Passo 4: documentar ADR-005.**

A ADR deve registrar:

- retenção zero como invariante;
- baseline `small/cpu/int8/beam=5/5s/no-hotwords`;
- uma variável por branch;
- métricas e critérios de promoção deste plano;
- modelos candidatos `medium` e `large-v3-turbo` como challengers, não defaults;
- rejeição de hotwords, VAD e LLM corretor como remendo;
- reavaliação somente por corpus pareado.

- [ ] **Passo 5: criar um comando vermelho mínimo.**

Antes de implementar o harness, adicionar um teste que importa `asr_service.evaluation.wer` e falha por módulo ausente:

```python
def test_wer_counts_substitution_deletion_and_insertion() -> None:
    from asr_service.evaluation.wer import score_wer

    score = score_wer("a b c", "a x c y")
    assert score.substitutions == 1
    assert score.deletions == 0
    assert score.insertions == 1
    assert score.reference_words == 3
```

Executar:

```bash
cd asr-service
uv run --extra test pytest -q tests/test_evaluation_wer.py
```

Esperado: FAIL por módulo/função inexistente.

- [ ] **Passo 6: commit apenas da documentação e teste vermelho na branch local adequada.**

Não publicar ainda.

---

## Tarefa 1 — Implementar o harness pareado de ASR

**Objetivo:** medir WER, erros e operação usando os mesmos bytes para baseline e candidatos.

**Arquivos:** todos os arquivos `asr-service/asr_service/evaluation/*` e testes listados no mapa.

**Interfaces:**

```python
@dataclass(frozen=True, slots=True)
class WerScore:
    substitutions: int
    deletions: int
    insertions: int
    reference_words: int
    wer: float

@dataclass(frozen=True, slots=True)
class EvaluationCase:
    id: str
    audio_path: Path
    reference: str
    condition: str
    speaker_id: str
    expected_duration_ms: int

@dataclass(frozen=True, slots=True)
class CaseResult:
    case_id: str
    hypothesis: str
    duration_ms: int
    bytes: int
    inference_ms: int
    wall_ms: int
    score: WerScore
    semantic_error_codes: tuple[str, ...]
```

O relatório JSON contém referências controladas e métricas; nunca PCM/base64.

- [ ] **Passo 1: escrever testes RED da normalização.**

Cobrir:

- caixa;
- pontuação;
- espaços;
- diacríticos preservados por padrão;
- números não convertidos silenciosamente;
- normalizador idêntico para todos os candidatos.

```python
def test_normalizer_is_stable_and_preserves_diacritics() -> None:
    assert normalize_pt_br("  AÇÃO, às 10h! ") == "ação às 10h"
```

- [ ] **Passo 2: implementar `normalization.py` e passar os testes.**

- [ ] **Passo 3: escrever e passar os testes de Levenshtein com backtrace.**

O algoritmo deve devolver contagens separadas, não apenas distância.

- [ ] **Passo 4: escrever validação fail-closed do manifest.**

Rejeitar:

- `audioPath` fora da raiz autorizada;
- duplicidade de ID;
- referência vazia;
- duração inválida;
- condição desconhecida;
- extensão que não seja `.pcm`;
- sample rate diferente de 16 kHz;
- PCM ímpar ou incompatível com duração.

- [ ] **Passo 5: implementar runner HTTP.**

O runner deve:

1. ler PCM16 little-endian;
2. chamar `/v1/transcriptions` com request ID determinístico por execução;
3. aquecer o modelo com uma rodada descartada;
4. repetir `N` vezes;
5. registrar p50/p95, RTF, bytes e inferência;
6. separar janela completa e residual;
7. não imprimir texto reconhecido no modo privado;
8. aceitar `--include-controlled-text` apenas para corpus sintético/controlado;
9. escrever relatório atômico;
10. recusar sobrescrever relatório existente.

- [ ] **Passo 6: testar runner com FastAPI fake.**

O teste verifica headers, bytes, cálculo de RTF, ausência de base64 e falha em resposta malformada.

- [ ] **Passo 7: adicionar CLI.**

Comando alvo:

```bash
uv run --extra test python -m asr_service.evaluation.cli \
  --manifest=/tmp/semantia-asr-eval/manifest.json \
  --endpoint=http://127.0.0.1:8108/v1/transcriptions \
  --hypothesis=small-cpu-int8-beam5 \
  --runs=3 \
  --output=/tmp/semantia-asr-eval/small.json
```

Esperado: exit 0 e JSON com corpus, hipótese, métricas por caso, agregado e nenhum áudio.

- [ ] **Passo 8: gates.**

```bash
uv run --extra test pytest -q
uv run --extra test ruff check .
```

Esperado: todos passam.

- [ ] **Passo 9: revisar diff por privacidade e publicar somente tooling se autorizado.**

Tooling pode virar PR independente porque não altera runtime.

---

## Tarefa 2 — Construir corpus controlado e protocolo humano

**Objetivo:** fornecer evidência que TTS sozinho não consegue produzir.

**Arquivos:**

- Criar: `asr-service/evaluation/reference-scripts/general-pt-br-v1.txt`
- Criar: `asr-service/evaluation/reference-scripts/python-pt-br-v1.txt`
- Criar: `asr-service/evaluation/manifests/corpus-publico-v1.example.json`
- Modificar: `.gitignore` para ignorar `asr-service/.evaluation-private/`
- Criar no cérebro: protocolo de consentimento e descarte no diário/ADR.

**Interfaces:** o manifest privado aponta para PCM temporário; scripts de referência podem ser versionados; vozes e áudio não.

- [ ] **Passo 1: escrever dois roteiros controlados.**

Cada roteiro terá 45–60 segundos:

- geral: datas, números, nomes fictícios, condição, negação, pergunta e instrução;
- Python: classe, objeto, método, atributo, herança e encapsulamento em frases naturais;
- nenhum nome real, dado pessoal ou conteúdo de reunião.

- [ ] **Passo 2: gerar corpus sintético descartável.**

Condições:

- voz limpa;
- silêncio puro;
- ruído sem fala;
- reverberação;
- fala concorrente;
- residual de 250, 500, 1.000 e 2.000 ms.

O áudio fica em `/tmp/semantia-asr-eval-*` e é removido após relatório.

- [ ] **Passo 3: realizar piloto humano consentido local.**

Mínimo operacional do piloto:

- 10 falantes adultos de pt-BR;
- dois roteiros;
- duas condições por roteiro: microfone próximo/ambiente controlado e sala com ruído/reverberação moderados;
- 40 gravações pareadas;
- mesmo navegador, microfone e PCM para todos os modelos;
- consentimento explícito para benchmark local e descarte;
- sem crianças nesta fase;
- sem upload para repositório, produto ou fornecedor externo.

- [ ] **Passo 4: anotar referência e erros semânticos.**

Códigos permitidos:

```text
ENTITY
NUMBER
NEGATION
MODALITY
CONDITION
COMMAND
CAUSALITY
TEMPORAL_ORDER
TECHNICAL_TERM
UNRELATED_INSERTION
DEGENERATE_REPETITION
```

Duas pessoas revisam amostra de divergências; desacordo fica registrado como `REVIEW_DISAGREEMENT`, não resolvido por adivinhação.

- [ ] **Passo 5: provar descarte.**

Depois da matriz:

- remover MP3/WAV/PCM/F32;
- verificar `.evaluation-private`, `/tmp`, volumes e Git;
- manter apenas manifest sem caminhos pessoais, roteiro e métricas agregadas.

---

## Tarefa 3 — Propagar sinais de qualidade do faster-whisper

**Objetivo:** expor sinais não textuais suficientes para classificar entrada suspeita.

**Arquivos:** contratos/config/provider/API Python e testes.

**Interfaces produzidas:**

```python
@dataclass(frozen=True, slots=True)
class TranscriptionQualitySignals:
    language_probability: float | None
    average_log_probability: float | None
    maximum_no_speech_probability: float | None
    maximum_compression_ratio: float | None
    segment_count: int
    word_count: int
    character_count: int
```

`TranscriptionResult` passa a conter `quality: TranscriptionQualitySignals`.

Resposta HTTP:

```json
{
  "requestId": "segment-0001",
  "text": "...",
  "engine": "faster-whisper",
  "model": "small",
  "inferenceMs": 42,
  "quality": {
    "languageProbability": 0.98,
    "averageLogProbability": -0.24,
    "maximumNoSpeechProbability": 0.08,
    "maximumCompressionRatio": 1.31,
    "segmentCount": 1,
    "wordCount": 4,
    "characterCount": 25
  }
}
```

- [ ] **Passo 1: testes RED do contrato.**

Cobrir números finitos, `null` quando indisponível, contagem vazia e rejeição de NaN/Infinity.

- [ ] **Passo 2: testes RED do adapter.**

O fake do `WhisperModel.transcribe` devolve `info.language_probability` e segmentos com `avg_logprob`, `no_speech_prob` e `compression_ratio`. Verificar agregação ponderada de `avg_logprob` por duração do segmento.

- [ ] **Passo 3: implementar agregação sem guardar palavras/timestamps.**

Não ativar `word_timestamps`; não logar texto nem segmentos.

- [ ] **Passo 4: manter defaults do decoder byte-equivalentes.**

Adicionar configuração opcional apenas se valor existir:

```python
transcribe_kwargs = {
    "language": language,
    "task": "transcribe",
    "beam_size": settings.beam_size,
    "condition_on_previous_text": False,
    "hotwords": settings.hotwords or None,
}
```

Parâmetros opcionais de temperatura/threshold são omitidos quando não configurados.

- [ ] **Passo 5: validar ranges em `config.py`.**

- `ASR_BEAM_SIZE`: inteiro 1–10, default 5;
- `ASR_TEMPERATURE`: finito 0–1, ausente por default;
- `ASR_LOG_PROB_THRESHOLD`: finito -5–0, ausente por default;
- `ASR_NO_SPEECH_THRESHOLD`: finito 0–1, ausente por default;
- `ASR_COMPRESSION_RATIO_THRESHOLD`: finito 1–5, ausente por default.

- [ ] **Passo 6: atualizar API e testes.**

Resposta malformada continua fail-closed. Health/readiness não expõem thresholds sensíveis nem texto.

- [ ] **Passo 7: gates Python.**

```bash
uv run --extra test pytest -q
uv run --extra test ruff check .
```

---

## Tarefa 4 — Criar política versionada de entrada ASR suspeita no Nest

**Objetivo:** impedir que um literal fisicamente implausível chegue à adaptação como entrada normal.

**Arquivos:** `asr-client.ts`, `http-asr.client.ts`, specs e novos `asr-quality.policy.*`.

**Interfaces:**

```ts
export type AsrQualityReason =
  | 'IMPOSSIBLE_SPEECH_RATE'
  | 'LOW_LANGUAGE_PROBABILITY'
  | 'LOW_AVERAGE_LOG_PROBABILITY'
  | 'HIGH_NO_SPEECH_PROBABILITY'
  | 'HIGH_COMPRESSION_RATIO'
  | 'DEGENERATE_REPETITION'
  | 'MISSING_QUALITY_SIGNALS';

export type AsrQualityAssessment = {
  state: 'usable' | 'suspect' | 'unknown';
  reasons: AsrQualityReason[];
  policyVersion: 'asr-input-quality-v1';
};
```

Política inicial versionada:

```ts
const ASR_INPUT_QUALITY_V1 = {
  maximumWordsPerMinute: 360,
  minimumLanguageProbability: 0.70,
  minimumAverageLogProbability: -1.0,
  maximumNoSpeechProbability: 0.60,
  maximumCompressionRatio: 2.40,
  minimumWordsForCompressionCheck: 8,
  repeatedTrigramLimit: 3,
} as const;
```

Regras:

- `wordsPerMinute > 360` → suspeito;
- língua abaixo de 0,70 → suspeito;
- `averageLogProbability < -1.0` → suspeito;
- `noSpeechProbability >= 0.60` combinado com log-prob baixa → suspeito;
- compressão acima de 2,40 com pelo menos oito palavras → suspeito;
- trigram repetido mais de três vezes → suspeito;
- sinais ausentes em legado → `unknown`, não apagar o literal e não retroclassificar;
- qualquer razão suspeita basta para `suspect`;
- thresholds só mudam em nova policy/versionamento após corpus.

- [ ] **Passo 1: escrever testes RED para cada razão e combinações de borda.**

- [ ] **Passo 2: testar explicitamente o incidente agregado.**

Entrada sintética de 51 palavras/5 s deve produzir `IMPOSSIBLE_SPEECH_RATE` sem incluir o conteúdo real do incidente.

- [ ] **Passo 3: implementar parser estrito no `HttpAsrClient`.**

Rejeitar `quality` parcial com tipo inválido; aceitar `null` nos campos opcionais; nunca converter string numérica silenciosamente.

- [ ] **Passo 4: implementar política pura e determinística.**

Sem rede, relógio, banco ou provider.

- [ ] **Passo 5: gates focados.**

```bash
pnpm test --runInBand src/modules/asr/http-asr.client.spec.ts src/modules/asr/asr-quality.policy.spec.ts
```

Esperado: PASS.

---

## Tarefa 5 — Persistir proveniência e qualidade do literal

**Objetivo:** tornar replay e auditoria coerentes sem guardar áudio ou ASR bruto duplicado.

**Arquivos:** Prisma, migration, entidade/repositório/use case e testes.

**Schema proposto:**

```prisma
enum TranscriptInputQualityState {
  UNKNOWN
  USABLE
  SUSPECT
}

model TranscriptSegment {
  // campos existentes
  audioDurationMs        Int?
  asrEngine              String?
  asrModel               String?
  asrInferenceMs         Int?
  asrQualityState        TranscriptInputQualityState @default(UNKNOWN)
  asrQualityReasons      Json?
  asrQualityPolicyVersion String @default("legacy-unassessed")
  asrQualitySignals      Json?
}
```

`asrQualitySignals` permite somente números/null e contagens; não guarda palavras, hipótese bruta, áudio ou prompt.

- [ ] **Passo 1: migration RED/contrato N-1.**

Antes da migration candidata:

- criar banco N-1 a partir da worktree/base correta;
- inserir segmento legado;
- provar ausência das novas colunas;
- aplicar migration;
- provar texto, ID, seq e estratégia preservados;
- provar novos campos `UNKNOWN/legacy-unassessed`.

- [ ] **Passo 2: expandir `AppendTranscriptSegmentUseCase.execute`.**

Entrada adicional:

```ts
asr: {
  durationMs: number;
  engine: string;
  model: string;
  inferenceMs: number;
  signals: AsrQualitySignals;
  assessment: AsrQualityAssessment;
}
```

- [ ] **Passo 3: persistir tudo no mesmo insert do segmento.**

Replay existente retorna metadados persistidos; não reinfere nem recalcula com policy nova.

- [ ] **Passo 4: propagar em REST/snapshot/Socket.IO.**

Payload público mínimo:

```ts
quality: {
  state: 'unknown' | 'usable' | 'suspect';
  reasons: AsrQualityReason[];
  policyVersion: string;
}
```

Não expor log-probabilities ao participante; elas permanecem na auditoria backend.

- [ ] **Passo 5: testes de repositório e E2E PostgreSQL.**

Cobrir fresh DB, N-1, append, replay, snapshot e evento final.

- [ ] **Passo 6: provar que nenhum campo binário/texto bruto novo foi criado.**

---

## Tarefa 6 — Bloquear adaptação de entrada suspeita e corrigir snapshot temporal

**Objetivo:** tornar ASR e adaptação uma cadeia segura sem acoplar o literal à disponibilidade da IA.

**Arquivos:** use case ASR, gateway, coordinator, entidade/schema de adaptação e specs.

**Interfaces:**

Adicionar failure code:

```ts
INPUT_SUSPECT: 'INPUT_SUSPECT'
```

O coordenador recebe input imutável:

```ts
export type TranscriptAdaptationJob = {
  segment: TranscriptSegment;
  context: AudienceContext | null;
  contextVersion: number;
};
```

- [ ] **Passo 1: escrever RED — entrada suspeita não chama provider.**

Assertar:

- literal persistido e emitido;
- adaptação `BYPASSED/INPUT_SUSPECT`;
- `provider.adapt` com zero chamadas;
- evento adaptado materializa literal;
- mesmo `segmentId/seq`.

- [ ] **Passo 2: capturar contexto na fronteira final.**

Depois do retorno do ASR e imediatamente antes de criar/publicar o final, reler sessão uma vez e construir `TranscriptAdaptationJob`. O coordinator não consulta “contexto atual” depois.

Teste de corrida:

1. ASR resolve;
2. snapshot v1 é capturado;
3. contexto muda para v2;
4. fila executa;
5. adaptação persiste v1;
6. próximo segmento usa v2.

- [ ] **Passo 3: bypass antes da fila/provider.**

Entrada suspeita deve criar estado terminal auditável sem consumir concorrência Groq.

- [ ] **Passo 4: manter literal primeiro.**

Teste com provider atrasado e suspeito comprova ordem:

```text
transcript:final
transcript:adapted (bypassed)
```

- [ ] **Passo 5: atualizar replay/recovery.**

Reinício não reinfere segmento suspeito nem o envia à Groq.

---

## Tarefa 7 — Executar matriz de modelos Whisper

**Objetivo:** decidir por evidência se `small` deve ser substituído.

**Código:** nenhum ajuste funcional adicional além das tarefas 1–3. Cada candidato usa configuração isolada.

**Matriz fixa:**

| Variante | Modelo | Device | Compute | Beam | Janela | Hotwords | VAD |
|---|---|---|---|---:|---:|---|---|
| baseline | `small` | CPU | int8 | 5 | 5 s | vazio | não |
| challenger A | `medium` | CPU | int8 | 5 | 5 s | vazio | não |
| challenger B | `large-v3-turbo` | CPU | int8 | 5 | 5 s | vazio | não |

- [ ] **Passo 1: construir imagens isoladas no mesmo commit.**

- [ ] **Passo 2: reutilizar cache de modelos verificado.**

Registrar tamanho, hash/revisão disponível, cold start e warm-up. Nenhum download entra na rodada medida.

- [ ] **Passo 3: executar baseline adjacente antes e depois de cada candidato.**

Ordem:

```text
small → medium → small → large-v3-turbo → small
```

- [ ] **Passo 4: rodar corpus sintético/degradado e humano pareado.**

Separar:

- geral;
- Python;
- limpo;
- ruído/reverberação;
- concorrência;
- silêncio;
- janela completa;
- residual.

- [ ] **Passo 5: rodar KVM 2 e KVM 4 emulados.**

Medir:

- WER S/D/I;
- erros semânticos;
- p50/p95/RTF;
- CPU/RSS;
- fila;
- cold/warm;
- modelo em disco;
- duas sessões simultâneas.

- [ ] **Passo 6: aplicar critérios sem exceção manual.**

Decisão do relatório: `PROMOTE`, `REJECT` ou `INCONCLUSIVE` por variante.

- [ ] **Passo 7: manter somente o vencedor.**

Se nenhum passar, `small` permanece. Branches rejeitadas não são acumuladas nem publicadas.

---

## Tarefa 8 — Experimentar decoder e fronteira somente após modelo

**Objetivo:** testar hipóteses secundárias sem confundir o efeito do modelo.

**Pré-condição:** tarefa 7 fechada com modelo selecionado.

### Experimento 8A — decoder conservador

Comparar uma variável por rodada:

1. baseline do modelo selecionado;
2. `temperature=0` explícito;
3. thresholds `log_prob=-1.0`, `no_speech=0.6`, `compression_ratio=2.4`;
4. beam 3 somente como trade-off de velocidade.

Os defaults ausentes continuam omitidos no adapter. Não ativar tudo junto.

### Experimento 8B — janela

Só executar se pelo menos 20% dos erros lexicais revisados forem atribuídos a fronteira de janela. Comparar 5 s com 6 s, mantendo modelo/decoder constantes. Não repetir 4 s ou overlap de 300 ms sem nova hipótese, pois já pioraram em evidência anterior.

- [ ] **Passo 1: branches locais separadas por hipótese.**

- [ ] **Passo 2: mesma matriz e critérios da tarefa 7.**

- [ ] **Passo 3: resíduos avaliados separadamente.**

- [ ] **Passo 4: promover no máximo um vencedor por eixo.**

- [ ] **Passo 5: confirmar que silêncio e ruído não geram termos do domínio.**

---

## Tarefa 9 — Promover configuração ASR vencedora com rollback

**Objetivo:** aplicar somente o que venceu os benchmarks.

**Arquivos:** `config.py`, `docker-compose.yml`, testes, ADR/runbook.

- [ ] **Passo 1: manter defaults atuais até decisão.**

O commit de promoção contém explicitamente o modelo/decoder vencedor. Se não houver vencedor, este passo documenta “sem mudança de default”.

- [ ] **Passo 2: adicionar health seguro com versão de configuração.**

Pode expor modelo, compute, policy e readiness; não expõe hotwords, caminhos, texto ou sinais de um segmento.

- [ ] **Passo 3: build real non-root e smoke com fala sintética.**

- [ ] **Passo 4: vertical host → PCM → Nest → ASR → literal → banco → Socket.IO.**

- [ ] **Passo 5: revalidar autorização, idempotência, no-speech replay, ACK e drain.**

- [ ] **Passo 6: revalidar retenção zero em `/tmp`, `/app`, volumes, banco, logs e storage do navegador.**

---

## Tarefa 10 — Introduzir `pt-br-accessible-v2` sem alterar v1

**Objetivo:** transformar as decisões da pesquisa em regras executáveis e versionadas.

**Arquivos:** prompt v2, context policy, schema e specs.

**Schema v2:**

```ts
export const adaptationOutputV2Schema = z.object({
  adaptedText: z.string().min(1).max(5_000),
  decision: z.enum(['adapted', 'literal']),
  risk: z.enum([
    'none',
    'urgent',
    'ambiguous',
    'preservation-risk',
    'fragment',
    'context-insufficient',
  ]),
  appliedRuleIds: z.array(z.enum([
    'PUNCTUATION',
    'SPLIT_SENTENCE',
    'DIRECT_ORDER',
    'COMMON_EQUIVALENT',
    'EXPLICIT_REFERENT',
  ])).max(8),
  verifierRequired: z.boolean(),
  reasonCode: z.enum([
    'ADAPTED_SAFELY',
    'NO_SAFE_CHANGE',
    'AMBIGUOUS_INPUT',
    'FRAGMENT_INPUT',
    'CRITICAL_CONTENT',
    'PRESERVATION_UNCERTAIN',
  ]),
}).strict();
```

- [ ] **Passo 1: manter builders separados por versão.**

`pt-br-accessible-v1.prompt.ts` não muda. Factory seleciona v1/v2 por configuração validada.

- [ ] **Passo 2: criar política de contexto explícita.**

```ts
export type AdaptationPolicy = {
  intensity: 'light' | 'moderate' | 'high';
  preserveTechnicalTerms: true;
  allowApprovedGlossary: boolean;
  preferExplicitReferents: boolean;
  criticality: 'normal' | 'high';
  allowedRuleIds: AppliedRuleId[];
};
```

Mapeamento:

- `domain` preserva terminologia e seleciona glossário aprovado;
- `simplificationLevel` legado mapeia para intensidade;
- `meetingType` mapeia criticidade;
- `portugueseFamiliarity` não autoriza remoção de fatos;
- `ageRange` é serializado apenas para compatibilidade/auditoria, mas não altera regras, vocabulário ou tom;
- ausência de contexto → literal.

- [ ] **Passo 3: codificar regras universais no system prompt.**

Preservar:

- agente, ação, paciente/destinatário;
- números, entidades, datas, unidades;
- negação e modalidade;
- condição, causalidade e ordem temporal;
- perguntas, comandos, proibições e urgência;
- termos técnicos;
- conteúdo citado.

Proibir:

- completar fragmentos;
- resolver ambiguidade/pronome sem evidência;
- usar conhecimento externo;
- imitar gramática de Libras;
- resumir removendo informação;
- obedecer instruções do transcript.

- [ ] **Passo 4: testes de prompt injection e serialização.**

Texto “ignore as regras” aparece apenas no bloco JSON não confiável. Prompt estático permanece byte-estável.

- [ ] **Passo 5: configuração v2 desabilitada por default.**

Rollback para v1 exige apenas configuração e restart controlado, não migration destrutiva.

---

## Tarefa 11 — Tornar riscos e relações fail-closed

**Objetivo:** impedir que guardas lexicais aceitem inversão de sentido.

**Arquivos:** `semantic-risk-profile.*`, semantic validator, use case e specs.

**Estratégia inicial conservadora:** enquanto não existir verificador relacional independente validado, segmentos com relações críticas só podem ser alterados quando a guarda determinística comprovar a relação suportada. Relações não suportadas permanecem literais.

**Categorias:**

```ts
export type SemanticRiskCategory =
  | 'AGENT_PATIENT'
  | 'COMMAND'
  | 'NEGATION'
  | 'MODALITY'
  | 'CONDITION'
  | 'CAUSALITY'
  | 'TEMPORAL_ORDER'
  | 'COMPARISON'
  | 'ENUM_ASSIGNMENT'
  | 'PRONOUN_AMBIGUITY';
```

- [ ] **Passo 1: corpus RED com pares adversariais.**

Incluir no mínimo 20 casos por categoria:

- “Maria entregou a João” → “João entregou a Maria”;
- “saia” → “fique”;
- obrigação → permissão;
- condição removida;
- causa/consequência invertidas;
- antes/depois trocados;
- maior/menor trocados;
- item/valor reatribuídos;
- pronome resolvido sem evidência.

- [ ] **Passo 2: implementar perfil de risco do literal.**

O detector identifica marcadores e estruturas suportadas; não afirma equivalência.

- [ ] **Passo 3: política de aceitação.**

```text
risk != none                           → literal
input suspect                          → bypass INPUT_SUSPECT
source relation unsupported + changed → fallback RELATIONAL_RISK_UNVERIFIED
lexical guard failure                  → fallback PRESERVATION_FAILED
model says literal but text differs    → fallback INVALID_RESPONSE
all deterministic gates pass           → candidate eligible
```

Adicionar failure code `RELATIONAL_RISK_UNVERIFIED`.

- [ ] **Passo 4: preservar utilidade em casos de baixo risco.**

Permitir pontuação, divisão segura e equivalente comum apenas quando não houver relação crítica não verificável.

- [ ] **Passo 5: não usar um segundo LLM como prova automática nesta fase.**

NLI/QA/modelo verificador entram primeiro no avaliador offline como sinal complementar. Só viram gate runtime por nova ADR e benchmark de latência/erro.

---

## Tarefa 12 — Expandir corpus e avaliador do agente

**Objetivo:** comparar v1/v2 no mesmo conjunto e entender benefício, fallback e risco.

**Arquivos:** novo corpus v2, evaluator, script e specs.

**Corpus mínimo:** 300 casos sintéticos distribuídos entre:

- preservação lexical;
- relações semânticas;
- fragmentos;
- ambiguidade;
- jargão/termos técnicos;
- perfis/intensidades;
- saúde/jurídico/segurança;
- instrução operacional;
- prompt injection;
- literal preferível;
- entrada ASR suspeita sintética;
- múltiplas adaptações humanas aceitáveis.

**Relatório:**

```ts
{
  corpusVersion,
  promptVersion,
  provider,
  model,
  total,
  providerCalls,
  inputSuspectBypasses,
  acceptedAdapted,
  acceptedLiteral,
  fallbacksByCode,
  criticalViolations,
  ruleUsage,
  wordsPerSentenceByProfile,
  latencyMs: { p50, p95, max },
  usage: { inputTokens, outputTokens }
}
```

- [ ] **Passo 1: RED para todo risco não nulo.**

- [ ] **Passo 2: RED para zero chamada em entrada suspeita.**

- [ ] **Passo 3: executar guardas offline sem rede.**

- [ ] **Passo 4: executar Groq somente com conteúdo sintético.**

Comparar v1 e v2 em ordem alternada, três repetições por caso e temperatura baixa.

- [ ] **Passo 5: aplicar critérios automáticos.**

Qualquer violação crítica bloqueia promoção. Taxa alta de fallback não é mascarada como sucesso.

- [ ] **Passo 6: investigar o histórico `exit 1` da avaliação de 20 casos.**

O novo script deve listar somente IDs/códigos sanitizados dos casos que falharam; nunca engolir a causa em um agregado opaco.

---

## Tarefa 13 — Evoluir preferências e formulário sem estereótipos

**Objetivo:** fazer o agente responder a preferências observáveis, não idade ou rótulo genérico.

**Backend — política alvo:**

```ts
export type AudienceAdaptationPreferencesV2 = {
  adaptationIntensity: 'light' | 'moderate' | 'high';
  technicalTerms: 'preserve' | 'approved-glossary';
  explicitReferences: boolean;
  domain: string;
  meetingType: string;
};
```

`ageRange` e `portugueseFamiliarity` legados continuam legíveis, mas ficam fora da decisão automática v2. Migration JSON preserva sessões existentes; não inventa preferências.

- [ ] **Passo 1: testes de DTO e persistência/versionamento.**

- [ ] **Passo 2: falha de `PATCH` fica visível.**

O formulário não fecha nem inicia como se tivesse salvo. Deve oferecer retry ou seguir explicitamente com literal.

- [ ] **Passo 3: escolha por exemplos A/B.**

A intensidade é explicada por exemplos de operação, não “baixo/médio/alto conhecimento do surdo”.

- [ ] **Passo 4: glossário aprovado e versionado.**

Nenhuma definição livre do modelo. Quando não houver glossário, preservar termo sem explicar.

- [ ] **Passo 5: manter configuração dentro da sala.**

Não reintroduzir preparação ou bloqueio antes da entrada.

---

## Tarefa 14 — Exibir literal, adaptado, ambos e transcrição incerta

**Objetivo:** permitir avaliação real da IA e comunicar limites sem duplicar anúncios acessíveis.

**Interfaces web:**

```ts
export type CaptionMode = 'literal' | 'adapted' | 'both';

export interface TranscriptQuality {
  state: 'unknown' | 'usable' | 'suspect';
  reasons: string[];
  policyVersion: string;
}
```

Preferência individual local:

```text
semantia.captions.mode
```

Não é enviada ao host nem compartilhada com a sala.

- [ ] **Passo 1: RED — modo adaptado usa adaptação somente quando `succeeded`.**

Fallback/bypass sempre mostra literal.

- [ ] **Passo 2: RED — modo both mostra rótulos claros.**

```text
Original
Português adaptado automaticamente
```

Nunca usar “tradução”, “Libras” ou “correção”.

- [ ] **Passo 3: RED — entrada suspeita.**

Mostrar:

```text
Transcrição incerta. Peça para a pessoa repetir.
```

O conteúdo literal permanece disponível e não é apresentado como confirmado.

- [ ] **Passo 4: announcer acessível.**

`aria-live` anuncia apenas o modo primário escolhido, uma vez por segmento. Modo `both` não duplica leitura.

- [ ] **Passo 5: persistir somente preferência de modo/tamanho.**

Não persistir transcript ou adaptação em localStorage.

- [ ] **Passo 6: QA responsivo/acessível.**

Teclado, foco, contraste, 320/375/768/1280 px, alvos >=44 px, leitor de tela, movimento reduzido e rolagem ao vivo/releitura.

---

## Tarefa 15 — Integração vertical e gates completos

**Objetivo:** provar que as melhorias não quebram o produto.

### API/Python

```bash
cd asr-service
uv run --extra test pytest -q
uv run --extra test ruff check .

cd ..
pnpm prisma:generate
pnpm test --runInBand
pnpm lint
pnpm build
pnpm exec prisma validate
pnpm audit --prod
```

### Web

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm audit --prod
```

### Banco

- fresh DB com cadeia completa;
- N-1 sem colunas candidatas antes da migration;
- segmento legado preservado;
- adaptação e qualidade com constraints/indexes inspecionados;
- banco descartável removido em etapa separada.

### E2E obrigatório

1. áudio sintético utilizável → literal → v2 → adaptação sucedida;
2. áudio sintético suspeito → literal → `INPUT_SUSPECT`, zero chamada provider;
3. literal antes da adaptação;
4. mesma ID/seq;
5. contexto v1 capturado antes de atualização v2;
6. replay sem reinferência;
7. ACK perdido/reconnect/idempotência;
8. no-speech sem persistência;
9. fila cheia ASR e Groq com fallback correto;
10. timeout/retry/circuit/restart;
11. sessão encerrada e não-host rejeitados antes do ASR;
12. frontend literal/adaptado/both/fallback/suspect;
13. aplicação construída, não somente Vite HMR;
14. PostgreSQL, API, ASR e web saudáveis nas portas isoladas;
15. zero PCM em filesystem, volumes, banco, logs e browser storage;
16. zero segredo em diff/bundle/OpenAPI/health.

### Revisão em duas passagens

1. **Especificação/privacidade/lifecycle:** revisar cada arquivo alterado contra este plano e ADRs.
2. **Adversarial added-lines:** procurar segredo, nova rede, provider silencioso, conteúdo real, corrida, texto sobrescrito e alegação não sustentada.

Corrigir findings em TDD e repetir narrow + full gate.

---

## Tarefa 16 — Avaliação participativa e gate científico

**Objetivo:** determinar se a v2 ajuda, para quem e em quais condições.

- [ ] **Passo 1: preparar piloto formativo com 6–8 adultos surdos.**

Estratificar e registrar, sem generalização:

- trajetória linguística;
- uso de Libras;
- proficiência/autopercepção em português;
- escolarização;
- preferência literal/adaptado;
- familiaridade com domínio.

- [ ] **Passo 2: desenho within-subject randomizado.**

Cada participante lê versões literal e v2 em ordem contrabalanceada, sem saber qual é “a nova”. Usar conteúdo sintético/consentido.

- [ ] **Passo 3: medir separadamente.**

- compreensão factual;
- compreensão inferencial;
- tempo;
- esforço percebido;
- preferência;
- confiança;
- erro crítico;
- comentários qualitativos.

- [ ] **Passo 4: calcular tamanho final após piloto.**

Não inventar poder/amostra antes de observar variância e efeito.

- [ ] **Passo 5: revisão por pessoa surda/especialista.**

Aprovar linguagem do formulário, critérios e interpretação.

- [ ] **Passo 6: decidir escopo de promoção.**

Resultados podem promover somente certos perfis/intensidades. Ausência de benefício mantém literal/default e v2 experimental.

---

## Tarefa 17 — Rollout seguro, documentação e PRs

**Objetivo:** ativar mudanças em etapas reversíveis e manter o cérebro fiel.

**Flags/configuração:**

```text
ASR_INPUT_QUALITY_MODE=observe|enforce
ASR_INPUT_QUALITY_POLICY=asr-input-quality-v1
TRANSCRIPT_ADAPTATION_PROMPT_VERSION=pt-br-accessible-v1|pt-br-accessible-v2
TRANSCRIPT_ADAPTATION_V2_ENABLED=false|true
```

Defaults antes da promoção:

```text
ASR_INPUT_QUALITY_MODE=observe
TRANSCRIPT_ADAPTATION_PROMPT_VERSION=pt-br-accessible-v1
TRANSCRIPT_ADAPTATION_V2_ENABLED=false
```

### Etapas de rollout

1. **Observe:** coletar somente contagens agregadas de razões/latência, sem texto.
2. **Enforce para IA:** entrada suspeita bloqueia apenas adaptação; literal continua com aviso.
3. **Modelo ASR vencedor:** habilitar em QA local/staging e repetir benchmark adjacente.
4. **v2 em QA:** somente conteúdo sintético e usuários internos.
5. **Piloto consentido:** pessoas surdas, escopo controlado.
6. **Promoção:** somente após gates automáticos + participativos.

### PRs

- PR 1: harness/tooling ASR, se publicado;
- PR 2: qualidade ASR + modelo vencedor + migrations;
- PR 3: agente v2 e guardas;
- PR 4: frontend de modos/estados;
- PR cérebro: ADRs, plano, diário, resultados e requisitos.

Se PRs-base continuarem abertos, usar bases empilhadas corretas. Nenhum merge sem revisão humana.

### Fechamento documental

Registrar separadamente:

1. qualidade melhorou/piorou/inalterada;
2. o que entrou no runtime/default;
3. o que foi publicado remotamente, mesmo sem merge;
4. se algum áudio/segredo foi publicado — resultado obrigatório: **não**;
5. modelo/decoder promovido ou baseline mantido;
6. status da v2: experimental, piloto ou promovida;
7. gates executados e pendentes, sem marcar o que não rodou.

---

## Ordem recomendada de execução

```text
0. Freeze/ADR
1. Harness
2. Corpus/protocolo
3. Sinais Whisper
4. Política Nest
5. Persistência
6. Gate IA + snapshot
7. Matriz de modelos
8. Decoder/janela condicional
9. Promoção ASR
10. Prompt/schema v2
11. Fail-closed relacional
12. Corpus/avaliação v2
13. Preferências
14. UI literal/adaptado/ambos
15. E2E e gates
16. Avaliação participativa
17. Rollout/PRs/cérebro
```

As tarefas 10–14 podem avançar após a tarefa 6 sem esperar a conclusão da matriz de modelos, desde que usem apenas conteúdo sintético e não alterem o baseline ASR. A integração final da tarefa 15 exige o vencedor — ou a decisão explícita de manter `small`.

---

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Modelo maior melhora WER, mas cria backlog | hard gates de RTF/fila/RSS; manter `small` se falhar |
| Confidence do Whisper vira verdade absoluta | usar múltiplos sinais; estado `suspect`, não “errado”; thresholds versionados |
| Política bloqueia fala válida | fase `observe`, corpus humano e análise por razão antes de `enforce` |
| IA deixa erro mais fluente | zero chamada em entrada suspeita; risco não nulo fail-closed |
| Guardas lexicais aceitam inversão | corpus relacional e fallback para relação não verificável |
| v2 reduz demais a taxa de adaptação | reportar fallback honestamente; benefício humano decide, não taxa bruta |
| Contexto novo aplicado a segmento antigo | snapshot imutável capturado na fronteira final e teste de corrida |
| Idade infantiliza | v2 ignora idade para intensidade/tom |
| Termo técnico é removido/explicado errado | preservação obrigatória e glossário aprovado/versionado |
| Modo both duplica leitor de tela | uma única fonte `aria-live` conforme modo primário |
| Fixtures humanas vazam | diretório ignorado/temporário, consentimento, nenhum push, descarte verificado |
| Experimentos rejeitados chegam ao GitHub | branches locais por default; inventário e autorização antes de push |
| Documento científico é tratado como prova final | avaliação das fontes + estudo participativo; alegações limitadas |

---

## Definição de pronto

O plano estará implementado somente quando:

- houver benchmark pareado reproduzível com fala humana e corpus degradado;
- o modelo ASR default tiver sido promovido por critérios ou o `small` tiver sido mantido por decisão documentada;
- sinais de qualidade chegarem ao backend sem expor conteúdo;
- entrada suspeita persistir/broadcastar literal com aviso e nunca chamar a Groq;
- snapshot de contexto não sofrer corrida temporal;
- `pt-br-accessible-v2` coexistir com v1 e estiver desabilitado por default até promoção;
- todo risco não nulo e toda relação não verificável resultar em literal;
- o frontend permitir literal/adaptado/ambos com fallback e incerteza claros;
- migrations fresh/N-1, suites, builds, audits, E2E, carga e retenção zero passarem;
- avaliação participativa delimitar benefício e público, ou concluir honestamente que a v2 ainda não deve ser promovida;
- cérebro estiver sincronizado e PRs permanecerem em revisão, sem auto-merge;
- nenhum áudio, transcript real, segredo ou branch experimental rejeitada tiver sido publicado.
