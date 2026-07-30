# Sala ao vivo — arquitetura do domínio genérico

> **Status em 2026-07-30:** o contrato genérico foi implementado e validado na branch
> `feat/salas-comunicacao`, empilhada sobre `docs/novo-escopo-transcricao`. Ainda depende de revisão
> e merge dos PRs para ser considerado integrado em `dev`.
>
> Use este documento junto ao
> [contrato canônico](../produto/contrato-mvp-transcricao-tempo-real.md), ao
> [glossário](../produto/glossario.md) e aos
> [requisitos atuais](../requisitos/mvp-transcricao-tempo-real.md).

## Fronteira entre realidade e alvo

| Área | Validado na branch de generalização | Ainda planejado |
|---|---|---|
| Papéis | `HOST`, `MODERATOR`, `PARTICIPANT` e `GUEST`, todos contextuais | separar comunicador do anfitrião quando houver necessidade comprovada |
| Agregado | `Room` como reunião do produto; `RoomSession` e `SessionParticipant` como persistência interna | contexto detalhado e versionado da plateia |
| Entrada | JWT para conta; `joinToken` + token efêmero para convidado | revogação administrativa antes do encerramento e rate limit |
| Transcript | uma versão literal limpa e persistida | literal + adaptada por segmento |
| Retenção | reunião encerrada somente leitura, sem expiração automática | exclusão antecipada e automática em 30 dias |
| Capacidade | jornada multiator funcional | carga e reconexão comprovadas para 25/50 conexões |
| Duração | ciclo explícito sem limite automático | limite de até 4 horas |

Código validado na branch não deve ser descrito como já integrado em `dev`; da mesma forma, itens
planejados não devem ser anunciados como entregues.

## Decisão de produto: reunião instantânea

Para o MVP, **`Room` é a reunião percebida pelo usuário**. A jornada segue o modelo do Google Meet:
um clique em **Nova reunião** executa uma criação transacional, gera o convite e entrega a
experiência já ao vivo. Não existem no contrato de UX:

- criação manual de ocorrência;
- estado ou tela de preparação;
- ação separada para iniciar;
- painel de configuração antes da entrada;
- histórico de sessões dentro de uma sala.

`RoomSession` permanece no schema como um registro técnico interno para preservar participantes,
transcript, chat e os dados migrados. Toda nova `Room` criada pelo fluxo atual recebe exatamente
uma ocorrência interna já em `LIVE`. Registros históricos migrados podem preservar ocorrências
anteriores sem reintroduzir esse modelo na interface.

## Modelo validado

- `User`: identidade autenticada sem papel global de produto.
- `Room`: reunião do produto, com nome, anfitrião (`hostId`), código legado e timestamps.
- `RoomMember`: associação persistente com papel `MODERATOR` ou `PARTICIPANT`.
- `RoomSession`: ocorrência interna obrigatória, criada já `LIVE`, com `joinToken`, estado e horários.
- `SessionParticipant`: identidade autenticada ou convidada restrita à reunião.
- `TranscriptSegment`: `sessionId`, sequência estável, texto literal e data.
- `ChatMessage`: sessão, identidade contextual, texto e data.
- `Score`: datilologia/ranking, fora do núcleo atual.

O anfitrião é derivado de `Room.hostId`, não de uma função global no cadastro. Moderadores e
participantes recebem permissões somente pela associação à sala. Convidados não são promovidos a
membros persistentes.

## Papéis e permissões

| Operação | Host | Moderator | Participant | Guest |
|---|---:|---:|---:|---:|
| abrir reunião instantânea | sim | não | não | não |
| configurar e renomear durante a reunião | sim | sim | não | não |
| administrar membros | sim | sim, dentro do contrato autorizado | não | não |
| encerrar reunião | sim | sim | não | não |
| entrar em reunião `LIVE` autorizada | sim | sim | sim | sim, por token efêmero |
| consultar conteúdo após `ENDED` | sim | sim | sim, se associado | sim, enquanto o token for válido |
| enviar chat/transcript após `ENDED` | não | não | não | não |
| receber `joinToken` reutilizável | sim | sim | não | não |

Detalhes, listagens e snapshots removem o `joinToken` para quem não possui `canManage`. O token
efêmero do convidado carrega identidade e reunião específicas e não funciona em outra reunião.

## Ciclo de vida

```text
POST /rooms ── transação ──▶ Room + ocorrência interna LIVE ── end ──▶ ENDED
                                      │                               │
                                      │ acesso por link               └─ leitura de transcript/chat
                                      └─ mutações habilitadas
```

- criação produz `LIVE` e `startedAt` na mesma transação que cria a `Room`;
- não há endpoint público para criar/listar ocorrência ou iniciá-la manualmente;
- apenas anfitrião ou moderador encerra;
- encerramento é idempotente;
- chat, transcript e ações ao vivo recusam mutações depois de `ENDED`;
- conteúdo persistido continua consultável conforme a política de retenção vigente.
- `PREPARING` permanece apenas para compatibilidade da migration e não faz parte da jornada ativa.

## Migração preservadora

A migration `20260730090000_generalize_communication_rooms`:

1. acrescenta os novos valores de estado e torna `PREPARING` o default;
2. converte `school_classes` em `rooms`, preservando IDs, criador e timestamps;
3. converte `class_members` em `room_members`;
4. converte `live_sessions` em `room_sessions` e troca `classId` por `roomId`;
5. cria salas de fallback determinísticas para sessões antigas sem turma;
6. cria identidades contextuais para sessões e chats existentes;
7. mantém as chaves de `transcript_segments` e `chat_messages` ligadas às sessões renomeadas;
8. remove `User.role` e os enums escolares apenas depois da conversão.

A prova foi executada em PostgreSQL 16 por dois caminhos:

- cadeia completa em banco vazio via `prisma migrate deploy`;
- schema educacional anterior + fixture contendo turma, vínculo, duas sessões — uma sem turma —,
  transcript e chat, seguido da migration e de assertivas SQL de cardinalidade, IDs, relações,
  papéis e default de estado.

## API REST e OpenAPI

O contrato público usa `POST /api/rooms` para abrir a reunião instantânea e `/api/sessions`
internamente para convite, snapshot, transcript e encerramento. As rotas públicas de criar/listar
ocorrências e iniciar manualmente foram removidas. Swagger foi gerado a partir da API real com 17
paths e 19 operações; o cliente frontend foi recapturado e regenerado pelo fluxo `pnpm api:sync`.

As jornadas ativas não expõem `/classes`, `/turmas` ou `/aula`. Compatibilidade com o domínio
escolar acontece pela migration dos dados, não pela manutenção indefinida de dois contratos
públicos concorrentes.

## Protocolo Socket.IO

Namespace `/live`, room `session:<id>` e handshake por uma das identidades:

- JWT autenticado;
- `guestToken` efêmero emitido para a sessão.

Eventos cliente → servidor:

- `session:join/leave/end`;
- `transcript:partial/final`;
- `chat:send`;
- `hand:raise/lower`.

Eventos servidor → cliente:

- snapshot de sessão, presença e permissões contextuais;
- atualizações de participantes;
- parciais e finais de transcript;
- chat e fila de mãos;
- encerramento e falhas reconhecidas.

Todo comando recebe `{ ok: true, ... }` ou `{ ok: false, error: { code, message } }`. O gateway
permanece fino e delega autorização, persistência e transições aos mesmos serviços usados pelo
REST.

## Fluxo atual da transcrição

```text
Comunicador no browser                   API                         Participantes
Web Speech API ─ parcial ─▶ transcript:partial ─▶ broadcast ─▶ legenda parcial
Web Speech API ─ final ───▶ transcript:final ───▶ usecase ──▶ persistência + broadcast
                                                   │
                                                   └─ stripDisfluencies()
```

- parciais são efêmeras e não persistidas;
- finais recebem limpeza conservadora;
- ruído puro não recebe sequência nem broadcast;
- sequência, transcript e chat sobrevivem ao encerramento;
- o Brave pode emitir erro `network` no reconhecimento; o front evita reinício infinito.

## Arquitetura-alvo do pipeline

```text
áudio do navegador
  → STT parcial (efêmero)
  → STT final
  → limpeza conservadora no backend
  → transcript literal canônico + persistência
  → fila de adaptação contextual
  → transcript adaptado OU fallback literal
  → preferência individual + legenda karaokê
```

A adaptação, o contexto da plateia e a preferência literal/adaptada permanecem planejados. Falha
de IA nunca poderá bloquear o literal e credenciais de provedor deverão existir somente no
backend por variável de ambiente.

## Evidências de validação

Em 2026-07-30, na branch de generalização:

- PR API: [Semantia-UniSenai/semantia-api#4](https://github.com/Semantia-UniSenai/semantia-api/pull/4);
- PR web: [Semantia-UniSenai/semantia-web#4](https://github.com/Semantia-UniSenai/semantia-web/pull/4);

- API: 15 suites e 61 testes unitários, lint, build e Prisma aprovados;
- E2E multiator aprovado contra PostgreSQL 16;
- migration limpa e migration com dados legados aprovadas;
- OpenAPI/Orval sincronizados;
- frontend: 13 arquivos e 68 testes, além do build, aprovados;
- audit de produção sem vulnerabilidades altas; web sem advisories e API com 3 moderadas;
- jornada anterior de preparação foi rejeitada na revisão de produto e removida. O QA final em
  Brave/Chromium provou em 1440×900 e 390×844: cadastro, **Nova reunião** em um clique, entrada ao
  vivo, convite `/convite/reuniao/:token`, Socket.IO/chat, encerramento, leitura posterior e card
  recente ligado diretamente à reunião; a abertura observada no ambiente local levou 162 ms;
- QA visual não encontrou overflow, clipping ou hierarquia quebrada nas telas críticas.

Essas evidências provam o Card 02 na branch. Não provam os requisitos ainda planejados de IA,
retenção automática, carga, quatro horas ou produção distribuída.
