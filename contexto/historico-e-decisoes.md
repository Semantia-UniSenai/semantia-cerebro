---
tags: [tcc, senai, semantia, libras, acessibilidade]
status: em-andamento
atualizado: 2026-06-13
---

# Semantia 🤟

> **Nota mestre do projeto.** Fonte de verdade do TCC do Cauê. Atualizar conforme novo material chegar pelo canal #semantia.

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

## 14→ Lacunas / perguntas em aberto (revisado 2026-07-04)

- ~~**IA: regras vs. OpenAI vs. ML**~~ → **resolvida** (§17: LLM em camadas no backend).
- ~~**Motor de adaptação semântica**~~ → **especificado** (§17 + `../arquitetura/sala-ao-vivo.md`);
  falta implementar a camada 2.
- **Integrantes da equipe:** nomes não informados ainda.
- **Como vem o conteúdo do professor:** a sala ao vivo respondeu o caso "aula falada" (STT);
  adaptação de material estático (PDF/slide) segue em aberto.
- **Biblioteca de sinais:** origem dos vídeos (Signbank UFSC/INES apontados no §17, mas
  integração não desenhada).
- Pendências de entrega do INOVA: pitch, vídeo do protótipo, canvas em PDF.

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
