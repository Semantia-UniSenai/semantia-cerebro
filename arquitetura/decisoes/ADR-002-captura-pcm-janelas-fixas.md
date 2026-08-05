---
id: ADR-002
status: aceita
data: 2026-08-04
decisores: [Foyth]
supersede-parcialmente: ADR-001
---

# ADR-002 — captura PCM em janelas fixas, sem ASR ou VAD no frontend

## Contexto

A arquitetura do Card 06 usava Vosk no navegador para prévias textuais e para fechar segmentos enviados ao backend. Embora barato e rápido, um texto provisório incorreto aumenta esforço cognitivo e pode induzir uma pessoa surda a interpretar a fala errada antes da correção. Foyth decidiu que a interação predominantemente presencial tolera alguns segundos até o texto confiável e rejeitou substituir Vosk por um VAD dedicado.

## Decisão

1. Remover Vosk, Web Speech e Whisper/Transformers.js do runtime e bundle do frontend.
2. O frontend não converte áudio em texto e não publica `transcript:partial` a partir do microfone.
3. Enquanto o anfitrião mantiver a transcrição ativa, `getUserMedia` + `AudioWorklet` capturam PCM e fecham janelas contíguas de 5 segundos por contagem de frames, não por detecção de fala.
4. Ao pausar, sair ou encerrar, o trecho residual com pelo menos 250 ms é enfileirado; se conectado, a ação aguarda drenagem/ACK antes de desconectar. Estado offline, disconnect abrupto ou unmount descartam bytes não aceitos conforme retenção zero.
5. Não usar sobreposição nesta primeira versão, para evitar texto duplicado ou reconciliação semântica arriscada.
6. O provider `faster-whisper` deixa de habilitar `vad_filter`; o modelo recebe cada janela integral.
7. Resultado vazio é um sucesso sem fala: recebe ACK, não persiste segmento e não faz broadcast final; um cache efêmero de 120 s preserva replay idempotente acima do TTL de 60 s do navegador.
8. O único componente áudio→texto é o serviço ASR Python privado.
9. Remover o rollback `ASR_MODE=browser`; final textual enviado pelo cliente permanece proibido.

## Por que 5 segundos

Com RTF local p95 de 0,505 no perfil KVM 2 emulado, uma janela de 5 segundos tende a acrescentar cerca de 2,5 segundos de inferência além do tempo de coleta. Isso mantém a ordem de grandeza em segundos, reduz o número de chamadas quando comparado a janelas menores e será reavaliado com fala humana antes de produção.

## Consequências positivas

- uma única fonte de verdade textual;
- ausência de legenda provisória potencialmente enganosa;
- bundle menor e sem download do modelo Vosk/Whisper no navegador;
- comportamento igual por capacidade de captura em Chromium e Firefox;
- fronteira simples: frontend captura; backend transcreve.

## Custos e riscos

- primeira legenda de cada trecho aparece somente após coleta + fila + inferência;
- palavras exatamente na fronteira de uma janela podem perder contexto;
- silêncio também é enviado ao backend enquanto a captura estiver ativa;
- mais minutos de CPU são consumidos quando o microfone fica ligado sem fala;
- sem overlap nesta fase, a precisão de fronteira depende do Whisper;
- o parâmetro de 5 segundos só pode ser promovido após WER humano e soak na VPS real.

## Guardas

- somente HOST em sessão LIVE;
- fila/TTL/retry/idempotência existentes permanecem;
- máximo de oito janelas no navegador e na sessão;
- nenhuma persistência de áudio;
- resultado vazio não é tratado como erro nem cria linha no banco; replay no-speech usa cache efêmero de
  120 s, sem tombstone persistente;
- falha do backend fica visível e não cria fallback textual local;
- stop manual enfileira o residual; sair/encerrar conectados aguardam a drenagem por ACK antes da
  transição;
- estado offline, desconexão abrupta, unmount, expiração ou falha definitiva descartam bytes conforme
  retenção zero.

## Reavaliação

Reavaliar janela, overlap e eventual streaming somente com o mesmo corpus humano pt-BR, medindo WER, perdas em fronteiras, latência ponta a ponta, RTF, CPU/RSS e rejeições de fila. Nenhum VAD ou ASR frontend entra sem nova decisão explícita.
