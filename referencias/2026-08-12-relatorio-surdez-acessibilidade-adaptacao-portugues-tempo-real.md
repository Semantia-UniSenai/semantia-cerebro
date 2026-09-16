---
title: Síntese auditável — surdez, acessibilidade e adaptação de português escrito em tempo real
status: referencia-recebida-auditada-parcialmente
data: 2026-08-12
pdf: 2026-08-12-relatorio-surdez-acessibilidade-adaptacao-portugues-tempo-real.pdf
sha256_pdf: 1a83440560da40603691b68676b8630d3684881280a01a649e98052e2cd7c8f5
---

# Síntese auditável do relatório de acessibilidade textual

## Proveniência e escopo da auditoria

O PDF recebido em 2026-08-12 tem 28 páginas A4, camada textual completa, 417.297 bytes e SHA-256
`1a83440560da40603691b68676b8630d3684881280a01a649e98052e2cd7c8f5`.

O próprio relatório se classifica como **mapeamento profundo de evidências**, não como revisão sistemática
PRISMA concluída. Scopus, Web of Science, PsycINFO e Portal CAPES não foram consultados diretamente por
interfaces autenticadas durante sua produção. Portanto, não se deve apresentar o documento como revisão
sistemática exaustiva nem inventar números de triagem, exclusão ou deduplicação.

A auditoria local confirmou:

- 28/28 páginas com texto extraível;
- 49 menções de URL e 26 ocorrências brutas do padrão DOI no texto extraído;
- os DOIs nucleares normalizados foram resolvidos em Crossref, incluindo estudos sobre compreensão leitora
  de pessoas surdas, simplificação de material de saúde, qualidade acústica de legendas automáticas e perda
  factual em simplificação textual;
- alguns DOIs aparentavam falhar apenas porque o PDF introduziu quebra de linha ou anexou parâmetros
  `utm_source`; após normalização, os registros correspondentes foram resolvidos.

Essa conferência prova existência e metadados bibliográficos, não reproduz análise de método, amostra,
estatística e validade externa de cada artigo. A incorporação de regras ao produto continua condicionada à
leitura crítica das fontes primárias e à validação com pessoas surdas.

## Conclusões científicas aceitas como direção

1. Não existe base para um único estilo de “português para surdos”. A população é heterogênea em aquisição
   linguística, Libras, português escrito, escolarização, fluência, vocabulário, morfologia, ortografia,
   experiência de leitura e preferências.
2. Idade cronológica, diagnóstico e uso de Libras não são substitutos seguros de proficiência ou preferência
   de leitura. `ageRange` não deve controlar silenciosamente léxico, tom ou intensidade de adaptação.
3. Frase menor não é sinônimo de frase mais clara. Simplificação pode omitir informação, inverter relações
   e aumentar vagueza.
4. Preservação semântica tem precedência sobre redução de tamanho. Literal continua soberano e disponível.
5. Termos técnicos devem ser preservados. Glosas só podem vir de glossário aprovado e versionado; o modelo
   não deve inventar definições.
6. Preferências individuais são mais defensáveis que um único perfil “da plateia surda”: literal/adaptado,
   intensidade escolhida, tratamento de termos técnicos, referentes explícitos e ritmo de apresentação.
7. Métricas automáticas e preferência subjetiva não provam compreensão. Promoção exige estudo participativo
   com pessoas surdas, medindo compreensão factual/inferencial, esforço, tempo e erros críticos.
8. Adaptação de uma entrada ASR errada pode produzir texto fluente e falso. O sistema precisa tratar qualidade
   da entrada antes de permitir reescrita generativa.

## Regras candidatas para `pt-br-accessible-v2`

As regras abaixo são candidatas conservadoras. O prompt não as transforma em garantia científica.

- preservar entidades, números, datas, horários, unidades, negação, modalidade, condições, causalidade,
  ordem temporal, perguntas, comandos, exceções e urgência;
- preservar agente, ação, paciente e destinatário;
- permitir pontuação, divisão de oração e ordem mais direta somente quando as relações permanecerem
  verificáveis;
- não resolver pronome com mais de um antecedente plausível;
- não completar fragmento nem usar conhecimento externo;
- usar `decision=literal` para ambiguidade, fragmento/contexto insuficiente, risco de preservação, conteúdo
  crítico incerto ou preferência literal;
- fazer todo risco diferente de `none` produzir fallback/bypass conservador;
- registrar IDs das regras aplicadas e motivo tipado, sem usar confiança autodeclarada pelo modelo para
  autorizar a própria saída.

Schema candidato do relatório:

```json
{
  "adaptedText": "string",
  "decision": "adapted | literal",
  "risk": "none | urgent | ambiguous | preservation-risk | fragment | context-insufficient",
  "appliedRuleIds": ["LEX-01", "SYN-02"],
  "verifierRequired": true,
  "reasonCode": "string"
}
```

## Formulário e personalização

Direção recomendada:

- `meetingType`: manter como domínio operacional/criticidade, não como proxy de capacidade;
- `ageRange`: opcional e fora do cálculo automático da intensidade;
- `portugueseFamiliarity`: substituir rótulo abstrato por preferência demonstrada com exemplos A/B;
- `domain`: manter para preservar terminologia e selecionar glossário aprovado;
- `simplificationLevel`: renomear para intensidade preferida, definida por operações autorizadas;
- adicionar escolha individual `literal | adaptado | ambos`;
- adicionar preferência para termos técnicos e referentes explícitos;
- separar ritmo/tamanho visual de transformação semântica;
- classificar criticidade da sala: saúde, jurídico, segurança, emergência e instrução operacional exigem
  conservação mais forte.

Nenhuma dessas combinações de formulário foi cientificamente validada como produto pronto. Elas são
hipóteses apoiadas pela heterogeneidade observada e devem ser testadas.

## Níveis por operações, não por contagem arbitrária

- **Leve:** pontuação, quebra visual e pequenas reordenações inequívocas.
- **Moderada:** leve + divisão de orações, referente explícito quando unívoco e redução segura de
  nominalizações.
- **Alta:** moderada + maior oportunidade de léxico frequente e sintaxe menos encaixada, sem relaxar nenhuma
  invariável e sem resumir livremente.

Limites universais de palavras por frase, CPS, WPM ou quantidade de contexto anterior permanecem hipóteses.

## Guardas em camadas

1. Determinística: entidades, valores, códigos, datas, unidades e marcadores de negação/modalidade.
2. Relacional: agente–ação–paciente/destinatário, condição–consequência, causa, sequência e modalidade.
3. Sinais complementares: NLI bidirecional e QA de consistência, nunca tratados isoladamente como prova.
4. Contexto crítico ou dúvida residual: literal ou revisão humana.

A v1 implementa principalmente a primeira camada. Ela ainda não prova equivalência relacional.

## Incidente real de 2026-08-12 — registro agregado e sem conteúdo

Uma reunião local autorizada de aula de Python produziu 16 segmentos canônicos em aproximadamente 80 s.
O conteúdo não foi copiado para este repositório. O áudio foi corretamente descartado sob retenção zero.

Evidências agregadas:

- 16 segmentos literais persistidos com `pt-br-conservative-v1`;
- o texto exportado pelo usuário coincidiu exatamente com o literal do PostgreSQL após normalização;
- contexto salvo: domínio escolar/Python, público adulto, preferência leve;
- 10 adaptações `SUCCEEDED`, das quais 6 eram idênticas ao literal e 4 alteraram texto;
- 6 fallbacks `PRESERVATION_FAILED`;
- o frontend recebeu `entry.adaptation`, mas o palco exibiu somente `entry.text`; o usuário viu o literal
  do ASR, não a adaptação;
- uma janela nominal de 5 s produziu 51 palavras/257 caracteres, densidade equivalente a 612 palavras/min,
  sinal fisicamente implausível para fala normal e forte indicador de alucinação de ASR;
- o contrato ASR atual retorna apenas texto, engine, modelo e latência; não transporta `avg_logprob`,
  `no_speech_prob`, compressão ou outro sinal de qualidade;
- o adaptador não possui gate de qualidade da entrada antes da Groq;
- entre as quatro alterações aceitas, houve correção gramatical pequena, inserção/reformulação sobre texto
  já corrompido e colapso de repetição. Guardas lexicais não provaram preservação das relações.

Conclusão do incidente: a falha principal ocorreu no `faster-whisper small` sobre janelas independentes; a
camada generativa também permanece arriscada ao reescrever entrada corrompida. Não há áudio ou roteiro de
referência para calcular WER ou atribuir causalidade a microfone, ruído, eco, fala sobreposta, janela ou
decoder. Qualquer mudança direta de modelo/parâmetro seria hipótese não testada.

## Backlog derivado

### P0 — segurança e diagnóstico

1. Impedir apresentação de adaptação fluente quando a entrada ASR for classificada como suspeita.
2. Propagar metadados de qualidade não textuais do worker até a decisão de adaptação, com schema tipado e
   sem armazenar áudio.
3. Criar detector de entrada suspeita com corpus e thresholds experimentais; densidade textual impossível é
   um sinal, não um critério único.
4. Fazer `ambiguous`, `preservation-risk`, `fragment` e `context-insufficient` acionarem literal.
5. Implementar guardas relacionais para agente/ação/paciente, negação, modalidade, condição, causalidade e
   ordem temporal.
6. Mostrar claramente literal/adaptado/fallback e permitir escolha individual; nunca chamar literal de
   tradução ou adaptação.
7. Tornar erro ao salvar contexto visível e capturar snapshot/versionamento no momento do segmento.

### P0 — experimento de ASR antes de mudança

1. Capturar novo corpus humano pt-BR consentido, com roteiro de referência, no mesmo navegador/microfone e
   sem reutilizar conteúdo privado.
2. Congelar bytes PCM, baseline `small/cpu/int8/beam=5/5 s/sem hotwords` e hardware.
3. Comparar uma variável por vez: modelo, janela/contexto, decoder e perfil acústico.
4. Medir WER, substituições, deleções, inserções, erros semânticos, resíduos, p50/p95, RTF, CPU/RSS e fila.
5. Incluir fala limpa, ruído, reverberação, fala concorrente, silêncio e bordas/resíduos.
6. Promover somente vencedor pareado. Não adicionar hotwords de Python como correção rápida: elas podem
   hallucinar termos técnicos em silêncio ou áudio ambíguo.

### P1 — benefício e governança

- corpus com pelo menos 300 casos e múltiplas referências aceitáveis;
- formulário baseado em preferências e glossário versionado;
- comparação de 0/1/2 segmentos anteriores sem permitir que contexto reapareça na saída;
- estudo participativo com pessoas surdas e cálculo de poder após piloto;
- métricas separadas de compreensão, segurança, preferência, esforço e operação;
- revisão sistemática formal nas bases autenticadas antes de alegação científica abrangente.

## Gate de comunicação

Até a execução dos experimentos e validação humana, o Semantia pode afirmar apenas:

- existe transcript literal persistido e fallback;
- existe pipeline experimental de adaptação em português escrito;
- a adaptação não é tradução para Libras;
- o incidente demonstrou risco material de ASR e de reescrita sobre entrada corrompida;
- não há evidência suficiente para alegar que a adaptação atual melhora compreensão de pessoas surdas.
