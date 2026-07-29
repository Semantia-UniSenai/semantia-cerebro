---
name: "semantia-cerebro-sync"
description: "Atualização cerebral do Semantia: mantém o repo semantia-cerebro fiel (decisões, regras de negócio, arquitetura, integrações, código, docs) e commita."
status: active
version: "v1"
---

# Semantia — Atualização Cerebral (cerebro-sync)

> Skill sempre-ativa. Cópia versionada aqui no próprio cérebro; também vive como skill
> do agente (OpenClaw Skill Workshop). Mantenha as duas em sincronia.

Mantém o **semantia-cerebro** — a memória de longo prazo do projeto Semantia — **fiel à
realidade**. Toda decisão, regra de negócio, mudança de arquitetura, integração, lógica de
código relevante, documento ou material novo é registrado lá e **commitado**. Se não está no
cérebro, é como se não tivesse acontecido.

Princípio: o cérebro é fiel ao **que é verdade hoje** (código, decisões reais), não ao que se
imaginou. Atualização no **mesmo fluxo** da mudança, não depois.

## Quando ativar (gatilhos) — constantemente

Ative ao trabalhar em **qualquer** repo do Semantia (`semantia-web`, `semantia-api`,
`semantia-cerebro`) ou conversar sobre o projeto, sempre que ocorrer:

- Uma **decisão** de produto, técnica ou de negócio (escopo, free vs Pro, prioridades).
- Mudança/definição de **regra de negócio**.
- Mudança de **arquitetura**, stack, modelagem de dados ou estrutura de pastas.
- Nova ou alterada **integração** (ex.: VLibras, Signbank/UFSC, Paper Design shaders, futura IA/MediaPipe).
- **Lógica de código** relevante criada/alterada (fluxos, motor semântico, auth, ferramentas).
- Chegada de **documento/material** novo (PDF, docx, imagem, referência, ata).
- Mudança de **identidade** (logo, slogan, marca) ou de **roadmap**.

Na dúvida entre registrar e não: se isso muda o entendimento do projeto para um humano ou IA
que chegar depois, **registra**.

## Onde fica o cérebro

- Local: `/home/foyth/semantia/semantia-cerebro`
- Remoto: `github.com/Semantia-UniSenai/semantia-cerebro` (privado) · branch **`main`**

Estrutura (crie subpastas novas quando fizer sentido):

```
projeto/         Documentos oficiais do TCC e da inscrição INOVA
referencias/     Artigos e material de estudo
identidade/      Logo, infográfico, marca
contexto/        Histórico vivo e decisões (historico-e-decisoes.md)
arquitetura/     (criar) Decisões de arquitetura, diagramas, modelagem
regras-negocio/  (criar) Regras de negócio e do produto
integracoes/     (criar) Como cada integração funciona e gotchas
skills/          Esta e outras skills versionadas do projeto
```

## O que registrar e como

- **Decisões:** o **quê**, o **porquê** e o **quando** (data absoluta). Inclua alternativas
  descartadas quando ajudar.
- **Regras de negócio:** enunciado claro + motivação. Free vs Pro (o "ouro" = motor de
  adaptação semântica) é regra central.
- **Arquitetura/integrações:** como funciona, dependências, gotchas, credenciais (referência ao
  local seguro — **nunca** commitar segredo).
- **Markdown** para pensamento/decisão/spec; `.docx`/`.pdf` para documentos formais; imagens em
  `identidade/` ou junto do material.
- **Atualize o arquivo existente** em vez de duplicar. Nomes descritivos. Linke arquivos relacionados.
- Mantenha `contexto/historico-e-decisoes.md` como o **log corrido** do projeto.

## Threshold — o que NÃO registrar

- Ruído trivial (typo, ajuste cosmético sem decisão por trás).
- O que o próprio código/README já documenta de forma óbvia.
- Conversa efêmera sem decisão. Registre a **decisão destilada**, não o transcript.

## Nunca commitar segredo

Tokens, chaves e credenciais (ex.: Trello, GitHub) ficam **fora** do repositório
(`~/.config/...`, `600`). No cérebro só referencie o **local** e o **propósito**, nunca o valor.

## Ritual de commit (sempre)

Após registrar, **commit + push** no `semantia-cerebro` (`main`):

```bash
cd /home/foyth/semantia/semantia-cerebro
git add -A
git -c user.name="CaueFoyth" -c user.email="foythcaue@gmail.com" \
  commit -m "docs: <resumo curto da atualização do cérebro>"
git push
```

- Mensagens **PT-BR**, conventional (`docs:`/`chore:`).
- Autor = **CaueFoyth**. **Nunca** adicionar `Co-Authored-By: Claude` nem footer "Generated with Claude".
- Commits pequenos e temáticos.

## Checklist por sessão de Semantia

1. Houve decisão/mudança relevante? → registra no arquivo certo do cérebro.
2. Documento/material novo? → salva na pasta certa com nome descritivo.
3. Atualizou `historico-e-decisoes.md`?
4. Segredo nenhum no diff?
5. `commit + push` na `main` antes de encerrar.
