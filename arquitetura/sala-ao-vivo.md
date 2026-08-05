# Sala ao vivo — arquitetura do domínio genérico

> **Status em 2026-08-03:** o contrato genérico foi implementado e validado na branch
> `feat/salas-comunicacao`; a experiência caption-first e a adaptação dos envelopes reais do gateway
> foram validadas em `feat/ux-sala-acessivel`; a captura robusta foi validada nas branches
> `feat/captura-fala-robusta` e `feat/protocolo-transcricao`, todas empilhadas sobre ela. As entregas
> ainda dependem de revisão e merge dos PRs para serem consideradas integradas em `dev`.
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
| Entrada | JWT para conta; `joinToken` + token efêmero para convidado, inclusive com conta já autenticada | revogação administrativa antes do encerramento e rate limit |
| Transcript | literal limpo, final idempotente e persistido | literal + adaptada por segmento |
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
- `TranscriptSegment`: `sessionId`, `clientSegmentId`, sequência estável, texto literal e data.
- `ChatMessage`: sessão, identidade contextual, texto e data.
- `Score`: datilologia/ranking, fora do núcleo atual.

O anfitrião é derivado de `Room.hostId`, não de uma função global no cadastro. Moderadores e
participantes recebem permissões somente pela associação à sala. Convidados não são promovidos a
membros persistentes.

Uma conta autenticada pode abrir um convite público e entrar com a identidade contextual criada por
esse convite. Nesse caso, o token efêmero **específico da mesma `sessionId`** prevalece sobre o JWT
global da conta durante o handshake Socket.IO. Isso evita negar o convite por a conta não ser membro,
sem ampliar acesso: token de convidado, identidade e permissões continuam restritos àquela reunião.

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
| publicar transcript durante `LIVE` | sim | não | não | não |

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
internamente para convite, snapshot, transcript e encerramento. Não existe endpoint REST público de
upload/transcrição: áudio PCM entra apenas pelo evento Socket.IO autenticado `transcription:audio` e
segue da API ao serviço ASR em rede privada. As rotas públicas de criar/listar ocorrências e iniciar
manualmente foram removidas. Swagger e cliente Orval devem ser recapturados pelo fluxo `pnpm api:sync`
sempre que o contrato mudar.

As jornadas ativas não expõem `/classes`, `/turmas` ou `/aula`. Compatibilidade com o domínio
escolar acontece pela migration dos dados, não pela manutenção indefinida de dois contratos
públicos concorrentes.

## Protocolo Socket.IO

Namespace `/live`, room `session:<id>` e handshake por uma das identidades:

- JWT autenticado;
- `guestToken` efêmero emitido para a sessão.

Eventos cliente → servidor:

- `session:join/leave/end`;
- `transcription:audio` com PCM16 binário, somente `HOST` em sessão `LIVE`;
- `chat:send`;
- `hand:raise/lower`.

Eventos servidor → cliente:

- snapshot de sessão, presença e permissões contextuais;
- atualizações de participantes;
- `transcription:status` e transcript final canônico;
- chat e fila de mãos;
- encerramento e falhas reconhecidas.

O gateway serializa o snapshot com `self`, mensagens com `name`/`role`/`at`, transcript com `at` e
presença como `{ participant }`. O frontend normaliza esses envelopes na fronteira de
`useLiveSession`; componentes de apresentação recebem apenas `Participant`, `ChatMessage` e
`TranscriptEntry` canônicos. Não se deve espalhar compatibilidade de wire format pelos componentes.

Todo comando recebe `{ ok: true, ... }` ou `{ ok: false, error: { code, message } }`. O gateway
permanece fino e delega autorização, persistência e transições aos mesmos serviços usados pelo
REST.

## Fluxo atual da transcrição

A captura local-first anterior permanece documentada como baseline histórico no
[relatório do Card 06](./captura-fala-transporte-card-06.md). O contrato vigente é definido pelas
[ADR-001](./decisoes/ADR-001-asr-backend-cpu-first.md) e
[ADR-002](./decisoes/ADR-002-captura-pcm-janelas-fixas.md):

```text
controle explícito iniciar/parar
  → getUserMedia + AudioWorklet
  → frames PCM contíguos, sem ASR/VAD/classificação no frontend
  → janela fixa de 5 s; residual ≥ 250 ms no stop
  → resample 16 kHz mono + PCM16 little-endian
  → fila cliente: 8 itens, TTL 60 s, mesmo clientSegmentId no retry
  → Socket.IO transcription:audio (HOST-only)
  → API: validação + idempotência + fila serial por sessão
  → ASR privado: faster-whisper small/int8 CPU, sem vad_filter
  → vazio: ACK/no-speech; texto: limpeza → PostgreSQL/broadcast
```

- Firefox/Zen e demais navegadores são tratados por capacidade, sem user-agent nem recomendação de
  troca;
- o navegador não carrega modelo, reconhecedor, engine ou worker de ASR e não emite texto;
- cada janela normal tem 5000 ms; o residual no stop tem 250–5000 ms; o contrato defensivo aceita até
  30000 ms, PCM16 mono/16 kHz e no máximo 960000 bytes;
- Socket.IO limita o envelope a 1,1 MB; cliente e API limitam a oito segmentos por sessão;
- somente `HOST` presente em sessão `LIVE` envia áudio; moderador, participante e convidado são
  recusados antes da inferência;
- a API consulta `(sessionId, clientSegmentId)` antes do ASR, coalesce duplicata concorrente e serializa
  segmentos da mesma sessão;
- o serviço ASR executa uma inferência concorrente por padrão e possui fila interna limitada;
- áudio existe apenas em memória e é descartado em sucesso, falha definitiva, expiração, saída, stop
  ou encerramento; não há WAV/PCM em storage, banco, volume ou logs;
- o gateway não possui handlers cliente→servidor para transcript parcial ou final textual;
- estados `processing`, `complete` e `failed` expõem motor/modelo/latência sem logar áudio ou texto;
- nenhum fallback cloud ocorre sem nova decisão, configuração e consentimento.

O teste isolado de microfone continua estritamente local: calcula somente nível e nunca envia samples.

### Seleção e teste da entrada de áudio

A central de áudio segue a hierarquia do Google Meet sem reproduzir sua identidade visual: ação
primária de transcrição, cápsula com a entrada atual e popover de configuração. A implementação:

- descobre somente entradas por `navigator.mediaDevices.enumerateDevices()` e atualiza a relação por
  `devicechange` quando headset ou microfone é conectado ou removido;
- mantém a interface utilizável antes da permissão com labels acessíveis (`Microfone padrão`,
  `Microfone N`) e substitui os nomes assim que o navegador os expõe;
- persiste apenas o `deviceId` escolhido no storage local do site e volta para a entrada padrão ou
  primeira disponível quando o dispositivo desaparece;
- testa a entrada selecionada com `getUserMedia` + `AnalyserNode`, mostra nível e confirmação local e
  encerra track, source, analyser, animation frame e `AudioContext` ao parar, trocar ou desmontar;
- usa constraint exata de `deviceId` tanto no teste quanto na captura PCM;
- troca somente captura/grafo quando a transcrição está ativa. Reunião, presença e chat continuam
  conectados;
- não conecta o teste isolado ao Socket.IO, não grava áudio e não transmite samples ou nível;
- a captura da reunião envia janelas efêmeras ao backend e nunca gera texto localmente.

Não existe watchdog de hipótese, classificação de silêncio ou segmentação por conteúdo. A janela fecha
por contagem de frames e o residual fecha quando o anfitrião pausa, sai ou encerra.

### Limites medidos do reconhecimento local

O benchmark controlado de 2026-08-03 mediu cinco cenários com o mesmo roteiro de 45 palavras. O
Whisper Small q8/WASM produziu WER de 0%, 0%, 0%, 2,2% e 4,4%; o Vosk, usado para resposta rápida,
produziu 2,2%, 4,4%, 17,8%, 33,3% e 28,9% em fala limpa, ruído leve, ruído forte, fala concorrente e
reverberação. O refinamento Whisper levou aproximadamente 12,6 s para cerca de 21 s de áudio neste
hardware, enquanto Vosk manteve as hipóteses parciais.

Esses números são de fixtures sintéticas controladas e não são promessa universal. A leitura humana
anterior teve WER aproximado de 24,4% no Vosk. Cold start, hardware, sotaques, nomes próprios,
microfones e salas reais continuam exigindo QA no Card 11. Metodologia, textos reconhecidos, runtime,
privacidade e limitações estão no
[relatório do Card 06](./captura-fala-transporte-card-06.md).

## Arquitetura-alvo do pipeline

```text
captura PCM no navegador, sem ASR/VAD
  → janelas efêmeras → provider ASR backend → transcript literal canônico
  → persistência/broadcast idempotente
  → fila separada de adaptação contextual por agente/LLM
  → transcript adaptado OU fallback literal
```

ASR e agente são serviços distintos. A LLM recebe texto final, nunca substitui o reconhecimento de
fala e não pode reescrever silenciosamente nomes, números ou códigos. A adaptação, o contexto da
plateia e a preferência literal/adaptada permanecem planejados. Falha nessa etapa nunca poderá
bloquear o literal; credenciais futuras de STT/LLM deverão existir somente no backend por variável de
ambiente.

## Evidências de validação

Em 2026-07-30, na branch de generalização:

- PR API: [Semantia-UniSenai/semantia-api#4](https://github.com/Semantia-UniSenai/semantia-api/pull/4);
- PR web: [Semantia-UniSenai/semantia-web#4](https://github.com/Semantia-UniSenai/semantia-web/pull/4);

- API: 15 suites e 61 testes unitários, lint, build e Prisma aprovados;
- E2E multiator aprovado contra PostgreSQL 16;
- migration limpa e migration com dados legados aprovadas;
- OpenAPI/Orval sincronizados em 17 paths e 19 operações, sem endpoint de áudio ou
  `transcribeMeetingAudio`;
- frontend: 16 arquivos e 84 testes, typecheck e build aprovados; o runtime Vosk foi isolado em
  chunk lazy de 5,79 MB (2,38 MB gzip), fora do bundle inicial, e o `AudioWorklet` saiu como asset
  JavaScript same-origin de 2,12 kB;
- QA real do produto com Vosk forçado e microfone sintético: Firefox ficou pronto em 46,352 s e
  Chromium em 43,172 s; ambos exibiram o estado ativo, requisitaram o modelo uma vez e não fizeram
  request a `/transcriptions`, OpenAI ou Groq;
- depois de uma falha relatada em Firefox/Zen real, o cenário de `AudioContext` suspenso durante a
  carga longa foi reproduzido em teste, e o pipeline legado foi substituído por `AudioWorklet`;
- QA final do build, com suspensão adicional forçada e viewport `1280×480`, percorreu
  `MediaStream → AudioWorklet → Vosk → Socket.IO → PostgreSQL` em Firefox e Chromium. Persistiu cinco
  palavras no Firefox e sete no Chromium, manteve o controle visível, não fez request de áudio,
  OpenAI ou Groq e não produziu erro de console nem log Vosk;
- no Firefox, “Pausar transcrição” deixou a track em `ended` e o `AudioContext` em `closed`; o asset
  do worklet e o modelo foram requisitados uma vez. Isso comprova lifecycle e pipeline, não precisão
  suficiente para acessibilidade;
- audit de produção sem vulnerabilidades altas; web sem advisories e API com 3 moderadas;
- jornada anterior de preparação foi rejeitada na revisão de produto e removida. O QA final em
  Brave/Chromium provou em 1440×900 e 390×844: cadastro, **Nova reunião** em um clique, entrada ao
  vivo, convite `/convite/reuniao/:token`, Socket.IO/chat, encerramento, leitura posterior e card
  recente ligado diretamente à reunião; a abertura observada no ambiente local levou 162 ms;
- QA visual não encontrou overflow, clipping ou hierarquia quebrada nas telas críticas.

Essas evidências provam o Card 02 na branch. Não provam os requisitos ainda planejados de IA,
retenção automática, carga, quatro horas ou produção distribuída.

### Evidências adicionais em 2026-07-31

- seleção, persistência, remoção, erros específicos, troca durante teste e cleanup foram cobertos em
  testes unitários; mudança reativa de dispositivo reinicia somente o ASR;
- QA da central de áudio em Chromium enumerou três entradas, selecionou uma entrada específica,
  persistiu a escolha e confirmou nível 100; Firefox enumerou a entrada fake do engine e confirmou
  nível 23;
- popover desktop `1280×720` e mobile `390×844` permaneceu integralmente na viewport. No mobile,
  reserva 84 px de safe area para não colidir com o chat e o widget VLibras;
- em ambos os engines, o teste não emitiu request de áudio, chamada para provedor STT, erro de console
  ou erro de página;
- após a integração de dispositivos, Firefox aprovou novamente o pipeline completo nos transportes
  direto e compatível, reconhecendo e persistindo “este é um teste técnico de transcrição em
  português”, sem request de áudio.
- PR de UX/integração real: [Semantia-UniSenai/semantia-web#5](https://github.com/Semantia-UniSenai/semantia-web/pull/5),
  empilhado sobre o PR web #4;
- Vitest aprovou 42 suites e 123 testes; build/typecheck, `git diff --check` e audit de produção
  também passaram;
- smoke E2E em dois contextos isolados provou anfitrião autenticado + segunda conta autenticada
  entrando pelo convite como `GUEST`, refresh direto ainda autorizado, presença e chat bidirecional,
  sem erro de console ou página;
- a colisão entre VLibras e `Enviar mensagem` foi reproduzida por geometria e eliminada movendo o
  widget para fora do painel lateral aberto; o clique real passou sem `force` ou bypass.
- o teste humano dos lados comunicador e pessoa surda aprovou a UI/UX; o Card 03 continua em
  `EM REVISÃO` enquanto os PRs web #5 e cérebro #3 estiverem abertos e aguardando revisão;
- a leitura de um roteiro controlado produziu WER de aproximadamente 24,4% no Vosk local, com erros
  semânticos relevantes. Essa evidência foi registrada no Card 06, que passa a tratar benchmark e
  escolha do fallback/modelo; o Card 11 continua sendo o gate de qualidade ponta a ponta. A precisão
  do reconhecedor não pertence ao aceite visual do Card 03.
