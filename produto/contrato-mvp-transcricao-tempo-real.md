---
title: Contrato canônico do MVP de transcrição em tempo real
status: canônico
atualizado: 2026-07-30
substitui: escopo educacional de adaptação de materiais estáticos
---

# Contrato canônico do MVP de transcrição em tempo real

Este documento é a fonte de verdade do produto atual. Quando um documento histórico, card antigo
ou trecho de código divergir dele, a divergência deve ser tratada como **legado a migrar**, não
como requisito vigente.

## Propósito

O Semantia é uma plataforma web de **comunicação acessível em tempo real**. Uma pessoa ouvinte
fala normalmente e pessoas surdas acompanham a comunicação por legendas claras, responsivas e
acessíveis. O produto atende escolas, empresas, reuniões, palestras, eventos e comunidades; o
contexto educacional é uma vertical possível, não o domínio central.

O Semantia não se apresenta como tradução completa de português para Libras nem como substituto
de intérprete humano. O núcleo imediato entrega **texto acessível literal ou adaptado**. O
VLibras é uma camada opcional e separada de intérprete digital.

## Núcleo do MVP

O fluxo prioritário é:

`áudio → reconhecimento de fala → limpeza conservadora de disfluências → adaptação por IA → legenda karaokê`

1. O comunicador abre uma reunião instantânea; a API já a inicia e gera o link/token de convite.
2. O navegador captura a fala e envia segmentos parciais e finais.
3. Segmentos parciais são efêmeros e servem apenas à sensação de tempo real.
4. Segmentos finais passam pela limpeza conservadora no backend.
5. O texto limpo é o transcript literal canônico.
6. O agente especializado produz uma versão adaptada sem mudar fatos ou intenção.
7. Cada participante escolhe entre literal e adaptada e pode alternar durante a reunião.
8. Se a IA falhar ou exceder o tempo limite, a legenda literal continua sem interrupção.

## Público

- Pessoas surdas que usam português escrito com diferentes níveis de familiaridade.
- Comunicadores ouvintes que não dominam Libras.
- Organizações que precisam tornar encontros presenciais ou remotos mais acessíveis.
- Escolas, empresas, palestras, eventos e comunidades, sem hierarquia entre esses segmentos no
  contrato técnico.

## Atores canônicos

- **Anfitrião:** conta autenticada que abre, encerra e administra a reunião.
- **Comunicador:** fonte de fala/transcrição. No MVP é o próprio anfitrião; separar os papéis fica
  para uma evolução posterior.
- **Participante:** pessoa que entra para acompanhar a comunicação e escolher sua experiência de
  legenda.
- **Convidado:** participante que entra por link/token sem precisar criar conta.
- **Plateia:** perfil coletivo de contexto configurável dentro da reunião; não é um papel de usuário.
- **Moderador:** conta autenticada autorizada no contexto da reunião para apoiar configuração,
  gestão e encerramento, sem receber privilégios por papel global.

O vocabulário detalhado e as substituições de termos legados estão em
[`glossario.md`](./glossario.md).

## Decisão de acesso

- Abrir e administrar uma reunião **exige conta autenticada** do anfitrião.
- Acompanhar uma reunião pelo link de convite **não exige conta** no contrato do MVP.
- O convidado informa um nome de exibição e recebe uma identidade efêmera limitada à reunião.
- Criar conta como participante é opcional e só será necessário para recursos persistentes
  futuros, como histórico pessoal ou preferências entre reuniões.
- O link/token concede acesso apenas à reunião correspondente e deixa de permitir mutações ao
  encerrá-la.

**Estado validado na branch `feat/salas-comunicacao`:** um `POST /api/rooms` autenticado cria
atomicamente a reunião já em `LIVE` e devolve o identificador e o `joinToken`. O frontend entra
diretamente na experiência ao vivo. Convidados usam nome de exibição e token efêmero restrito à
reunião; o `joinToken` reutilizável só é devolvido a anfitrião ou moderador. A entrega aguarda
revisão e merge dos PRs empilhados antes de ser descrita como integrada em `dev`.

### Decisão de simplicidade do MVP

O modelo de produto segue a jornada do Google Meet: **sala e reunião são a mesma coisa para quem
usa o Semantia**. Não existe criação manual de sessão, tela de preparação, botão separado para
iniciar nem histórico de sessões dentro de uma sala. O registro `RoomSession` permanece somente
como detalhe interno para preservar transcript, chat, participantes e compatibilidade da migration.
Toda nova `Room` criada pelo produto recebe uma única ocorrência interna, já iniciada.

PRs de implementação em revisão: [API #4](https://github.com/Semantia-UniSenai/semantia-api/pull/4)
e [web #4](https://github.com/Semantia-UniSenai/semantia-web/pull/4). Nenhum merge foi realizado.

## Ciclo de vida, duração e retenção

- Uma reunião do MVP comporta até **4 horas** de duração contínua.
- O anfitrião pode encerrá-la antes; encerramento é idempotente.
- A reconexão do anfitrião não pode duplicar segmentos nem reiniciar a sequência.
- O Semantia **não grava nem armazena áudio** no MVP. O áudio existe apenas no fluxo de captura do
  navegador necessário ao reconhecimento de fala.
- Transcript, chat e metadados identificáveis da reunião — título, contexto da plateia, horários,
  participantes e metadados de adaptação — ficam disponíveis ao anfitrião por **30 dias após o
  encerramento**.
- O anfitrião pode excluir os dados antes do prazo; a exclusão deve remover transcript, chat e
  identificadores efêmeros vinculados à reunião.
- Depois de 30 dias, a exclusão deve ser automática. Logs técnicos mínimos sem conteúdo,
  nomes, tokens ou IDs de participante podem existir por **90 dias** para segurança e métricas;
  depois disso devem ser excluídos ou agregados de forma não identificável.

**Estado atual:** segmentos, chat e metadados são persistidos sem expiração automática. O limite
de quatro horas, a exclusão antecipada e as retenções de 30/90 dias são contrato planejado para
os cards de privacidade e produção; não devem ser anunciados como implementados antes dos testes.

## Capacidade esperada

- Tamanho-alvo do MVP: até **50 conexões simultâneas por reunião**, incluindo anfitrião.
- O núcleo assume uma fonte principal de transcrição por vez.
- O gate de implementação deve provar pelo menos 25 participantes concorrentes sem perda de
  ordem; a capacidade de 50 só pode ser anunciada após teste de carga e reconexão.
- Eventos maiores, múltiplos comunicadores simultâneos e distribuição horizontal são evolução de
  produção, não bloqueadores da primeira validação do núcleo.

## Ordem de prioridade

### P0 — núcleo antes do piloto

1. contrato e domínio genérico;
2. UX/UI acessível e responsiva;
3. contexto da plateia;
4. preferência literal/adaptada;
5. captura e transporte robustos;
6. limpeza conservadora;
7. agente especializado com fallback literal;
8. legenda karaokê;
9. privacidade e acesso;
10. validação full-stack.

### P1 — depois do gate do núcleo

Chat/moderação, áudio e vídeo de conferência, VLibras na sala, análise sentimental opcional,
observabilidade/escala e validação formal com o público/TCC.

### P2 — continuidade sem competir com o núcleo

Datilologia, ranking, dicionário, ferramentas gratuitas e demais funcionalidades educacionais
úteis permanecem no produto, mas não definem o MVP atual.

## Limites e não objetivos

- Não prometer tradução completa para Libras.
- Não prometer substituição de intérprete humano.
- Não armazenar áudio no MVP.
- Não usar análise sentimental como diagnóstico ou fato; quando existir, será opcional e incerta.
- Não bloquear transcrição por chat, vídeo, avatar, gamificação ou ferramentas gratuitas.
- Não aplicar mudanças destrutivas às tabelas educacionais antes de uma migração de dados
  separada e validada.

## Verdade validada em 2026-07-30

### Implementado e reutilizável em `dev`

- autenticação JWT e PostgreSQL/Prisma;
- reuniões ao vivo com token, transcript e chat persistidos;
- Socket.IO com presença, mãos levantadas e encerramento;
- Web Speech API com parciais/finais;
- limpeza conservadora de disfluências no backend;
- palco de legenda karaokê literal;
- datilologia/ranking e integração global do VLibras.

### Validado na branch `feat/salas-comunicacao`, pendente de revisão

- domínio `Room`, `RoomMember` e registro interno `RoomSession` com papéis contextuais `HOST`,
  `MODERATOR`, `PARTICIPANT` e `GUEST`;
- reunião instantânea em um clique, já `LIVE`, com link/token de convite imediato;
- ingresso de convidado sem conta por identidade e token efêmeros restritos à reunião;
- ciclo ativo `LIVE → ENDED`, gestão contextual e modo somente leitura após encerramento;
- migration preservadora de salas, membros, sessões, transcripts e chats legados;
- REST, Swagger/OpenAPI, cliente Orval, Socket.IO, rotas e telas sincronizados;
- jornada real em Brave/Chromium validada em desktop e mobile.

### Planejado para o contrato atual após a generalização

- contexto da plateia;
- versões literal e adaptada do mesmo segmento;
- agente especializado e fallback medido;
- retenção/exclusão e limites de sessão;
- validação de capacidade e endurecimento de produção.

### Legado explícito

`PROFESSOR`, `ALUNO`, `SchoolClass`, `ClassMember`, `teacherId`, `/turmas` e `/aula` representam a
fundação educacional integrada em `dev`. Na branch de generalização, o contrato ativo foi removido
e uma migration converte os dados preservando IDs e relações. Documentos de junho sobre CRUD de
material educacional, texto → glosas e API vazia continuam como registros históricos, não como
backlog vigente.

## Documentos relacionados

- [Glossário canônico](./glossario.md)
- [Requisitos, regras e casos de uso](../requisitos/mvp-transcricao-tempo-real.md)
- [Arquitetura da sala ao vivo](../arquitetura/sala-ao-vivo.md)
- [Backlog atual](../planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md)
- [Auditoria do backlog legado](../planejamento/2026-07-29-auditoria-backlog-legado-trello.md)
