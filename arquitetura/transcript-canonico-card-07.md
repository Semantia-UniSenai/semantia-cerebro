---
title: Card 07 — transcript canônico conservador e versionado
status: em-revisao
atualizado: 2026-08-10
clickup: 86e2j4w4k
strategy: pt-br-conservative-v1
---

# Card 07 — transcript canônico conservador e versionado

O Card 07 consolida a única forma literal persistida do texto final reconhecido pelo ASR. A limpeza
permanece local, síncrona, determinística e conservadora: remove somente ruído inequívoco, não chama
LLM, não acrescenta rede e não tenta corrigir o reconhecedor por adivinhação.

A decisão normativa está na
[ADR-003](./decisoes/ADR-003-transcript-canonico-versionado.md). A evidência sanitizada dos gates está
em [`../evidencias/card-07/validation-2026-08-10.json`](../evidencias/card-07/validation-2026-08-10.json).

PRs abertos para revisão humana:

- [API #10](https://github.com/Semantia-UniSenai/semantia-api/pull/10);
- [web #10](https://github.com/Semantia-UniSenai/semantia-web/pull/10);
- [cérebro #8](https://github.com/Semantia-UniSenai/semantia-cerebro/pull/8).

Os três PRs estavam `OPEN`, `CLEAN` e `MERGEABLE` após a publicação. Nenhum repositório tinha checks
de CI configurados (`statusCheckRollup=[]`); os gates locais versionados abaixo são a evidência
executável disponível. Nenhum merge automático foi realizado.

## Contrato vigente

```text
PCM16 mono/16 kHz efêmero
  → ASR final faster-whisper
  → trim
  → cleanCanonicalTranscript(text)
      ├─ vazio: ACK conclusivo, seq=null, sem INSERT e sem transcript:final
      └─ conteúdo: text canônico + cleaningStrategyVersion
           → transação PostgreSQL existente
           → transcript:final
           → snapshot e REST
```

A estratégia corrente é o identificador imutável `pt-br-conservative-v1`. Registros e eventos
anteriores sem rastreabilidade explícita são identificados como `legacy-unversioned`.

O campo `text` continua sendo a única cópia persistida do transcript literal. O texto bruto retornado
pelo ASR permanece somente na memória da chamada e não entra em banco, REST, Socket.IO, corpus,
evidência ou log.

## Regras conservadoras

### Remove ou normaliza

| Entrada sintética | Canônico |
|---|---|
| `né? hoje hoje aula` | `hoje aula` |
| `tipo assim, precisamos revisar` | `precisamos revisar` |
| `isso é importante, tá ligado, pessoal` | `isso é importante, pessoal` |
| `Né, tipo assim, tá ligado, precisamos revisar` | `precisamos revisar` |
| `ééé... comunicação acessível` | `comunicação acessível` |
| `ação ação acessível` | `ação acessível` |
| `hum... então seguimos` | `então seguimos` |

Marcadores empilhados no início são consumidos por uma única expressão limitada pela entrada; não há
loop de substituição. A pontuação ligada ao marcador removido também cai, evitando `?` ou vírgula
órfã.

### Preserva na dúvida

| Entrada sintética | Motivo |
|---|---|
| `Esse é um tipo de dado.` | `tipo` é substantivo |
| `Bom dia, equipe.` | saudação legítima |
| `Se chover, então ficaremos em casa.` | conectivo lógico |
| `Faça assim para concluir.` | advérbio legítimo |
| `Você sabe a resposta.` | verbo legítimo |
| `Ana Né apresentou o trabalho.` | nome próprio |
| `O sensor tá ligado na tomada.` | sentido literal |
| `Não, não faça isso.` | repetição pontuada pode ser ênfase |
| `O ano foi vinte vinte.` | números repetidos são preservados |
| `O hummus é uma pasta.` | substring não é filler |

O filtro não resume, traduz, reorganiza, completa intenção, troca nomes, corrige números ou remove
negações. Repetição separada por pontuação permanece.

## Descarte e replay

Se a limpeza produzir vazio:

1. o append retorna ausência de segmento;
2. nenhuma transação ou alocação de `seq` ocorre;
3. nenhum `transcript:final` é emitido;
4. o ACK continua conclusivo com `ok=true` e `seq=null`;
5. engine, modelo e latência do resultado permanecem no ACK interno existente;
6. o mesmo `(sessionId, clientSegmentId)` recebe replay sem nova inferência durante 120 segundos.

O cache efêmero no-speech não contém texto nem áudio, expira por TTL e fica limitado a 512 entradas no
processo. Ao atingir o limite, exatamente a entrada mais antiga é removida antes da inserção. A
serialização por sessão, a coalescência de inflight, a fila máxima de oito e a idempotência persistida
continuam sendo as guardas do Card 06.

## Persistência e compatibilidade

A migration `20260806190000_version_transcript_cleaning` adiciona:

```sql
ALTER TABLE "transcript_segments"
ADD COLUMN "cleaningStrategyVersion" TEXT NOT NULL
DEFAULT 'legacy-unversioned';
```

Propriedades:

- aditiva e sem reescrita do campo `text`;
- registros existentes recebem `legacy-unversioned`;
- código novo passa `pt-br-conservative-v1` explicitamente no mesmo `INSERT`;
- código antigo ainda consegue inserir omitindo a coluna, útil para rollback emergencial;
- não há índice novo, query adicional, coluna de bruto nem backfill que atribua `v1` ao histórico.

A versão é propagada em:

- `GET /api/sessions/:id/transcript`;
- `session:state.transcript[]`;
- `transcript:final`;
- `TranscriptEntry` no frontend.

O frontend aceita eventos Socket antigos sem o campo e os normaliza imediatamente para
`legacy-unversioned`. Não existe alteração visual neste card.

## Prova da migration

Em 2026-08-10 foram usados bancos PostgreSQL scratch exclusivos, posteriormente removidos:

1. cadeia completa em banco vazio: seis migrations aplicadas;
2. cadeia N−1: cinco migrations e coluna ainda ausente;
3. fixture sintética com usuário, sala, sessão LIVE e transcript legado;
4. aplicação apenas da migration candidata;
5. linha anterior preservada com `legacy-unversioned`;
6. insert explícito `pt-br-conservative-v1` aprovado;
7. insert pelo contrato antigo, omitindo a coluna, aprovado com default legado;
8. tentativa de `NULL` rejeitada e sem linha residual;
9. relações e três transcripts válidos preservados;
10. três bancos scratch e harness temporário removidos; zero banco scratch remanescente.

Nenhum reset, drop ou escrita foi executado em banco compartilhado ou de produção.

## Revisão de código

A revisão final cobriu regras semânticas, diff completo, lifecycle, cache, concorrência, retries,
serialização, regexes, OpenAPI/Orval, migration, segurança e privacidade. Cinco achados foram
corrigidos antes da publicação:

1. marcadores discursivos empilhados eram removidos apenas uma vez;
2. cache no-speech tinha TTL, mas não limite de cardinalidade;
3. E2E de ausência de broadcast dependia de espera fixa de 100 ms;
4. Orval havia trazido drift de `audienceContext` fora do escopo;
5. audit encontrou `js-yaml < 4.3.1` transitivo com vulnerabilidade alta.

As correções adicionaram regressões, eliminaram o timeout fixo, restringiram o diff web ao Card 07 e
atualizaram somente o override já existente de `js-yaml` para `4.3.1`. Scans das linhas adicionadas não
encontraram segredo, execução dinâmica, rede nova, log de conteúdo, retenção de PCM/áudio ou loop
infinito.

## Gates finais verificados

| Gate | Resultado |
|---|---|
| API Jest sem cache | 21 suítes, 120/120 testes |
| API E2E PostgreSQL + Socket.IO | 1/1 |
| API build | aprovado |
| Prisma validate | aprovado |
| API audit produção | nenhuma vulnerabilidade conhecida após `js-yaml 4.3.1` |
| Web Vitest | 18 arquivos, 94/94 testes |
| Web typecheck/build | aprovados |
| Web audit produção | nenhuma vulnerabilidade conhecida |
| ASR pytest | 15/15 |
| ASR Ruff | aprovado |
| Migration fresh e N−1 | aprovada |
| `git diff --check` | aprovado nos três worktrees antes da publicação |

Benchmark isolado, Node/ts-node, no host de desenvolvimento:

| Perfil | Tamanho | Iterações | p95 | Limite |
|---|---:|---:|---:|---:|
| normal | 54 | 50.000 | 0,002458 ms | 1 ms |
| remoção máxima | 5.000 | 5.000 | 0,065897 ms | 1 ms |
| preservação máxima | 5.000 | 5.000 | 0,049767 ms | 1 ms |

São medições deste host, não promessa de latência ponta a ponta nem de VPS de produção. O script falha
com exit code não zero se qualquer perfil exceder `1 ms p95`.

## Limitações explícitas

- o corpus versionado é exclusivamente sintético;
- não havia amostra humana real anonimizada e explicitamente autorizada, portanto nenhuma foi usada;
- o Card 07 não corrige erros linguísticos produzidos pelo ASR;
- a validação com fala espontânea, sotaques, nomes e público real continua nos Cards 11 e 17;
- o Card 07 não implementa agente, modo adaptado, retenção de 30 dias ou rate limit;
- o cache no-speech é local ao processo; após restart, ruído não persistido pode ser inferido outra vez;
- qualquer mudança nas regras cria `pt-br-conservative-v2`, nunca altera retroativamente a `v1`.

## Rollback

1. Reverter aplicação API/web para o checkpoint estável do Card 06.
2. Não remover a coluna durante rollback emergencial.
3. O default `legacy-unversioned` mantém inserts do código anterior funcionando.
4. Segmentos já gravados com `pt-br-conservative-v1` permanecem válidos.
5. Confirmar health, ASR ready, persistência única, ACK vazio e broadcast.
6. Corrigir adiante em branch nova; não reescrever migration aplicada nem resetar `dev`.

## Referências

- [ADR-003 — transcript canônico versionado](./decisoes/ADR-003-transcript-canonico-versionado.md)
- [Card 06 — captura e transporte](./captura-fala-transporte-card-06.md)
- [Requisitos canônicos](../requisitos/mvp-transcricao-tempo-real.md)
- [Contrato do MVP](../produto/contrato-mvp-transcricao-tempo-real.md)
- [Plano executado](../planejamento/2026-08-06-card-07-transcript-canonico-plano-implementacao.md)
