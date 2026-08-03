---
title: Auditoria do backlog legado do Trello
status: concluída
board: https://trello.com/b/R9MvwoxY/semantia
board_status: descontinuado-somente-histórico
data: 2026-07-29
---

# Auditoria do backlog legado do Trello

## Contexto

O board legado do Trello continha **38 cards abertos**, todos no Backlog e sem responsável. Eles
foram criados em junho, antes do backend, da sala ao vivo e da decisão de tornar a transcrição
acessível o núcleo abrangente do produto.

O ClickUp passou a ser o board operacional. Os 18 cards atuais estão atribuídos ao Cauê, com
prioridade nativa e etiqueta de tipo. Esta auditoria preserva a rastreabilidade dos cards antigos
sem permitir que suas premissas educacionais concorram com o MVP atual.

O Trello está **descontinuado** e não deve receber alterações. A classificação abaixo existe
somente no `semantia-cerebro`; os links servem como evidência histórica. Status, responsáveis,
flags e prioridades operacionais pertencem exclusivamente aos cards atuais do ClickUp.

## Critérios

- **Concluído:** o objetivo original foi comprovado no sistema ou no cérebro.
- **Substituído:** a premissa original deixou de ser contrato e há um card atual que a substitui.
- **Incorporado:** o trabalho restante foi absorvido por um card atual mais abrangente.
- **Mantido para fase posterior:** continua útil, mas não bloqueia o núcleo e possui vínculo com
  um card P1/P2 atual.

## Resultado consolidado

- 7 concluídos.
- 9 substituídos.
- 10 incorporados.
- 12 mantidos para fase posterior.
- 38 de 38 com decisão e vínculo explícitos.

## Inventário classificado

| # | Card legado | Classificação | Decisão e vínculo atual |
|---:|---|---|---|
| 01 | [Definir modelo Free vs Pro](https://trello.com/c/KBO9gbKa) | Substituído | Adaptação textual passa a integrar o núcleo do MVP; precificação fica fora deste ciclo. [Card 01](https://app.clickup.com/t/90171419563/86e2j4gtn). |
| 02 | [Mapear personas e jornadas](https://trello.com/c/ZZcnkmZ5) | Substituído | Professor/aluno dão lugar a anfitrião/comunicador/participante. [Card 02](https://app.clickup.com/t/90171419563/86e2j4qky). |
| 03 | [Submissão INOVA SENAI](https://trello.com/c/o0sVjqiK) | Mantido para fase posterior | Entregáveis acadêmicos continuam válidos, sem bloquear o núcleo. [Card 17](https://app.clickup.com/t/90171419563/86e2j4x7r). |
| 04 | [Catálogo de ferramentas gratuitas](https://trello.com/c/6hvliWJt) | Mantido para fase posterior | Catálogo será reorganizado após o núcleo. [Card 18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 05 | [Fechar direção visual](https://trello.com/c/R52N8K42) | Incorporado | Direção visual faz parte da experiência acessível completa. [Card 03](https://app.clickup.com/t/90171419563/86e2j4uyj). |
| 06 | [Design system](https://trello.com/c/0DHGgBZo) | Incorporado | Tokens e componentes entram no mesmo gate de UX/UI. [Card 03](https://app.clickup.com/t/90171419563/86e2j4uyj). |
| 07 | [Acessibilidade Libras-first](https://trello.com/c/AcCXdb8H) | Incorporado | Auditoria visual e funcional entra nos Cards [03](https://app.clickup.com/t/90171419563/86e2j4uyj) e [11](https://app.clickup.com/t/90171419563/86e2j4whd). |
| 08 | [Tirar Adaptação Semântica do grid grátis](https://trello.com/c/EOBfbttF) | Substituído | A adaptação é parte do MVP atual; a regra antiga de “não entregar” foi revogada. [Card 01](https://app.clickup.com/t/90171419563/86e2j4gtn). |
| 09 | [Ferramenta: Datilologia](https://trello.com/c/V6pVfRoe) | Concluído | Datilologia e ranking estão implementados; evolução fica no [Card 18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 10 | [Dicionário de Sinais](https://trello.com/c/xTq9SdDu) | Mantido para fase posterior | Recurso secundário preservado no [Card 18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 11 | [Sinal do dia](https://trello.com/c/M1shEzVq) | Mantido para fase posterior | Recurso de engajamento preservado no [Card 18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 12 | [Quiz adivinhe o sinal](https://trello.com/c/uAPemv7n) | Mantido para fase posterior | Gamificação não bloqueia a transcrição. [Card 18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 13 | [Validar Tradutor VLibras](https://trello.com/c/TSxWASmX) | Concluído | Integração global e correção de clique foram comprovadas; integração na sala segue no [Card 14](https://app.clickup.com/t/90171419563/86e2j4wum). |
| 14 | [Arquitetura de rotas do front](https://trello.com/c/c4KhPgnN) | Concluído | `vue-router`, rotas públicas/logadas e guard estão implementados. |
| 15 | [Responsividade e testes de UI](https://trello.com/c/xublNwGX) | Incorporado | QA responsivo e de componentes integra os Cards [03](https://app.clickup.com/t/90171419563/86e2j4uyj) e [11](https://app.clickup.com/t/90171419563/86e2j4whd). |
| 16 | [Tela de login e cadastro](https://trello.com/c/sgdfWR7i) | Concluído | Login, cadastro, JWT e guard existem; papéis serão generalizados no [Card 02](https://app.clickup.com/t/90171419563/86e2j4qky). |
| 17 | [Área do professor](https://trello.com/c/XsfvbdZN) | Substituído | Painel educacional dá lugar à jornada do anfitrião. Cards [02](https://app.clickup.com/t/90171419563/86e2j4qky) e [04](https://app.clickup.com/t/90171419563/86e2j4vuj). |
| 18 | [Área do aluno](https://trello.com/c/rgk6GX3D) | Substituído | Área do aluno dá lugar à experiência do participante. Cards [02](https://app.clickup.com/t/90171419563/86e2j4qky), [05](https://app.clickup.com/t/90171419563/86e2j4vxe) e [09](https://app.clickup.com/t/90171419563/86e2j4wad). |
| 19 | [Definir stack do semantia-api](https://trello.com/c/QoIUYnTT) | Concluído | NestJS, Prisma/PostgreSQL, Swagger e módulos estão implementados. |
| 20 | [Modelagem de dados](https://trello.com/c/eVayDJQE) | Substituído | O modelo educacional implementado é fundação legada; o alvo genérico será modelado nos Cards [02](https://app.clickup.com/t/90171419563/86e2j4qky), [04](https://app.clickup.com/t/90171419563/86e2j4vuj) e [10](https://app.clickup.com/t/90171419563/86e2j4wd1). |
| 21 | [Autenticação e autorização](https://trello.com/c/kvOXCuQj) | Concluído | Auth JWT e RBAC escolar existem; guest/host genéricos continuam nos Cards [02](https://app.clickup.com/t/90171419563/86e2j4qky) e [10](https://app.clickup.com/t/90171419563/86e2j4wd1). |
| 22 | [API de conteúdos do professor](https://trello.com/c/IfIX1rTC) | Substituído | CRUD de material estático não é o núcleo atual; fluxo ao vivo é coberto pelos Cards [02](https://app.clickup.com/t/90171419563/86e2j4qky), [06](https://app.clickup.com/t/90171419563/86e2j4w0k) e [08](https://app.clickup.com/t/90171419563/86e2j4w7h). |
| 23 | [Biblioteca de sinais](https://trello.com/c/JvkQC9Hg) | Mantido para fase posterior | Biblioteca permanece complementar ao VLibras/ferramentas. Cards [14](https://app.clickup.com/t/90171419563/86e2j4wum) e [18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 24 | [Especificar motor semântico](https://trello.com/c/8JWW1pln) | Substituído | Decisão regras vs. IA foi resolvida: limpeza conservadora + agente LLM. [Card 08](https://app.clickup.com/t/90171419563/86e2j4w7h). |
| 25 | [Protótipo texto para glosas](https://trello.com/c/75X4pIX5) | Substituído | O MVP entrega texto acessível adaptado, sem prometer tradução própria para Libras. [Card 08](https://app.clickup.com/t/90171419563/86e2j4w7h). |
| 26 | [Pipeline conceito para sinal](https://trello.com/c/uiKg4742) | Mantido para fase posterior | Evolução complementar ligada aos Cards [14](https://app.clickup.com/t/90171419563/86e2j4wum) e [18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 27 | [Reconhecimento por webcam](https://trello.com/c/AMeJJJzc) | Mantido para fase posterior | Pesquisa de fase futura consolidada no [Card 18](https://app.clickup.com/t/90171419563/86e2j4xc5). |
| 28 | [Deploy do front](https://trello.com/c/tTbNrAqI) | Incorporado | Deploy faz parte do gate de produção. [Card 16](https://app.clickup.com/t/90171419563/86e2j4x37). |
| 29 | [Ambientes e variáveis](https://trello.com/c/WLpObQFJ) | Incorporado | Configuração e segredos entram no [Card 16](https://app.clickup.com/t/90171419563/86e2j4x37). |
| 30 | [CI básico](https://trello.com/c/xdzsVZB0) | Incorporado | Gates de CI/qualidade entram no [Card 16](https://app.clickup.com/t/90171419563/86e2j4x37). |
| 31 | [Domínio e HTTPS](https://trello.com/c/PeNGmZrB) | Incorporado | Publicação segura entra no [Card 16](https://app.clickup.com/t/90171419563/86e2j4x37). |
| 32 | [Manter semantia-cerebro vivo](https://trello.com/c/GIR387wE) | Concluído | Ritual, estrutura e skill de sincronização estão versionados e ativos. |
| 33 | [README e arquitetura do web](https://trello.com/c/0ipaI80S) | Incorporado | Documentação será mantida junto ao contrato e à evolução da UX. Cards [01](https://app.clickup.com/t/90171419563/86e2j4gtn) e [03](https://app.clickup.com/t/90171419563/86e2j4uyj). |
| 34 | [Esqueleto do artigo](https://trello.com/c/grudrCkU) | Mantido para fase posterior | Entrega acadêmica vinculada ao [Card 17](https://app.clickup.com/t/90171419563/86e2j4x7r). |
| 35 | [Fundamentação teórica](https://trello.com/c/kpyDnPP5) | Mantido para fase posterior | Pesquisa vinculada ao [Card 17](https://app.clickup.com/t/90171419563/86e2j4x7r). |
| 36 | [Trabalhos relacionados](https://trello.com/c/HRbKF9X9) | Mantido para fase posterior | Pesquisa vinculada ao [Card 17](https://app.clickup.com/t/90171419563/86e2j4x7r). |
| 37 | [Modelagem UML](https://trello.com/c/XfK9g51o) | Mantido para fase posterior | Diagramas devem refletir o domínio já generalizado. [Card 17](https://app.clickup.com/t/90171419563/86e2j4x7r). |
| 38 | [Análise de requisitos e testes](https://trello.com/c/iWrO4vGl) | Incorporado | Requisitos ficam neste card; testes full-stack no [Card 11](https://app.clickup.com/t/90171419563/86e2j4whd) e TCC no [Card 17](https://app.clickup.com/t/90171419563/86e2j4x7r). |

## Política após a descontinuação

1. O ClickUp é o único board operacional do novo MVP.
2. O Trello permanece intacto como registro histórico e não recebe nomes, descrições, membros,
   etiquetas, movimentos ou arquivamentos novos.
3. Esta matriz no cérebro é a classificação canônica dos 38 cards antigos.
4. Cards substituídos ou incorporados não devem voltar ao backlog ativo sem revisar o contrato.
5. Itens de fase posterior são representados pelos Cards 17/18 no ClickUp, evitando backlog duplo.
6. Os cards atuais do ClickUp permanecem atribuídos ao Cauê e usam prioridade nativa:
   Urgente=P0, Alta=P1 e Normal=P2.
