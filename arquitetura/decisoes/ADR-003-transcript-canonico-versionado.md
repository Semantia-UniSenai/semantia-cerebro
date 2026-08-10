---
id: ADR-003
status: aceita
proposta: 2026-08-06
validado: 2026-08-10
decisores: [Foyth]
relaciona: ADR-002
---

# ADR-003 — transcript canônico conservador e versionado por segmento

## Contexto

O ASR interno produz texto final sujeito a hesitações, vícios e repetição imediata. O futuro agente de
adaptação precisa de uma entrada estável, mas uma limpeza agressiva pode apagar negações, nomes,
números ou construções válidas. Também era necessário distinguir registros históricos de textos
produzidos por uma estratégia nova sem persistir o bruto reconhecido.

Resultado vazio após a limpeza cria outro problema: não deve aparecer como legenda, mas um ACK perdido
não pode causar inferência ASR repetida indefinidamente. A solução precisa preservar as guardas de
ordem, idempotência e retenção zero do Card 06.

## Decisão

1. `text` é o único transcript literal canônico persistido.
2. O texto bruto do ASR permanece efêmero na memória da chamada e não é duplicado.
3. A limpeza é função pura, síncrona, determinística e sem rede ou LLM.
4. Remover somente hesitações e marcadores inequivocamente discursivos; ambiguidade permanece.
5. Preservar nomes, números, negações, Unicode, caixa e repetição pontuada.
6. Identificar cada novo segmento com a estratégia imutável `pt-br-conservative-v1`.
7. Identificar registros/eventos sem versão como `legacy-unversioned`.
8. Adicionar `cleaningStrategyVersion TEXT NOT NULL DEFAULT 'legacy-unversioned'` por migration aditiva.
9. Propagar a versão no REST, snapshot Socket.IO, `transcript:final` e tipos web, sem mudança visual.
10. Se o canônico ficar vazio, não inserir, não consumir `seq` e não emitir `transcript:final`, mas
    concluir o ACK.
11. Reutilizar o cache no-speech para replay sem ASR, com TTL de 120 segundos e limite global de 512
    entradas sem texto/áudio.
12. Preservar a transação, a unicidade `(sessionId, clientSegmentId)`, a serialização por sessão e o
    limite de fila existentes.
13. Mudança futura de regra gera nova versão; o significado da `v1` nunca é alterado retroativamente.

## Alternativas rejeitadas

### Persistir texto bruto e limpo

Rejeitada por duplicar conteúdo identificável, ampliar retenção e tornar o bruto um contrato acidental.
A rastreabilidade necessária é atendida pela versão da estratégia.

### Usar LLM para “corrigir” o ASR

Rejeitada por custo, latência, não determinismo e risco de inventar conteúdo. Adaptação por IA é uma
camada posterior e opcional.

### Marcar todo histórico como `v1`

Rejeitada porque atribuiria uma estratégia que não produziu aqueles textos.

### Persistir tombstone para ruído

Rejeitada por criar retenção desnecessária. O replay efêmero atende o TTL de entrega do navegador; um
restart pode reinferir, mas não guarda conteúdo.

### Colapsar toda repetição

Rejeitada porque pontuação pode representar ênfase, correção ou negação legítima.

## Consequências positivas

- uma fonte literal estável para UI e Card 08;
- rastreabilidade e rollback por segmento;
- compatibilidade com código antigo durante rollback;
- zero query, hop de rede ou dependência nova no caminho crítico;
- ruído puro não vira linha vazia nem retry infinito;
- regras semanticamente arriscadas permanecem fora do filtro.

## Custos e riscos

- heurísticas conservadoras deixam alguns vícios no texto;
- cache efêmero não sobrevive a restart;
- a versão aumenta o contrato público e exige sincronização web;
- corpus sintético não substitui validação com fala espontânea e público real;
- regexes futuras podem introduzir falso positivo ou custo, por isso exigem corpus positivo/negativo e
  benchmark de 5.000 caracteres.

## Guardas

- entrada textual máxima de 5.000 caracteres já validada pelo pipeline;
- p95 de cada perfil do benchmark deve ficar em até 1 ms;
- resultado vazio recebe ACK conclusivo e não publica final;
- cache no-speech: 120 s, no máximo 512 entradas, sem texto ou áudio;
- migration aditiva com default legado e prova fresh/N−1;
- nenhum conteúdo humano real entra em corpus/evidência sem anonimização e autorização explícita;
- API/web permanecem em PR para revisão; não há merge automático.

## Reavaliação

Criar ADR nova e `pt-br-conservative-v2` quando uma regra mudar. Exigir caso sintético de remoção,
caso negativo equivalente, verificação de idempotência, benchmark máximo, migration/compatibilidade se
o contrato mudar e validação humana autorizada antes de promover heurísticas mais agressivas.
