# UX da sala ao vivo — contrato e validação

> **Status em 2026-07-31:** em desenvolvimento na branch `docs/ux-sala-acessivel`, derivada da
> experiência funcional aceita em `feat/salas-comunicacao`. Este documento descreve decisões de
> produto e UX; não declara contexto da plateia, preferência literal/adaptada ou agente de IA como
> implementados.

## Vínculos

- Card 03: [Fechar a experiência UX/UI acessível das salas ao vivo](https://app.clickup.com/t/90171419563/86e2j4uyj).
- [Contrato canônico do MVP](./contrato-mvp-transcricao-tempo-real.md).
- [Arquitetura da sala ao vivo](../arquitetura/sala-ao-vivo.md).
- [Plano de implementação](../.hermes/plans/2026-07-31_104527-fechar-ux-sala-ao-vivo.md).

## Escopo deste card

Este card fecha a jornada, o contrato visual, os estados e um protótipo navegável antes de alterar o
frontend de produção. Ele não implementa IA, contexto persistido, preferências persistidas, WebRTC,
moderação, retenção nem precisão lexical do ASR.

A superfície é primariamente **Monitor**: a pessoa acompanha a legenda e o estado da reunião. A barra
de ações e os painéis são uma camada secundária **Operate**. Essa ordem impede que configurações,
chat ou decoração concorram com o texto ao vivo.

## Contrato que não pode regredir

A reunião é instantânea:

```text
Nova reunião
  → reunião já LIVE
  → compartilhar convite
  → iniciar/pausar transcrição quando desejar
  → configurar contexto opcional dentro da sala
  → acompanhar legenda, pessoas e chat
  → encerrar
  → consultar conteúdo em somente leitura
```

Não fazem parte da UX ativa:

- preparação da reunião;
- formulário obrigatório antes da entrada;
- configuração de público antes de abrir;
- botão separado para iniciar a reunião;
- hierarquia visível entre sala e sessão interna.

“Iniciar transcrição” controla captura e ASR; não muda o ciclo de vida da reunião.

---

## Estado atual auditado

### Evidência observada

A auditoria considerou:

- build final da branch `feat/salas-comunicacao` servido em `127.0.0.1`;
- frontend HTTP 200, API saudável com banco conectado e modelo Vosk same-origin disponível;
- viewport desktop `1280×720` da central de áudio no Firefox;
- viewport mobile `390×844` da central de áudio no Firefox;
- captura real enviada por Foyth com transcript parcial/final sendo exibido;
- referência de controles de áudio do Google Meet fornecida por Foyth;
- componentes `LiveRoomView`, `CaptionStage`, `MicControl`, `ChatPanel` e `SessionInviteView`.

A captura real prova que microfone, ASR, Socket.IO e palco entregam texto. Frases reconhecidas com
palavras incorretas evidenciam limite lexical do modelo pt-BR; isso não é defeito de layout e foi
separado para melhoria posterior.

### O que deve ser preservado

- A legenda já ocupa a maior superfície e usa fundo escuro de alto contraste.
- A linha atual recebe mais peso que o histórico.
- A pessoa pode aumentar/diminuir texto e voltar ao ponto ao vivo.
- Estado `Ao vivo`, convite e encerramento estão visíveis no cabeçalho.
- Chat e pessoas ficam fora do palco de legenda.
- A seleção e o teste de microfone mostram dispositivo, sinal, sucesso e privacidade.
- O anfitrião e o participante já recebem ações diferentes por permissão.
- `prefers-reduced-motion` e foco visível já existem como fundação técnica.

### Escala de severidade

- **P0:** impede entrada, compreensão ou acesso à legenda.
- **P1:** aumenta muito o esforço, oculta ou comunica incorretamente um estado importante.
- **P2:** inconsistência de interação, acessibilidade ou hierarquia sem bloquear a tarefa.
- **P3:** refinamento visual ou editorial.

### Achados P0

Nenhum P0 foi observado na jornada funcional validada. Isso não significa que o contrato visual
esteja fechado; significa apenas que a legenda permanece alcançável e legível no cenário auditado.

### Achados P1

#### P1.1 — “Transcrição ao vivo” pode contradizer o microfone pausado

O cabeçalho do palco mantém indicador colorido e a expressão “Transcrição ao vivo” enquanto a barra
inferior informa que o microfone está pausado. A pessoa pode interpretar disponibilidade do recurso
como publicação ativa.

**Direção:** separar `Legenda disponível` de `Transcrição ativa`; usar ícone, texto e tom coerentes
para `pausada`, `preparando`, `voz detectada`, `texto confirmado`, `reconectando` e `falha`.

#### P1.2 — Estados técnicos competem com a ação principal

MicControl concentra preparação, transporte local, sinal, hipótese, erro, nível e instruções abaixo da
barra. Em telas curtas, o estado empurra o palco e exige leitura longa durante uma tarefa de alta
pressão.

**Direção:** um estado curto e acionável na barra; detalhes técnicos ficam em ajuda progressiva na
central de áudio. Nunca transformar frames em confirmação de texto.

#### P1.3 — Modal de áudio cobre o palco sem contrato completo de foco

O popover tem `role="dialog"` e fecha por Escape, mas não aplica backdrop/inert, foco inicial e retorno
de foco como um dialog modal; visualmente também se comporta como modal no mobile.

**Direção:** desktop usa popover/painel não modal quando houver espaço; mobile usa bottom sheet modal
com foco contido, título anunciado, Escape e retorno ao gatilho.

#### P1.4 — Mobile empilha palco, dialog, chat e VLibras

No mobile, a central de áudio ocupa quase toda a viewport, enquanto a entrada do chat e o widget
VLibras permanecem visíveis atrás. A pessoa perde contexto sobre qual camada está ativa e há risco de
colisão de safe area.

**Direção:** uma única superfície secundária por vez; bottom sheet acima da barra inferior, backdrop
claro e conteúdo subjacente inerte. Reservar safe area explícita para controles e VLibras.

#### P1.5 — Painel lateral permanente consome largura mesmo vazio

No desktop, Chat/Pessoas reserva cerca de 340 px quando não há conteúdo. A legenda segue grande, mas
perde área útil para uma superfície secundária vazia.

**Direção:** painel fechado por padrão ou persistido por preferência; quando aberto, Variante A
redimensiona somente em desktop largo e Variante B sobrepõe. Mobile sempre usa sheet.

#### P1.6 — Reconexão não possui orientação suficiente

A implementação distingue `connecting`, `connected` e `offline`, mas a interface atual só mostra uma
mensagem genérica. Não comunica que a legenda existente continua disponível, que conteúdo novo pode
atrasar ou qual ação é segura.

**Direção:** estado `Reconectando…` preserva transcript, bloqueia apenas mutações dependentes da
conexão e informa fallback sem remover o palco.

### Achados P2

#### P2.1 — Cabeçalho móvel dedica muito espaço a ações administrativas

Sair, identidade, convidar e encerrar ocupam duas linhas antes da legenda. Para participante, sair é
necessário; para host, convite/encerramento são menos frequentes que transcrição.

**Direção:** cabeçalho compacto; ações secundárias migram para barra/painel sem esconder rótulos.
Encerrar permanece separado visualmente de sair e das ações frequentes.

#### P2.2 — A barra atual não forma um sistema único de controles

“Iniciar transcrição” e “Entrada de áudio” são blocos largos próprios. Chat/Pessoas vivem em outra
região, e preferências de legenda ficam no topo do palco.

**Direção:** barra inferior estável com agrupamento por frequência e papel, inspirada no modelo mental
do Meet, mas com identidade e rótulos Semantia.

#### P2.3 — O vazio do palco e do chat tem pouca orientação

“Aguardando o comunicador falar…” confirma ausência de texto, mas não explica se a reunião está
conectada, se o host está transcrevendo ou se a pessoa precisa agir. O chat vazio ocupa uma coluna
inteira com pouca utilidade.

**Direção:** combinar estado de reunião e disponibilidade de legenda; fornecer uma única ação quando
ela existe. Fechar painel vazio não essencial.

#### P2.4 — Histórico não identifica origem da fala

A captura real mostra linhas fragmentadas sem informação de comunicador ou intervalo. Isso não impede
leitura, mas dificulta conversas com mais de um comunicador e revisão posterior.

**Direção:** o protótipo testa identificação discreta de comunicador sem competir com a frase atual.
A persistência dessa informação depende de contrato posterior e não é prometida neste card.

#### P2.5 — Tabs de Chat/Pessoas precisam de semântica fechada

A seleção é visual, porém o contrato precisa definir `tablist`, `tab`, `tabpanel`, `aria-selected`,
teclas de seta e estado de contagem sem depender da cor.

**Direção:** aplicar padrão WAI-ARIA Tabs quando ambas as superfícies compartilharem o mesmo painel;
se forem gatilhos independentes, usar botões com `aria-expanded` e `aria-controls`.

#### P2.6 — Preferências futuras podem virar controles falsos

Literal/adaptada, contexto e IA ainda não existem. Colocá-los no protótipo sem distinção pode ser
interpretado como entrega.

**Direção:** marcar no artefato como “proposta”; no produto real, só renderizar quando os contratos dos
Cards 04, 05, 08 e 09 existirem.

### Achados P3

- O palco usa grandes áreas escuras uniformes; hierarquia pode depender mais de tipografia e ritmo do
  que de caixas e bordas.
- Contadores `0` e `1` têm peso visual semelhante ao rótulo do painel.
- Nome da reunião e subtítulo repetem informação em alguns cenários de QA.
- A linha parcial poderia ter um sinal editorial mais distinto sem depender apenas de cor.

## Defeitos técnicos conhecidos fora deste card

- `CaptionStage.vue`: na ausência de valor salvo, `Number(localStorage.getItem(...))` converte `null`
  para `0`, podendo substituir o default de 34 px por 22 px. O futuro card de implementação deve
  corrigir em RED/GREEN.
- A precisão do Vosk para nomes próprios, ruído e algumas palavras segue limitada. O Card 03 não
  altera modelo nem pós-processa o literal com IA.

## Resultado da auditoria

A composição atual já prova a tese funcional, mas ainda parece uma tela técnica com regiões
justapostas. O novo contrato deve transformá-la em uma experiência de reunião **caption-first**:
legenda dominante, estado inequívoco, barra inferior estável, painel sob demanda e uma única camada
secundária por vez.
