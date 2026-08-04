---
tags: [tcc, senai, semantia, libras, acessibilidade]
status: histórico-vivo
atualizado: 2026-08-03
---

# Semantia 🤟

> **Registro cronológico do projeto.** As seções 1–18 preservam decisões e entregas da fase
> educacional iniciada em junho. O contrato vigente está em
> [`../produto/contrato-mvp-transcricao-tempo-real.md`](../produto/contrato-mvp-transcricao-tempo-real.md),
> e os requisitos atuais em
> [`../requisitos/mvp-transcricao-tempo-real.md`](../requisitos/mvp-transcricao-tempo-real.md).
> Em caso de divergência, os documentos canônicos prevalecem; o histórico não deve ser apagado.

**Slogan:** _"Inclusão não é adaptação, é o padrão."_
**Logo:** mão estilizada como rede neural / grafo de nós + wordmark "SEMANTIA" (gradiente azul→roxo). Já existe (gerada por IA).

---

## 1. O que é

Plataforma **web** para **adaptação semântica de conteúdos educacionais para Libras**. Foco: ajudar **professores, intérpretes e instituições** a deixar material didático acessível para **estudantes surdos**.

A sacada central: **adaptação semântica, NÃO tradução literal.** Em vez de trocar palavra por palavra (como fazem VLibras / Hand Talk), o sistema **reorganiza conceitos e estrutura linguística** para a forma natural da Libras (língua visual-espacial, gramática própria), e relaciona os conceitos a **vídeos/animações de sinais** de uma biblioteca.

## 2. Contexto acadêmico

- **TCC** — UNISENAI Joinville, **Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas** (Graduação Tecnológica).
- Período: **Julho–Dezembro/2026**.
- Também é submissão do **INOVA SENAI** (concurso de inovação) — exige logo, slogan, pitch e canvas.
- Área tecnológica declarada: **Tecnologia da Informação**.
- Nomes provisórios descartados antes do "Semantia": SinalizaEdu, EduLibras, SinalTech, LibrasBridge.

O TCC tem **duas entregas**:
1. **Artigo científico** (normas ABNT).
2. **Sistema funcional** (MVP).

## 3. Problema

- Brasil: ~**10 mi** de pessoas com algum grau de deficiência auditiva, ~**2,7 mi** com surdez profunda (IBGE).
- Maioria do conteúdo educacional (textos, slides, docs) **não tem adaptação adequada para Libras**.
- Ferramentas existentes (VLibras, Hand Talk): **tradução literal** do português → interpretação pouco natural; feitas pra web/comunicação geral, **não para o professor adaptar material didático**.
- Dependência forte de **intérpretes humanos**, nem sempre disponíveis.
- Professor não domina Libras: fluência leva ~2 anos + custo alto → barreira de tempo e dinheiro.

## 4. Solução e diferenciais

**3 diferenciais** (núcleo do pitch):
1. **Adaptação semântica** do conteúdo (não tradução literal).
2. **Arquitetura orientada a contexto** — ajusta a comunicação por domínio (educação / atendimento ao público / serviços).
3. **Potencial evolutivo**: reconhecimento de sinais em tempo real via **IA multimodal** (visão computacional + ML).

Posicionamento: não é só um tradutor, é uma **plataforma de acessibilidade inteligente e escalável**.

## 5. Objetivos

**Geral:** desenvolver plataforma que adapta conteúdos educacionais para Libras, ajudando professores a criar material acessível e promovendo inclusão de estudantes surdos.

**Específicos:**
- Receber conteúdo educacional em **texto**.
- Identificar **conceitos e palavras-chave** relevantes para Libras.
- Apresentar **sinais correspondentes** (vídeos/animações).
- Aplicar **adaptação semântica** (reorganizar pra estrutura natural da Libras).
- **Validar protótipo** em contexto educacional real.
- Investigar viabilidade de **visão computacional + ML** para reconhecimento de sinais (rumo à comunicação bidirecional).

## 6. MVP (escopo prático)

**Fluxo do MVP:**
1. Professor faz login.
2. Cadastra um conteúdo educacional.
3. Solicita a adaptação semântica do texto.
4. Visualiza o conteúdo adaptado.
5. Consulta sinais relacionados.
6. Salva o resultado para consulta futura.

**Escopo controlado do MVP:**
- Conversão de conteúdos **curtos** (frases/instruções) com **biblioteca pré-definida de sinais**.
- Organização semântica para melhorar compreensão.
- Vocabulário **limitado**.
- **Protótipo complementar** de visão computacional reconhecendo **10–20 sinais isolados** via webcam (prova de viabilidade).

**Exemplo de adaptação** (case real do material):
"Hoje vamos estudar a equação do segundo grau" → `HOJE` · `AULA` · `MATEMÁTICA` · `TEMA` · `EQUAÇÃO SEGUNDO GRAU`.

**Fora do MVP:** app mobile nativo; reconhecimento de sinais por câmera em produção; tradução automática de Libras em tempo real.

## 7. Stack técnica

- **Frontend:** Vue.js
- **Backend:** Node.js
- **Banco:** PostgreSQL
- **Infra:** Docker
- **Visão computacional (protótipo):** MediaPipe + Python (keypoints/landmarks de mãos, corpo, rosto)
- **IA:** o infográfico cita **OpenAI**; o detalhamento fala em **abordagem por regras + biblioteca pré-definida** no protótipo inicial, com ML/multimodal só em fases futuras. ⚠️ Ponto a alinhar (ver Lacunas).

**Hipótese de pesquisa:** IA de tradução assistida com acurácia **intermediária (60–80%)** já melhora significativamente a comunicação em sala.

## 8. Modelo de negócio (Canvas resumido)

- **Proposta de valor:** conversão de conteúdo educacional em Libras com adaptação semântica/contextual; geração automática de representações visuais; impacto social na inclusão.
- **Clientes:** professores (pública/privada), escolas, secretarias de educação, universidades, ONGs de surdos; futuro: empresas/atendimento/saúde.
- **Canais:** SaaS web, app móvel (futuro), parcerias com secretarias/universidades, marketing digital, workshops.
- **Receita:** freemium (assinatura), licenciamento institucional, contratos públicos, serviços de adaptação, futuro API comercial.
- **Recursos-chave:** biblioteca de sinais, motor de adaptação semântica, equipe IA/visão/linguística, infra cloud, parcerias com intérpretes.
- **Custos:** dev + manutenção, produção da biblioteca de sinais, equipe, infra/cloud, marketing, P&D.
- **Viabilidade econômica:** começa **gratuito** para instituições (impacto social); sustentabilidade futura via licenciamento/API/serviços.

## 9. Casos de uso

1. **Professor** adapta material de aula (não domina Libras).
2. **Estudante surdo** revisa conteúdo antes de prova.
3. **Instituição** cria material acessível sem depender só de intérprete.
4. **Futuro / sociedade:** famílias, empresas, criadores de conteúdo, órgãos públicos.

## 10. Estrutura do artigo (ABNT)

Capa/folha de rosto · Resumo (150–500 palavras) · Palavras-chave (3–5) · Introdução (contexto, justificativa, objetivos) · Fundamentação teórica (educação inclusiva, Libras, tecnologias assistivas, acessibilidade digital, IA na educação, PLN, adaptação semântica, sistemas web educacionais, UX/UI acessível, visão computacional p/ Libras, metodologias ágeis) · Trabalhos relacionados · Metodologia (ágil — Scrum/Kanban) · Análise de requisitos (RF/RNF, matriz de rastreabilidade, UML: casos de uso, pacotes, classes, atividades, sequência, implantação) · Proposta do sistema (mockups + telas reais) · Considerações finais (testes: unitário, integração, sistema, regressão, aceitação; infra mínima ex. VPS + custos) · Referências (NBR 6023). Bases: IEEE, ACM, SCOPUS, SPRINGER, Google Acadêmico.

## 11. INOVA SENAI — checklist de submissão

- Logo (obrigatória) ✅ feita · Slogan ✅ definido.
- Pitch em **vídeo** (2–3 min): **alunos aparecendo**, **sem voz sintética/IA**, proposta clara — publicar no YouTube e colar link. ⏳ DEFINIR.
- Vídeo do protótipo funcionando (máx 1min30) — YouTube. ⏳ DEFINIR.
- Canvas em PDF (anexo). ⏳ DEFINIR.
- Referência de exemplo citada (DSPI): PetGuard.

## 12. Material de estudo (referências do Cauê)

- **Artigo CINTED-UFRGS / RENOTE v18 n1 (jul/2020)** — "Um Recurso Colaborativo para apoiar Comunicação entre Surdos e Ouvintes" (UDESC; Costa, Freitas, Berkenbrock, Sell). App móvel de tecnologia assistiva colaborativa; metodologia **Design Science Research (DSR)**; mostra imagem + escrita de sinais (SignWriting) + Libras. Trabalhos relacionados úteis pra fundamentação: **ECCA**, **AraBoard**, **AssistLIBRAS**.

## 13. Desenvolvimento (status)

**Repo:** `/home/foyth/senai/semantia` (ainda não é git / não versionado).
**Stack:** Vue 3 + Vite + TypeScript (front puro, sem backend ainda). pnpm.

**MVP entregue (2026-06-13) — Hub estático:** landing estilo iLovePDF, sem login.
- Header sticky + logo SVG (mão-rede com gradiente da marca) + nav.
- Hero com slogan, CTAs e explicação do diferencial (semântico ≠ literal).
- Grid de ferramentas (cards): **"Adaptar para Libras" = ativo**; "Biblioteca de Sinais", "Reconhecer Sinais" (webcam), "Adaptar por Contexto" = _em breve_.
- Seção "Por que adaptação semântica?" com o exemplo HOJE·AULA·MATEMÁTICA·TEMA·EQUAÇÃO 2º GRAU.
- Acessibilidade de base: HTML semântico, skip-link, foco visível, `prefers-reduced-motion`, contraste.
- Arquivos-chave: `src/App.vue`, `src/components/{LogoMark,ToolCard,ToolIcon}.vue`, `src/data/tools.ts`, `src/style.css` (design tokens da marca).
- Build + typecheck passam. Dev: `pnpm dev` (porta 5173).

**Redesign + integração funcional (2026-06-13 tarde):**
- **Logo real** do Cauê processada (fundo→transparente via PIL): `public/brand/semantia-logo.png` (lockup) e `semantia-mark.png` (símbolo). Usada no header/footer.
- **VLibras integrado e funcionando** — componente `@vue-a11y/vlibras` (widget oficial gov.br, avatar 3D Ícaro), registrado em `main.ts`, `<VLibras>` no App. Traduz qualquer texto selecionado da página. **É a 1ª ferramenta REAL, gratuita.**
- **UI repaginada (skill frontend-design):** tipografia Bricolage Grotesque + Hanken Grotesk (sem Inter); grafo-mão animado (`NetworkHand.vue`) ecoando a logo; grid **bento**; faixa **escura** com exemplo de glosas; textura de rede; animações de entrada + `prefers-reduced-motion`. Icon-forward e pouca prosa (público surdo: Libras L1, português L2).
- Catálogo de ferramentas (`tools.ts`): **Adaptação Semântica** (nosso motor, _em construção_, featured) · **Tradutor em Libras** (VLibras, _disponível_) · **Datilologia** (_em construção_, nosso) · **Dicionário de Sinais** (Signbank UFSC, _em breve_) · **Reconhecer Sinais** (webcam, _fase 2_).
- Build + typecheck OK.

**Fontes de acessibilidade gratuitas mapeadas:** VLibras (gov.br, embuti­vel, livre) · Signbank de Libras UFSC (dicionário aberto em vídeo) · datilologia/alfabeto manual (construir próprio). Hand Talk tem API mas é paga → fora.

**DECISÃO DE PRODUTO PENDENTE (do Cauê):** VLibras faz tradução **literal** — exatamente o que o TCC critica. Posicionamento adotado provisoriamente: **adaptação semântica (nossa) = estrela/diferencial**, VLibras = **camada de acessibilidade que já funciona** por baixo. Cauê precisa bater o martelo nesse enquadramento (define o discurso e o foco do TCC). [[Empreendedorismo]]

**Refinamentos (2026-06-13, rodada 2 — feedback do Cauê):**
- **Elemento visual refeito:** `NetworkHand.vue` agora é uma **silhueta de mão aberta** (gradiente, opacidade de grupo p/ união uniforme) com a rede neural por dentro (nós nas juntas/pontas + núcleo na palma). Lê claramente como mão (antes era constelação abstrata).
- **Parallax** no hero: mousemove → CSS vars `--mx/--my`, hero art e mesh com fatores diferentes (profundidade), `requestAnimationFrame` + guard `prefers-reduced-motion`.
- **Ferramentas em quadro estilo iLovePDF:** `ToolCard` uniforme (ícone centralizado, status chip, hover lift + barra de topo gradiente); grid `auto-fill minmax(214px)`. Saiu o bento assimétrico.
- **Card "Tradutor em Libras" clicável** → `openVLibras()` clica no `[vw-access-button]` do widget (com retry). Também no CTA do header/hero ("Traduzir agora"). Verificado via Playwright: botão de acesso presente e clicado (player do gov.br não abre em headless por redirect, mas abre em navegador real).
- Build + typecheck OK.

**Rodada 3 (2026-06-13) — Cauê achou a mão "muito feia":** descartei `NetworkHand` e fiz
`HeroPreview.vue` — painel de **vidro (glass)** mostrando a **reordenação semântica**: coluna
Português → coluna Libras (glosas), com **conectores em gradiente que se cruzam** (visualiza "não
é palavra por palavra"). Fundo **aurora** (blobs borrados animados) + parallax. Bonito e na tese.
Build OK.

**Rodada 4 (2026-06-13) — Cauê: "tudo torto", quer design REVOLUCIONÁRIO + parallax no site todo.**
Lição (advisor): eu mandava só **PNG estático** → ele não via animação nenhuma (por isso pediu parallax
3x). **Mudança de processo: revisão de design SEMPRE por vídeo** (Playwright `recordVideo` → ffmpeg mp4).
- Parei de desenhar centerpiece na mão. Fundo do hero agora é **shader WebGL animado** — `MeshShader.vue`
  usando **`@paper-design/shaders`** (meshGradient, cores da marca, `prefers-reduced-motion`→speed 0).
- Hero refeito: centrado, tipografia gigante, sem ilustração custom (o shader é a arte). Veil radial p/ legibilidade.
- **Parallax de scroll** genérico (`[data-parallax]` + handler rAF por viewport): hero content, orb na seção
  de ferramentas, grid da faixa escura.
- Build OK, sem erros de console. Libs novas: `@paper-design/shaders`.
- **PENDENTE crítico:** pedi ao Cauê **1–2 sites de referência** ("design revolucionário" pra ele) — sem
  âncora eu errei o gosto dele 3x. Próxima iteração mira na referência.

**Rodada 5 (2026-06-13) — 3 correções do Cauê:**
- **Bug VLibras abria-e-fechava:** causa = `HTMLElement.click()` retorna `undefined`, então `if(!click())`
  era sempre true e o `setTimeout` de fallback clicava 2ª vez (toggle). Fix: checar existência do
  `[vw-access-button]`, clicar **uma vez**.
- **Removido** o indicador de scroll (`.scroll-hint`) — estava sobreposto/mal colocado.
- **Parallax forte (scroll + mouse):** handler combinado com base cacheada (sem feedback de transform);
  camadas no hero (3 orbs + 2 palavras-fantasma OLÁ/MÃOS + conteúdo) com speeds 0.1–0.34 e mouse até 58px;
  orb na seção de ferramentas; grid da faixa escura. + **reveal on scroll** (IntersectionObserver, stagger
  nos cards) com fallback que revela tudo em `prefers-reduced-motion`. Entregue **em vídeo**.

**Próximo passo recomendado:** construir a **Datilologia** (alfabeto manual) — funcional já, útil, e é **código nosso** (importa pro TCC ter trabalho original, não só embed). Decisão de enquadramento semântica-estrela/VLibras-camada **ainda pendente de OK do Cauê**.

## 15. Backend nasce: auth + datilologia com ranking (2026-06-28/29)

Repos criados na org **`Semantia-UniSenai`**: `semantia-api` (NestJS) e o front ganhou área
logada. Decisão de stack/arquitetura registrada em `../projeto/Arquitetura-Backend.md` (Clean
Architecture + Repository Pattern, Prisma 7, JWT+bcryptjs, Swagger→orval, deploy
Vercel+Render+Neon com ping anti-cold-start). Feature gated do MVP: **treino de datilologia +
ranking** (`gameKey` permite novos jogos sem mudar schema). Front `3d471b8`, API `b560316`.

## 16. Sala de aula ao vivo — full-stack (2026-07-02)

A feature principal do MVP pós-banca: professor fala → **legenda em tempo real** pros alunos.
Detalhe completo em `../arquitetura/sala-ao-vivo.md`. Resumo:

- **Schema:** `User.role` (PROFESSOR|ALUNO), `SchoolClass`+`ClassMember`, `LiveSession`
  (joinToken, status LIVE|ENDED), `TranscriptSegment` (seq), `ChatMessage`.
- **Gateway Socket.IO `/live` fino**: JWT no handshake, presença em `LiveRoomStateService`,
  toda regra de negócio nos **usecases** (os mesmos da REST); acks `{ ok } | { ok:false, error }`.
- **STT no browser do professor** (Web Speech API, custo zero de servidor): `transcript:partial`
  (throttle 150ms, efêmero) + `transcript:final` (persiste). Chat + fila de mãos + encerramento.
- API `2605434`+`b27bce4`; front `fd21a59`.
- **Gotcha Brave (fix `7f43c22`):** erro `network` consecutivo no SpeechRecognition vira fatal
  e avisa o professor (antes ficava em retry silencioso infinito).

## 17. Decisão: adaptação semântica = LLM em camadas, NÃO ML próprio (2026-07-04)

Resolve a lacuna "regras vs. OpenAI vs. ML" (§14) — o motor semântico do TCC é um **pipeline
em camadas no backend**:

1. **Camada 1 (FEITA):** regex de disfluências — remove vícios de fala ("ééé", "né", "tipo
   assim"), gagueira e pontuação órfã. Conservadora (ambíguas ficam).
2. **Camada 2 (A FAZER):** LLM rápido (Haiku/Gemini Flash) reescreve a frase final adaptada e
   emite `transcript:adapted` (substitui na UI ~1s depois; toggle literal/adaptado).

**ML próprio descartado:** não existe corpus PT→PT-adaptado-pra-surdos, não cabe no prazo; o
prompt engineering da camada 2 vira a seção de metodologia do artigo, ML fica como trabalho
futuro. Custo estimado: centavos por aula de 1h.

**Mapa VLibras/avatares (mesma conversa):** não existe avatar 3D de Libras gratuito e maduro
além do VLibras (Hand Talk/Rybená pagos, ProDeaf morto). Caminho recomendado: transcrição
adaptada + **vídeos de sinais humanos** (Signbank UFSC, INES) pros conceitos-chave, VLibras
**self-hosted** (é open source) como fallback — sinaliza o diferencial em vez de competir com
a Hand Talk. (Mapa de memória até jan/2026; reconferir com busca web.)

## 18. UI karaokê + correção arquitetural do filtro (2026-07-04)

- **Legendas karaokê** na tela do aluno: linhas ≤7 palavras balanceadas (`captionLines.ts`),
  linha corrente em destaque, scroll livre pra reler + "↓ Voltar ao vivo", A−/A+ persistido,
  acessibilidade (`aria-live`, `prefers-reduced-motion`). Front `25b164d`.
- **Correção do Cauê (regra de arquitetura):** o filtro de disfluências tinha nascido no front —
  **regra de negócio nunca no cliente**. Movido pro `AppendTranscriptSegmentUseCase` (API
  `9db4751`, front `31faa92`): texto canônico é limpo no backend; frase 100% ruído → `null`,
  sem broadcast. De quebra corrigido bug da pontuação órfã ("né?" sobrava "?"). No front fica
  só apresentação (quebra de linhas, palco).
- Testes: API **138 jest**, front **91 vitest** verdes.

## 19. Transcrição acessível vira o núcleo abrangente do produto (2026-07-29)

Depois da validação do MVP anterior, o Semantia deixa de ser pensado apenas como sala de aula
e passa a ser uma plataforma de **comunicação acessível em tempo real** para escolas, empresas,
palestras, eventos e comunidade. O objetivo é permitir que uma pessoa ouvinte que não sabe
Libras fale normalmente e uma pessoa surda acompanhe a comunicação pela transcrição.

**Prioridade absoluta:** concluir o pipeline
`áudio → STT → limpeza de disfluências → agente especializado → legenda karaokê`.
Chat, mãos levantadas, mídia de conferência, moderação, VLibras, análise sentimental e as
ferramentas educativas permanecem desejáveis, mas não bloqueiam o núcleo.

O anfitrião configura o contexto da plateia antes da sessão (tipo de encontro, faixa etária,
familiaridade com português escrito, domínio e nível de simplificação). Cada participante pode
escolher transcrição literal ou adaptada e mudar sua preferência durante a reunião. O agente de
IA é consumido por token no backend e adapta o texto limpo sem alterar fatos; falha da IA deve
manter o modo literal disponível.

A implementação atual de `PROFESSOR`, `ALUNO`, `SchoolClass`, `ClassMember`, turma e aula é uma
fundação técnica a ser generalizada, não o contrato final. O backlog macro foi registrado em
[`../planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md`](../planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md).

Em **2026-07-29**, as 18 entregas desse backlog foram cadastradas como tasks no ClickUp, todas
em `PENDENTE`, atribuídas ao Cauê, com prioridade e etiqueta de tipo. O cadastro foi validado
task a task no Brave após recarga; o board passou a exibir 24 pendências, somando 6 itens
anteriores e 18 novos. IDs, links e o gate de verificação estão em
[`../planejamento/2026-07-29-registro-tasks-clickup-mvp-transcricao.md`](../planejamento/2026-07-29-registro-tasks-clickup-mvp-transcricao.md).

## 20. Contrato estrutural do novo MVP (2026-07-29)

As decisões que condicionam os próximos cards foram fechadas e registradas em
[`../produto/contrato-mvp-transcricao-tempo-real.md`](../produto/contrato-mvp-transcricao-tempo-real.md):

- anfitrião autenticado cria e administra a sala;
- participante pode entrar como convidado por link/token sem conta;
- `sala`, `sessão ao vivo`, `anfitrião/comunicador`, `participante` e `plateia` são os termos
  canônicos; professor/aluno/turma/aula ficam como legado ou copy de uma vertical escolar;
- o MVP não armazena áudio;
- sessões têm duração-alvo de até 4 horas;
- transcript, chat e metadados identificáveis têm retenção planejada de 30 dias, com exclusão
  antecipada pelo anfitrião; logs técnicos mínimos sem conteúdo/identidade têm janela de 90 dias;
- a capacidade-alvo é de até 50 conexões, mas só pode ser anunciada depois do teste de carga;
- o texto literal limpo é canônico e sempre disponível; adaptação por IA é uma versão adicional,
  nunca tradução completa para Libras.

A implementação atual ainda exige JWT de participantes, persiste conteúdo sem expiração e usa
papéis escolares. Esses pontos estão explicitamente marcados como **planejados/legados**, não
como funcionalidades já entregues.

A auditoria dos 38 cards antigos do Trello classificou 7 como concluídos, 9 como substituídos,
10 como incorporados e 12 como mantidos para fase posterior, todos com vínculo para o backlog
atual. Registro em
[`../planejamento/2026-07-29-auditoria-backlog-legado-trello.md`](../planejamento/2026-07-29-auditoria-backlog-legado-trello.md).
O Trello foi descontinuado e permanece apenas como registro histórico; o ClickUp é o único board
operacional e nenhuma higienização futura deve ser feita diretamente no board antigo.

## 21. Sala caption-first aplicada e convite autenticado corrigido (2026-07-31)

A Variante A — Palco central saiu do protótipo e foi aplicada no frontend real no PR web #5,
empilhado sobre a generalização de salas do PR web #4. Legenda domina a hierarquia; chat e pessoas
ficam fechados por padrão, redimensionam o palco no desktop e viram bottom sheet modal no mobile.

O teste de usabilidade surdo/comunicador revelou um P0: uma conta autenticada podia validar o convite
e criar identidade de convidado, mas o Socket.IO priorizava o JWT global e recebia `forbidden` por a
conta não ter vínculo com a sessão. A regra fechada é: quando existe acesso efêmero para a mesma
`sessionId`, ele prevalece no handshake e na identidade corrente; fora dela, o JWT continua sendo a
credencial normal. O smoke com duas contas comprovou entrada, refresh, presença e chat sem liberar
acesso indiscriminado. O contrato wire real do gateway passou a ser normalizado no composable, e não
nos componentes. Áudio continua local; nenhum endpoint ou upload de áudio foi adicionado.

## 22. UI/UX aceita e qualidade do ASR separada do escopo visual (2026-07-31)

Depois de testar os lados comunicador e pessoa surda, Foyth aprovou a experiência da sala como
“tudo muito bom”. Palco central, hierarquia da legenda, convite, entrada, chat, presença, painéis,
controles e comportamento responsivo foram aceitos. Isso não conclui o workflow: como os PRs web #5
e cérebro #3 continuam abertos, com revisão solicitada e sem review concluída, o Card 03 permanece em
`EM REVISÃO`. Card com PR aberto não pode ser movido para concluído; aceite funcional e revisão de
código/documentação são gates distintos. Os PRs continuam sem merge automático.

A baixa precisão do Vosk local não reabre o escopo visual. Em roteiro controlado com 45 palavras, a
legenda apresentou 11 erros — 8 substituições, 2 exclusões e 1 inserção —, WER aproximado de 24,4%,
incluindo trocas de sentido como “acessibilidade” por “a sensibilidade” e “em texto diretamente no
navegador” por “diretamente para o vendedor”. A amostra e os critérios de benchmark foram registrados
no Card 06; o Card 11 permanece como gate full-stack. Áudio deve continuar local e erros não podem ser
mascarados por correção textual que invente conteúdo.

## 23. Captura local robusta e transporte idempotente (2026-08-03)

O Card 06 substituiu o “Vosk como fallback final” por um pipeline híbrido inteiramente no navegador:
Vosk pt-BR mantém parciais rápidas e produz um final preliminar; Whisper Small q8/WASM via
Transformers.js refina esse final. Vazio, erro ou deadline de 20 s conserva o Vosk, e somente o texto
escolhido entra no pipeline canônico. Web Speech só é aceito quando o browser comprova execução
on-device pt-BR; Firefox/Zen usa o fallback por capacidade, nunca por user-agent.

A privacidade passou de intenção a gate observado: a auditoria do artefato em Brave/Chromium capturou
92 frames WebSocket, todos textuais, com zero frame binário e zero corpo HTTP de áudio. Firefox 153
executou captura real com Vosk, Worker Whisper e stop completo. Pesos do modelo podem ser baixados,
mas PCM circula somente entre `AudioWorklet`, thread principal e Worker local; nenhum áudio vai para
API, Socket.IO ou provedor STT.

O transporte agora limita/deduplica parciais, enfileira até 50 finais por 120 s, usa ACK de 5 s, retry
e reentrada confirmada antes do flush. Cada final recebe `clientSegmentId`; a API exige `HOST` e uma
migration cria unicidade por sessão. Retry/reconexão retorna replay sem novo broadcast ou segmento.
Stop, saída, encerramento, disconnect e unmount invalidam modelos carregando, terminam recognizers e
Workers, zeram buffers, param tracks e cancelam timers/ACKs/envios. Um teste específico provou que um
load Vosk antigo não desmonta uma captura reiniciada.

No benchmark sintético controlado de 45 palavras, o Whisper teve WER de 0%, 0%, 0%, 2,2% e 4,4% em
fala limpa, ruído leve, ruído forte, fala concorrente e reverberação; Vosk teve 2,2%, 4,4%, 17,8%,
33,3% e 28,9%. Whisper levou aproximadamente 12,6 s para cerca de 21 s de áudio neste hardware. Isso
não apaga o WER humano anterior de 24,4% nem promete precisão universal; Card 11 continua como gate
com pessoas, sotaques, microfones e salas reais.

A implementação está nas branches `feat/captura-fala-robusta` e `feat/protocolo-transcricao`,
empilhadas sobre `feat/salas-comunicacao`, e permanece `EM REVISÃO` até os PRs serem revisados, sem
merge automático. O relatório técnico e as evidências reproduzíveis estão em
[`../arquitetura/captura-fala-transporte-card-06.md`](../arquitetura/captura-fala-transporte-card-06.md).

## Lacunas / perguntas em aberto (revisado 2026-08-03)

- ~~**IA: regras vs. OpenAI vs. ML**~~ → **resolvida** (§17: limpeza conservadora + agente LLM).
- ~~**Motor de adaptação semântica**~~ → **especificado** (§17 + contrato canônico); falta
  implementar a camada de IA.
- ~~**Conta versus convidado**~~ → **resolvida** (§20: anfitrião com conta, participante convidado).
- ~~**Duração, retenção e tamanho da sala**~~ → **resolvidos como contrato-alvo** (§20), ainda
  dependentes de implementação e teste.
- **Integrantes da equipe:** nomes não informados ainda.
- **Adaptação de material estático:** preservada como possibilidade futura, fora do núcleo atual.
- **Biblioteca de sinais:** fontes candidatas mapeadas, integração ainda não desenhada.
- **INOVA SENAI:** pitch, vídeo do protótipo e canvas continuam pendentes no fluxo acadêmico.

---

## Anexos recebidos (2026-06-13)

Salvos em `/home/foyth/.openclaw/media/inbound/`:
- `Projeto_-_Semantia_-_TCC.pdf` — documento oficial do TCC (UNISENAI).
- `2_-_Detalhamento_-_Inscricao.docx` — formulário INOVA completo (problema, justificativa, objetivos, viabilidade). **Mais detalhado.**
- `3_-_Detalhamento_Completo.docx` — nomes provisórios, slogan, segmentos, roteiro do pitch (2 min).
- `4_-_Modelo_para_Canvas.docx` — Business Model Canvas.
- `5_-_Modelos_de_Cases_de_Uso.docx` — 4 casos de uso.
- `1_-_Orientacoes.docx` — checklist de submissão INOVA SENAI.
- `SEMANTIA.docx` — texto-base de introdução/contextualização.
- `ArtigoLibras_material_de_estudo.pdf` — artigo CINTED-UFRGS (referência teórica).
- 2 imagens — infográfico do projeto + logo.
