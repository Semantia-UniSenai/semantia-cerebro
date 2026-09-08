---
title: Diário de execução — Card 13 mídia de conferência
status: em-andamento
atualizado: 2026-09-02
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
