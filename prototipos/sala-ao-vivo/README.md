# Protótipo — sala ao vivo acessível

Artefato navegável do Card 03, criado para validar a experiência antes de alterar o frontend Vue.

## Limites

Este protótipo:

- não usa API, banco, Socket.IO, microfone, storage ou IA;
- não envia requests para serviços externos;
- usa dados fictícios;
- apresenta `Contexto` e `Adaptada` como propostas de cards futuros;
- não representa funcionalidade entregue em produção.

## Abrir

Na raiz do `semantia-cerebro`:

```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipos/sala-ao-vivo
```

Abra:

```text
http://127.0.0.1:4174/
```

O botão **Explorar cenários** alterna variante, papel e estado. Para capturas limpas, acrescente
`&clean=1` ao link.

## URL navegável

```text
?variant=stage|focus
&role=host|participant
&state=<scenarioKey>
&panel=chat|people|context|preferences|audio-help|actions
```

Valores desconhecidos são descartados e caem em opções seguras.

### Links de revisão

```text
http://127.0.0.1:4174/?variant=stage&role=host&state=live-empty
http://127.0.0.1:4174/?variant=stage&role=host&state=mic-denied&panel=audio-help
http://127.0.0.1:4174/?variant=stage&role=participant&state=live-literal
http://127.0.0.1:4174/?variant=focus&role=host&state=meeting-reconnecting
http://127.0.0.1:4174/?variant=focus&role=participant&state=ai-unavailable-literal-fallback
http://127.0.0.1:4174/?variant=focus&role=participant&state=invite-validating
http://127.0.0.1:4174/?variant=stage&role=host&state=meeting-ended-readonly
```

## Variantes

### A · Palco central (`stage`)

O palco é uma superfície definida. Em desktop largo, um painel aberto reduz a coluna central; em
tablet/mobile, ele vira overlay ou bottom sheet.

### B · Foco leitura (`focus`)

A legenda ocupa praticamente toda a viewport. Barra e painéis sobrepõem o palco sem alterar a largura
da linha de leitura.

## Papéis

- `host`: convite, captura/transcrição, áudio, contexto e encerramento.
- `participant`: modo de leitura, tamanho, chat, pessoas, mão e saída individual.

Participante não recebe controle de microfone/transcrição nem `Encerrar para todos`.

## Estados

1. `invite-validating`
2. `invite-unavailable`
3. `meeting-connecting`
4. `meeting-reconnecting`
5. `live-empty`
6. `mic-requesting`
7. `mic-denied`
8. `local-model-preparing`
9. `local-audio-without-text`
10. `live-literal`
11. `live-adapted`
12. `ai-unavailable-literal-fallback`
13. `meeting-ended-readonly`
14. `action-error`

## Teclado

- `Tab` / `Shift+Tab`: navegar.
- `Enter` / `Espaço`: ativar.
- `Escape`: fechar painel, sheet ou dialog.
- O foco retorna ao controle que abriu a superfície.
- O dialog de encerramento inicia em `Cancelar`.
- O skip link **Ir para a legenda** aparece quando recebe foco.

O protótipo não adiciona atalhos globais de letras porque eles podem conflitar com chat, navegador e
tecnologia assistiva.

## Testes locais

Máquina de estados e URL:

```bash
node --test prototipos/sala-ao-vivo/prototype.spec.mjs
```

Sintaxe:

```bash
node --check prototipos/sala-ao-vivo/prototype.js
```

O harness Playwright/axe é temporário e fica em `/tmp/semantia-ux-qa`; dependências não são adicionadas
ao cérebro.

## Fonte canônica

Decisões, jornadas, microcopy, WCAG, responsividade e handoff estão em
[`produto/ux-sala-ao-vivo.md`](../../produto/ux-sala-ao-vivo.md).

Resultados técnicos, correções, limites humanos e seis capturas finais estão em
[`validacao.md`](./validacao.md).
