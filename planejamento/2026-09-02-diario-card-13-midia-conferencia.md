---
title: Diário de execução — Card 13 mídia de conferência
status: concluido
atualizado: 2026-09-14
card: 86e2j4wqw
---

# Diário de execução — Card 13

## Convenções

- Registra apenas fatos executados e resultados observados.
- `PASS`, `FAIL`, `NÃO EXECUTADO` e `BLOQUEADO` são estados distintos.
- Nenhum token, áudio, vídeo, transcript privado ou credencial será registrado.

## 2026-09-02 — baseline e decisão

### Repositórios

- API: branch `feat/midia-sala`, base `origin/dev@a7fa0f4d364aef012140d7462b8bb136dc3f542a`.
- Web: branch `feat/midia-sala`, base `origin/dev@72be078ebc14d1fd0d602b76a0e7b142b3d74a43`.
- Cérebro: branch `docs/midia-sala`, base `origin/main@728a1b37d47b15e5068649f5753f6cb3b4bcff23`.
- Os três SHAs locais foram comparados com `git ls-remote` antes das worktrees.
- Não havia branch local/remota com os nomes novos nem PR aberto de API/web.

### Baseline API

Comando: `pnpm install --frozen-lockfile && pnpm prisma:generate`, seguido de `pnpm test --runInBand`.

Resultado: **PASS — 21 suites, 120 testes, 0 falhas**.

### Baseline web

Comando inicial: `pnpm install --frozen-lockfile`, seguido de `pnpm test --run`.

Resultado inicial: **FAIL — 8 testes de `LiveRoomView.spec.ts`**, todos pelo mesmo erro de fixture: o mock de `useLiveSession` não expunha `admissionStatus`, integrado pelo Card 12.

Correção mínima e separada: adicionados à fixture `admissionStatus`, `admissionQueue` e as ações da sala de espera/contexto já consumidas pela view. Nenhum código de produção mudou.

Verificação:

- `pnpm test --run src/views/LiveRoomView.spec.ts`: **PASS — 8/8**;
- `pnpm test --run`: **PASS — 18 arquivos, 94 testes**;
- commit web: `78e76cb test(live): atualiza fixture da sala de espera`.

### Decisão arquitetural

Criado `arquitetura/midia-conferencia.md` com:

- LiveKit como SFU;
- Socket.IO canônico para domínio/admissão;
- token curto pós-admissão;
- mídia efêmera sem gravação;
- microfone da chamada separado da transcrição;
- origem física compartilhada para evitar captura concorrente em Safari/iOS;
- matriz automatizada e real de navegadores;
- compartilhamento de tela fora do Card 13.

### Riscos abertos

- Não há credenciais LiveKit de desenvolvimento/QA verificadas nesta etapa.
- Safari macOS/iOS, Edge Windows e Chrome Android exigem ambiente/dispositivo real para alegação de suporte.
- O limite de 50 pessoas permanece alvo não comprovado.

## 2026-09-02 — provider LiveKit e casos de uso

### RED/GREEN

- RED: `pnpm test --runInBand src/modules/media/usecases` falhou porque os contratos e casos de uso ainda não existiam.
- GREEN: `IssueMediaCredentialsUseCase` e `CloseMediaRoomUseCase` passaram; estado não `LIVE` retorna `SESSION_READ_ONLY` e identidade vazia retorna `BAD_REQUEST` antes do provider.
- RED: o spec do provider falhou antes de `LiveKitMediaRoomProvider` existir.
- GREEN: token curto, grants mínimos, room `semantia:<sessionId>`, limite 50, `emptyTimeout=60`, ausência de configuração e cleanup idempotente ficaram cobertos.
- RED: o spec do `MediaModule` mostrou que `ConfigService` não estava resolvido isoladamente.
- GREEN: `MediaModule` importa `ConfigModule` e inicia sem credenciais reais.

### Evidência

- `pnpm test --runInBand src/modules/media`: **PASS — 4 suites, 12 testes**.
- `pnpm test --runInBand`: **PASS — 25 suites, 132 testes**.
- `pnpm exec eslint "src/modules/media/**/*.ts"`: **PASS — 0 erros**.
- Commits API: `9c64b38 feat(media): adiciona provider LiveKit` e `e2fbd5e docs(media): documenta configuracao LiveKit`.
- Variáveis documentadas sem valor real: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_TOKEN_TTL_SECONDS`.

### Desvio e risco

O `pnpm build` falhou em arquivo não alterado, `src/modules/sessions/repositories/prisma-live-session.repository.ts:107`, porque `AudienceContext` não satisfaz `Prisma.InputJsonValue`. A suíte base não revelava esse typecheck. O defeito precisa de correção regressiva antes do gate final; ele não foi mascarado nem atribuído à camada de mídia.

## 2026-09-02 — autorização e encerramento no gateway

### RED/GREEN

- RED: sete cenários de `media:credentials` falharam com `onMediaCredentials is not a function`.
- GREEN: host, participante e guest admitidos recebem credencial; socket sem identidade ou sem admissão é recusado; sessão encerrada e provider indisponível preservam erros canônicos.
- RED: `LiveModule` não importava `MediaModule`.
- GREEN: o wiring Nest passou sem expor o provider fora do módulo.
- RED: encerramento não invocava `CloseMediaRoomUseCase`.
- GREEN: cleanup ocorre depois de `EndSessionUseCase` e antes de `session:ended`; falha do provider não reabre nem bloqueia o encerramento canônico.
- RED adversarial: quebra de linha em `sessionId` permitia log forging.
- GREEN: somente o identificador de log é sanitizado e limitado; o provider e o evento continuam recebendo o ID canônico sem alteração.

### Evidência

- `pnpm test --runInBand src/modules/live/live.gateway.spec.ts src/modules/live/live.module.spec.ts src/modules/media`: **PASS — 6 suites, 33 testes**.
- `pnpm test --runInBand`: **PASS — 26 suites, 144 testes**.
- `pnpm exec eslint "{src,test}/**/*.ts"`: **PASS — 0 erros**.
- Commit API: `2d77bfb feat(live): integra midia ao ciclo da sessao`.
- A resposta de credenciais não entra em `session:state` nem em broadcast.
- A causa do provider não entra no ACK nem no warning de cleanup.

## 2026-09-02 — credencial efêmera e adapter web

### RED/GREEN

- RED: quatro cenários de `requestMediaCredentials` falharam porque o composable não expunha a operação.
- GREEN: emissão ocorre somente após `session:state`; erro do provider é recuperável; disconnect cancela ACK; token não entra em refs, storage ou query.
- RED: cada comportamento do adapter falhou antes da implementação: suporte do browser, opções adaptativas, conexão, tracks, mute/unmute, presença, reconexão, autoplay, dispositivos e cleanup.
- GREEN: `LiveKitConferenceClient` isola o SDK, usa `isBrowserSupported`, `supportsAdaptiveStream`, `supportsDynacast`, 720p/24 fps ideal e IDs estáveis `participantId:source`.
- RED de autorrevisão: substituição da mesma track deixava a anterior anexada; rejeição de `room.disconnect()` interrompia o cleanup local.
- GREEN: substituição destaca a track anterior; disconnect é idempotente, remove listeners/tracks e termina localmente mesmo com transporte já ausente.

### Evidência

- `pnpm exec vitest run src/live/useLiveSession.spec.ts`: **PASS — 18 testes**.
- `pnpm exec vitest run src/live/media/livekit-conference-client.spec.ts`: **PASS — 21 testes**.
- `pnpm test`: **PASS — 19 arquivos, 119 testes**.
- `pnpm build`: **PASS**.
- Commits web: `44e27cf feat(media): solicita credenciais efemeras da sala` e `d18ad5c feat(media): encapsula cliente LiveKit`.
- `livekit-client` fixado em `2.22.2`.

### Privacidade e limites

- O token fica apenas na variável local retornada pelo ACK e passada a `Room.connect`; não é logado nem persistido.
- O gate prova tipos e comportamento determinístico do adapter, não transporte com um servidor LiveKit real nem suporte Safari/mobile.

## 2026-09-10 — reabertura após QA funcional

O relato de uso real classificou câmera e áudio como instáveis e invalidou qualquer leitura anterior de que a entrega estava pronta. O Card 13 voltou para diagnóstico, correção e QA integral; nenhum PR será mergeado automaticamente.

### Baseline reproduzido

- `node scripts/run-conference-e2e.mjs --project=chromium-desktop`: **FAIL** no fluxo com host e convidado admitidos.
- As duas pessoas conectaram à mesma room, publicaram microfone por gesto explícito e receberam um elemento `<audio>` remoto.
- O áudio remoto não possuía nome acessível: esperado `Áudio de <participante>`, observado `aria-label=null`.
- A falha interrompeu o roteiro antes de provar câmera, mute remoto, encerramento e cleanup no mesmo fluxo.
- Baseline focal web: **PASS — 6 arquivos, 74 testes**, seguido de build e `git diff --check` com exit `0`.
- Baseline API: **PASS — 26 suites, 144 testes**, seguido de build e `git diff --check` com exit `0`.

### Achados iniciais de produto e UI/UX

1. O componente que anexa áudio remoto não preserva a identidade acessível da pessoa.
2. O preview local depende de a pessoa existir na lista textual recebida pela view, mas o adapter de mídia não publica explicitamente a identidade local; o E2E ainda não chegou a essa asserção.
3. A barra inferior mistura chamada, vídeo, transcrição, entrada, chat e pessoas com pesos concorrentes; em desktop ela ocupa largura excessiva e dificulta distinguir microfone da chamada de transcrição.
4. O palco vazio domina a viewport e mostra “Aguardando o comunicador falar” mesmo quando a transcrição está pausada, produzindo estado contraditório.
5. Ativação de câmera/microfone não tem estado visual de solicitação/permissão em andamento nem bloqueio explícito contra novas intenções.
6. Não existe seleção/refresh de câmera na integração atual, apesar do contrato cross-browser exigir troca de câmera e fallback manual de dispositivos.

### Loop de recuperação

- reproduzir cada falha em um comando red-capable;
- adicionar regressão antes da correção;
- corrigir lifecycle antes de redesenhar o palco;
- refazer hierarquia, estados, microcopy, responsividade, foco, zoom e reduced motion;
- executar matriz Chromium/Firefox/WebKit e viewports mobile com dois contextos;
- registrar separadamente automação, Brave real disponível e dispositivos reais não disponíveis.

## 2026-09-14 — fechamento técnico para revisão

### Correções do review

- O encerramento foi consolidado em `session:end`; o endpoint REST paralelo foi removido.
- A emissão de mídia relê a sessão antes e depois do provider, fecha a room se houver corrida com `ENDED`, limita o token a 60 segundos e aplica throttling por socket.
- `room.auto_create: false` tornou terminal o `deleteRoom`: a credencial antiga não recria a sala.
- Publicações tardias usam uma barreira de geração; cliente com conexão falha é descartado e uma tentativa posterior solicita credencial nova.
- O teste local de microfone usa lease da origem física compartilhada; troca de entrada ganhou rollback e restauração dos consumidores.
- Preview local, chamada, transcrição e origem física são liberados no fim canônico e no unmount.
- A chamada volta ao estado anterior depois do teste de câmera/microfone, inclusive se a permissão for negada.
- A modal de dispositivos ganhou foco inicial, `Escape`, contenção de `Tab` e restauração do foco.
- A rota da sala passou a lazy-load; o chunk inicial medido caiu para `83,63 kB` gzip. O chunk da sala ainda gera aviso por ultrapassar 500 kB minificado e fica como alvo de otimização posterior.

### Evidência final

- Web: `pnpm test && pnpm build && git diff --check` — **PASS: 26 arquivos, 212 testes, build e diff-check**.
- API: `pnpm exec jest --runInBand`, ESLint, build e diff-check — **PASS: 27 suites, 148 testes**.
- API/PostgreSQL scratch: `pnpm prisma migrate deploy && pnpm test:e2e` — **PASS: 1 cenário E2E**.
- Playwright/LiveKit/PostgreSQL scratch: **PASS: 17 execuções, 4 skips intencionais, 0 falhas**. Os skips correspondem à prova de token executada somente uma vez no Chromium desktop; os fluxos de produto passaram em Chromium desktop/mobile, Firefox desktop e WebKit desktop/mobile.
- Autoplay bloqueado: **PASS**, com ação explícita para liberar áudio.
- Token antigo: conecta antes do fim e falha depois de `session:end` + `deleteRoom()` com auto-criação desativada.
- OpenAPI executada: nenhum `POST /sessions/:id/end` permanece exposto.
- Auditoria de produção: web mantém 1 advisory alto herdado (`nanoid`); API mantém 10 altos herdados. Nenhum é introduzido pelas dependências de mídia desta branch.

### Limites e publicação

- Safari macOS/iOS, Chrome Android e Edge reais: **NÃO EXECUTADO**. Playwright WebKit/mobile não substitui dispositivo físico.
- Capacidade de 25/50 participantes, troca real de rede e carga longa: **NÃO EXECUTADO**; nenhuma alegação pública de escala foi autorizada.
- Não houve captura, persistência ou publicação de áudio/vídeo, token ou segredo. O E2E de credencial desativa trace e mantém o token somente em memória.
- PRs web/API: `#13`, contra `dev`, sem merge automático. A documentação segue em PR separado contra `main`.

## 2026-09-14 — integração autorizada

- Foyth autorizou explicitamente a aprovação e o merge dos PRs.
- Web PR `#13`: mergeada em `dev` no commit `15e23697d8322bba186497436ef23c65530993f1`.
- API PR `#13`: mergeada em `dev` no commit `7c51db661a671e67ec70039016280bfe99ca9149`.
- Cérebro PR `#11`: mergeada em `main` no commit `d7ac292be554eff03ba1621a01d3be5f452fdf9a`.
- O resultado mergeado foi revalidado: web com 212 testes e build; API com 148 testes, lint, Prisma generate e build.
- Os limites de dispositivos físicos, escala e rede continuam registrados e não foram convertidos em alegações de suporte.
