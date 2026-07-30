# Sala ao vivo — fundação implementada e arquitetura-alvo

> **Status em 2026-07-29:** a sala educacional foi implementada e é uma fundação reutilizável.
> O contrato vigente é uma sala genérica de comunicação acessível. Use este documento junto ao
> [contrato canônico](../produto/contrato-mvp-transcricao-tempo-real.md), ao
> [glossário](../produto/glossario.md) e aos
> [requisitos atuais](../requisitos/mvp-transcricao-tempo-real.md).

## Fronteira entre realidade e alvo

| Área | Implementado em `dev` | Contrato atual ainda planejado |
|---|---|---|
| Papéis | `PROFESSOR` e `ALUNO` autenticados | anfitrião/comunicador e participante/convidado |
| Agregado | `SchoolClass`/`ClassMember` | sala genérica sem dependência escolar |
| Entrada | conta JWT + turma ou `joinToken` | convidado por link/token sem conta |
| Transcript | uma versão literal limpa | literal + adaptada por segmento |
| Contexto | título da sessão | perfil da plateia estável |
| Retenção | persistência sem expiração | exclusão antecipada e automática em 30 dias |
| Capacidade | não comprovada por carga | alvo de 50 conexões, condicionado a teste |
| Duração | sem limite explícito | até 4 horas por sessão |

O código legado não deve ser descrito como inexistente, nem o alvo como já entregue.

## Modelo implementado

- `User.role`: `PROFESSOR` ou `ALUNO`.
- `SchoolClass` e `ClassMember`: turma e associação de alunos.
- `LiveSession`: título, dono (`teacherId`), turma opcional, `joinToken`, status, início e fim.
- `TranscriptSegment`: `sessionId`, sequência, texto literal e data.
- `ChatMessage`: sessão, usuário, texto e data.
- `Score`: datilologia/ranking, fora do núcleo atual.

A migração para sala genérica deve preservar dados históricos e ser tratada em migration
separada. Renomear copy sem mudar permissões/modelo não conclui a generalização.

## Fluxo implementado da transcrição

```text
Comunicador no browser                   API                         Participantes
Web Speech API ─ parcial ─▶ transcript:partial ─▶ broadcast ─▶ legenda parcial
Web Speech API ─ final ───▶ transcript:final ───▶ usecase ──▶ persistência + broadcast
                                                   │
                                                   └─ stripDisfluencies()
```

- Parciais são efêmeras, literais e não persistidas.
- Finais recebem limpeza conservadora dentro do `AppendTranscriptSegmentUseCase`.
- Frase 100% ruído retorna `seq: null` e não é persistida nem emitida.
- Sequência e transcript sobrevivem à sessão.
- O navegador Brave pode emitir erro `network` no SpeechRecognition; o front trata repetição como
  falha fatal em vez de reiniciar indefinidamente.

## Arquitetura-alvo do pipeline

```text
áudio do navegador
  → STT parcial (efêmero)
  → STT final
  → limpeza conservadora no backend
  → transcript literal canônico + persistência
  → fila de adaptação contextual
  → transcript adaptado OU fallback literal
  → preferência individual + legenda karaokê
```

Regras:

1. Apenas finais entram na limpeza, persistência e IA.
2. O texto literal limpo não pode depender do provedor de IA.
3. O agente recebe contexto da plateia e preserva fatos, nomes, números e intenção.
4. Timeout/erro da IA não bloqueia a legenda; o literal continua.
5. Uma adaptação por sala/contexto é preferida a uma chamada por participante.
6. Tokens do provedor ficam somente em variável de ambiente do backend.
7. Metadados de versão, latência e status podem ser auditados sem copiar transcript para logs.
8. A preferência literal/adaptada é apresentação individual, não uma nova geração por usuário.

## Protocolo Socket.IO implementado

Namespace `/live`, handshake autenticado por JWT e room `session:<id>`.

Eventos cliente → servidor:

- `session:join/leave/end`;
- `transcript:partial/final`;
- `chat:send`;
- `hand:raise/lower`.

Todo evento é reconhecido com `{ ok: true, ... }` ou
`{ ok: false, error: { code, message } }`. O gateway é fino e delega acesso, propriedade e
persistência aos mesmos usecases usados pela API REST.

## Evolução necessária do protocolo

- permitir identidade efêmera de convidado sem aceitar JWT arbitrário;
- transmitir contexto/versionamento da sessão;
- relacionar literal e adaptado pelo mesmo `seq`;
- emitir status da adaptação e fallback sem expor prompts;
- separar papel de anfitrião/comunicador de ocupações como professor;
- aplicar limites de presença, reconexão e capacidade medidos;
- proteger consulta pós-sessão pela política de retenção.

## Legenda karaokê

A fundação literal já possui linhas curtas, trecho atual em destaque, releitura, retorno ao vivo,
tamanho persistido, `aria-live` e respeito a movimento reduzido. O alvo deve adicionar:

- escolha literal/adaptada sem perder posição;
- estado visual de adaptação atrasada sem “pular” contexto;
- fallback explícito e não alarmista;
- QA de contraste, teclado, leitores de tela, mobile e baixa conectividade.

## Ciclo de vida e privacidade-alvo

- anfitrião autenticado cria e encerra;
- convidado entra por token restrito à sessão;
- duração máxima de 4 horas;
- áudio não é gravado nem armazenado;
- transcript/chat e metadados identificáveis retidos por 30 dias e removíveis antes;
- conteúdo, nomes, tokens e IDs de participante não entram em logs operacionais; logs técnicos
  mínimos expiram ou são agregados após 90 dias;
- sessão suporta alvo de 50 conexões somente após teste de carga.

Esses itens são contrato planejado enquanto não houver migration, usecases, jobs de expiração e
testes correspondentes.

## Evidência de testes disponível

Em 2026-07-04, a API registrava 138 testes Jest e o front 91 testes Vitest, incluindo gateway,
usecases, limpeza e palco de legenda. Essas contagens são evidência histórica, não prova dos
requisitos planejados neste documento. Cada card deve executar gates frescos.
