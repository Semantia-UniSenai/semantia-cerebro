---
title: Glossário canônico do Semantia
status: canônico
atualizado: 2026-07-30
---

# Glossário canônico do Semantia

Este glossário orienta documentação, interface, código novo e cards. Termos educacionais podem
ser usados em materiais históricos ou em uma vertical escolar, mas não como nomes do domínio
central.

## Termos do produto

### Reunião

Encontro instantâneo que reúne anfitrião, participantes, convite, transcrição e interações. É
aberto com um clique e já nasce ao vivo. **Sala e reunião são o mesmo conceito no MVP.** Uma escola
ainda pode chamá-la de aula ou turma na interface de uma vertical, sem alterar o modelo central.

### Registro interno de ciclo de vida

`RoomSession` delimita tecnicamente presença, transcrição, chat e encerramento. Não é um conceito
exposto na interface: não há criação, preparação, início manual nem histórico de sessões dentro de
uma reunião.

### Anfitrião

Pessoa autenticada que abre, configura durante o uso, encerra e administra a reunião. Substitui
**professor** como papel de autorização. Professor continua sendo uma ocupação possível do
anfitrião.

### Comunicador

Pessoa cuja fala alimenta a transcrição. No MVP, anfitrião e comunicador são a mesma pessoa. O
termo existe para permitir, no futuro, palestrante e organizador diferentes.

### Participante

Pessoa que entra para acompanhar a comunicação e escolher a apresentação da legenda. Substitui
**aluno** como papel de domínio. Um estudante é um participante na vertical educacional.

### Convidado

Participante que entra por link/token e usa uma identidade efêmera da reunião, sem conta
obrigatória.

### Plateia

Perfil coletivo informado pelo anfitrião para orientar a adaptação: tipo de encontro, faixa
etária, familiaridade com português escrito, domínio e nível de simplificação. Não representa um
usuário ou permissão.

### Contexto da plateia

Configuração feita já dentro da reunião para orientar o agente de adaptação. Alterações exigem
versionamento explícito e valem para os segmentos seguintes; abrir a reunião nunca depende desse
formulário.

### Segmento parcial

Hipótese temporária do reconhecimento de fala. É efêmero, literal, substituível e não deve ser
persistido nem enviado à IA.

### Segmento final

Trecho confirmado pelo reconhecimento de fala. Recebe sequência estável, passa pela limpeza e
pode gerar as versões literal e adaptada.

### Transcript literal

Texto final após limpeza conservadora de disfluências. É a versão canônica e o fallback sempre
disponível.

### Transcript adaptado

Versão de leitura facilitada produzida pelo agente a partir do texto literal e do contexto da
plateia. Deve preservar fatos, intenção, nomes, números e termos essenciais. Não deve ser chamado
de tradução para Libras.

### Legenda karaokê

Apresentação em linhas curtas que acompanha a fala, destaca o trecho atual e permite reler sem
perder o retorno ao vivo.

### Intérprete digital

Camada opcional de apresentação por avatar, inicialmente via VLibras. Não é sinônimo do agente de
adaptação e não substitui intérprete humano.

### Moderador

Papel contextual para apoiar controle de participantes, configuração e encerramento. Não concede
privilégios globais fora da reunião autorizada.

## Substituições obrigatórias

| Legado | Canônico | Uso permitido do legado |
|---|---|---|
| turma | reunião ou sala | material histórico ou vertical escolar |
| aula | reunião | material histórico ou copy escolar |
| sessão | registro interno de ciclo de vida | código, banco e arquitetura; não usar na jornada do MVP |
| professor | anfitrião ou comunicador | ocupação da pessoa em contexto escolar |
| aluno | participante | ocupação da pessoa em contexto escolar |
| classe escolar | sala | modelo legado até a migração |
| tradução/adaptação para Libras | texto acessível adaptado | somente quando houver tradução real por solução própria/terceira |
| motor de glosas | agente de adaptação textual | histórico do protótipo antigo |
| texto do professor | fala do comunicador | material histórico |

## Regras de escrita

- Usar linguagem abrangente em novas telas, APIs e documentos.
- Diferenciar **implementado**, **planejado** e **legado** sempre que o estado não for óbvio.
- Não transformar “plateia” em papel de autorização.
- Não chamar texto adaptado de Libras.
- Não afirmar que VLibras é tecnologia própria do Semantia.
- Não chamar o Semantia de produto exclusivamente escolar.
