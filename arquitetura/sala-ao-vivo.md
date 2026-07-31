# Sala ao vivo — arquitetura do domínio genérico

> **Status em 2026-07-31:** o contrato genérico foi implementado e validado na branch
> `feat/salas-comunicacao`; a experiência caption-first e a adaptação dos envelopes reais do gateway
> foram validadas em `feat/ux-sala-acessivel`, empilhada sobre ela. Ambas ainda dependem de revisão e
> merge dos PRs para serem consideradas integradas em `dev`.
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
internamente para convite, snapshot, transcript e encerramento. Não existe endpoint REST de upload ou
transcrição de áudio: a API recebe somente texto pelos eventos Socket.IO. As rotas públicas de
criar/listar ocorrências e iniciar manualmente foram removidas. Swagger e cliente Orval devem ser
recapturados pelo fluxo `pnpm api:sync` sempre que o contrato mudar.

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

O gateway serializa o snapshot com `self`, mensagens com `name`/`role`/`at`, transcript com `at` e
presença como `{ participant }`. O frontend normaliza esses envelopes na fronteira de
`useLiveSession`; componentes de apresentação recebem apenas `Participant`, `ChatMessage` e
`TranscriptEntry` canônicos. Não se deve espalhar compatibilidade de wire format pelos componentes.

Todo comando recebe `{ ok: true, ... }` ou `{ ok: false, error: { code, message } }`. O gateway
permanece fino e delega autorização, persistência e transições aos mesmos serviços usados pelo
REST.

## Fluxo atual da transcrição

```text
caminho rápido
SpeechRecognition ─ parcial/final ─▶ Socket.IO ─▶ limpeza + persistência + broadcast
        │ ausente ou erro network/service-not-allowed/start-failed
        ▼
fallback local cross-browser
getUserMedia + AudioContext + AudioWorklet ─▶ Vosk português em WebAssembly/Web Worker
                                           ─▶ texto parcial/final ─▶ mesmo Socket.IO canônico
```

- captura de microfone funciona em navegadores modernos por `getUserMedia`; gravar ou transmitir
  áudio não implica que o navegador ofereça conversão de fala em texto;
- o caminho rápido usa a implementação de `SpeechRecognition` fornecida pelo navegador, que pode
  depender do serviço do próprio fornecedor;
- Firefox/Zen, um microfone específico selecionado ou o caminho nativo bloqueado carregam sob
  demanda `/models/vosk-model-small-pt-0.3.model` e processam os samples no próprio navegador;
- o modelo padrão tem 32.440.432 bytes, licença Apache-2.0, tamanho e SHA-256 verificados na
  preparação. A extensão pública neutra `.model` evita `Content-Encoding: gzip` e descompactação
  dupla; o binário é servido same-origin e permanece fora do Git;
- no fallback local, a API Semantia e terceiros não recebem áudio; somente texto parcial/final
  atravessa Socket.IO;
- não existe chave, custo por minuto, endpoint de upload ou dependência de provedor STT no backend;
- Vosk/Web Speech são ASR, não a futura IA generativa de adaptação. O literal não recebe correção
  inventada por LLM;
- todo texto final usa o mesmo `AppendTranscriptSegmentUseCase`, limpeza conservadora, sequência e
  broadcast;
- falhas distinguem permissão/captura, download do modelo e reconhecimento local sem recomendar
  troca de navegador;
- após a carga longa, o `AudioContext` é retomado novamente antes do estado ativo. O worklet é um
  asset JavaScript same-origin, e um watchdog encerra a captura quando nenhum frame chega em quatro
  segundos, evitando o falso estado “transcrevendo”;
- a interface permite cancelar a preparação, diferencia conexão/silêncio/áudio recebido e mantém o
  controle visível em altura reduzida. Esses sinais são derivados localmente e não enviam áudio,
  samples ou nível sonoro à API.

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
- usa constraint exata de `deviceId` tanto no teste quanto na captura Vosk. Como a API
  `SpeechRecognition` não permite escolher entrada, uma seleção específica ativa o Vosk local em vez
  de fingir que o ASR nativo está usando o microfone escolhido;
- troca somente captura/grafo/reconhecedor quando a transcrição está ativa. Reunião, presença e chat
  continuam conectados;
- não conecta o teste ao Socket.IO, não grava áudio e não transmite samples ou nível. Somente texto
  parcial/final produzido pelo ASR segue para o contrato canônico.

No Vosk, frames de áudio não são tratados como prova de transcrição. O transporte rápido por porta do
worker recebe um watchdog de áudio audível sem hipótese; após oito segundos ele fecha a porta e troca
para o transporte compatível por PCM local. A interface só confirma transcrição depois de texto não
vazio e torna observável uma falha também no segundo transporte.

### Limites medidos do fallback local

No spike automatizado Firefox de 2026-07-30, o modelo carregou em 43,643 s a frio e processou um
áudio pt-BR de 8,064 s sem chamadas de transcrição externas. A frase esperada continha “projeto
Semantia” e “navegador Firefox”; a saída reconheceu “projeto ser mantinha” e “navegador falha fox”.
Isso prova viabilidade técnica no Firefox, mas também evidencia carga inicial e precisão inferiores
às de modelos maiores. Cache, progresso visível, dispositivos reais, ruído, sotaques e nomes próprios
precisam de QA antes de tratar o fallback como legenda de acessibilidade confiável.

## Arquitetura-alvo do pipeline

```text
captura no navegador
  → ASR nativo ou Vosk local: parcial efêmero
  → ASR nativo ou Vosk local: final
  → limpeza conservadora no backend
  → transcript literal canônico + persistência
  → fila de adaptação contextual por IA generativa
  → transcript adaptado OU fallback literal
  → preferência individual + legenda karaokê
```

A adaptação, o contexto da plateia e a preferência literal/adaptada permanecem planejados. A IA
generativa será acionada somente depois do literal final. Falha nessa etapa nunca poderá bloquear o
literal; credenciais futuras de adaptação deverão existir somente no backend por variável de
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
