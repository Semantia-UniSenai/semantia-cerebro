---
title: Validação da mídia de conferência
status: validacao-automatizada-concluida
atualizado: 2026-09-14
card: 86e2j4wqw
---

# Validação da mídia de conferência

## Escopo automatizado final

O runtime descartável usa PostgreSQL, API NestJS, web Vite e LiveKit Server `v1.9.10`. `room.auto_create` permanece desativado. Mídia de teste é sintética e nenhuma credencial é registrada.

- Chromium desktop: preview, restauração, encerramento, token terminal, áudio/vídeo bidirecional, RTP e RMS.
- Firefox desktop: preview, restauração, encerramento e áudio/vídeo bidirecional.
- WebKit desktop: preview, restauração, encerramento e áudio/vídeo bidirecional.
- Chromium mobile emulado: preview, restauração, encerramento e áudio/vídeo bidirecional, RTP e RMS.
- WebKit mobile emulado: preview, restauração, encerramento e áudio/vídeo bidirecional.
- Chromium com autoplay bloqueado: CTA de recuperação e reprodução após gesto explícito.

Resultado consolidado: **17 execuções passaram, 4 skips intencionais, 0 falhas**. Os quatro skips são a prova de token terminal nos projetos em que ela não precisa ser repetida; ela passou no Chromium desktop contra o LiveKit real.

## Provas de lifecycle e privacidade

- câmera e microfone iniciam desligados;
- teste local não publica mídia e devolve chamada ao estado anterior;
- teste local e transcrição reutilizam a origem física compartilhada;
- encerramento para previews, clones, tracks e sala LiveKit;
- uma publicação que resolve depois do encerramento é descartada;
- credencial emitida antes do fim não recria a room;
- token permanece em memória, sem trace, storage, URL, banco ou log;
- falha da mídia não encerra Socket.IO, chat, legenda ou mãos levantadas.

## Limites honestos

- Safari em macOS e iPhone/iPad reais: **não validado**.
- Chrome em Android real: **não validado**.
- Edge em Windows real: **não validado**.
- Interrupção por chamada telefônica, lock/background e troca Wi-Fi ↔ rede móvel: **não validado**.
- 25/50 participantes e carga de 10 minutos: **não validado**.

Playwright WebKit e viewports mobile provam regressões de engine/layout no laboratório; não autorizam declarar suporte aos dispositivos reais acima.