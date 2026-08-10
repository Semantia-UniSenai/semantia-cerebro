---
title: Card 07 — plano de implementação do transcript canônico
status: implementado-em-revisao
atualizado: 2026-08-10
clickup: 86e2j4w4k
repositorios:
  - semantia-api
  - semantia-web
  - semantia-cerebro
branch_api: fix/pipeline-disfluencias
branch_web: chore/card07-sync-transcript-contract
branch_cerebro: docs/card07-transcript-canonico
---

# Card 07 — Plano de implementação do transcript canônico

> **Execução:** seguir TDD em ciclos RED → GREEN → REFACTOR, fazer commits pequenos e só declarar o
> card pronto depois dos gates automatizados, da migration em PostgreSQL descartável, do smoke
> Socket.IO e da revisão humana. Não substituir a limpeza determinística por LLM.

## Objetivo

Evoluir a camada determinística imediatamente posterior ao ASR para transformar o texto final
reconhecido em um **transcript canônico conservador, ordenado e rastreável**, removendo apenas ruído
inequívoco. O mesmo canônico será a fonte do modo literal e, no Card 08, a única entrada estável do
agente de adaptação.

A feature deve preservar o pipeline estabilizado do Card 06 e não acrescentar nova chamada de rede,
fila, modelo ou inferência ao caminho crítico.

## Estado real de partida em 2026-08-06

A `dev` da API foi atualizada com `git pull --ff-only origin dev` e está limpa em:

- branch: `dev`;
- SHA: `8c1ba5449ac98f0399e90e6bc3820d9214b6d711`;
- remoto: `origin/dev` no mesmo SHA;
- PRs API abertos no momento da inspeção: nenhum.

O pipeline vigente é:

```text
PCM16 mono/16 kHz
  → transcription:audio
  → autorização HOST + sessão LIVE
  → idempotência/coalescing/fila serial por sessão
  → faster-whisper small/int8
  → trim
  → stripDisfluencies (síncrono)
  → transação PostgreSQL (seq + clientSegmentId)
  → transcript:final
```

Já existem:

- `stripDisfluencies` com remoção de fillers, repetição contígua e pontuação órfã;
- descarte de texto vazio depois da limpeza no `AppendTranscriptSegmentUseCase`;
- ordenação por `seq`, idempotência por `(sessionId, clientSegmentId)` e broadcast apenas quando
  `created=true`;
- ACK sem segmento para ASR vazio;
- testes unitários do filtro, use case, ASR e gateway;
- E2E real de Socket.IO + PostgreSQL em `test/app.e2e-spec.ts`.

A regressão textual pedida no card já retorna corretamente no código atual:

```text
entrada: né? hoje hoje aula
saída:   hoje aula
```

Ela ainda deve ser registrada como teste contratual explícito porque o card exige essa garantia.

### Baseline de desempenho observado

Benchmark local, Node/ts-node, 1.000 warmups + 10.000 iterações por amostra:

| Amostra | Tamanho | p50 | p95 | p99 |
|---|---:|---:|---:|---:|
| regressão `né? hoje hoje aula` | 18 | 0,000819 ms | 0,001015 ms | 0,001505 ms |
| frase normal | 70 | 0,001410 ms | 0,001513 ms | 0,002350 ms |
| limite sintético | 5.000 | 0,054283 ms | 0,057284 ms | 0,061397 ms |

Esses números são baseline deste host, não promessa universal. O gate do Card 07 deve comprovar que a
nova versão continua local, síncrona e insignificante diante da inferência ASR.

### Falha de baseline encontrada

A execução fresca, sem cache, de:

```bash
pnpm exec jest src/modules/live/live.gateway.spec.ts --runInBand --no-cache
```

retornou sete testes aprovados e um teste legado quebrado. O caso chama `onTranscriptFinal`, handler
textual removido pelo Card 06, e falha com:

```text
TypeError: gateway.onTranscriptFinal is not a function
```

Essa falha não pertence à lógica de limpeza, mas precisa ser corrigida antes do ciclo do Card 07 para
que o baseline não seja falsamente tratado como verde. O teste deve ser substituído por uma validação
real de convidado tentando enviar `transcription:audio`; o handler textual não pode voltar.

Os três testes focados atuais da limpeza/ASR passaram sem cache: três suítes e 17 testes.

## Escopo

### Incluído

1. Contrato explícito entre texto reconhecido, canônico limpo e futuro texto adaptado.
2. Corpus table-driven de casos sintéticos e sanitizados em pt-BR.
3. Limpeza conservadora de fillers inequívocos, repetição contígua e pontuação órfã.
4. Preservação comprovada de palavras ambíguas, nomes, números, negações, Unicode e ênfase pontuada.
5. Versão imutável da estratégia em cada segmento persistido.
6. Marcação honesta de segmentos legados.
7. Descarte de ruído puro sem linha, persistência ou broadcast.
8. Replay idempotente do ruído descartado sem nova inferência ASR durante o TTL.
9. Campo aditivo `cleaningStrategyVersion` no REST, snapshot Socket.IO e `transcript:final`.
10. Regeneração do client OpenAPI/Orval, sem edição manual do código gerado.
11. Benchmark reproduzível e gates de latência, segurança, privacidade e E2E.
12. Documentação no cérebro e atualização do card/PRs.

### Fora do escopo

- resumir, interpretar, simplificar ou adaptar semanticamente;
- usar LLM, embeddings ou provedor externo para limpar texto;
- implementar o agente do Card 08;
- persistir o texto bruto reconhecido pelo ASR;
- persistir áudio, PCM, corpus de áudio ou transcrição humana identificável;
- criar parcial textual, ASR no navegador, VAD, overlap ou nova janela de áudio;
- corrigir erros linguísticos do ASR por adivinhação;
- mudar o modelo `small`, `beam_size=5`, hotwords vazias ou `condition_on_previous_text=False`;
- alterar a UI do modo literal/adaptado além da sincronização de tipos;
- implementar retenção/exclusão completa do Card 10.

## Regras de negócio consolidadas

1. **Canônico não é adaptação.** A limpeza remove somente disfluência inequívoca; não resume, explica,
   traduz, reorganiza nem completa intenção.
2. **Ambiguidade fica.** Se houver risco de alterar significado, a palavra permanece. Palavras como
   `bom`, `então`, `assim`, `sabe` e `tipo` não são fillers quando aparecem isoladamente em construção
   semântica; só uma expressão/posição inequivocamente discursiva pode ser removida.
3. **Ordem é inviolável.** A limpeza não troca segmentos nem palavras de lugar; `seq` continua sendo
   alocado na transação existente.
4. **Um final estável.** O agente futuro recebe apenas o texto canônico final, nunca parcial ou texto
   bruto instável.
5. **Vazio não é legenda.** Texto vazio após limpeza não cria linha, segmento, broadcast ou entrada de
   histórico.
6. **Retry não reinfere ruído.** O mesmo `clientSegmentId` descartado como ruído deve ser lembrado no
   cache efêmero de no-speech e reconhecido como replay durante 120 segundos.
7. **Literal usa o canônico.** O campo `text` existente permanece o literal canônico exibível.
8. **Versão por segmento.** Cada segmento novo registra exatamente qual estratégia produziu seu texto;
   isso evita mentir quando um deploy muda durante uma sessão longa.
9. **Legado é explícito.** Linhas anteriores ao Card 07 recebem `legacy-unversioned`, não a versão nova.
10. **Privacidade por minimização.** Só o canônico e a versão são persistidos; o bruto do ASR existe
    apenas na memória da chamada e não entra em banco, evento, log ou evidência.
11. **Sem novo hop.** A limpeza permanece função síncrona em processo, antes da transação existente.
12. **Contrato aditivo.** `cleaningStrategyVersion` é acrescentado sem renomear/remover campos atuais.

## Contrato de dados decidido

### Tipos do domínio

```ts
export const CURRENT_TRANSCRIPT_CLEANING_STRATEGY =
  'pt-br-conservative-v1' as const;

export const LEGACY_TRANSCRIPT_CLEANING_STRATEGY =
  'legacy-unversioned' as const;

export interface CanonicalTranscript {
  text: string;
  cleaningStrategyVersion: string;
}

export function cleanCanonicalTranscript(input: string): CanonicalTranscript;
```

O nome da versão deve ser tratado como identificador opaco e imutável. Qualquer alteração semântica
futura gera `pt-br-conservative-v2`; nunca editar o significado de `v1` retroativamente.

### Persistência

Adicionar a `transcript_segments`:

```prisma
cleaningStrategyVersion String @default("legacy-unversioned")
```

Migration compatível com rollback:

```sql
ALTER TABLE "transcript_segments"
ADD COLUMN "cleaningStrategyVersion" TEXT NOT NULL
DEFAULT 'legacy-unversioned';
```

Decisões:

- o default no banco permite que um rollback temporário para código antigo continue inserindo linhas;
- o código novo **sempre passa explicitamente** `pt-br-conservative-v1` no append;
- não criar índice: a versão não participa da ordenação/idempotência e o índice só aumentaria escrita;
- não alterar `text`, `seq`, `clientSegmentId` nem dados históricos;
- não criar colunas `rawText` ou `adaptedText` neste card.

### REST e Socket.IO

Cada segmento passa a expor:

```ts
{
  id?: string; // REST; Socket continua sem necessidade do id
  sessionId?: string; // REST
  seq: number;
  text: string;
  cleaningStrategyVersion: string;
  at?: Date; // Socket
  createdAt?: Date; // REST
}
```

O campo aparece em:

- `GET /api/sessions/:id/transcript`;
- `session:state.transcript[]`;
- `transcript:final`.

Ele não precisa aparecer no ACK de `transcription:audio`: o ACK confirma transporte/processamento, e o
segmento canônico já é entregue pelo evento final ou REST. Isso evita duplicar payload e contrato.

## Fluxo alvo

```text
resultado final do ASR (memória)
  → trim
  → cleanCanonicalTranscript (uma execução síncrona, O(n), entrada ≤ 5.000 chars)
      ├─ texto vazio
      │    → cache efêmero no-speech por sessionId/clientSegmentId (TTL 120 s)
      │    → ACK ok, seq=null, sem INSERT e sem transcript:final
      └─ texto canônico
           → INSERT/retorno idempotente com
              text + cleaningStrategyVersion + clientSegmentId + seq
           → transcript:final com text + cleaningStrategyVersion
           → REST/snapshot com a mesma linha
```

Não haverá chamada adicional ao ASR, banco, rede ou disco. A coluna nova viaja no mesmo INSERT e no
mesmo payload já emitido.

## Requisitos funcionais

| ID | Requisito | Prova |
|---|---|---|
| RF-C07-01 | Remover somente filler inequívoco configurado | corpus table-driven |
| RF-C07-02 | Colapsar repetição imediata sem pontuação separadora | corpus positivo/negativo |
| RF-C07-03 | Remover pontuação órfã após limpeza | regressão `né? hoje hoje aula` |
| RF-C07-04 | Preservar palavras semanticamente válidas | casos negativos |
| RF-C07-05 | Não criar segmento quando o canônico fica vazio | use case + E2E |
| RF-C07-06 | Não emitir `transcript:final` para ruído puro | gateway + E2E |
| RF-C07-07 | Manter ordem e idempotência | repo/use case + E2E |
| RF-C07-08 | Registrar a versão em todo segmento novo | migration + repo + E2E |
| RF-C07-09 | Identificar histórico anterior como legado | migration em DB descartável |
| RF-C07-10 | Entregar somente canônico estável ao downstream | ausência de handler textual/parcial + E2E |
| RF-C07-11 | Replay de ruído não repetir inferência | teste ASR com mesmo `clientSegmentId` |
| RF-C07-12 | REST e Socket devolverem a mesma versão | E2E |

Os requisitos preservam RF06/RF07 do MVP: limpeza de vícios/repetições e texto limpo como entrada da
IA, com contingência independente de IA.

## Requisitos não funcionais

### Latência e desempenho

1. Sem LLM, HTTP, fila adicional ou segunda consulta ao banco.
2. Uma única execução de limpeza por novo `clientSegmentId`; replay persistido retorna antes do ASR.
3. Repetição de ruído descartado usa cache no-speech e não reinfere durante o TTL.
4. Regexes compiladas no carregamento do módulo e entrada limitada a 5.000 caracteres.
5. Complexidade esperada O(n) por segmento; evitar padrões de backtracking catastrófico.
6. Benchmark controlado no mesmo host:
   - 1.000 iterações de warmup;
   - 10.000 medições;
   - amostras de 18, cerca de 70 e 5.000 caracteres;
   - p95 da amostra de 5.000 caracteres ≤ 1,0 ms;
   - registrar também p50/p99 e comparar com o baseline de 0,057284 ms p95.
7. Não usar assert temporal em Jest comum para evitar flakiness; o benchmark é gate separado e
   reproduzível.

### Disponibilidade e resiliência

- falha da IA futura não afeta este canônico;
- migration é backward-compatible para rollback de aplicação;
- conflitos de sequência e clientSegmentId continuam tratados pela transação existente;
- nenhuma alteração em ACK timeout, fila de oito segmentos, TTL frontend ou tentativas;
- um resultado tardio não é publicado depois do encerramento pelas garantias existentes do Card 06.

### Privacidade e segurança

- não persistir nem logar texto bruto, áudio ou diff humano identificável;
- não incluir payload textual em métricas, erros, comentários do PR ou evidências;
- corpus automatizado deve ser sintético/sanitizado;
- revisão humana usa arquivo local temporário e explicitamente autorizado;
- evidência versionada contém apenas contagens, tipos de caso e decisão humana, sem frases privadas;
- manter publicação restrita a `HOST` e sessão `LIVE`;
- manter gateway sem handlers cliente→servidor de texto parcial/final;
- validar strings até 5.000 caracteres e Unicode sem exceção/ReDoS.

### Compatibilidade

- mudança REST/Socket é aditiva;
- frontend ignora visualmente o campo, mas carrega seu tipo para uso futuro;
- segmentos antigos retornam `legacy-unversioned`;
- nenhum reprocessamento histórico ou alteração do texto antigo;
- OpenAPI é gerado do backend final; arquivos Orval não são editados manualmente.

## Corpus mínimo de aceitação

O corpus deverá separar `remove`, `preserve` e `discard`.

### Remove/normaliza

| Entrada | Saída esperada |
|---|---|
| `né? hoje hoje aula` | `hoje aula` |
| `Né, vamos vamos começar.` | `vamos começar.` |
| `ééé... comunicação acessível` | `comunicação acessível` |
| `tipo assim, precisamos revisar` | `precisamos revisar` |
| `Hoje hoje estudaremos Unicode.` | `Hoje estudaremos Unicode.` |
| `ação ação acessível` | `ação acessível` |
| `hum... então seguimos` | `então seguimos` (`então` isolado permanece sem contexto inequívoco de filler) |

### Preserva

| Entrada | Motivo |
|---|---|
| `Esse é um tipo de dado.` | `tipo` tem função semântica |
| `O resultado é válido.` | `é` é verbo legítimo |
| `Bom dia, equipe.` | `bom` é adjetivo/saudação legítima |
| `Se chover, então ficaremos em casa.` | `então` é conectivo lógico |
| `Faça assim para concluir.` | `assim` é advérbio legítimo |
| `Você sabe a resposta.` | `sabe` é verbo legítimo |
| `Não, não faça isso.` | repetição pontuada pode ser ênfase/correção |
| `É muito, muito importante.` | ênfase intencional pontuada |
| `O ano foi vinte vinte.` | números não devem ser colapsados por heurística textual |
| `Ana Né apresentou o trabalho.` | nome próprio não deve ser removido no meio da frase |
| `João falou sobre ação e inclusão.` | nomes, acentos e Unicode permanecem |
| `A palavra hummus tem dois emes.` | substring não é filler isolado |
| `O tipo assim definido é seguro.` | expressão inserida em construção semântica permanece |

### Descarta

- `né`;
- `ééé...`;
- `hum, ah, hã` quando compostos somente pelos fillers suportados;
- espaços e pontuação deixados pela remoção.

O conjunto exato de fillers deve continuar pequeno. Adicionar uma expressão exige um caso positivo e
pelo menos um caso negativo que prove que a expressão não apaga uso legítimo.

## Plano de implementação

### Tarefa 0 — Isolar branches e restaurar baseline verde

**Arquivos**

- Modificar: `semantia-api/src/modules/live/live.gateway.spec.ts`
- Nenhuma mudança de produção.

**Passos**

1. Atualizar remotos e criar worktree API a partir de `origin/dev`:

   ```bash
   git fetch origin --prune
   git worktree add ../.worktrees/semantia-api-card07 \
     -b fix/pipeline-disfluencias origin/dev
   ```

2. Criar também branches/worktrees do cérebro e, somente quando o contrato OpenAPI estiver estável,
   da web.
3. Executar `pnpm install --frozen-lockfile` e `pnpm prisma:generate` na worktree nova.
4. Reproduzir a falha atual com Jest sem cache.
5. Substituir o teste obsoleto `onTranscriptFinal` por teste que:
   - entra como `GUEST`;
   - chama `onTranscriptionAudio` com PCM válido;
   - recebe `FORBIDDEN`;
   - comprova que `transcribeAudio.execute` não foi chamado.
6. Manter o teste que prova ausência de handlers textuais.
7. Executar a suíte focada e depois toda a suíte sem cache.
8. Commit sugerido: `test(live): alinha regressão ao transporte PCM`.

**Critério de saída**

Baseline verde sem reintroduzir publicação textual pelo cliente.

### Tarefa 1 — Definir o canônico versionado por TDD

**Arquivos**

- Modificar: `src/modules/sessions/usecases/disfluencies.ts`
- Modificar: `src/modules/sessions/usecases/disfluencies.spec.ts`
- Criar: `src/modules/sessions/testing/transcript-cleaning.corpus.ts`

**RED**

1. Escrever teste para `cleanCanonicalTranscript('né? hoje hoje aula')` retornando:

   ```ts
   {
     text: 'hoje aula',
     cleaningStrategyVersion: 'pt-br-conservative-v1'
   }
   ```

2. Confirmar falha porque o contrato versionado ainda não existe.
3. Adicionar tabelas `remove`, `preserve` e `discard`, incluindo Unicode, caixa, pontuação, números,
   negação, nome próprio e substrings.

**GREEN**

1. Extrair constantes de estratégia e função `cleanCanonicalTranscript`.
2. Reutilizar a lógica comprovada de `stripDisfluencies`; não criar segunda passagem redundante.
3. Manter regexes como constantes de módulo.
4. Restringir remoção a tokens/expressões completos e posições inequivocamente discursivas.
5. Retornar versão junto do texto.

**REFACTOR**

1. Dar nomes por intenção às etapas: fillers, repetição imediata, espaços/pontuação órfã e decisão de
   conteúdo lexical.
2. Evitar lista grande e heurísticas linguísticas especulativas.
3. Manter `stripDisfluencies` somente como wrapper temporário se ainda houver chamadas; removê-lo
   quando todos os consumidores migrarem para o contrato novo.
4. Rodar casos longos e Unicode para detectar exceção ou lentidão anormal.

**Critério de saída**

Corpus inteiro verde, sem redução de casos ambíguos e sem LLM.

### Tarefa 2 — Versionar a persistência sem duplicar texto

**Arquivos**

- Modificar: `prisma/schema.prisma`
- Criar: `prisma/migrations/20260806190000_version_transcript_cleaning/migration.sql`
- Modificar: `src/modules/sessions/entities/transcript-segment.entity.ts`
- Modificar: `src/modules/sessions/repositories/transcript.repository.ts`
- Modificar: `src/modules/sessions/repositories/prisma-transcript.repository.ts`
- Modificar: `src/modules/sessions/testing/session-test.helpers.ts`
- Atualizar fixtures que constroem `TranscriptSegment`.

**RED**

1. Fazer os testes de domínio/repositório esperarem `cleaningStrategyVersion`.
2. Fazer o teste do append esperar que a versão corrente seja passada explicitamente ao repositório.
3. Confirmar falha de tipagem/teste antes da modelagem.

**GREEN**

1. Adicionar coluna com default `legacy-unversioned`.
2. Regenerar Prisma Client.
3. Adicionar o campo obrigatório à entidade.
4. Acrescentar a versão ao contrato `append` e a todos os mapeamentos Prisma.
5. Não alterar a transação de alocação de `seq` nem a chave idempotente.
6. Garantir que replays retornem a versão armazenada, não a versão atualmente carregada no processo.

**Verificação da migration em PostgreSQL descartável**

1. Aplicar migrations anteriores.
2. Inserir uma linha de transcript anterior ao Card 07.
3. Aplicar a migration nova.
4. Verificar `NOT NULL`, default e valor `legacy-unversioned` na linha existente.
5. Iniciar a API nova e persistir linha `pt-br-conservative-v1`.
6. Simular insert do código antigo omitindo a coluna e confirmar default legado para rollback.
7. Não executar drop/reset em banco compartilhado ou de produção.

**Critério de saída**

Legado rotulado honestamente, novos segmentos versionados e zero coluna de texto bruto.

### Tarefa 3 — Integrar limpeza, descarte e replay sem nova inferência

**Arquivos**

- Modificar: `src/modules/sessions/usecases/append-transcript-segment.usecase.ts`
- Modificar: `src/modules/sessions/usecases/session-content.spec.ts`
- Modificar: `src/modules/asr/usecases/transcribe-audio-segment.usecase.ts`
- Modificar: `src/modules/asr/usecases/transcribe-audio-segment.usecase.spec.ts`

**RED**

1. Testar append de frase com fillers:
   - repositório recebe apenas canônico;
   - recebe `pt-br-conservative-v1`;
   - nunca recebe o bruto.
2. Testar frase composta só por ruído:
   - append retorna ausência de segmento;
   - repositório não é chamado.
3. Testar retry do mesmo `clientSegmentId` cujo ASR retornou texto não vazio, mas a limpeza zerou:
   - primeira chamada: `segment=null`, `replayed=false`;
   - segunda chamada: `segment=null`, `replayed=true`;
   - ASR chamado uma vez;
   - append chamado uma vez.
4. Testar replay persistido antigo devolvendo `legacy-unversioned`.

**GREEN**

1. Chamar `cleanCanonicalTranscript` exatamente uma vez no append.
2. Se o canônico estiver vazio, retornar sem repository append.
3. No use case ASR, quando o append não criar segmento por limpeza vazia, chamar o mesmo
   `rememberNoSpeech` já usado por ASR vazio.
4. Preservar metadata `engine`, `model` e `inferenceMs` no ACK/replay existente.
5. Não logar `result.text`, canônico ou diferenças.

**REFACTOR**

Se `null` ficar ambíguo, usar união discriminada interna:

```ts
{ kind: 'discarded' } |
{ kind: 'segment'; segment: TranscriptSegment; created: boolean }
```

Só fazer isso se melhorar clareza nos consumidores; não adicionar abstração sem necessidade.

**Critério de saída**

Ruído puro não persiste/transmite e retry não paga nova inferência.

### Tarefa 4 — Propagar rastreabilidade no REST e Socket.IO

**Arquivos**

- Modificar: `src/modules/sessions/dtos/session-response.dto.ts`
- Modificar: `src/modules/live/live.gateway.ts`
- Modificar: `src/modules/live/live.gateway.spec.ts`
- Modificar: `test/app.e2e-spec.ts`

**RED**

1. DTO/OpenAPI espera `cleaningStrategyVersion` obrigatório.
2. Gateway espera versão em `session:state.transcript[]` e `transcript:final`.
3. E2E espera o mesmo valor no evento e no REST.
4. E2E adicional usa retorno ASR de ruído e prova:
   - ACK `ok=true`, `seq=null`;
   - ausência de nova linha no transcript REST;
   - retry do mesmo ID não chama ASR de novo.

**GREEN**

1. Mapear a versão já presente na entidade nos dois payloads Socket.
2. Decorar o campo no Swagger como string opaca com exemplo `pt-br-conservative-v1`.
3. Manter todos os campos atuais e o formato do ACK.
4. Não enviar texto bruto, diff ou lista de tokens removidos.

**Critério de saída**

Banco, REST, snapshot e evento final concordam sobre `seq`, `text` e versão.

### Tarefa 5 — Sincronizar client web sem lógica nova de UI

**Pré-condição**

Executar só depois do contrato API e dos testes backend estabilizarem.

**Arquivos**

- Regenerar: `semantia-web/openapi.json`
- Regenerar: `semantia-web/src/api/generated/**`
- Modificar: `semantia-web/src/live/types.ts`
- Modificar: `semantia-web/src/live/useLiveSession.ts`
- Modificar: `semantia-web/src/live/useLiveSession.spec.ts`

**Passos**

1. Subir a API da branch Card 07 com a migration aplicada em banco local.
2. Na web, executar:

   ```bash
   API_DOCS_URL=http://127.0.0.1:3000/docs-json pnpm api:sync
   ```

3. Confirmar que Orval acrescentou `cleaningStrategyVersion` ao `TranscriptSegmentDto`; não editar o
   arquivo gerado manualmente.
4. Acrescentar a versão aos tipos Socket e ao `normalizeTranscriptEntry`.
5. Carregar a versão no estado, mas não exibi-la nem criar opção de UI neste card.
6. Atualizar testes de snapshot/evento final.
7. Executar teste, typecheck e build.

**Critério de saída**

Contrato tipado sincronizado e nenhuma alteração visual/latência no navegador.

### Tarefa 6 — Criar benchmark reproduzível e validar RNFs

**Arquivos**

- Criar: `semantia-api/scripts/benchmark-transcript-cleaning.ts`
- Modificar: `semantia-api/package.json`

**Passos**

1. Adicionar script `benchmark:transcript-cleaning` usando `ts-node` já presente.
2. Usar somente amostras sintéticas de 18, ~70 e 5.000 caracteres.
3. Fazer 1.000 warmups e 10.000 medições com `performance.now()`.
4. Reportar JSON com tamanho, p50, p95 e p99.
5. Falhar com exit code não zero se p95 da amostra de 5.000 caracteres superar 1,0 ms.
6. Executar no mesmo perfil de CPU usado no baseline e registrar ambiente/comando, sem chamar o
   resultado de benchmark de VPS física.
7. Verificar por inspeção/diff:
   - nenhuma dependência nova;
   - nenhuma chamada async na limpeza;
   - nenhuma query adicional;
   - nenhuma regex sem limite de entrada;
   - nenhum log de conteúdo.

**Critério de saída**

p95 dentro do orçamento e caminho crítico sem novo hop.

### Tarefa 7 — Revisão humana segura

1. Selecionar uma amostra real explicitamente autorizada pelo usuário.
2. Copiar somente durante a revisão para `/tmp/card07-review-input.txt` com permissão restrita.
3. Rodar localmente a limpeza e revisar lado a lado:
   - remoção correta;
   - falsos positivos;
   - mudança de sentido;
   - pontuação órfã;
   - ordem.
4. Não commitar, anexar ao ClickUp ou incluir em logs a amostra/diff.
5. Apagar o arquivo temporário ao fim.
6. Versionar somente um resumo sanitizado:
   - quantidade de segmentos;
   - quantos mudaram;
   - quantos foram descartados;
   - falsos positivos encontrados;
   - decisão de aprovação/reprovação.
7. Se houver falso positivo, adicionar caso **sintético equivalente** ao corpus antes de corrigir.

**Critério de saída**

Zero alteração semântica identificada na amostra aprovada; caso contrário, voltar ao RED.

### Tarefa 8 — Atualizar cérebro, ClickUp e PRs

**Cérebro**

- Criar: `arquitetura/transcript-canonico-card-07.md`
- Criar: `arquitetura/decisoes/ADR-003-transcript-canonico-versionado.md`
- Criar: `contexto/diario-card07-transcript-canonico-2026-08-06.md`
- Atualizar: `requisitos/mvp-transcricao-tempo-real.md`
- Atualizar: `produto/contrato-mvp-transcricao-tempo-real.md`
- Atualizar: `contexto/historico-e-decisoes.md`
- Atualizar: registro de cards/links do backlog.

Documentar:

- bruto efêmero versus canônico persistido;
- versão corrente e política de novas versões;
- tratamento do legado;
- corpus e limites conhecidos;
- decisão de não usar LLM;
- benchmark e ambiente;
- retenção zero de áudio;
- PRs, SHAs, migration e rollback.

**ClickUp**

1. Ao iniciar a execução, mover Card 07 para `EM PROGRESSO`.
2. Atualizar seção `Alterações` com branches e, depois, PRs.
3. Não marcar concluído enquanto houver PR aberto.
4. Após gates e revisão, mover para `EM REVISÃO`.
5. Registrar um único comentário final sanitizado com links, gates e limitações.

**PRs sugeridos**

1. API: `fix(transcript): versiona limpeza canônica conservadora` → `dev`.
2. Web: `chore(api): sincroniza versão do transcript canônico` → `dev`, depois do backend final.
3. Cérebro: `docs(card-07): documenta transcript canônico versionado` → `main`.

Não fazer merge automático; seguir revisão humana e workflow do Semantia.

## Ordem de commits sugerida

1. `test(live): alinha regressão ao transporte PCM`
2. `test(transcript): define corpus canônico conservador`
3. `feat(transcript): versiona estratégia de limpeza`
4. `fix(asr): evita reinferência de ruído descartado`
5. `feat(transcript): expõe versão no REST e socket`
6. `test(transcript): cobre fluxo canônico ponta a ponta`
7. `perf(transcript): adiciona benchmark da limpeza`
8. Web: `chore(api): regenera contrato de transcript`
9. Cérebro: `docs(card-07): registra arquitetura e evidências`

Agrupar commits apenas se o diff ficar artificialmente fragmentado; cada commit deve compilar/testar.

## Gates obrigatórios

### API focada

```bash
pnpm prisma:generate
pnpm exec prisma validate
pnpm exec jest src/modules/sessions/usecases/disfluencies.spec.ts \
  src/modules/sessions/usecases/session-content.spec.ts \
  src/modules/asr/usecases/transcribe-audio-segment.usecase.spec.ts \
  src/modules/live/live.gateway.spec.ts \
  --runInBand --no-cache
pnpm benchmark:transcript-cleaning
```

### API completa

```bash
pnpm exec jest --runInBand --no-cache
pnpm test:e2e
pnpm lint
pnpm build
pnpm audit --prod --audit-level=high
git diff --check
```

O E2E requer PostgreSQL real descartável/com backup apropriado; não considerar mock unitário substituto.

### Web

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm audit --prod --audit-level=high
git diff --check
```

### Prisma/runtime

1. `prisma migrate deploy` em banco scratch.
2. Verificar schema, default, backfill legado e insert novo.
3. Subir API + web + ASR + PostgreSQL.
4. Enviar um segmento com fala válida e confirmar uma linha/evento.
5. Enviar ruído textual determinístico via E2E mock e confirmar zero linha/evento.
6. Repetir o mesmo `clientSegmentId` e confirmar zero nova inferência.
7. Reconectar e confirmar snapshot ordenado com versão.
8. Consultar REST e confirmar igualdade com Socket.
9. Encerrar sessão e confirmar ausência de escrita tardia.
10. Inspecionar volumes/logs e confirmar ausência de áudio/texto bruto.

### Documentação e segurança

- frontmatter YAML válido;
- links relativos existentes;
- nenhuma credencial/token/segredo;
- nenhuma amostra humana identificável;
- `git diff --check` em todos os repos;
- ClickUp consistente com branches/PRs reais.

## Critérios de aceite finais

- [x] Baseline Jest stale corrigido sem reintroduzir handler textual.
- [x] Regressão `né? hoje hoje aula` produz `hoje aula` sem `?` órfão.
- [x] Corpus pt-BR cobre acentos, Unicode, caixa, pontuação, repetição e ambiguidade.
- [x] Frases legítimas como `tipo de dado` permanecem intactas.
- [x] Limpeza não resume, interpreta ou adapta.
- [x] Segmento novo persiste `pt-br-conservative-v1`.
- [x] Segmento antigo retorna `legacy-unversioned`.
- [x] Texto bruto do ASR não é persistido, emitido ou logado.
- [x] Texto vazio após limpeza não gera INSERT nem `transcript:final`.
- [x] Retry de ruído descartado não chama ASR novamente no TTL.
- [x] Ordem `seq` e idempotência permanecem corretas.
- [x] REST, snapshot e evento final concordam em texto/versão.
- [x] Client Orval foi regenerado do OpenAPI final.
- [x] Nenhuma mudança visual foi introduzida na web.
- [x] Nenhuma dependência ou chamada de rede foi adicionada à limpeza.
- [x] Benchmark de 5.000 caracteres fica ≤ 1,0 ms p95 no gate controlado.
- [x] Unitários, E2E, lint, builds, Prisma e audits passam.
- [x] Migration foi comprovada em PostgreSQL descartável.
- [ ] Revisão humana com amostra real: não executada porque não há corpus anonimizado e explicitamente autorizado; permanece nos Cards 11/17.
- [x] Áudio, bruto e corpus privado continuam efêmeros.
- [ ] Documentação/ClickUp refletem estado real e PRs permanecem para revisão.

## Rollback

1. Reverter o código API/web para o último checkpoint estável do Card 06.
2. **Não remover a coluna** durante rollback emergencial.
3. O default `legacy-unversioned` mantém inserts do código antigo funcionando.
4. Linhas já gravadas com `pt-br-conservative-v1` permanecem válidas.
5. Confirmar novamente API health, ASR ready, uma transcrição literal, persistência única e broadcast.
6. Abrir correção forward em branch nova; não resetar `dev` nem reescrever migration aplicada.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| limpeza agressiva muda sentido | corpus negativo + revisão humana + lista pequena |
| regex degrada com entrada longa | limite de 5.000 + benchmark + padrões pré-compilados |
| ruído descartado reinfere no retry | cache no-speech também após limpeza vazia |
| histórico recebe versão falsa | `legacy-unversioned` explícito |
| rollback antigo deixa de inserir | default de banco mantido |
| campo novo diverge entre API/web | OpenAPI final + Orval, nunca edição manual |
| bruto vaza em evidência/log | minimização, amostra local `/tmp`, resumo sem conteúdo |
| teste verde por cache | Jest `--no-cache` nos gates críticos |
| Card 08 consome parcial/bruto | contrato documentado e integração somente com canônico |

## Referências

- ClickUp Card 07: `https://app.clickup.com/t/90171419563/86e2j4w4k`
- [`../requisitos/mvp-transcricao-tempo-real.md`](../requisitos/mvp-transcricao-tempo-real.md)
- [`../produto/contrato-mvp-transcricao-tempo-real.md`](../produto/contrato-mvp-transcricao-tempo-real.md)
- [`../arquitetura/captura-fala-transporte-card-06.md`](../arquitetura/captura-fala-transporte-card-06.md)
- [`../arquitetura/decisoes/ADR-002-captura-pcm-janelas-fixas.md`](../arquitetura/decisoes/ADR-002-captura-pcm-janelas-fixas.md)
