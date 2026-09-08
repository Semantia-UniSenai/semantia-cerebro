---
title: Mídia de conferência na sala caption-first
status: em-implementacao
atualizado: 2026-09-02
card: 86e2j4wqw
---

# Mídia de conferência na sala caption-first

## Decisão

O Card 13 adiciona áudio bidirecional e câmera às reuniões do Semantia por meio de um **SFU LiveKit**. Não será criada uma malha WebRTC ponto a ponto.

A decisão preserva duas fronteiras independentes:

```text
Socket.IO /live
  identidade, autorização, sala de espera, ciclo LIVE/ENDED,
  transcript, chat, mãos e encerramento

LiveKit
  áudio/vídeo efêmero, publicação/assinatura de tracks,
  estado técnico de mídia e reconexão
```

A sala do provedor usa `semantia:<sessionId>`. A identidade da pessoa no provedor usa o `participantId` canônico já admitido pelo Semantia.

## Motivos

- uma malha P2P exige conexões e uploads crescentes entre todas as pessoas e conflita com o alvo futuro de até 50 conexões;
- o SFU isola a complexidade de codecs, ICE/TURN, adaptação de bitrate e reconexão;
- a autorização e o ciclo de negócio já estão no gateway `/live` e não devem ser duplicados no provedor;
- um adapter de frontend e um provider de backend evitam acoplamento direto do produto ao SDK.

## Alternativas descartadas

### WebRTC mesh artesanal

Descartada porque funciona apenas para grupos pequenos, aumenta o custo de upload de cada pessoa e exigiria sinalização, TURN e reconexão próprios.

### Transmitir mídia pelo Socket.IO

Descartada porque Socket.IO não é transporte de mídia em tempo real. O namespace `/live` continua servindo somente ao domínio da reunião e ao áudio PCM efêmero do ASR.

### Unificar microfone da chamada e transcrição

Descartada como UX. Os controles e estados permanecem independentes. A implementação pode compartilhar uma única origem física e fornecer clones específicos para a conferência e para o pipeline PCM, evitando capturas concorrentes em Safari/iOS.

## Contrato de autorização

1. A pessoa autentica e solicita entrada pelo Socket.IO.
2. A sala de espera, quando ativa, precisa aprovar a entrada.
3. O cliente recebe `session:state` e passa a ser participante admitido.
4. Somente então pode solicitar `media:credentials` no mesmo socket.
5. A API verifica presença e sessão `LIVE` e emite token LiveKit com TTL de 600 segundos.
6. O token permite entrar apenas em `semantia:<sessionId>`, publicar microfone/câmera e assinar tracks.
7. Convidado aguardando, socket não admitido e sessão encerrada não recebem credencial.

`LIVEKIT_API_SECRET` existe somente no ambiente da API. O token de participante fica apenas em memória e não aparece em snapshot, broadcast, URL, storage, banco ou logs.

## Ciclo e privacidade

- câmera e microfone da chamada começam desligados;
- permissão é solicitada somente após gesto explícito;
- áudio/vídeo atravessa o SFU com WebRTC/DTLS-SRTP, mas a primeira entrega **não afirma E2EE**;
- gravação, egress, ingest e snapshots permanecem desabilitados;
- não há schema nem persistência de mídia;
- `session:end` encerra a sessão canônica e remove a room LiveKit;
- sair, desmontar a view ou receber `session:ended` para e libera tracks/listeners;
- falha de mídia degrada para a sala textual sem interromper legenda, chat ou mãos.

## Áudio da chamada versus transcrição

Os controles visíveis são:

- **Transcrição**: captura PCM do anfitrião para o ASR privado;
- **Áudio da chamada**: publicação do microfone para as demais pessoas.

Mute da chamada não pausa transcrição. Pausar transcrição não silencia a chamada. Uma origem de microfone compartilhada fornece tracks clonadas por consumidor; a última liberação encerra a origem física. Troca de dispositivo reconstrói os consumidores ativos e encerra todos os recursos antigos.

## Compatibilidade por capacidade

- requer HTTPS/WSS, ou `localhost` em desenvolvimento;
- não usa `navigator.permissions.query()` como gate;
- trata `NotAllowedError`, `NotFoundError`, `NotReadableError` e `OverconstrainedError` com ação recuperável;
- usa constraints ideais de câmera e permite negociação de resolução;
- vídeos remotos usam `autoplay playsinline`; preview local usa também `muted`;
- autoplay bloqueado expõe **Ativar áudio** no gesto da pessoa;
- `devicechange` e `setSinkId` são progressivos, com **Atualizar dispositivos** como fallback;
- tiles são indexados por `participantId + source`, evitando duplicação em reconexão.

Suporte só será declarado depois de automação em Chromium, Firefox e WebKit e execução real registrada em Brave/Chrome, Edge, Firefox, Safari macOS, Safari iOS e Chrome Android. Playwright WebKit não substitui Safari real.

## Layout

A legenda continua sendo a região principal e persistente. Vídeo não cobre legenda, controles, chat ou VLibras. Negar câmera preserva áudio/texto; negar microfone preserva vídeo/texto; negar ambos preserva toda a reunião textual.

## Limites

Compartilhamento de tela é a task separada `86e33mk6m`. Gravação, E2EE, moderação remota de tracks, SIP e múltiplas fontes de transcrição ficam fora do Card 13.

A room pode ser configurada para até 50 participantes, mas isso não é evidência de capacidade. A primeira alegação depende de carga sintética, piloto real e Card 16.

## Rollback

A web pode ocultar/desabilitar os controles de conferência e manter a sala textual. A API pode responder `MEDIA_UNAVAILABLE` sem alterar o domínio. Chaves do provedor podem ser revogadas e rooms ativas fechadas. Nenhum rollback altera transcript, chat, presença ou sala de espera.

## Reavaliação

Reavaliar o provider se o piloto demonstrar incompatibilidade relevante, custo inviável, exigência formal de E2EE ou necessidade de hospedagem própria. A fronteira `MediaRoomProvider`/`ConferenceClient` deve permitir a troca sem reescrever o domínio da reunião.
