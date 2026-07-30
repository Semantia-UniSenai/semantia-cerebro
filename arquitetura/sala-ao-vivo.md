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
| Agregado | `Room`, `RoomMember`, `RoomSession` e `SessionParticipant` | contexto detalhado e versionado da plateia |
| Entrada | JWT para conta; `joinToken` + token efêmero para convidado | revogação administrativa antes do encerramento e rate limit |
| Transcript | uma versão literal limpa e persistida | literal + adaptada por segmento |
| Retenção | sessão encerrada somente leitura, sem expiração automática | exclusão antecipada e automática em 30 dias |
| Capacidade | jornada multiator funcional | carga e reconexão comprovadas para 25/50 conexões |
| Duração | ciclo explícito sem limite automático | limite de até 4 horas |

Código validado na branch não deve ser descrito como já integrado em `dev`; da mesma forma, itens
planejados não devem ser anunciados como entregues.

## Modelo validado

- `User`: identidade autenticada sem papel global de produto.
- `Room`: nome, anfitrião (`hostId`), código de convite e timestamps.
- `RoomMember`: associação persistente com papel `MODERATOR` ou `PARTICIPANT`.
- `RoomSession`: vínculo obrigatório com a sala, título, `joinToken`, estado e horários.
- `SessionParticipant`: identidade autenticada ou convidada restrita à sessão.
- `TranscriptSegment`: `sessionId`, sequência estável, texto literal e data.
- `ChatMessage`: sessão, identidade contextual, texto e data.
- `Score`: datilologia/ranking, fora do núcleo atual.

O anfitrião é derivado de `Room.hostId`, não de uma função global no cadastro. Moderadores e
participantes recebem permissões somente pela associação à sala. Convidados não são promovidos a
membros persistentes.

## Papéis e permissões

| Operação | Host | Moderator | Participant | Guest |
|---|---:|---:|---:|---:|
| configurar e renomear sala | sim | sim | não | não |
| administrar membros | sim | sim, dentro do contrato autorizado | não | não |
| preparar, iniciar e encerrar sessão | sim | sim | não | não |
| acessar sessão em `PREPARING` | sim | sim | não | não |
| entrar em sessão `LIVE` autorizada | sim | sim | sim | sim, por token efêmero |
| consultar conteúdo após `ENDED` | sim | sim | sim, se associado | sim, enquanto o token for válido |
| enviar chat/transcript após `ENDED` | não | não | não | não |
| receber `joinToken` reutilizável | sim | sim | não | não |

Detalhes, listagens e snapshots removem o `joinToken` para quem não possui `canManage`. O token
efêmero do convidado carrega identidade e sessão específicas e não funciona em outra sessão.

## Ciclo de vida

```text
PREPARING ── start ──▶ LIVE ── end ──▶ ENDED
    │                    │                │
    │ host/moderator     │ acesso válido  └─ leitura de transcript/chat
    └─ plateia bloqueada └─ mutações habilitadas
```

- criação produz `PREPARING` por padrão;
- apenas anfitrião ou moderador inicia e encerra;
- encerramento é idempotente;
- chat, transcript e ações ao vivo recusam mutações depois de `ENDED`;
- conteúdo persistido continua consultável conforme a política de retenção vigente.

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

O contrato público usa `/api/rooms`, `/api/rooms/:roomId/sessions`, `/api/sessions` e operações de
membros, convidados, transcript e ciclo de vida. Swagger foi gerado a partir da API real com 19
paths e 22 operações; o cliente frontend foi regenerado pelo Orval.

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

- API: 15 suites e 66 testes unitários, lint e build aprovados;
- E2E multiator aprovado contra PostgreSQL 16;
- migration limpa e migration com dados legados aprovadas;
- OpenAPI/Orval sincronizados;
- frontend: 10 arquivos e 63 testes, além do build, aprovados;
- audit de produção sem vulnerabilidades altas; web sem advisories e API com 3 moderadas;
- jornada real em Brave/Chromium aprovada em desktop e 390 px: cadastro, criação de sala,
  preparação, início, Socket.IO/chat, encerramento e leitura posterior;
- QA visual não encontrou overflow, clipping ou hierarquia quebrada nas telas críticas.

Essas evidências provam o Card 02 na branch. Não provam os requisitos ainda planejados de IA,
retenção automática, carga, quatro horas ou produção distribuída.
