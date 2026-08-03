---
title: Glossário canônico do Semantia
status: canônico
atualizado: 2026-07-29
---

# Glossário canônico do Semantia

Este glossário orienta documentação, interface, código novo e cards. Termos educacionais podem
ser usados em materiais históricos ou em uma vertical escolar, mas não como nomes do domínio
central.

## Termos do produto

### Sala de comunicação

Espaço lógico que reúne anfitrião, participantes, configuração de contexto e sessões. Substitui
**turma** como agregado genérico. Uma escola ainda pode chamar uma sala de turma na interface da
vertical educacional, sem alterar o modelo central.

### Sessão ao vivo

Período com início e fim em que há presença, transcrição e interação em tempo real. Substitui
**aula ao vivo** no domínio central.

### Anfitrião

Pessoa autenticada que cria, configura, inicia, encerra e administra a sala. Substitui
**professor** como papel de autorização. Professor continua sendo uma ocupação possível do
anfitrião.

### Comunicador

Pessoa cuja fala alimenta a transcrição. No MVP, anfitrião e comunicador são a mesma pessoa. O
termo existe para permitir, no futuro, palestrante e organizador diferentes.

### Participante

Pessoa que entra para acompanhar a comunicação e escolher a apresentação da legenda. Substitui
**aluno** como papel de domínio. Um estudante é um participante na vertical educacional.

### Convidado

Participante que entra por link/token e usa uma identidade efêmera da sessão, sem conta
obrigatória.

### Plateia

Perfil coletivo informado pelo anfitrião para orientar a adaptação: tipo de encontro, faixa
etária, familiaridade com português escrito, domínio e nível de simplificação. Não representa um
usuário ou permissão.

### Contexto da plateia

Configuração estável durante a sessão que orienta o agente de adaptação. Mudanças depois de a
sessão entrar ao vivo exigirão versionamento explícito; o MVP não altera o contexto silenciosamente.

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

Papel futuro para apoiar controle de participantes e interações. Não bloqueia a primeira entrega
do núcleo.

## Substituições obrigatórias

| Legado | Canônico | Uso permitido do legado |
|---|---|---|
| turma | sala de comunicação | material histórico ou vertical escolar |
| aula | sessão ao vivo | material histórico ou copy escolar |
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
