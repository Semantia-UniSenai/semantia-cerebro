---
title: Requisitos do MVP de transcrição em tempo real
status: canônico
atualizado: 2026-07-30
---

# Requisitos do MVP de transcrição em tempo real

## Legenda de estado

- **IMPLEMENTADO:** comprovado no código integrado em `dev` em 2026-07-29.
- **VALIDADO NA BRANCH:** implementado e comprovado em `feat/salas-comunicacao`, mas ainda depende
  de revisão e merge dos PRs empilhados.
- **PARCIAL:** existe uma fundação reutilizável, mas o contrato atual ainda não está completo.
- **PLANEJADO:** requisito ativo ainda não implementado.
- **LEGADO:** existe no sistema ou em documentos antigos, mas será migrado ou mantido fora do
  núcleo.

Builds e contagens antigas de testes não alteram o estado funcional deste documento.

## Requisitos funcionais

| ID | Requisito | Prioridade | Estado em 2026-07-30 | Evidência ou lacuna |
|---|---|---|---|---|
| RF01 | Anfitrião cria conta, autentica-se e administra reuniões próprias. | P0 | VALIDADO NA BRANCH | Auth sem papel global e permissão contextual `HOST`/`MODERATOR`. |
| RF02 | Anfitrião abre uma reunião instantânea em um clique e recebe link/token de convite. | P0 | VALIDADO NA BRANCH | Criação transacional já `LIVE`; não há preparação nem início manual. |
| RF03 | Convidado entra pelo link com nome de exibição, sem conta. | P0 | VALIDADO NA BRANCH | REST e Socket.IO usam token efêmero limitado à reunião. |
| RF04 | Anfitrião configura durante a reunião tipo do encontro, faixa etária, familiaridade com português, domínio e simplificação. | P0 | PLANEJADO | Não há modelo nem tela de contexto; essa configuração não bloqueia a abertura. |
| RF05 | Navegador do comunicador captura fala e publica hipóteses parciais e finais. | P0 | IMPLEMENTADO | Web Speech API e eventos `transcript:partial/final`. |
| RF06 | Backend limpa disfluências inequívocas apenas nos segmentos finais. | P0 | IMPLEMENTADO | `AppendTranscriptSegmentUseCase` e `stripDisfluencies`. |
| RF07 | Backend persiste o transcript literal com sequência estável. | P0 | IMPLEMENTADO | `TranscriptSegment(sessionId, seq, text)`. |
| RF08 | Agente produz versão adaptada contextual sem alterar fatos ou intenção. | P0 | PLANEJADO | Camada de IA ainda não existe. |
| RF09 | Falha/timeout da IA mantém a versão literal sem interromper a sala. | P0 | PLANEJADO | Deve ser implementado junto ao agente. |
| RF10 | Participante escolhe literal ou adaptada e alterna durante a reunião. | P0 | PLANEJADO | Hoje existe somente o transcript literal. |
| RF11 | Legenda karaokê acompanha a fala, permite releitura e retorno ao vivo. | P0 | PARCIAL | Palco literal existe; falta integrar versão adaptada e preferências. |
| RF12 | Anfitrião encerra a reunião sem duplicar efeitos. | P0 | IMPLEMENTADO | REST/Socket.IO usam encerramento idempotente. |
| RF13 | Anfitrião consulta e exclui transcript/chat dentro da política de 30 dias. | P0 | PLANEJADO | Consulta existe; exclusão e expiração automática não. |
| RF14 | Participantes usam chat e mãos levantadas com moderação genérica. | P1 | VALIDADO NA BRANCH | Chat/mãos usam papéis contextuais; anfitrião e moderador gerenciam a sala. |
| RF15 | Sala oferece áudio e vídeo de conferência sem confundir o microfone da transcrição. | P1 | PLANEJADO | Não há WebRTC/conferência. |
| RF16 | Participante aciona VLibras como camada opcional na sala. | P1 | PARCIAL | Widget existe globalmente; integração da experiência ao vivo não validada. |
| RF17 | Análise sentimental, quando ativada, mostra incerteza e nunca diagnostica pessoas. | P1 | PLANEJADO | Não existe no produto atual. |
| RF18 | Ferramentas secundárias continuam acessíveis sem bloquear o núcleo. | P2 | PARCIAL | Datilologia/ranking e ferramentas públicas existem; reorganização pendente. |

## Requisitos não funcionais

| ID | Requisito | Estado | Critério de aceite |
|---|---|---|---|
| RNF01 | Acessibilidade e responsividade | PARCIAL | Teclado, foco, contraste, `aria-live`, movimento reduzido e QA mobile/desktop na sala. |
| RNF02 | Continuidade da legenda | PLANEJADO | Falha da IA não interrompe o literal; reconexão não duplica sequência. |
| RNF03 | Latência observável | PLANEJADO | Medir parcial, final limpo e adaptado; adaptação deve buscar p95 ≤ 2 s e cair para literal em até 3 s. |
| RNF04 | Capacidade | PLANEJADO | Provar 25 participantes concorrentes; só anunciar alvo de 50 após teste de carga/reconexão. |
| RNF05 | Duração da reunião | PLANEJADO | Suportar até 4 h sem reiniciar sequência nem perder ordem. |
| RNF06 | Privacidade | PARCIAL | Áudio não é armazenado e tokens ficam restritos à reunião; expiração de 30/90 dias ainda não foi implementada. |
| RNF07 | Segurança | PARCIAL | Hash, JWT, guest token contextual e acesso pós-reunião somente leitura foram validados; rate limit ainda falta. |
| RNF08 | Auditabilidade da IA | PLANEJADO | Registrar versão, latência e status da adaptação sem logar segredo ou transcript fora da política. |
| RNF09 | Compatibilidade | PARCIAL | Mensagem explícita quando STT não for suportado; fluxo validado em Brave/Chrome e fallback documentado. |
| RNF10 | Observabilidade | PLANEJADO | Métricas sem conteúdo sensível para conexão, reconexão, fila, latência, timeout e erro. |

## Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Transcrição acessível em tempo real é o núcleo e precede mídia, avatar, jogos e ferramentas gratuitas. |
| RN02 | Abrir/administrar reunião exige conta do anfitrião; acompanhar por convite não exige conta. |
| RN03 | O convidado recebe identidade efêmera restrita à reunião. |
| RN04 | Segmentos parciais não são persistidos nem enviados à IA. |
| RN05 | Limpeza remove apenas ruído inequívoco e nunca “melhora” significado. |
| RN06 | O transcript literal limpo é canônico e nunca depende do resultado da IA. |
| RN07 | A versão adaptada preserva fatos, nomes, números, intenção e termos essenciais. |
| RN08 | A preferência literal/adaptada é individual e pode mudar durante a reunião. |
| RN09 | O contexto da plateia pode ser configurado já dentro da reunião; cada alteração futura deve ter versão explícita e valer apenas para novos segmentos. |
| RN10 | O MVP usa uma fonte principal de transcrição por vez. |
| RN11 | Áudio não é gravado nem armazenado no MVP. |
| RN12 | Transcript, chat e metadados identificáveis expiram 30 dias após o encerramento e podem ser apagados antes pelo anfitrião; logs técnicos mínimos sem conteúdo/identidade têm janela de 90 dias. |
| RN13 | A reunião suporta no máximo 4 h e tem alvo de até 50 conexões, condicionado a teste. |
| RN14 | VLibras é camada opcional e não é o agente de adaptação do Semantia. |
| RN15 | O produto não promete tradução completa para Libras nem substituição de intérprete humano. |
| RN16 | Estado implementado, planejado e legado deve permanecer explícito na documentação. |
| RN17 | Sala e reunião são o mesmo conceito no MVP; `RoomSession` é detalhe interno e não pode gerar preparação, início manual ou histórico aninhado na UX. |

## Casos de uso canônicos

### UC01 — Abrir reunião instantânea

**Ator:** anfitrião autenticado.

1. Clica em **Nova reunião**.
2. O backend cria atomicamente a reunião já ao vivo.
3. O frontend entra imediatamente na experiência de transcrição.
4. O anfitrião copia o link/token de convite gerado.
5. Quando necessário, configura o contexto já dentro da reunião, sem bloquear a entrada.

**Resultado:** reunião ao vivo pronta para uma fonte principal de transcrição, sem etapa de
preparação ou início manual.

### UC02 — Entrar como convidado

**Ator:** participante.

1. Abre o link de convite.
2. Informa nome de exibição.
3. Entra sem criar conta.
4. Recebe snapshot e eventos subsequentes da reunião autorizada.

**Resultado:** identidade efêmera vinculada somente à reunião.

### UC03 — Publicar transcrição

**Ator:** comunicador/anfitrião.

1. Autoriza o microfone.
2. Publica parciais efêmeras.
3. Confirma segmentos finais.
4. Backend limpa e persiste o literal.
5. Agente tenta produzir o adaptado.

**Resultado:** legenda contínua, com fallback literal.

### UC04 — Escolher experiência de leitura

**Ator:** participante.

1. Escolhe literal ou adaptada.
2. Acompanha o karaokê.
3. Rola para reler.
4. Retorna ao trecho ao vivo.
5. Troca o modo sem afetar os demais.

### UC05 — Encerrar e administrar dados

**Ator:** anfitrião.

1. Encerra a reunião.
2. Consulta transcript/chat durante a retenção.
3. Exclui antes do prazo quando necessário.
4. Na ausência de exclusão manual, o sistema apaga o conteúdo após 30 dias.

### UC06 — Usar interações complementares

**Atores:** anfitrião, moderador futuro e participantes.

Chat, mãos levantadas, mídia, VLibras e análise sentimental seguem permissões e consentimentos
próprios e não podem interromper o fluxo de transcrição.

## Matriz de rastreabilidade para o ClickUp

| Faixa | Cobertura |
|---|---|
| Cards 01–02 | Contrato, glossário, requisitos e migração do domínio. |
| Cards 03–05 | UX acessível, contexto da plateia e preferências individuais. |
| Cards 06–09 | Captura, limpeza, agente e karaokê. |
| Cards 10–11 | Privacidade, retenção e validação full-stack. |
| Cards 12–16 | Complementos e produção após o gate do núcleo. |
| Card 17 | Validação com público e atualização do TCC. |
| Card 18 | Funcionalidades secundárias sem competir com o núcleo. |

Links individuais estão em
[`../planejamento/2026-07-29-registro-tasks-clickup-mvp-transcricao.md`](../planejamento/2026-07-29-registro-tasks-clickup-mvp-transcricao.md).

## Contradições conhecidas e tratamento

- `PROFESSOR`/`ALUNO`, turmas e rotas `/aula` continuam integrados em `dev`, mas foram removidos do
  contrato ativo na branch de generalização e cobertos por migration preservadora.
- Não existe agente de IA nem preferência adaptada.
- Não existe expiração de transcript/chat/metadados nem política automática de 90 dias para logs técnicos.
- Documentos do Desafio Interdisciplinar de junho são snapshots históricos e não descrevem o
  backend atual nem o MVP vigente.
