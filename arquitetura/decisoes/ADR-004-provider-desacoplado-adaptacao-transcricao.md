---
id: ADR-004
status: aceita
proposta: 2026-08-10
decisores: [Foyth]
relaciona: ADR-003
---

# ADR-004 — adaptação assíncrona com provider desacoplado e fallback literal

## Contexto

O Card 07 entrega um transcript literal canônico, conservador e versionado. O diferencial do Semantia
exige uma segunda forma textual mais direta para pessoas surdas, mas modelos generativos podem inventar,
omitir ou alterar números, nomes, negações, condições e instruções. Um fornecedor temporário também não
pode virar dependência do domínio nem destino silencioso de dados em caso de falha local.

O contexto da plateia existe no banco, mas ainda não possui versão e não pode ser atualizado depois que a
reunião instantânea entra em `LIVE`. Isso impede atribuir cada adaptação ao contexto que realmente a
produziu.

## Decisão

1. O literal canônico permanece fonte de verdade e é emitido antes da IA.
2. A adaptação é derivação assíncrona, persistida separadamente e ligada ao mesmo segmento/`seq`.
3. O domínio depende de `TranscriptAdaptationProvider`.
4. O MVP contém providers `fake`, `disabled` e `groq`; Groq é temporário e selecionado por configuração.
5. O modelo inicial de spike é `openai/gpt-oss-20b`, sujeito a corpus e revisão humana.
6. A saída usa JSON Schema estrito e Zod, mas também passa por invariantes determinísticas independentes.
7. Números, datas, unidades, entidades detectáveis, negações, modalidade, condições e comandos são
   protegidos.
8. Conteúdo urgente/perigoso e fragmento ambíguo priorizam literal.
9. Timeout, retry limitado, circuit breaker, fila limitada e deduplicação ficam fora do adapter.
10. Qualquer falha materializa o literal; nunca há fallback silencioso para outro provider.
11. O contexto ganha versão monotônica; cada adaptação persiste versão e snapshot usados.
12. Chaves ficam somente no ambiente backend/secret manager; logs e banco nunca recebem segredo,
    reasoning ou prompt completo.
13. Groq permanece desabilitada por padrão; desenvolvimento externo usa apenas corpus sintético.
14. A saída é “português adaptado automaticamente”, não Libras nem substituta de intérprete.
15. Aceitação linguística exige participação de pessoas surdas.

## Alternativas rejeitadas

### Campo `adaptedText` no próprio segmento

Rejeitado porque mistura fonte canônica com derivação falível e dificulta estados, retries e auditoria.

### Chamada síncrona antes do literal

Rejeitada porque indisponibilidade, latência ou cota da IA interromperiam a acessibilidade básica.

### Fallback Groq → OpenAI/Gemini/Ollama

Rejeitado porque transfere dados a outro destino sem decisão explícita e mascara indisponibilidade.

### Confiar em `preservedMeaning: true`

Rejeitado porque seria o modelo avaliando a própria resposta. O backend mantém guardas independentes e
revisão humana.

### Um prompt/perfil universal “para surdos”

Rejeitado por homogeneizar pessoas com experiências linguísticas diferentes. O contexto usa opções
explícitas e, sem contexto, o resultado é literal.

### Tradução textual para “gramática de Libras”

Rejeitada. Libras possui estrutura própria; adaptação em português não é tradução para língua de sinais.

## Consequências positivas

- literal nunca depende do provedor;
- troca de fornecedor é localizada;
- uma chamada atende toda a sala;
- falhas são auditáveis e visíveis por código;
- contexto e prompt são reproduzíveis por versão;
- segurança semântica não depende só do schema/modelo;
- a futura preferência individual usa dois fluxos com o mesmo `seq`.

## Custos e riscos

- tabela e estados adicionais;
- fila local não garante reprocessamento em múltiplas instâncias;
- guardas regex/lexicais não provam equivalência completa;
- segmentos fixos de 5 s podem terminar no meio de uma frase;
- cota organizacional pode limitar salas simultâneas;
- dados reais exigem governança internacional antes de uso;
- revisão com comunidade exige agenda e participação remunerada quando aplicável.

## Guardas

- fake obrigatório em CI;
- Groq opt-in e desabilitada por padrão;
- somente canônico final no request;
- sem áudio, ASR bruto, JWT, join token ou dados pessoais desnecessários;
- uma tentativa lógica por segmento e replay sem reinferência;
- fila/timeout/circuito com testes determinísticos;
- migration fresh e N-1;
- E2E Socket.IO com PostgreSQL real;
- corpus sintético adversarial;
- zero erro semântico crítico na amostra aceita;
- PRs permanecem em revisão e sem auto-merge.

## Reavaliação

Criar nova ADR quando:

- o sistema passar a múltiplas instâncias e precisar de outbox/worker durável;
- um provider/modelo novo for promovido;
- houver janela de contexto entre segmentos;
- as regras de adaptação mudarem e exigirem `pt-br-accessible-v2`;
- avaliação com pessoas surdas alterar os perfis ou critérios;
- o Card 10 definir requisitos adicionais de retenção ou residência de dados.
