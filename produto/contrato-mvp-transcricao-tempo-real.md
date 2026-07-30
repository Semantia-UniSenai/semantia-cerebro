---
title: Contrato canônico do MVP de transcrição em tempo real
status: canônico
atualizado: 2026-07-29
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

1. O comunicador inicia uma sala e informa o contexto da plateia.
2. O navegador captura a fala e envia segmentos parciais e finais.
3. Segmentos parciais são efêmeros e servem apenas à sensação de tempo real.
4. Segmentos finais passam pela limpeza conservadora no backend.
5. O texto limpo é o transcript literal canônico.
6. O agente especializado produz uma versão adaptada sem mudar fatos ou intenção.
7. Cada participante escolhe entre literal e adaptada e pode alternar durante a sessão.
8. Se a IA falhar ou exceder o tempo limite, a legenda literal continua sem interrupção.

## Público

- Pessoas surdas que usam português escrito com diferentes níveis de familiaridade.
- Comunicadores ouvintes que não dominam Libras.
- Organizações que precisam tornar encontros presenciais ou remotos mais acessíveis.
- Escolas, empresas, palestras, eventos e comunidades, sem hierarquia entre esses segmentos no
  contrato técnico.

## Atores canônicos

- **Anfitrião:** conta autenticada que cria, configura, inicia, encerra e administra a sala.
- **Comunicador:** fonte de fala/transcrição. No MVP é o próprio anfitrião; separar os papéis fica
  para uma evolução posterior.
- **Participante:** pessoa que entra para acompanhar a comunicação e escolher sua experiência de
  legenda.
- **Convidado:** participante que entra por link/token sem precisar criar conta.
- **Plateia:** perfil coletivo de contexto configurado para a sessão; não é um papel de usuário.
- **Moderador:** papel futuro para apoiar gestão e segurança; não bloqueia o núcleo do MVP.

O vocabulário detalhado e as substituições de termos legados estão em
[`glossario.md`](./glossario.md).

## Decisão de acesso

- Criar, configurar e administrar uma sala **exige conta autenticada** do anfitrião.
- Acompanhar uma sala pelo link de convite **não exige conta** no contrato do MVP.
- O convidado informa um nome de exibição e recebe uma identidade efêmera limitada à sessão.
- Criar conta como participante é opcional e só será necessário para recursos persistentes
  futuros, como histórico pessoal ou preferências entre sessões.
- O link/token concede acesso apenas à sala correspondente e pode ser revogado ao encerrar a
  sessão.

**Estado atual:** a API e o frontend ainda exigem JWT de todos os participantes. O `joinToken` já
existe, mas o ingresso realmente anônimo é **planejado**, não implementado. Essa diferença deve
ser resolvida no card de generalização do domínio e protegida no card de privacidade.

## Ciclo de vida, duração e retenção

- Uma sessão do MVP comporta até **4 horas** de duração contínua.
- O anfitrião pode encerrá-la antes; encerramento é idempotente.
- A reconexão do anfitrião não pode duplicar segmentos nem reiniciar a sequência.
- O Semantia **não grava nem armazena áudio** no MVP. O áudio existe apenas no fluxo de captura do
  navegador necessário ao reconhecimento de fala.
- Transcript, chat e metadados identificáveis da sessão — título, contexto da plateia, horários,
  participantes e metadados de adaptação — ficam disponíveis ao anfitrião por **30 dias após o
  encerramento**.
- O anfitrião pode excluir os dados antes do prazo; a exclusão deve remover transcript, chat e
  identificadores efêmeros vinculados à sessão.
- Depois de 30 dias, a exclusão deve ser automática. Logs técnicos mínimos sem conteúdo,
  nomes, tokens ou IDs de participante podem existir por **90 dias** para segurança e métricas;
  depois disso devem ser excluídos ou agregados de forma não identificável.

**Estado atual:** segmentos, chat e metadados são persistidos sem expiração automática. O limite
de quatro horas, a exclusão antecipada e as retenções de 30/90 dias são contrato planejado para
os cards de privacidade e produção; não devem ser anunciados como implementados antes dos testes.

## Capacidade esperada

- Tamanho-alvo do MVP: até **50 conexões simultâneas por sala**, incluindo anfitrião.
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

## Verdade implementada em 2026-07-29

### Implementado e reutilizável

- autenticação JWT e PostgreSQL/Prisma;
- sessões ao vivo com token, transcript e chat persistidos;
- Socket.IO com presença, mãos levantadas e encerramento;
- Web Speech API com parciais/finais;
- limpeza conservadora de disfluências no backend;
- palco de legenda karaokê literal;
- datilologia/ranking e integração global do VLibras.

### Planejado para o contrato atual

- domínio e papéis genéricos;
- ingresso de convidado sem conta;
- contexto da plateia;
- versões literal e adaptada do mesmo segmento;
- agente especializado e fallback medido;
- retenção/exclusão e limites de sessão;
- moderação genérica e validação de capacidade.

### Legado explícito

`PROFESSOR`, `ALUNO`, `SchoolClass`, `ClassMember`, `teacherId`, `/turmas` e `/aula` representam a
fundação educacional implementada. Permanecem no código até a migração, mas não são o contrato
final. Documentos de junho sobre CRUD de material educacional, texto → glosas e API vazia são
registros históricos, não o backlog vigente.

## Documentos relacionados

- [Glossário canônico](./glossario.md)
- [Requisitos, regras e casos de uso](../requisitos/mvp-transcricao-tempo-real.md)
- [Arquitetura da sala ao vivo](../arquitetura/sala-ao-vivo.md)
- [Backlog atual](../planejamento/2026-07-29-backlog-mvp-transcricao-tempo-real.md)
- [Auditoria do backlog legado](../planejamento/2026-07-29-auditoria-backlog-legado-trello.md)
