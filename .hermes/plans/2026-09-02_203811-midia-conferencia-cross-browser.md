# Mídia de Conferência Cross-Browser — Plano de Implementação

> **Para o Hermes no Semantia:** executar este plano inline, tarefa por tarefa, com TDD e as duas passagens determinísticas de autorrevisão exigidas pelo projeto. Não delegar implementação ou revisão a agentes auxiliares. As etapas usam checkboxes para acompanhamento.

**Objetivo:** permitir que duas ou mais pessoas autorizadas na mesma reunião do Semantia conversem por áudio e vídeo em tempo real, com controles independentes da transcrição, sem gravação e sem sacrificar legendas, acessibilidade ou a sala quando a mídia falhar.

**Arquitetura:** usar LiveKit como SFU, e não uma malha WebRTC artesanal. O Socket.IO `/live` continua sendo a fonte de verdade para identidade, ingresso, sala de espera, transcrição, chat e encerramento; o backend NestJS emite credenciais LiveKit curtas somente para um socket já admitido na sessão. O frontend Vue encapsula o SDK atrás de um adapter testável, inicia câmera e microfone desligados, publica mídia somente após ação explícita e mantém a experiência textual funcional se a conexão de mídia falhar.

**Stack:** NestJS 11, Socket.IO 4.8, Vue 3/Vite, TypeScript, `livekit-server-sdk@2.18.0`, `livekit-client@2.22.2`, Vitest, Jest e `@playwright/test@1.62.1`; LiveKit Cloud no ambiente remoto e LiveKit Server `v1.13.6` no laboratório/CI quando houver infraestrutura local compatível.

## Restrições globais

- Implementar a partir de `origin/dev`, não das worktrees atuais em branches históricas.
- Baselines verificados em 2026-09-02: API `origin/dev@a7fa0f4`, web `origin/dev@72be078`, cérebro `origin/main@728a1b3`. Revalidar os três SHAs antes de começar.
- Criar worktrees isoladas por meio da skill `using-git-worktrees`; não trocar, resetar ou sujar as worktrees atuais.
- Branches: `feat/midia-sala` na API e web; `docs/midia-sala` no cérebro.
- O alvo remoto das PRs de API e web é `dev`; o alvo da PR documental é `main`.
- Usar SFU. Não implementar mesh P2P: o custo cresce quadraticamente e conflita com o alvo futuro de até 50 conexões.
- Mídia e sinalização de mídia não passam pelo Socket.IO; o Socket.IO só emite credenciais curtas e continua responsável pelo domínio da reunião.
- `LIVEKIT_API_SECRET` existe somente no backend por variável de ambiente. Nunca entra no frontend, banco, token Semantia, logs, fixtures, screenshots ou documentação versionada.
- O token LiveKit fica somente em memória, tem TTL de 10 minutos para ingresso e nunca é salvo em `localStorage`, `sessionStorage`, URL ou telemetria.
- Câmera e microfone de chamada começam desligados. Nenhuma permissão é solicitada sem ação explícita.
- “Microfone da chamada” e “Transcrição” são controles e estados diferentes. Mute da chamada não pausa a transcrição; pausar a transcrição não silencia a chamada.
- Não habilitar gravação, egress, ingest ou snapshots. O áudio/vídeo atravessa o SFU, mas não é persistido.
- Não afirmar criptografia ponta a ponta. A primeira entrega usa a proteção WebRTC/DTLS-SRTP do transporte e o SFU processa/encaminha a mídia.
- Falha de LiveKit não encerra a sala, não desconecta Socket.IO e não interrompe legenda, chat ou mãos levantadas.
- O ingresso na mídia acontece somente depois de `session:state`; convidados aguardando aprovação não recebem credencial LiveKit.
- Ao encerrar a reunião, sair da rota ou desmontar a view, parar tracks, remover listeners, destacar elementos e desconectar a sala de mídia.
- `getUserMedia` exige HTTPS ou `localhost`. Produção e QA remoto devem usar HTTPS/WSS.
- Não depender de `navigator.permissions.query({name: 'camera'|'microphone'})`; suporte e semântica variam. Solicitar no clique e classificar `DOMException`.
- `devicechange` e seleção de saída por `setSinkId` são melhorias progressivas. Deve existir botão “Atualizar dispositivos”; ocultar saída quando `setSinkId`/`speaker-selection` não estiver disponível.
- Usar `<video autoplay playsinline>`; preview local também usa `muted`. Se autoplay de áudio remoto for bloqueado, mostrar ação explícita “Ativar áudio” que chama `room.startAudio()` no próprio clique.
- Compatibilidade declarada somente após os gates reais deste plano. Playwright WebKit não equivale a Safari real.
- Compartilhamento de tela (`86e33mk6m`) fica fora deste plano, mas deve reutilizar o adapter e a sala LiveKit criados aqui.

---

## Contexto verificado

- Card 13: <https://app.clickup.com/t/90171419563/86e2j4wqw> — P1, pendente, responsável Cauê, sem branch/PR.
- Decisão de prioridade desta retomada, em 2026-09-02: iniciar o Card 13 antes dos Cards 10 e 11. Este plano incorpora autorização mínima, tokens curtos, ausência de gravação e cleanup, mas não declara os Cards 10/11 concluídos nem substitui seus gates completos.
- A API integrada em `dev` possui `LiveGateway` em `src/modules/live/live.gateway.ts`, presença deduplicada por participante em `live-room-state.service.ts`, sala de espera e áudio PCM para ASR via `transcription:audio`.
- A web integrada em `dev` possui `useLiveSession.ts`, `useMeetingTranscription.ts`, `usePcmAudioCapture.ts`, seleção/teste de entrada e `LiveRoomView.vue`; não possui WebRTC de conferência.
- O controle `MicControl.vue` atual significa **transcrição**, não áudio bidirecional.
- Os PRs de salas, contexto, ASR, transcript adaptado e sala de espera já foram mergeados em `dev`; não criar uma implementação paralela sobre branches antigas.

## Escopo da primeira entrega

### Incluído

1. Credencial de mídia para participante já admitido em sessão `LIVE`.
2. Conexão LiveKit independente do Socket.IO.
3. Áudio bidirecional para `HOST`, `MODERATOR`, `PARTICIPANT` e `GUEST` admitidos.
4. Microfone de chamada on/off e troca de entrada.
5. Câmera on/off, troca de câmera e preview local.
6. Tiles remotos, estado de mute/câmera, participante ativo e reconexão.
7. Fallback de autoplay com botão explícito.
8. Layout caption-first desktop/mobile e acessibilidade por teclado/leitor de tela.
9. Encerramento que fecha a sala LiveKit e cleanup local completo.
10. Testes unitários, integração multiator e QA real cross-browser.

### Fora do escopo

- Compartilhamento de tela, gravação, streaming, background blur, reações, E2EE, SIP, moderação remota de mídia, mais de uma fonte de transcrição, gravação de reunião e seleção universal de saída.
- Capacidade anunciada de 50 pessoas. O servidor pode ser configurado com limite 50, mas a comunicação pública continua condicionada ao Card 16 e a teste de carga.

## Critérios de aceite do produto

- Duas pessoas autorizadas entram e ouvem uma à outra em navegadores diferentes.
- Ambas podem ligar/desligar o próprio microfone e câmera; ninguém ativa mídia de outra pessoa.
- Estado inicial não publica mídia e não abre prompt de permissão.
- Host consegue manter chamada e transcrição simultâneas; os dois controles permanecem independentes.
- Negar câmera permite seguir somente com áudio; negar áudio permite seguir com vídeo/texto; negar ambos mantém a sala textual.
- Saída, refresh, desconexão e encerramento não deixam tracks, elementos ou participantes de mídia duplicados.
- Legenda permanece legível e navegável com todos os layouts.
- A sala de espera não é contornada pela credencial de mídia.
- Nenhum conteúdo de áudio/vídeo aparece no banco ou logs.

## Mapa de arquivos previsto

### `semantia-api`

- Criar `src/modules/media/contracts/media-room.provider.ts`
- Criar `src/modules/media/errors/media.errors.ts`
- Criar `src/modules/media/usecases/issue-media-credentials.usecase.ts`
- Criar `src/modules/media/usecases/close-media-room.usecase.ts`
- Criar `src/modules/media/infrastructure/livekit-media-room.provider.ts`
- Criar `src/modules/media/media.module.ts`
- Criar specs correspondentes ao lado dos arquivos
- Modificar `src/modules/live/live.gateway.ts`
- Modificar `src/modules/live/live.gateway.spec.ts`
- Modificar `src/modules/live/live.module.ts`
- Modificar `.env.example`, `README.md`, `package.json`, `pnpm-lock.yaml`

### `semantia-web`

- Criar `src/live/media/types.ts`
- Criar `src/live/media/conference-client.ts`
- Criar `src/live/media/livekit-conference-client.ts`
- Criar `src/live/useConferenceMedia.ts`
- Criar `src/live/useVideoInputDevices.ts`
- Criar `src/components/live/ConferenceControls.vue`
- Criar `src/components/live/ConferenceStage.vue`
- Criar `src/components/live/ParticipantMediaTile.vue`
- Criar specs ao lado de adapters, composables e componentes
- Modificar `src/live/types.ts`
- Modificar `src/live/useLiveSession.ts` e `src/live/useLiveSession.spec.ts`
- Modificar `src/live/usePcmAudioCapture.ts` e spec apenas para suportar uma track de entrada compartilhada, sem alterar o contrato PCM/ASR
- Modificar `src/live/useMeetingTranscription.ts` e spec para aceitar a entrada compartilhada
- Modificar `src/views/LiveRoomView.vue` e `src/views/LiveRoomView.spec.ts`
- Modificar `package.json`, `pnpm-lock.yaml`, `README.md`
- Criar `playwright.config.ts`, `tests/e2e/conference.spec.ts`, `tests/e2e/media-fixtures.ts`
- Criar `.github/workflows/conference-cross-browser.yml`

### `semantia-cerebro`

- Criar `arquitetura/midia-conferencia.md`
- Modificar `arquitetura/sala-ao-vivo.md`
- Modificar `produto/contrato-mvp-transcricao-tempo-real.md`
- Modificar `requisitos/mvp-transcricao-tempo-real.md`
- Modificar `planejamento/2026-07-29-registro-tasks-clickup-mvp-transcricao.md`
- Criar `validacao/midia-conferencia-cross-browser.md`

---

### Tarefa 1: preparar baselines isoladas e registrar a decisão arquitetural

**Objetivo:** impedir desenvolvimento sobre branches antigas e fixar o contrato SFU antes do código.

**Arquivos:**
- Criar: `semantia-cerebro/arquitetura/midia-conferencia.md`
- Modificar: `semantia-cerebro/arquitetura/sala-ao-vivo.md`
- Modificar: `semantia-cerebro/requisitos/mvp-transcricao-tempo-real.md`

**Interfaces:**
- Consome: Card 13 e os estados integrados em `origin/dev`.
- Produz: decisão LiveKit/SFU, fronteira Socket.IO × mídia, política de privacidade e eventos canônicos usados nas tarefas seguintes.

- [x] **Etapa 1:** carregar `using-git-worktrees`, executar `git fetch origin` nos três repositórios e comparar `git ls-remote` com `origin/dev`/`origin/main`.
- [x] **Etapa 2:** criar worktrees isoladas a partir das refs corretas; abortar se qualquer ref tiver avançado e revalidar os arquivos citados neste plano.
- [x] **Etapa 3:** escrever `arquitetura/midia-conferencia.md` com este contrato mínimo:

```text
Socket.IO /live: identidade, admissão, sessão, transcript, chat, mãos, encerramento.
LiveKit: áudio/vídeo efêmero e estado técnico de tracks.
Sala LiveKit: semantia:<sessionId>.
Identidade LiveKit: participantId canônico do Semantia.
Credencial: evento media:credentials, somente depois de session:state, TTL 10m.
Publicação inicial: nenhuma; microphone/camera por gesto explícito.
Persistência: nenhuma mídia; egress/recording desabilitados.
```

- [x] **Etapa 4:** marcar RF15 como “EM IMPLEMENTAÇÃO NA BRANCH” somente na branch documental; não anunciar entrega.
- [x] **Etapa 5:** revisar termos para não chamar transporte via SFU de E2EE.
- [x] **Etapa 6:** commit no cérebro:

```bash
git add arquitetura/midia-conferencia.md arquitetura/sala-ao-vivo.md requisitos/mvp-transcricao-tempo-real.md
git commit -m "docs(media): define conferencia via SFU"
```

---

### Tarefa 2: implementar o provider LiveKit e os casos de uso da API por TDD

**Objetivo:** emitir tokens mínimos e encerrar salas sem acoplar o domínio ao SDK.

**Arquivos:**
- Criar: `src/modules/media/contracts/media-room.provider.ts`
- Criar: `src/modules/media/errors/media.errors.ts`
- Criar: `src/modules/media/usecases/issue-media-credentials.usecase.ts`
- Criar: `src/modules/media/usecases/issue-media-credentials.usecase.spec.ts`
- Criar: `src/modules/media/usecases/close-media-room.usecase.ts`
- Criar: `src/modules/media/usecases/close-media-room.usecase.spec.ts`
- Criar: `src/modules/media/infrastructure/livekit-media-room.provider.ts`
- Criar: `src/modules/media/infrastructure/livekit-media-room.provider.spec.ts`
- Criar: `src/modules/media/media.module.ts`
- Modificar: `package.json`, `pnpm-lock.yaml`, `.env.example`

**Interfaces:**
- Consome: `sessionId`, `SessionStatus`, `LiveParticipant` já autenticado/admitido.
- Produz:

```ts
export interface MediaCredentials {
  serverUrl: string
  participantToken: string
  expiresInSeconds: 600
}

export interface IssueMediaCredentialsInput {
  sessionId: string
  status: SessionStatus
  participant: { participantId: string; name: string; role: RoomParticipantRole }
}

export abstract class MediaRoomProvider {
  abstract issueCredentials(input: IssueMediaCredentialsInput): Promise<MediaCredentials>
  abstract closeRoom(sessionId: string): Promise<void>
}
```

- [x] **Etapa 1:** adicionar `livekit-server-sdk@2.18.0` com `pnpm add livekit-server-sdk@2.18.0`.
- [x] **Etapa 2:** escrever specs que falham para: sessão não `LIVE`, provider ausente, identidade vazia, token TTL 600, sala `semantia:<sessionId>`, criação idempotente da room com `maxParticipants=50` e `emptyTimeout=60`, grants `roomJoin/canPublish/canSubscribe=true` e `canPublishData=false`.
- [x] **Etapa 3:** executar:

```bash
pnpm test -- --runInBand src/modules/media
```

Resultado esperado: falha porque contracts/usecases/provider ainda não existem.

- [x] **Etapa 4:** implementar contracts e usecases; `IssueMediaCredentialsUseCase` rejeita estado diferente de `LIVE` com código `SESSION_READ_ONLY`.
- [x] **Etapa 5:** implementar `LiveKitMediaRoomProvider`: garantir a room com `LiveKitAPI.room.createRoom({ name, maxParticipants: 50, emptyTimeout: 60 })`, tratar “already exists” como sucesso concorrente e só então emitir `AccessToken`; incluir `name` e metadata JSON contendo apenas `role`; nunca incluir e-mail, join token ou JWT Semantia.
- [x] **Etapa 6:** implementar `closeRoom` com `LiveKitAPI.room.deleteRoom('semantia:' + sessionId)`; tratar “room not found” como sucesso idempotente.
- [x] **Etapa 7:** manter a API inicializável sem configuração LiveKit, mas `issueCredentials` deve retornar erro canônico `MEDIA_UNAVAILABLE`; não usar chaves falsas.
- [x] **Etapa 8:** documentar somente nomes de variáveis em `.env.example`:

```dotenv
LIVEKIT_URL="wss://seu-projeto.livekit.cloud"
LIVEKIT_API_KEY=""
LIVEKIT_API_SECRET=""
LIVEKIT_TOKEN_TTL_SECONDS=600
```

- [x] **Etapa 9:** executar o spec novamente; esperado: PASS.
- [x] **Etapa 10:** commit:

```bash
git add src/modules/media package.json pnpm-lock.yaml .env.example
git commit -m "feat(media): emite credenciais LiveKit efemeras"
```

---

### Tarefa 3: autorizar mídia pelo gateway após admissão

**Objetivo:** impedir bypass da sala de espera e reutilizar a identidade já validada do socket.

**Arquivos:**
- Modificar: `src/modules/live/live.gateway.ts`
- Modificar: `src/modules/live/live.gateway.spec.ts`
- Modificar: `src/modules/live/live.module.ts`

**Interfaces:**
- Consome: `IssueMediaCredentialsUseCase.execute(input)`.
- Produz: `media:credentials` → `Ack<MediaCredentials>`.

- [x] **Etapa 1:** adicionar specs falhando para os casos:
  - host, participante e guest admitidos recebem credencial;
  - socket não autenticado recebe `UNAUTHORIZED`;
  - autenticado mas ainda aguardando aprovação recebe `NOT_JOINED`;
  - sessão encerrada recebe `SESSION_READ_ONLY`;
  - erro de configuração recebe `MEDIA_UNAVAILABLE` sem stack/segredo;
  - resposta nunca aparece dentro de `session:state` nem em broadcast.
- [x] **Etapa 2:** executar `pnpm test -- --runInBand src/modules/live/live.gateway.spec.ts`; esperado: falha por ausência do handler.
- [x] **Etapa 3:** injetar os usecases do módulo de mídia no gateway e implementar:

```ts
@SubscribeMessage('media:credentials')
async onMediaCredentials(socket: LiveSocket): Promise<Ack<MediaCredentials>> {
  const { identity, sessionId, status } = this.requireParticipant(socket)
  return { ok: true, ...(await this.issueMediaCredentials.execute({
    sessionId,
    status,
    participant: identity,
  })) }
}
```

A implementação final deve manter `try/catch` e `toErrorAck` no padrão do gateway.

- [x] **Etapa 4:** mapear erros de mídia em `toErrorAck` sem logar `participantToken`.
- [x] **Etapa 5:** executar specs do gateway e módulo de mídia; esperado: PASS.
- [x] **Etapa 6:** commit:

```bash
git add src/modules/live src/modules/media
git commit -m "feat(live): autoriza midia somente apos ingresso"
```

---

### Tarefa 4: fechar mídia junto ao ciclo da sessão

**Objetivo:** eliminar mídia residual quando a reunião for encerrada.

**Arquivos:**
- Modificar: `src/modules/live/live.gateway.ts`
- Modificar: `src/modules/live/live.gateway.spec.ts`
- Modificar: `src/modules/media/usecases/close-media-room.usecase.ts`

**Interfaces:**
- Consome: `CloseMediaRoomUseCase.execute(sessionId)`.
- Produz: sala LiveKit removida após `EndSessionUseCase` confirmar o estado `ENDED`.

- [x] **Etapa 1:** escrever specs falhando para encerramento: delete chamado uma vez; repetição idempotente; falha do provider não reabre a sessão nem vaza segredo; `session:ended` ainda é emitido.
- [x] **Etapa 2:** executar spec; esperado: FAIL por ausência do cleanup.
- [x] **Etapa 3:** chamar `closeMediaRoom.execute(sessionId)` depois da transição persistida e antes da remoção local; registrar somente código técnico e `sessionId` sanitizado se a limpeza falhar.
- [x] **Etapa 4:** configurar `emptyTimeout=60` segundos na criação da room LiveKit como defesa adicional; isso não substitui `deleteRoom`.
- [x] **Etapa 5:** executar `pnpm test -- --runInBand src/modules/live src/modules/media`; esperado: PASS.
- [x] **Etapa 6:** commit:

```bash
git add src/modules/live src/modules/media
git commit -m "feat(media): encerra sala de conferencia com a sessao"
```

---

### Tarefa 5: criar a fronteira de credenciais no frontend

**Objetivo:** obter credenciais efêmeras sem espalhar Socket.IO pelo módulo de mídia.

**Arquivos:**
- Modificar: `src/live/types.ts`
- Modificar: `src/live/useLiveSession.ts`
- Modificar: `src/live/useLiveSession.spec.ts`

**Interfaces:**
- Produz:

```ts
export interface MediaCredentials {
  serverUrl: string
  participantToken: string
  expiresInSeconds: number
}

requestMediaCredentials(): Promise<Ack<MediaCredentials>>
```

- [x] **Etapa 1:** escrever testes falhando para emissão somente quando `joinedSocket=true`, propagação de `MEDIA_UNAVAILABLE`, cancelamento no disconnect e ausência do token em refs persistentes.
- [x] **Etapa 2:** executar `pnpm test -- src/live/useLiveSession.spec.ts`; esperado: FAIL.
- [x] **Etapa 3:** implementar `requestMediaCredentials` por `emitAck('media:credentials')` e retorná-la no composable.
- [x] **Etapa 4:** não adicionar credencial a `SessionState`, `localStorage`, `sessionStorage` ou query string.
- [x] **Etapa 5:** executar o teste novamente; esperado: PASS.
- [x] **Etapa 6:** commit:

```bash
git add src/live/types.ts src/live/useLiveSession.ts src/live/useLiveSession.spec.ts
git commit -m "feat(media): solicita credenciais efemeras da sala"
```

---

### Tarefa 6: encapsular o SDK LiveKit em um adapter testável

**Objetivo:** isolar SDK, tracks e eventos do Vue e permitir testes determinísticos.

**Arquivos:**
- Criar: `src/live/media/types.ts`
- Criar: `src/live/media/conference-client.ts`
- Criar: `src/live/media/livekit-conference-client.ts`
- Criar: `src/live/media/livekit-conference-client.spec.ts`
- Modificar: `package.json`, `pnpm-lock.yaml`

**Interfaces:**

```ts
export type ConferenceStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed'
export type MediaKind = 'audio' | 'video'
export interface ConferenceTrackRef {
  participantId: string
  kind: MediaKind
  source: 'microphone' | 'camera'
  muted: boolean
  attach(element: HTMLMediaElement): void
  detach(element?: HTMLMediaElement): void
}
export interface ConferenceClient {
  connect(serverUrl: string, token: string): Promise<void>
  disconnect(): Promise<void>
  setMicrophoneEnabled(enabled: boolean, deviceId?: string): Promise<void>
  setCameraEnabled(enabled: boolean, deviceId?: string): Promise<void>
  switchDevice(kind: 'audioinput' | 'videoinput' | 'audiooutput', deviceId: string): Promise<void>
  startAudio(): Promise<void>
  onEvent(listener: (event: ConferenceEvent) => void): () => void
}
```

- [x] **Etapa 1:** adicionar `livekit-client@2.22.2`.
- [x] **Etapa 2:** escrever specs falhando para mapeamento de participantes/tracks, mute, unsubscribe, reconexão, erro de dispositivo e autoplay bloqueado.
- [x] **Etapa 3:** executar `pnpm test -- src/live/media`; esperado: FAIL.
- [x] **Etapa 4:** implementar `Room` com `adaptiveStream` e `dynacast` somente quando os helpers do SDK disserem que o browser suporta; usar vídeo ideal 1280×720 e 24 fps, nunca constraint `exact`.
- [x] **Etapa 5:** mapear `RoomEvent.TrackSubscribed`, `TrackUnsubscribed`, `TrackMuted`, `TrackUnmuted`, `ParticipantConnected`, `ParticipantDisconnected`, `Reconnecting`, `Reconnected`, `Disconnected`, `MediaDevicesError` e `AudioPlaybackStatusChanged` para eventos próprios.
- [x] **Etapa 6:** usar `isBrowserSupported()` antes de conectar. Browser incompatível mantém a sala textual e gera `MEDIA_BROWSER_UNSUPPORTED`.
- [x] **Etapa 7:** `disconnect()` deve remover todos os listeners, destacar elementos e parar/publicar zero tracks locais.
- [x] **Etapa 8:** executar specs; esperado: PASS.
- [x] **Etapa 9:** commit:

```bash
git add src/live/media package.json pnpm-lock.yaml
git commit -m "feat(media): encapsula cliente LiveKit"
```

---

### Tarefa 7: implementar lifecycle reativo e recuperação da conferência

**Objetivo:** conectar mídia depois da admissão e degradar sem afetar a sala textual.

**Arquivos:**
- Criar: `src/live/useConferenceMedia.ts`
- Criar: `src/live/useConferenceMedia.spec.ts`

**Interfaces:**
- Consome: `requestMediaCredentials`, `ConferenceClient`.
- Produz: estado, participantes de mídia, tracks, `connect`, `retry`, `toggleMicrophone`, `toggleCamera`, `startAudio`, `switchDevice`, `disconnect`.

- [ ] **Etapa 1:** escrever specs falhando para: conexão depois de `session:state`, defaults off, retry com credencial nova, reconexão sem tile duplicado, disconnect idempotente, autoplay bloqueado e erro sem tocar no Socket.IO.
- [ ] **Etapa 2:** executar `pnpm test -- src/live/useConferenceMedia.spec.ts`; esperado: FAIL.
- [ ] **Etapa 3:** implementar o composable com factory injetável e token somente em variável local da função `connect`.
- [ ] **Etapa 4:** diferenciar `textConnectionStatus` e `mediaStatus`; não usar um único “Reconectando”.
- [ ] **Etapa 5:** em `session:ended`/unmount, chamar cleanup uma vez. Em oscilação temporária do Socket.IO, não derrubar uma sala LiveKit ainda saudável; se a sessão for encerrada, derrubar imediatamente.
- [ ] **Etapa 6:** ao receber autoplay bloqueado, expor `audioPlaybackBlocked=true`; `startAudio` só é chamado pelo clique do usuário.
- [ ] **Etapa 7:** executar specs; esperado: PASS.
- [ ] **Etapa 8:** commit:

```bash
git add src/live/useConferenceMedia.ts src/live/useConferenceMedia.spec.ts
git commit -m "feat(media): gerencia conexao e reconexao da conferencia"
```

---

### Tarefa 8: manter chamada e transcrição independentes com uma única origem física

**Objetivo:** evitar duas capturas concorrentes do mesmo microfone, especialmente no Safari/iOS, sem acoplar mute à transcrição.

**Arquivos:**
- Criar: `src/live/media/shared-microphone-source.ts`
- Criar: `src/live/media/shared-microphone-source.spec.ts`
- Modificar: `src/live/usePcmAudioCapture.ts` e spec
- Modificar: `src/live/useMeetingTranscription.ts` e spec
- Modificar: `src/live/useConferenceMedia.ts` e spec

**Interfaces:**

```ts
export interface MicrophoneLease {
  track: MediaStreamTrack
  release(): void
}
export interface SharedMicrophoneSource {
  acquire(deviceId: string): Promise<MicrophoneLease>
  reset(deviceId: string): Promise<void>
  dispose(): void
}
```

- [ ] **Etapa 1:** escrever specs falhando que provem: um único `getUserMedia` para dois consumidores; cada consumidor recebe clone próprio; mute/stop de um clone não encerra o outro; última liberação para a track-base; troca de dispositivo para/recria tudo sem vazamento.
- [ ] **Etapa 2:** executar os specs; esperado: FAIL.
- [ ] **Etapa 3:** implementar a fonte compartilhada com constraints existentes de `buildAudioConstraints`; não persistir labels, áudio ou grants.
- [ ] **Etapa 4:** permitir que `usePcmAudioCapture.start` receba uma `MicrophoneLease`; o composable continua responsável pelo AudioWorklet/PCM, mas não chama novo `getUserMedia` quando recebe lease.
- [ ] **Etapa 5:** publicar no LiveKit outro clone da mesma track-base; mute da chamada atua somente na publicação/clone da chamada.
- [ ] **Etapa 6:** troca de entrada captura quais consumidores estavam ativos, para ambos, reseta a fonte e restaura chamada/transcrição na nova entrada; anunciar interrupção curta via `role="status"`.
- [ ] **Etapa 7:** cobrir `NotAllowedError`, `NotFoundError`, `NotReadableError`, `OverconstrainedError` e encerramento externo da track.
- [ ] **Etapa 8:** executar specs; esperado: PASS.
- [ ] **Etapa 9:** commit:

```bash
git add src/live/media src/live/usePcmAudioCapture* src/live/useMeetingTranscription*
git commit -m "feat(audio): compartilha origem sem acoplar chamada e transcricao"
```

---

### Tarefa 9: adicionar câmera, dispositivos e tiles de vídeo

**Objetivo:** publicar câmera de forma explícita e apresentar vídeo remoto com fallback acessível.

**Arquivos:**
- Criar: `src/live/useVideoInputDevices.ts`
- Criar: `src/live/useVideoInputDevices.spec.ts`
- Criar: `src/components/live/ParticipantMediaTile.vue`
- Criar: `src/components/live/ParticipantMediaTile.spec.ts`
- Criar: `src/components/live/ConferenceStage.vue`
- Criar: `src/components/live/ConferenceStage.spec.ts`

**Interfaces:**
- Consome: participantes/tracks do `useConferenceMedia`.
- Produz: seleção de câmera, tile local/remoto, fallback de avatar e estado textual.

- [ ] **Etapa 1:** escrever specs falhando para labels sem permissão, refresh manual, `devicechange`, troca de câmera, preview local `muted`, todos os vídeos `playsinline`, detach no unmount e avatar quando câmera off.
- [ ] **Etapa 2:** executar specs; esperado: FAIL.
- [ ] **Etapa 3:** implementar descoberta de `videoinput` sem solicitar permissão na montagem; revelar labels apenas depois do clique de câmera/configuração.
- [ ] **Etapa 4:** usar constraints ideais 720p/24 fps e permitir degradação do navegador; câmera frontal pode ser espelhada apenas no preview local.
- [ ] **Etapa 5:** associar track por `participantId`, não por índice; reconexão substitui a track existente em vez de criar tile duplicado.
- [ ] **Etapa 6:** incluir nome, estado “Câmera desligada” e mute em texto/ícone; não comunicar somente por cor.
- [ ] **Etapa 7:** executar specs; esperado: PASS.
- [ ] **Etapa 8:** commit:

```bash
git add src/live/useVideoInputDevices* src/components/live/ParticipantMediaTile* src/components/live/ConferenceStage*
git commit -m "feat(video): publica camera e renderiza participantes"
```

---

### Tarefa 10: criar controles acessíveis e integrar à sala caption-first

**Objetivo:** inserir mídia sem transformar legendas em conteúdo secundário.

**Arquivos:**
- Criar: `src/components/live/ConferenceControls.vue`
- Criar: `src/components/live/ConferenceControls.spec.ts`
- Modificar: `src/views/LiveRoomView.vue`
- Modificar: `src/views/LiveRoomView.spec.ts`

**Interfaces:**
- Consome: `useConferenceMedia`, `ConferenceStage`, seleção de dispositivos.
- Produz: controles “Áudio da chamada”, “Câmera”, “Ativar áudio” e “Tentar mídia novamente”.

- [ ] **Etapa 1:** escrever specs falhando para copy não ambígua, `aria-pressed`, foco visível, status anunciado, defaults off, erros recuperáveis, sessão encerrada e layout compacto.
- [ ] **Etapa 2:** executar os specs; esperado: FAIL.
- [ ] **Etapa 3:** manter `MicControl` nomeado e visualmente identificado como “Transcrição”; não reutilizá-lo para mute da chamada.
- [ ] **Etapa 4:** incluir `ConferenceStage` sem remover `CaptionStage`. Desktop: mídia ocupa a área superior/central e legenda mantém faixa persistente de alto contraste. Mobile: um vídeo ativo por vez e legenda fixa sem cobrir controles, chat ou VLibras.
- [ ] **Etapa 5:** disponibilizar conferência para todos os papéis admitidos; transcrição continua restrita ao host conforme contrato atual.
- [ ] **Etapa 6:** mostrar “A chamada está sem áudio” com botão “Ativar áudio” quando `room.canPlaybackAudio=false`.
- [ ] **Etapa 7:** erros devem conter ação: permitir no navegador, escolher outro dispositivo, tentar novamente ou continuar sem mídia.
- [ ] **Etapa 8:** testar tabulação, Escape, foco restaurado, `prefers-reduced-motion`, 200% de zoom e 320 px de largura.
- [ ] **Etapa 9:** executar `pnpm test -- src/components/live src/views/LiveRoomView.spec.ts`; esperado: PASS.
- [ ] **Etapa 10:** commit:

```bash
git add src/components/live src/views/LiveRoomView.vue src/views/LiveRoomView.spec.ts
git commit -m "feat(live): integra conferencia sem ocultar legendas"
```

---

### Tarefa 11: automatizar o contrato multi-browser

**Objetivo:** detectar regressões em Chromium, Firefox e WebKit antes da revisão humana.

**Arquivos:**
- Criar: `playwright.config.ts`
- Criar: `tests/e2e/media-fixtures.ts`
- Criar: `tests/e2e/conference.spec.ts`
- Criar: `.github/workflows/conference-cross-browser.yml`
- Modificar: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Consome: ambiente de QA com API, PostgreSQL, ASR e projeto LiveKit de teste.
- Produz: projetos Playwright `chromium`, `firefox`, `webkit`, `Mobile Chrome` e `Mobile Safari` emulado.

- [ ] **Etapa 1:** adicionar `@playwright/test@1.62.1` e scripts `test:e2e:conference` e `test:e2e:conference:headed`.
- [ ] **Etapa 2:** configurar cinco projetos; manter retries somente no CI e guardar trace apenas na primeira repetição.
- [ ] **Etapa 3:** criar fixture de duas identidades/contextos isolados e mídia sintética. Chromium usa flags oficiais de fake media; Firefox usa prefs de mídia fake; WebKit usa injeção de `MediaStreamTrack` somente para UI e complementa o transporte com uma track gerada. Não confundir essa camada com teste de permissão real.
- [ ] **Etapa 4:** escrever cenários inicialmente falhando:
  1. host e guest aprovado conectam à mesma sala LiveKit;
  2. guest aguardando não obtém mídia;
  3. microfone/câmera iniciam off;
  4. publicação de áudio chega ao outro contexto;
  5. publicação de câmera cria exatamente um tile remoto;
  6. mute/unmute e camera off atualizam ambos os lados;
  7. autoplay bloqueado exibe e resolve “Ativar áudio”;
  8. negação de câmera mantém áudio/texto;
  9. reconexão não duplica participante/track;
  10. host usa chamada e transcrição simultâneas;
  11. encerramento remove mídia e deixa transcript somente leitura;
  12. unmount deixa `0` tracks locais em `live`.
- [ ] **Etapa 5:** executar primeiro em Chromium e confirmar RED antes de concluir cada fatia.
- [ ] **Etapa 6:** executar a matriz completa:

```bash
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:e2e:conference
```

Resultado esperado no fechamento: todos os projetos verdes; qualquer skip exige justificativa explícita no documento de validação e bloqueia alegação de suporte daquele browser.

- [ ] **Etapa 7:** workflow usa secrets de um projeto LiveKit exclusivo de teste e os injeta como env somente no job; não imprimir env nem ativar debug de SDK com token.
- [ ] **Etapa 8:** commit:

```bash
git add playwright.config.ts tests/e2e .github/workflows/conference-cross-browser.yml package.json pnpm-lock.yaml
git commit -m "test(media): cobre conferencia em multiplos engines"
```

---

### Tarefa 12: executar QA real em navegadores e dispositivos

**Objetivo:** provar permissões, codecs, autoplay, dispositivos físicos e layout que engines emulados não garantem.

**Arquivos:**
- Criar: `semantia-cerebro/validacao/midia-conferencia-cross-browser.md`

**Matriz mínima obrigatória:**

| Navegador | Plataforma | Cenários obrigatórios |
|---|---|---|
| Brave e Chrome estáveis | Linux ou Windows | áudio/vídeo, troca de entrada/câmera, negação, reconexão, 2 participantes |
| Edge estável | Windows | áudio/vídeo, autoplay, saída quando disponível |
| Firefox estável | Linux ou Windows | áudio/vídeo, troca, reconexão, chamada + ASR |
| Safari estável | macOS | prompt, autoplay, chamada + ASR, devicechange/refresh |
| Safari | iPhone/iPad atual | `playsinline`, rotação, câmera frontal/traseira, interrupção por chamada/lock |
| Chrome | Android atual | câmera frontal/traseira, mudança de rede, background/foreground |

- [ ] **Etapa 1:** para cada linha, registrar versão exata do navegador/SO/dispositivo, horário, dois papéis usados e resultado por cenário.
- [ ] **Etapa 2:** testar em duas máquinas/redes reais; uma aba na mesma máquina não prova áudio bidirecional sem eco/roteamento.
- [ ] **Etapa 3:** testar câmera/microfone negados, dispositivo ausente, dispositivo ocupado e desconexão física; cada erro deve preservar legenda/chat e oferecer ação.
- [ ] **Etapa 4:** testar Wi-Fi → rede móvel, perda temporária e retorno; UI deve distinguir reconexão de texto e mídia.
- [ ] **Etapa 5:** validar áudio remoto no Safari/iOS com o botão de desbloqueio e vídeos `playsinline`.
- [ ] **Etapa 6:** validar teclado, leitor de tela, 200% zoom, 320×568, 390×844, 1280×720 e 1440×900.
- [ ] **Etapa 7:** confirmar no backend, PostgreSQL e logs que não existem blobs, frames, gravações, tokens ou nomes de dispositivos persistidos.
- [ ] **Etapa 8:** anexar evidências sem rosto/voz identificável; usar mídia sintética ou consentida.
- [ ] **Etapa 9:** não marcar Safari, Edge ou mobile como suportado se o teste real correspondente não ocorreu.
- [ ] **Etapa 10:** commit documental:

```bash
git add validacao/midia-conferencia-cross-browser.md
git commit -m "docs(media): registra matriz cross-browser real"
```

---

### Tarefa 13: testar capacidade, rede limitada e cleanup

**Objetivo:** comprovar que a decisão SFU e o lifecycle não degradam o núcleo textual.

**Arquivos:**
- Modificar: `semantia-cerebro/validacao/midia-conferencia-cross-browser.md`
- Modificar: `semantia-api/README.md`
- Modificar: `semantia-web/README.md`

- [ ] **Etapa 1:** usar LiveKit CLI em ambiente exclusivo para 4 publishers com áudio/vídeo sintéticos e 21 subscribers por 10 minutos; registrar comando efetivamente usado, versão do `lk`, latência, perda, reconexões e consumo. Não usar produção.
- [ ] **Etapa 2:** repetir com câmera desligada para provar modo áudio/texto e com limite de banda; `adaptiveStream` deve reduzir recepção de tiles não visíveis.
- [ ] **Etapa 3:** durante a carga, publicar transcrição pelo host e comprovar ordem/continuidade da legenda.
- [ ] **Etapa 4:** executar 50 ciclos de entra/sai e confirmar ausência de participantes, elementos e tracks duplicados.
- [ ] **Etapa 5:** encerrar a sessão e verificar via API administrativa LiveKit que `semantia:<sessionId>` deixou de existir.
- [ ] **Etapa 6:** documentar que 25 participantes foram provados se, e somente se, todos os gates passarem; 50 continua alvo não anunciado.
- [ ] **Etapa 7:** atualizar READMEs com arquitetura, variáveis e limites honestos.
- [ ] **Etapa 8:** commits:

```bash
# API
git add README.md
git commit -m "docs(media): documenta provider e limites"

# Web
git add README.md
git commit -m "docs(media): documenta compatibilidade da conferencia"

# Cérebro
git add validacao/midia-conferencia-cross-browser.md
git commit -m "docs(media): registra carga e lifecycle"
```

---

### Tarefa 14: gates finais, PRs e atualização do Card 13

**Objetivo:** entregar estado verificável sem merge automático.

**Arquivos:** todos os arquivos da feature e documentação.

- [ ] **Etapa 1:** API:

```bash
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm test -- --runInBand
pnpm test:e2e
pnpm build
git diff --check origin/dev...HEAD
```

Esperado: todos com exit code `0`; E2E usa PostgreSQL real.

- [ ] **Etapa 2:** web:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm test:e2e:conference
git diff --check origin/dev...HEAD
```

Esperado: Vitest, typecheck/build e matriz Playwright verdes.

- [ ] **Etapa 3:** executar auditoria de dependências de produção em ambos e corrigir vulnerabilidades altas/críticas antes da PR.
- [ ] **Etapa 4:** executar QA autenticado real desktop/mobile e inspeção de console/network; DOM/build isolados não valem como aceite UX.
- [ ] **Etapa 5:** atualizar no cérebro RF15, arquitetura e registro do Card 13 para “EM REVISÃO”, citando PRs e evidências sem dizer “concluído”.
- [ ] **Etapa 6:** abrir três PRs: API/web contra `dev`; cérebro contra `main`. Solicitar revisão e não fazer merge.
- [ ] **Etapa 7:** mover o Card 13 para `EM REVISÃO`, registrar branches, links de PR, versões de navegador e gates. Manter em revisão enquanto PR estiver aberto.
- [ ] **Etapa 8:** manter os cards de câmera `86e33mgzy` e compartilhamento `86e33mk6m` relacionados; marcar câmera coberta pelo Card 13 somente após confirmar que todos os critérios do card específico foram satisfeitos. Compartilhamento continua pendente.

---

## Estratégia de rollout

1. Habilitar LiveKit somente em desenvolvimento/QA com envs configuradas.
2. Rodar matriz automatizada e QA real.
3. Publicar API antes da web; endpoint/evento novo é aditivo.
4. Publicar web com fallback: sem LiveKit/configuração, a sala textual continua operacional e mostra “Áudio e vídeo indisponíveis”.
5. Observar por uma reunião piloto interna sem dados sensíveis.
6. Só depois liberar a feature para o piloto do TCC.

## Rollback

- Web: remover/ocultar `ConferenceControls` por configuração e manter Socket.IO/transcrição.
- API: manter `media:credentials` desabilitado sem remover migrations, pois esta feature não cria schema.
- LiveKit: revogar chaves do ambiente afetado e fechar salas ativas.
- Rollback não deve alterar transcript, chat, identidade ou sala de espera.

## Riscos e contramedidas

| Risco | Contramedida |
|---|---|
| Malha WebRTC não escala | SFU LiveKit desde a primeira entrega |
| Sala de espera contornada | token somente pelo socket já admitido |
| Segredo no cliente | token assinado no NestJS; segredo somente em env backend |
| Safari bloqueia autoplay | evento do SDK + botão `room.startAudio()` no clique |
| Duas capturas do mic brigam no Safari/iOS | origem física compartilhada com clones independentes |
| Mute interrompe ASR | clones/publicações separados e teste explícito |
| devicechange/setSinkId incompletos | refresh manual e progressive enhancement |
| Reconexão duplica tiles | mapa por `participantId + source`, replace em vez de append |
| Vídeo torna legenda secundária | layout caption-first e gates de zoom/mobile/leitor de tela |
| Mídia residual após encerramento | `deleteRoom`, disconnect local e empty timeout defensivo |
| Teste emulado é confundido com Safari | QA em Safari/macOS/iOS real obrigatório |
| Credencial exposta em logs/traces | token só em memória; logger e traces sanitizados |

## Referências verificadas em 2026-09-02

- LiveKit JS SDK v2: <https://github.com/livekit/client-sdk-js> — áudio/vídeo, device management, autoplay, adaptive stream/dynacast e matriz Chrome/Firefox/Safari/Edge.
- LiveKit Server SDK JS: <https://github.com/livekit/node-sdks/tree/main/packages/livekit-server-sdk> — `AccessToken`, grants, TTL e `LiveKitAPI.room.deleteRoom`.
- LiveKit Server `v1.13.6`: <https://github.com/livekit/livekit/releases/tag/v1.13.6>.
- MDN `getUserMedia`: <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia> — secure context e erros de permissão/dispositivo.
- MDN autoplay: <https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay>.
- MDN `setSinkId`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId>.
- Playwright browsers: <https://playwright.dev/docs/browsers> — Chromium, Firefox, WebKit e branded browsers.

## Gate de conclusão do plano

A feature só pode ser declarada pronta quando:

- API e web partem de `dev` atualizado;
- todos os testes unitários, E2E, build e diff-check passam;
- Chromium, Firefox e WebKit passam automatizados;
- Brave/Chrome, Edge, Firefox, Safari macOS, Safari iOS e Chrome Android têm resultado real registrado ou são explicitamente marcados como não validados;
- host mantém chamada e transcrição simultâneas;
- encerramento remove a sala LiveKit;
- nenhum segredo ou conteúdo de mídia é persistido;
- legenda continua sendo o elemento principal;
- PRs estão abertos para revisão, Card 13 está em `EM REVISÃO` e nenhum merge foi feito sem autorização.
