# 🧠 semantia-cerebro

Biblioteca de **contexto** do projeto **Semantia** — para IAs e humanos.

Aqui mora **tudo** sobre o Semantia: cada pensamento, ideia, decisão, documento,
referência e material de estudo. É a memória de longo prazo do projeto. Antes de
qualquer agente de IA (ou pessoa nova) trabalhar no Semantia, o contexto vem **daqui**.

> **Regra de ouro:** decisão tomada → registrada aqui. Documento recebido → guardado aqui.
> Se não está no cérebro, é como se não tivesse acontecido.

## O que é o Semantia

Plataforma web de **comunicação acessível em tempo real** para aproximar pessoas ouvintes
que não sabem Libras e pessoas surdas em escolas, empresas, palestras, eventos e comunidade.
O núcleo é um pipeline de fala → texto → limpeza de disfluências → **adaptação por agente de
IA** → legenda karaokê, com escolha individual entre transcrição literal e adaptada.

A adaptação semântica continua sendo o diferencial, mas o produto não fica mais limitado a
conteúdo educacional ou sala de aula. TCC do curso de Análise e Desenvolvimento de Sistemas,
UNISENAI Joinville (jul–dez/2026), também submetido ao INOVA SENAI.

**Slogan:** _Inclusão não é adaptação, é o padrão._

## Estrutura

```
projeto/        Documentos oficiais do TCC e da inscrição INOVA
                (projeto, detalhamentos, canvas, casos de uso, orientações)
referencias/    Material de estudo e artigos científicos de base
identidade/     Logo e infográfico da marca
contexto/       Histórico de desenvolvimento, decisões e gotchas (vivo)
planejamento/   Backlogs, planos e divisão de entregas do produto
```

## Repositórios do Semantia (org `Semantia-UniSenai`)

- **semantia-web** — front-end da plataforma (Vue 3 + Vite).
- **semantia-api** — backend NestJS, PostgreSQL, REST/Socket.IO e pipeline de transcrição.
- **semantia-cerebro** — este repositório: contexto e memória do projeto.

## Como contribuir com o cérebro

- Markdown (`.md`) para pensamentos, decisões, specs e anotações.
- `.docx` / `.pdf` para documentos formais e referências.
- Imagens em `identidade/` ou junto do material que ilustram.
- Nomes descritivos. Quando registrar uma decisão, diga **o quê**, **por quê** e **quando**.
