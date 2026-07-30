# Backlog macro — MVP de transcrição acessível em tempo real

> Criado em 2026-07-29 a partir do direcionamento do produto, do estado real das branches `dev` de `semantia-api` e `semantia-web` e da auditoria histórica do Trello. A operação vigente ocorre exclusivamente no ClickUp.

## Objetivo do backlog

Transformar o Semantia de uma solução centrada em sala de aula em uma plataforma abrangente de comunicação acessível em tempo real para escolas, empresas, palestras, eventos, comunidades e outros ambientes nos quais uma pessoa ouvinte que não sabe Libras precisa se comunicar com pessoas surdas.

A prioridade absoluta é fechar o núcleo:

`áudio → reconhecimento de fala → limpeza de disfluências → agente de adaptação → legenda karaokê`

Chat, mãos levantadas, áudio/vídeo de conferência, moderação, VLibras, análise sentimental e ferramentas educativas continuam no produto, mas não devem desviar o desenvolvimento antes da transcrição principal estar validada de ponta a ponta.

## Leitura do estado atual

- A base existente já possui autenticação, sessões ao vivo, convite, Socket.IO, presença, chat, mãos levantadas, transcript persistido, captura pela Web Speech API, limpeza inicial por regex e palco karaokê.
- O domínio e a interface ainda usam `PROFESSOR`, `ALUNO`, `SchoolClass`, `ClassMember`, “turma” e “aula”.
- A camada de adaptação por LLM está documentada, porém não implementada.
- Preferências individuais de transcrição, contexto da plateia, sentimento, intérprete configurável, câmera, mídia de conferência e remoção de participantes ainda não existem.
- A produção publicada permanece legada em relação às branches `dev`.
- A auditoria histórica encontrou 38 cards antigos no Trello. O backlog operacional vigente foi consolidado no ClickUp e não deve ser duplicado no Trello.

## Convenções para os cards

- **Responsável sugerido de desenvolvimento:** `@foythcaue`.
- **Revisores sugeridos para produto/TCC:** `@carlakeitemachado2` e `@emersonamancio1`, conforme disponibilidade e responsabilidade real da equipe.
- O responsável sugerido deve ser substituído no ClickUp se outra pessoa assumir o item; nenhum card pode ficar sem responsável.
- Usar as flags já existentes no board: `Front`, `Back`, `Motor/IA`, `Design/UX`, `Acessibilidade`, `Infra`, `Auth`, `Documentação`, `Negócio`, `Pesquisa/TCC`, `Tradutor/VLibras` e `Ferramentas`.
- O ClickUp usa as prioridades `P0 — Crítica`, `P1 — Alta`, `P2 — Média` e `P3 — Baixa`.
- Atualizar descrição, discussões, evidências, branch e PR no ClickUp durante o trabalho; mover o card conforme o workflow vigente.
- Não mover para `Feito` sem validação executada e registrada no card.
- Branches sugeridas são planejamento; cada card deve registrar a branch real assim que o desenvolvimento começar.

---

# P0 — Núcleo obrigatório do MVP

## Card 01 — Consolidar o novo escopo do produto e higienizar o backlog

### Objetivo

Formalizar o Semantia como plataforma genérica de comunicação acessível em tempo real e remover contradições entre a nova direção, a documentação antiga e o board.

### Problema ou funcionalidade

A documentação e os cards atuais ainda descrevem principalmente educação, professor, aluno, adaptação de materiais estáticos e uma API que já deixou de estar vazia. Sem um contrato atualizado, decisões antigas podem ser tratadas como requisitos ativos e gerar retrabalho.

### Fluxo sugerido

1. Registrar propósito, público, atores, limites e ordem de prioridade do novo MVP.
2. Definir um glossário neutro para sala, anfitrião/comunicador, participante e plateia.
3. Atualizar requisitos funcionais, não funcionais, regras de negócio e casos de uso.
4. Marcar documentos e decisões de sala de aula como históricos ou substituídos quando não forem mais canônicos.
5. Auditar os 38 cards antigos e classificar cada um como concluído, substituído, incorporado a um novo card ou mantido para fase posterior.
6. Aplicar responsáveis, flags e prioridade a todos os cards ativos.
7. Registrar a decisão e a reorganização no `semantia-cerebro`.

### Regras de negócio

- Transcrição acessível em tempo real é o núcleo do produto.
- O produto não pode ficar limitado a escolas ou salas de aula.
- Funcionalidades secundárias não precisam ser apagadas, mas não podem bloquear o núcleo.
- Documentação deve diferenciar claramente estado implementado, planejado e legado.
- O cérebro é a fonte de verdade das decisões do Semantia.

### Validações necessárias

- README, histórico, requisitos e arquitetura descrevem o mesmo produto atual.
- Nenhum card ativo permanece sem responsável, flags e prioridade.
- Cards legados possuem justificativa de encerramento ou vínculo com o card substituto.
- Não há documentação afirmando que uma funcionalidade planejada já está implementada.

### Observações

Resolver neste card as decisões que mudam contratos posteriores, especialmente acesso com conta versus convidado, nomenclatura dos atores, duração/retenção de sessões e o tamanho esperado de uma sala no MVP.

### Alterações

- Branch: `docs/novo-escopo-transcricao` nos três repositórios.
- PR cérebro: [Semantia-UniSenai/semantia-cerebro#1](https://github.com/Semantia-UniSenai/semantia-cerebro/pull/1).
- PR API: [Semantia-UniSenai/semantia-api#3](https://github.com/Semantia-UniSenai/semantia-api/pull/3).
- PR web: [Semantia-UniSenai/semantia-web#3](https://github.com/Semantia-UniSenai/semantia-web/pull/3).

### Gestão do card

- Responsável: `@foythcaue`.
- Revisores sugeridos: `@carlakeitemachado2`, `@emersonamancio1`.
- Flags: `Negócio`, `Documentação`, `Pesquisa/TCC`.
- Prioridade: `P0 — Crítica`.
- Dependências: nenhuma.

---

## Card 02 — Generalizar o domínio de aula para salas de comunicação

**Status em 2026-07-30:** EM REVISÃO, sem merge automático.

### Objetivo

Substituir o contrato centrado em professor, aluno, turma e aula por um domínio genérico de salas ao vivo, preservando os dados e fluxos úteis já implementados.

### Problema ou funcionalidade

O schema atual possui `Role.PROFESSOR/ALUNO`, `SchoolClass`, `ClassMember`, `teacherId`, rotas `/turmas` e `/aula` e regras exclusivas para professor. Isso impede o Semantia de representar reuniões empresariais, palestras, eventos e encontros comunitários sem distorcer o domínio.

### Fluxo sugerido

1. Definir entidades, papéis, estados e permissões da sala genérica.
2. Permitir que o anfitrião crie uma sala em preparação, configure-a, inicie e encerre a sessão.
3. Manter convite seguro e entrada de participantes conforme a política de autenticação definida no Card 01.
4. Migrar modelos, DTOs, use cases, endpoints REST, eventos Socket.IO e tipos do front.
5. Atualizar rotas, telas e textos para os novos conceitos.
6. Criar migration segura que preserve sessões, transcripts e chats existentes.
7. Remover o contrato público antigo quando o novo estiver validado, sem manter dois fluxos concorrentes indefinidamente.

### Regras de negócio

- Somente o anfitrião ou moderador autorizado gerencia e encerra a sala.
- Participante acessa apenas salas para as quais possui autorização ou convite válido.
- Sala encerrada é somente leitura, conforme a política de retenção.
- O histórico existente não pode ser perdido pela migração.
- Papéis globais de cadastro não devem conceder livremente privilégios de anfitrião sem regra explícita.

### Validações necessárias

- Testes unitários de permissões e transições de estado.
- Testes E2E para criar, configurar, iniciar, entrar, sair e encerrar uma sala.
- Migration aplicada sobre banco descartável com dados no formato atual.
- Rotas, Swagger/orval e Socket.IO sincronizados.
- Busca textual sem termos educacionais ativos nas jornadas genéricas, exceto conteúdo histórico ou contexto escolhido como “sala de aula”.

### Observações

Não renomear apenas a interface. O contrato de domínio, banco, autorização e eventos precisa deixar de depender de `teacherId` e `classId` como conceitos centrais.

### Alterações

- Branch cérebro, API e web: `feat/salas-comunicacao`, empilhada sobre `docs/novo-escopo-transcricao`.
- Card ClickUp: [86e2j4qky](https://app.clickup.com/t/90171419563/86e2j4qky).
- PR API: [Semantia-UniSenai/semantia-api#4](https://github.com/Semantia-UniSenai/semantia-api/pull/4).
- PR web: [Semantia-UniSenai/semantia-web#4](https://github.com/Semantia-UniSenai/semantia-web/pull/4).
- PR cérebro: será aberto a partir desta sincronização documental.

### Evidências de validação em 2026-07-30

- 15 suites/66 testes unitários da API, lint e build aprovados.
- E2E multiator aprovado contra PostgreSQL 16 descartável.
- Migration aprovada na cadeia limpa e em fixture educacional com salas, vínculo, sessões,
  transcript e chat preservados.
- Audit de produção sem vulnerabilidades altas; web sem advisories e API com 3 moderadas.
- Swagger com 19 paths/22 operações e cliente Orval regenerado.
- 10 arquivos/63 testes do frontend e build aprovados.
- Jornada real em Brave/Chromium aprovada em desktop e mobile: cadastro sem papel global, criação,
  preparação, início, chat, encerramento e leitura pós-sessão.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Back`, `Front`, `Auth`.
- Prioridade: `P0 — Crítica`.
- Dependências: Card 01.

---

## Card 03 — Fechar a experiência UX/UI acessível das salas ao vivo

### Objetivo

Projetar e validar a experiência completa do anfitrião e da pessoa surda antes de consolidar os contratos visuais da implementação.

### Problema ou funcionalidade

A UI atual comprova o fluxo escolar, mas o novo produto exige configuração de plateia, preferências individuais, estados de IA e uma experiência excelente em diferentes dispositivos. Alterar telas isoladamente sem fechar a jornada produziria inconsistência e retrabalho.

### Fluxo sugerido

1. Mapear a jornada do anfitrião: criar sala, configurar público, compartilhar convite, iniciar, transcrever, acompanhar estado e encerrar.
2. Mapear a jornada do participante: entrar, configurar transcrição, acompanhar a legenda, alterar preferências e sair.
3. Desenhar wireframes e protótipos de alta fidelidade para desktop, tablet e mobile.
4. Especificar estados de carregamento, permissão negada, navegador incompatível, reconexão, IA indisponível, sala encerrada e transcript vazio.
5. Definir hierarquia visual, controles, atalhos, foco, tamanhos de legenda e comportamento do palco karaokê.
6. Validar o protótipo com critérios de acessibilidade e, quando possível, com pessoa surda ou intérprete.
7. Registrar decisões e componentes no cérebro.

### Regras de negócio

- A legenda é o elemento visual principal da sala.
- Português deve ser direto, e controles devem combinar texto, ícone e estado compreensível.
- Preferências do participante não podem interromper a reunião.
- Nenhum significado pode depender apenas de cor ou som.
- A experiência deve respeitar teclado, leitor de tela, contraste e `prefers-reduced-motion`.

### Validações necessárias

- Protótipos das duas jornadas aprovados antes da implementação final.
- Checklist WCAG aplicado aos fluxos críticos.
- Layout testado nas larguras móveis, tablet e desktop definidas pelo projeto.
- Navegação completa por teclado e ordem de foco documentada.
- Estados de erro e reconexão cobertos no protótipo.

### Observações

UI/UX é um diferencial central do produto, não acabamento posterior. A validação deve avaliar entendimento e esforço, não apenas aparência.

### Alterações

- Branch: não criada.
- Branch sugerida: `docs/ux-sala-acessivel` no `semantia-cerebro` e artefatos vinculados ao card.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Revisores sugeridos: `@carlakeitemachado2`, `@emersonamancio1`.
- Flags: `Design/UX`, `Acessibilidade`, `Front`.
- Prioridade: `P0 — Crítica`.
- Dependências: Card 01.

---

## Card 04 — Implementar a configuração de contexto e nível da plateia

### Objetivo

Permitir que o anfitrião configure o contexto da sala para que o agente adapte a transcrição ao público correto.

### Problema ou funcionalidade

A mesma fala exige vocabulário e estrutura diferentes em uma turma infantil, reunião empresarial ou palestra técnica. Hoje a sessão possui apenas título e vínculo opcional com turma; não existe contexto persistido nem contrato para a IA.

### Fluxo sugerido

1. Definir o conjunto mínimo de parâmetros com base em acessibilidade e linguagem não discriminatória.
2. Incluir inicialmente finalidade do encontro, faixa etária média, familiaridade com português escrito, domínio/assunto e nível desejado de simplificação.
3. Criar formulário acessível com explicação e exemplos para cada parâmetro.
4. Validar e persistir a configuração no backend.
5. Expor o contexto no snapshot da sala e no contrato interno do agente.
6. Bloquear alterações estruturais depois que a sessão for iniciada, mantendo consistência para todos os segmentos.
7. Exibir resumo da configuração ao anfitrião antes de iniciar.

### Regras de negócio

- Somente o anfitrião configura o contexto da sala.
- Configuração deve ser concluída antes do estado ao vivo.
- O sistema não deve rotular pessoas como “baixo nível”; os campos descrevem necessidades de comunicação.
- O contexto orienta a adaptação, mas não autoriza omitir fatos ou alterar o sentido da fala.
- Valores usados pelo agente devem ser versionados junto à sessão.

### Validações necessárias

- Testes de validação, permissões e persistência na API.
- Testes de formulário, mensagens de erro e navegação por teclado no front.
- Snapshot Socket.IO contém o contexto correto.
- Teste comprova que salas com contextos distintos produzem entradas distintas para o agente.
- Nenhum dado sensível desnecessário é solicitado.

### Observações

O conjunto inicial deve permanecer enxuto. Novos parâmetros só entram depois de evidência de que melhoram a compreensão ou a qualidade da adaptação.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/contexto-plateia`.
- Branch sugerida web: `feat/contexto-plateia`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Negócio`, `Back`, `Front`, `Motor/IA`, `Acessibilidade`.
- Prioridade: `P0 — Crítica`.
- Dependências: Cards 02 e 03.

---

## Card 05 — Implementar preferências individuais de transcrição

### Objetivo

Permitir que cada participante escolha entre transcrição literal e adaptada e altere essa escolha em tempo real sem afetar os demais usuários.

### Problema ou funcionalidade

Hoje todos recebem um único transcript limpo. O novo produto precisa atender participantes que preferem proximidade com o português falado e participantes que necessitam de uma versão semanticamente adaptada.

### Fluxo sugerido

1. Exibir a configuração de transcrição no primeiro acesso à sala.
2. Oferecer modo literal e modo adaptado com explicação curta e não técnica.
3. Salvar a preferência por usuário e sessão ou localmente conforme a política definida.
4. Permitir alteração durante a reunião sem reconectar o socket e sem recarregar a tela.
5. Manter os dois fluxos sincronizados pelo mesmo `seq` do segmento.
6. Aplicar a preferência também ao replay do transcript.
7. Restaurar uma escolha segura quando a IA estiver indisponível, informando que o texto limpo está sendo exibido.

### Regras de negócio

- A preferência é individual e não altera o conteúdo exibido a outros participantes.
- A troca de modo afeta o segmento atual e os posteriores sem perder histórico.
- Modo literal usa a versão final limpa, não as parciais instáveis.
- Modo adaptado nunca pode bloquear a disponibilidade do modo literal.
- Não exibir controles de intérprete ou sentimento como funcionais antes dos respectivos módulos estarem prontos.

### Validações necessárias

- Dois participantes na mesma sala conseguem usar modos diferentes simultaneamente.
- Troca de modo durante a sessão não duplica, perde nem reordena segmentos.
- Preferência é restaurada conforme o contrato definido.
- Falha da IA produz fallback visível e não interrompe a legenda.
- Testes de acessibilidade dos controles e anúncios de mudança.

### Observações

Para o MVP, uma única versão adaptada por sala e contexto deve atender todos que escolherem o modo adaptado. Evitar uma chamada de LLM por participante sem necessidade comprovada.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/preferencias-transcricao`.
- Branch sugerida web: `feat/preferencias-transcricao`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Back`, `Front`, `Acessibilidade`.
- Prioridade: `P0 — Crítica`.
- Dependências: Cards 02 e 03.

---

## Card 06 — Robustecer a captura de fala e o transporte em tempo real

### Objetivo

Transformar a captura atual pela Web Speech API em uma origem de transcrição confiável para o MVP, com ciclo de vida claro do microfone e recuperação de falhas.

### Problema ou funcionalidade

A implementação atual funciona no fluxo validado, mas depende do suporte do navegador, possui comportamento específico no Brave e ainda precisa ser endurecida para permissões, reconexão, duplicidade e falhas de rede.

### Fluxo sugerido

1. Formalizar a Web Speech API como origem inicial do MVP e definir contrato de fallback para navegadores não suportados.
2. Revisar solicitação de permissão, seleção de idioma `pt-BR`, início, pausa, retomada e encerramento do microfone.
3. Garantir throttle das parciais e envio único dos resultados finais.
4. Tratar erros recuperáveis e fatais com estados visíveis, sem loops infinitos.
5. Manter a captura coerente durante reconexões Socket.IO e impedir envio quando a sala estiver encerrada.
6. Instrumentar latência entre evento de fala reconhecida, API e exibição nos participantes.
7. Validar navegadores suportados em ambiente real.

### Regras de negócio

- Somente anfitrião autorizado publica transcript no MVP inicial.
- Parcial é efêmera; final entra no pipeline canônico.
- Parar o microfone deve interromper captura e envio imediatamente.
- A aplicação não deve afirmar que está ouvindo quando a permissão ou o reconhecimento falhou.
- Áudio não deve ser persistido por padrão.

### Validações necessárias

- Testes unitários dos estados e erros do reconhecimento de fala.
- Teste real em Chrome/Chromium e Brave; outros navegadores devem receber mensagem honesta de suporte.
- Reconexão não duplica o último segmento final.
- Encerrar ou sair da sala libera captura e timers.
- Métricas de latência registradas no relatório de teste.

### Observações

Este card trata o microfone usado para transcrição. Mídia de reunião entre participantes é um módulo separado e posterior.

### Alterações

- Branch: não criada.
- Branch sugerida web: `feat/captura-fala-robusta`.
- Branch sugerida API: `feat/protocolo-transcricao` se o contrato precisar mudar.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Front`, `Back`, `Acessibilidade`.
- Prioridade: `P0 — Crítica`.
- Dependências: Card 02.

---

## Card 07 — Consolidar a limpeza de disfluências e o transcript canônico

### Objetivo

Evoluir a primeira camada do pipeline para remover apenas ruído inequívoco, preservar significado e produzir segmentos canônicos rastreáveis para a IA e para o modo literal.

### Problema ou funcionalidade

O filtro atual cobre vícios e repetição imediata, mas possui vocabulário limitado e há um caso residual conhecido no qual `né?` seguido de conteúdo pode deixar pontuação órfã. Uma limpeza agressiva também poderia mudar frases legítimas.

### Fluxo sugerido

1. Criar corpus de casos reais com vícios, gagueira, repetição, pontuação e palavras ambíguas.
2. Corrigir os casos residuais sem remover palavras semanticamente válidas.
3. Definir o contrato entre texto reconhecido, texto limpo e texto adaptado.
4. Versionar a estratégia de limpeza usada em cada segmento ou sessão.
5. Decidir, em conjunto com a política de privacidade, quais versões serão persistidas.
6. Garantir que frase composta apenas por ruído não seja emitida nem persistida.
7. Documentar limites conhecidos e exemplos no cérebro.

### Regras de negócio

- A limpeza não pode resumir, interpretar ou adaptar; ela apenas remove disfluência inequívoca.
- Palavras ambíguas permanecem quando sua remoção puder alterar sentido.
- A ordem dos segmentos é preservada.
- Texto vazio após limpeza não gera legenda final.
- O agente recebe o texto limpo, nunca uma parcial instável.

### Validações necessárias

- Testes table-driven com acentos, Unicode, caixa, pontuação e repetição.
- Regressão para `né? hoje hoje aula` sem `?` órfão.
- Casos negativos comprovam preservação de frases legítimas como “tipo de dado”.
- Testes do use case e gateway confirmam `seq`, persistência e ausência de broadcast para ruído puro.
- Revisão manual de uma amostra de transcrição real.

### Observações

Não usar LLM para substituir esta camada barata e determinística. A IA entra somente depois do texto final limpo.

### Alterações

- Branch: não criada.
- Branch sugerida API: `fix/pipeline-disfluencias`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Back`, `Motor/IA`.
- Prioridade: `P0 — Crítica`.
- Dependências: Card 06.

---

## Card 08 — Construir o agente especializado de adaptação para pessoas surdas

### Objetivo

Implementar a camada de IA que transforma cada segmento final limpo em uma versão mais direta e compreensível, orientada pelo contexto da plateia e sem alterar o significado da fala.

### Problema ou funcionalidade

O diferencial central do Semantia ainda não existe no código. Hoje a aplicação termina na limpeza por regex e não produz `transcript:adapted`.

### Fluxo sugerido

1. Definir contrato estruturado de entrada e saída do agente.
2. Enviar texto limpo, contexto versionado da sala, idioma e regras de preservação de sentido.
3. Implementar adapter de provedor desacoplado e credencial exclusivamente por variável de ambiente.
4. Criar prompts versionados e resposta estruturada validada antes de persistir ou transmitir.
5. Integrar o agente ao pipeline assíncrono do segmento final e emitir a versão adaptada com o mesmo `seq`.
6. Aplicar timeout, retry limitado, circuit breaker e fallback para texto limpo.
7. Persistir metadados necessários para auditoria: versão do prompt, modelo, latência, status e consumo, sem salvar segredo.
8. Criar conjunto de avaliação com exemplos por contexto e revisão humana.

### Regras de negócio

- O agente não pode inventar fatos, omitir instruções importantes ou trocar entidades, números e negações.
- Falha da IA nunca interrompe o transcript literal.
- Uma adaptação por segmento e contexto da sala é compartilhada por participantes no modo adaptado.
- Tokens e chaves nunca ficam no front, banco, logs ou repositório.
- Texto adaptado deve ser identificável como adaptação automática.
- Conteúdo potencialmente perigoso ou urgente deve priorizar fidelidade sobre simplificação.

### Validações necessárias

- Testes unitários com provider fake para sucesso, timeout, erro, resposta inválida e fallback.
- Testes de integração comprovam evento e persistência de `seq` correspondente.
- Avaliação automática protege números, nomes, negações e comandos.
- Amostra revisada por pessoa surda, intérprete ou especialista antes de considerar qualidade aceita.
- Latência e consumo são medidos e registrados.
- Nenhum segredo aparece em diff, logs ou OpenAPI.

### Observações

Este agente é um componente de negócio especializado, não um chatbot genérico. O primeiro objetivo é adaptação textual em português mais acessível; tradução completa para gramática de Libras não deve ser prometida sem validação linguística.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/agente-adaptacao-transcricao`.
- Branch sugerida web: `feat/transcript-adaptado` para o consumo do novo evento.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Motor/IA`, `Back`, `Acessibilidade`.
- Prioridade: `P0 — Crítica`.
- Dependências: Cards 04 e 07.

---

## Card 09 — Finalizar a legenda karaokê literal e adaptada

### Objetivo

Entregar o palco principal da sala com leitura fluida, baixa carga cognitiva e troca confiável entre as versões literal e adaptada.

### Problema ou funcionalidade

O `CaptionStage` atual oferece linhas curtas, histórico e auto-scroll, mas ainda consome um único texto. A chegada atrasada da adaptação não pode causar saltos, duplicidade ou perda de contexto.

### Fluxo sugerido

1. Modelar cada segmento por `seq` com versões parcial, limpa e adaptada.
2. Exibir parcial de forma diferenciada e substituí-la pelo final limpo.
3. Atualizar o mesmo segmento quando a versão adaptada chegar.
4. Respeitar a preferência individual sem reconstruir ou perder o histórico.
5. Manter linhas curtas e balanceadas, destaque da linha atual, scroll livre e ação “Voltar ao vivo”.
6. Preservar controles de tamanho, contraste, teclado e movimento reduzido.
7. Adaptar layout para mobile, tablet, desktop, orientação horizontal e painel lateral.
8. Exibir estados de IA processando, indisponível e fallback sem poluir a leitura.

### Regras de negócio

- Segmentos são ordenados pelo mesmo `seq` em todos os modos.
- Atualização adaptada substitui a versão visual do segmento, não cria uma nova fala.
- Usuário pode reler histórico sem ser puxado automaticamente até escolher voltar ao vivo.
- Nenhuma animação pode impedir leitura ou desrespeitar movimento reduzido.
- A legenda permanece utilizável mesmo com chat e módulos secundários fechados.

### Validações necessárias

- Testes de componente para parcial, final, adaptação atrasada, fallback e troca de modo.
- Testes com segmentos longos, pontuação, números e alta frequência de eventos.
- Testes de auto-scroll, histórico, A−/A+ e `aria-live`.
- QA visual em mobile, tablet e desktop.
- Nenhum layout shift impede a leitura quando a adaptação chega.

### Observações

O palco karaokê deve dominar visualmente a sala. Painéis auxiliares não podem reduzir a legenda a uma área secundária, principalmente em mobile.

### Alterações

- Branch: não criada.
- Branch sugerida web: `feat/karaoke-literal-adaptado`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Front`, `Design/UX`, `Acessibilidade`.
- Prioridade: `P0 — Crítica`.
- Dependências: Cards 03, 05 e 08.

---

## Card 10 — Proteger privacidade, acesso e dados das transcrições

### Objetivo

Definir e implementar as garantias mínimas de segurança e LGPD para salas, áudio, transcrições e uso da IA.

### Problema ou funcionalidade

Reuniões empresariais, escolares e comunitárias podem conter dados pessoais ou confidenciais. O sistema atual usa JWT em `localStorage`, cadastro público com papel de professor, convite por token e não possui rate limiting, política formal de retenção ou consentimento para IA.

### Fluxo sugerido

1. Definir consentimento e aviso de transcrição/IA antes da entrada na sala.
2. Definir retenção, exclusão, exportação e acesso ao transcript após encerramento.
3. Endurecer papéis, criação de salas, convites, revogação e expiração.
4. Implementar rate limiting em autenticação, entrada e publicação de eventos.
5. Revisar armazenamento do JWT e riscos de XSS.
6. Redigir logs sem texto sensível e com correlação suficiente para diagnóstico.
7. Garantir que áudio não seja gravado por padrão e que o provedor de IA receba apenas o necessário.
8. Documentar suboperadores, finalidade e fluxo de dados do agente.

### Regras de negócio

- Participante deve saber que a fala está sendo transcrita e processada por IA.
- Transcript só é acessível a usuários autorizados pela política da sala.
- Convite revogado ou participante removido perde acesso em tempo real.
- Segredos ficam apenas no ambiente seguro do backend.
- Exclusão e retenção devem respeitar o contrato documentado.
- Dados da reunião não podem ser reutilizados para treinamento sem consentimento explícito.

### Validações necessárias

- Testes de autorização horizontal e vertical em REST e Socket.IO.
- Testes de expiração/revogação de convite e encerramento da sessão.
- Teste confirma rate limiting nos pontos críticos.
- Auditoria de logs e respostas sem tokens, prompts sensíveis ou transcript indevido.
- Checklist LGPD registrado no cérebro.
- Revisão das vulnerabilidades de dependências de runtime antes da publicação.

### Observações

Segurança não é nice to have para a liberação do núcleo. Recursos de reunião podem ser posteriores, mas a proteção do transcript deve existir desde o primeiro piloto.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/seguranca-transcricoes`.
- Branch sugerida web: `feat/consentimento-transcricao`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Back`, `Front`, `Auth`, `Infra`.
- Prioridade: `P0 — Crítica`.
- Dependências: Cards 01, 02 e 08.

---

## Card 11 — Validar o núcleo full-stack de ponta a ponta

### Objetivo

Provar em ambiente real que a jornada principal funciona do início ao fim antes de iniciar as funcionalidades nice to have.

### Problema ou funcionalidade

Builds e testes isolados não comprovam a experiência real. O núcleo envolve navegador, permissão de microfone, Socket.IO, PostgreSQL, filtro, provedor de IA, preferências individuais e UI karaokê.

### Fluxo sugerido

1. Subir PostgreSQL descartável, migrations, API e frontend das branches candidatas.
2. Criar anfitrião e participante em uma sala genérica.
3. Configurar contexto da plateia e preferências diferentes para dois participantes.
4. Transmitir fala com vícios, números, nomes, negação e frases longas.
5. Validar parcial, final limpo, adaptação, troca de modo, persistência e replay.
6. Interromper rede e IA para validar reconexão e fallback.
7. Medir latência ponta a ponta e registrar percentis, consumo e falhas.
8. Executar testes unitários, integração, E2E, lint, build, acessibilidade e QA responsivo.
9. Registrar evidências e riscos residuais no card e no cérebro.

### Regras de negócio

- O MVP só é considerado fechado quando a jornada funciona sem intervenção manual no banco.
- Falha da IA mantém a legenda literal disponível.
- Nenhum segmento pode ser perdido, duplicado ou exibido fora de ordem.
- Teste precisa usar navegador real para microfone e VLibras não entra como critério deste núcleo.
- Resultado deve separar claramente aprovado, falhou, bloqueado e não executado.

### Validações necessárias

- Fluxo real completo com pelo menos anfitrião e dois participantes em preferências distintas.
- API health confirma banco e frontend responde pela configuração correta.
- Todos os gates dos dois repositórios passam.
- Relatório contém latência parcial, final limpa e adaptada.
- Mobile e desktop validados.
- Repositórios ficam limpos de scripts, contas e arquivos temporários de teste.

### Observações

Este é o gate que libera o início dos cards P1. A meta de latência deve ser aprovada no Card 01 e medida aqui; não declarar “tempo real” sem números.

### Alterações

- Branch: não criada.
- Branch sugerida: usar as branches dos cards P0; harness descartável não deve ser commitado com produto.
- PR: registrar todos os PRs candidatos no card.

### Gestão do card

- Responsável: `@foythcaue`.
- Revisores sugeridos: `@carlakeitemachado2`, `@emersonamancio1`.
- Flags: `Front`, `Back`, `Motor/IA`, `Infra`, `Acessibilidade`.
- Prioridade: `P0 — Crítica`.
- Dependências: Cards 02 a 10.

---

# P1 — Evoluções após o núcleo da transcrição

## Card 12 — Generalizar chat, mãos levantadas e moderação de participantes

### Objetivo

Adaptar os recursos colaborativos existentes ao domínio genérico e entregar moderação real da sala.

### Problema ou funcionalidade

Chat e mãos levantadas já existem, mas usam regras e textos de professor/aluno. A lista de pessoas é apenas visual; o anfitrião ainda não consegue remover alguém nem revogar seu acesso.

### Fluxo sugerido

1. Atualizar contratos, textos e permissões para anfitrião, moderador e participante.
2. Manter chat e mãos sincronizados durante reconexões.
3. Permitir que o anfitrião remova participante da sala.
4. Desconectar os sockets do removido e impedir reentrada com o mesmo convite enquanto o bloqueio estiver ativo.
5. Registrar ação de moderação sem expor conteúdo desnecessário.
6. Melhorar lista de participantes, estados de presença e feedback das ações.

### Regras de negócio

- Participante comum não remove nem modera outros usuários.
- Pessoa removida recebe motivo genérico e perde acesso imediatamente.
- Chat e mãos não funcionam em sala encerrada.
- Moderação não pode apagar ou alterar transcript canônico.
- Estado de presença em memória deve ter estratégia explícita para múltiplas instâncias antes de escalar.

### Validações necessárias

- Testes REST/Socket.IO de permissão, remoção, revogação e reconexão.
- Smoke com dois dispositivos e remoção durante a sessão.
- Chat não duplica mensagens após reconectar.
- Fila de mãos mantém ordem e baixa automaticamente ao sair.
- UI de moderação funciona por teclado e exige confirmação.

### Observações

Reaproveitar a base atual; não reescrever chat e presença sem evidência de necessidade.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/moderacao-sala`.
- Branch sugerida web: `feat/moderacao-sala`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Back`, `Front`, `Acessibilidade`.
- Prioridade: `P1 — Alta`.
- Dependências: Cards 02 e 11.

---

## Card 13 — Implementar áudio e vídeo de conferência

### Objetivo

Adicionar mídia bidirecional à sala para que anfitrião e participantes controlem microfone e câmera sem depender de outra plataforma de reunião.

### Problema ou funcionalidade

O botão de microfone atual controla apenas reconhecimento de fala no navegador do anfitrião. Não existe transporte de áudio/vídeo entre participantes, seleção de dispositivos ou câmera.

### Fluxo sugerido

1. Definir arquitetura WebRTC adequada ao tamanho esperado das salas e à infraestrutura disponível.
2. Separar claramente microfone de transcrição e mídia de conferência.
3. Implementar permissão, seleção de dispositivos, mute/unmute e câmera on/off.
4. Integrar sinalização, entrada/saída e reconexão com o ciclo da sala.
5. Definir qual fonte de áudio alimenta a transcrição quando houver mais de um comunicador.
6. Criar layout responsivo que preserve a legenda como elemento principal.
7. Tratar baixa largura de banda, dispositivo ausente e permissão negada.

### Regras de negócio

- Câmera e microfone iniciam no estado definido pela política de privacidade, nunca silenciosamente.
- Participante controla sua própria mídia; anfitrião pode moderar conforme regra explícita, mas não ativar câmera/microfone remotamente.
- A transcrição deve continuar utilizável com vídeo desligado.
- Áudio/vídeo não é gravado por padrão.
- Falha de mídia não encerra a sala nem o transcript.

### Validações necessárias

- Teste real entre navegadores/dispositivos distintos.
- Permissões negadas e troca de dispositivo tratadas sem travamento.
- Reconexão recupera mídia sem duplicar participantes.
- QA de rede limitada e desligamento de câmera.
- Legenda permanece legível em todos os layouts.

### Observações

Este módulo possui complexidade própria e não deve ser incluído no gate P0. Se WebRTC próprio exceder o prazo, avaliar serviço gerenciado sem misturar a decisão com o agente de transcrição.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/midia-sala`.
- Branch sugerida web: `feat/midia-sala`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Back`, `Front`, `Infra`, `Acessibilidade`.
- Prioridade: `P1 — Alta`.
- Dependências: Cards 02, 10 e 11.

---

## Card 14 — Integrar o intérprete digital VLibras à experiência da sala

### Objetivo

Oferecer o VLibras como camada opcional de interpretação digital, com controle do participante e posicionamento compatível com a sala responsiva.

### Problema ou funcionalidade

O widget atual é global e rigidamente preso ao canto. A sala precisa permitir ligar/desligar, reposicionar ou redimensionar sem esconder legenda, chat ou vídeo.

### Fluxo sugerido

1. Definir se o VLibras recebe texto limpo, adaptado ou uma versão preparada especificamente para o avatar.
2. Criar preferência individual de intérprete digital.
3. Integrar abertura, fechamento e estado ao layout da sala.
4. Avaliar limites do widget oficial para reposicionamento e responsividade.
5. Se necessário, realizar prova técnica com a versão open source/self-hosted sem comprometer o núcleo.
6. Garantir fallback honesto quando o serviço externo não carregar.
7. Validar em navegador real, pois o player possui limitações em headless.

### Regras de negócio

- Intérprete é opcional e individual.
- VLibras não substitui a adaptação textual nem deve ser apresentado como diferencial semântico próprio.
- O avatar não pode cobrir a legenda ou controles essenciais.
- Falha do VLibras não interrompe a transcrição.
- Limitações e origem externa devem ser comunicadas com clareza.

### Validações necessárias

- Teste real de abertura, fechamento e troca de preferência.
- QA em mobile, tablet e desktop com chat e vídeo.
- Teste de indisponibilidade do serviço externo.
- Avaliação da compreensão do texto enviado ao avatar.
- Acessibilidade do controle por teclado.

### Observações

Personalização profunda depende das capacidades e licenças do VLibras. Não prometer reposicionamento livre antes da prova técnica.

### Alterações

- Branch: não criada.
- Branch sugerida web: `feat/interprete-vlibras-sala`.
- Branch sugerida API: apenas se surgir contrato de texto específico.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Tradutor/VLibras`, `Front`, `Acessibilidade`, `Design/UX`.
- Prioridade: `P1 — Alta`.
- Dependências: Cards 05, 09 e 11.

---

## Card 15 — Implementar análise sentimental acessível e opcional

### Objetivo

Adicionar metadados de tom emocional às legendas por meio de cores, ícones e rótulos textuais, sem alterar o transcript canônico.

### Problema ou funcionalidade

Texto puro pode esconder pistas de tom disponíveis na fala. Porém, inferência emocional é probabilística e pode induzir interpretação errada se apresentada como certeza ou apenas por cor.

### Fluxo sugerido

1. Definir conjunto pequeno de estados, incluindo neutro e incerto.
2. Processar sentimento como metadado separado do texto literal/adaptado.
3. Implementar preferência individual ligada/desligada e alteração durante a sessão.
4. Exibir combinação de cor, ícone e rótulo, nunca somente cor.
5. Mostrar incerteza quando a confiança não for suficiente.
6. Validar o impacto visual no karaokê e em movimento reduzido.
7. Medir latência e custo adicional sem atrasar a adaptação principal.

### Regras de negócio

- Sentimento é opcional e desativável a qualquer momento.
- O resultado é uma estimativa, não afirmação sobre intenção ou estado psicológico da pessoa.
- Metadado não modifica, resume nem substitui o texto.
- Não criar perfil emocional de participantes.
- Falha da análise não afeta transcrição ou adaptação.

### Validações necessárias

- Testes de estados neutro, incerto, feliz, triste e bravo conforme taxonomia aprovada.
- Contraste e entendimento validados sem depender de cor.
- Teste de preferência em tempo real.
- Avaliação manual de falsos positivos e comunicação de incerteza.
- Desempenho medido separadamente do agente de adaptação.

### Observações

Tratar como recurso assistivo experimental. A apresentação deve ser conservadora para não distorcer reuniões sensíveis.

### Alterações

- Branch: não criada.
- Branch sugerida API: `feat/sentimento-transcricao`.
- Branch sugerida web: `feat/sentimento-transcricao`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Motor/IA`, `Front`, `Acessibilidade`, `Design/UX`.
- Prioridade: `P1 — Alta`.
- Dependências: Cards 08, 09 e 11.

---

## Card 16 — Preparar produção, observabilidade e escala do tempo real

### Objetivo

Publicar a versão atual do produto com deploy reproduzível, monitoramento, controle de custo da IA e arquitetura compatível com Socket.IO.

### Problema ou funcionalidade

As branches `dev` contêm o sistema atual, enquanto a produção expõe uma API legada. Não há CI versionado, o estado ao vivo é mantido em memória e múltiplas réplicas exigem coordenação compartilhada.

### Fluxo sugerido

1. Definir dev, staging e produção com variáveis e segredos separados.
2. Criar CI para lint, testes, build, Prisma e validação de contratos.
3. Publicar API, migrations e frontend das branches aprovadas com estratégia de rollback.
4. Implementar health checks, logs estruturados, métricas e alertas.
5. Monitorar latência de STT, filtro, IA, Socket.IO e renderização.
6. Monitorar tokens, custo por sala, timeout, fallback e taxa de erro do agente.
7. Definir operação em instância única ou adicionar adapter compartilhado/presença distribuída antes de múltiplas réplicas.
8. Configurar backups, restauração e política de retenção do banco.
9. Validar contrato real em produção por `/docs-json`, health e smoke da sala.

### Regras de negócio

- Segredos nunca entram em repositório ou cliente.
- Deploy não pode aplicar migration destrutiva sem backup e plano de rollback.
- Produção deve refletir apenas commits revisados e gates verdes.
- Logs não carregam transcript completo por padrão.
- Escala horizontal só é habilitada quando presença e eventos forem consistentes entre instâncias.

### Validações necessárias

- CI verde em PR real dos dois repositórios.
- Deploy de staging reproduzido do zero.
- Smoke full-stack em staging e produção.
- Restauração de backup testada.
- Alertas de falha do agente e indisponibilidade da API exercitados.
- Contrato publicado contém os módulos atuais, não apenas auth/games/health.

### Observações

Resolver também as vulnerabilidades altas de runtime encontradas na auditoria antes de publicação. Tooling de desenvolvimento e dependências de runtime devem ser reportados separadamente.

### Alterações

- Branch: não criada.
- Branch sugerida API: `chore/producao-observabilidade`.
- Branch sugerida web: `chore/ci-deploy`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Infra`, `Back`, `Front`, `Motor/IA`.
- Prioridade: `P1 — Alta`.
- Dependências: Cards 10 e 11.

---

## Card 17 — Validar com o público e atualizar TCC, arquitetura e cérebro

### Objetivo

Validar a utilidade da adaptação com pessoas surdas/intérpretes e manter entregáveis acadêmicos e documentação alinhados ao sistema real.

### Problema ou funcionalidade

O novo posicionamento amplia o projeto além da escola e transforma prompt engineering e transcrição em tempo real na metodologia central. Os documentos atuais ainda descrevem adaptação de conteúdo estático, personas escolares e features que mudaram de prioridade.

### Fluxo sugerido

1. Preparar roteiro, consentimento e critérios para teste com pessoa surda, intérprete ou especialista.
2. Comparar transcript reconhecido, limpo e adaptado em contextos distintos.
3. Registrar compreensão, erros de sentido, carga cognitiva, preferência de modo e feedback da UI.
4. Ajustar parâmetros e prompts somente com evidência registrada.
5. Atualizar RF/RNF, matriz de rastreabilidade, casos de uso, diagramas, arquitetura e metodologia do artigo.
6. Atualizar pitch, canvas e materiais do INOVA conforme o novo posicionamento.
7. Registrar resultados, decisões e limitações no `semantia-cerebro`.

### Regras de negócio

- Não inventar evidência primária ou resultado de validação.
- Participação deve ser consentida e dados devem ser anonimizados quando possível.
- Feedback de pessoas surdas tem prioridade sobre suposições da equipe sobre compreensão.
- Documentação descreve o que foi executado e separa claramente trabalho futuro.
- Toda decisão relevante entra no cérebro no mesmo fluxo da mudança.

### Validações necessárias

- Evidência primária real anexada ou referenciada de forma segura.
- Problemas encontrados geram cards vinculados e priorizados.
- Artigo, UML, requisitos e README refletem a mesma arquitetura implementada.
- Metodologia explica corpus, prompts, versões, métricas e limites do agente.
- Commit e push do cérebro confirmados.

### Observações

A validação não deve prometer equivalência a intérprete humano nem tradução completa para Libras sem evidência científica e linguística.

### Alterações

- Branch: não criada.
- Branch sugerida: `docs/validacao-mvp-transcricao` no `semantia-cerebro`.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Revisores sugeridos: `@carlakeitemachado2`, `@emersonamancio1`.
- Flags: `Pesquisa/TCC`, `Documentação`, `Negócio`, `Acessibilidade`.
- Prioridade: `P1 — Alta`.
- Dependências: Card 11; deve acompanhar os Cards 14 e 15 quando forem validados.

---

# P2 — Funcionalidades secundárias preservadas

## Card 18 — Reorganizar e evoluir as funcionalidades secundárias existentes

### Objetivo

Preservar o valor do hub, datilologia, ranking e ferramentas de Libras sem permitir que consumam o esforço necessário para concluir a transcrição.

### Problema ou funcionalidade

O Semantia já possui funcionalidades educativas e vários cards antigos para dicionário, quiz, sinal do dia e jogos. Parte já existe, parte está planejada e parte da documentação está desatualizada. Manter tudo como prioridade ativa fragmentaria o desenvolvimento.

### Fluxo sugerido

1. Inventariar o que está funcional, parcial, planejado ou obsoleto.
2. Manter no produto o que possui valor e baixo custo de manutenção.
3. Agrupar melhorias por módulo em vez de abrir cards por ajuste pequeno.
4. Corrigir apenas regressões críticas enquanto o núcleo P0 estiver em andamento.
5. Depois do gate P0, priorizar por evidência de uso, impacto social e custo.
6. Atualizar textos para não apresentar ferramentas secundárias como núcleo do produto.
7. Arquivar cards duplicados ou baseados no estado antigo do código.

### Regras de negócio

- Nenhum conteúdo útil é removido apenas para simplificar score ou backlog.
- Ranking, datilologia e ferramentas públicas não bloqueiam a sala acessível.
- Funcionalidade marcada como disponível precisa funcionar no ambiente publicado.
- Ferramentas externas devem informar origem e limitações.
- Novos módulos só entram quando houver capacidade após o núcleo.

### Validações necessárias

- Inventário aprovado com status atual de cada funcionalidade.
- Build e testes das features preservadas continuam verdes.
- Cards antigos são encerrados ou vinculados ao módulo consolidado.
- Landing e navegação comunicam corretamente a prioridade do produto.
- Nenhuma ferramenta “em breve” aparece como pronta.

### Observações

Este card concentra o backlog nice to have. Se uma funcionalidade voltar a ser prioridade, ela deve ser desmembrada em card próprio com responsável e critério de aceite.

### Alterações

- Branch: não criada.
- Branch sugerida web: `refactor/funcionalidades-secundarias` quando o trabalho for iniciado.
- PR: não aberto.

### Gestão do card

- Responsável: `@foythcaue`.
- Flags: `Ferramentas`, `Front`, `Negócio`.
- Prioridade: `P2 — Média`.
- Dependências: Card 11.

---

## Ordem recomendada

1. Cards 01 e 03 fecham contrato de produto e UX.
2. Card 02 estabelece o domínio genérico.
3. Cards 04 e 05 adicionam contexto e preferências.
4. Cards 06 e 07 consolidam captura e limpeza.
5. Card 08 entrega o agente.
6. Card 09 finaliza a experiência karaokê.
7. Card 10 protege dados e acesso.
8. Card 11 é o gate de encerramento do núcleo.
9. Cards 12 a 17 entram somente depois do gate, conforme capacidade e prioridade.
10. Card 18 permanece em P2 até o núcleo estar estável.

## Regra de encerramento

O núcleo do MVP só está concluído quando um anfitrião cria uma sala genérica, configura a plateia, inicia a transcrição, e duas pessoas conseguem acompanhar simultaneamente os modos literal e adaptado em interface karaokê responsiva, com fallback quando a IA falha, acesso protegido e evidência de teste ponta a ponta.
