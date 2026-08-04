# Harness ASR — Card 06

Este diretório preserva as cinco fixtures WAV e os dois harnesses usados em 2026-08-03. Ele pertence
ao `semantia-cerebro`; os arquivos não devem ser enviados no bundle público do produto.

## Pré-requisitos

- checkout da branch web do Card 06;
- dependências instaladas com `pnpm install --frozen-lockfile`;
- modelo Vosk pt-BR disponível em
  `public/models/vosk-model-small-pt-0.3.model`;
- Brave/Chromium com WebAssembly e Worker;
- memória suficiente para o Whisper Small q8/WASM.

## Preparação descartável

A partir do checkout de `semantia-web`:

```bash
mkdir -p public/qa/card-06
cp <semantia-cerebro>/evidencias/card-06/harness/fixtures/*.wav public/qa/card-06/
cp <semantia-cerebro>/evidencias/card-06/harness/asr-benchmark.html ./
cp <semantia-cerebro>/evidencias/card-06/harness/asr-whisper-benchmark.html ./
pnpm dev --host 127.0.0.1
```

Abrir, no mesmo browser e origem do Vite:

- `/asr-benchmark.html` para Vosk;
- `/asr-whisper-benchmark.html` para Whisper.

Cada página publica o objeto final em `window.__benchmarkResult` e o imprime em `#output`. O harness
Whisper baixa `onnx-community/whisper-small` quando o cache não contém o modelo.

## Limpeza

Os dois HTMLs e `public/qa/card-06/` são cópias descartáveis. Removê-los do checkout web após o
benchmark. Não commitar fixtures, credenciais, cache de modelo ou relatório contendo tokens no
repositório de produção.

## Comparabilidade

- Não comparar `modelLoadMs` de cache aquecido com cold start.
- Executar os cinco cenários no mesmo browser/hardware.
- Preservar referência, versão do modelo, sample rate, duração, texto reconhecido, WER e latência.
- Salvar resultados novos em outro JSON datado.
- WER sintético não substitui teste humano com fala espontânea.
