# Prompt para pesquisa científica profunda — adaptação de português escrito em tempo real para pessoas surdas

> Copie e envie **todo o conteúdo a partir de “INÍCIO DO PROMPT”** para a IA especializada em pesquisa na internet.

---

# INÍCIO DO PROMPT

## Papel e padrão de qualidade

Atue como uma equipe interdisciplinar de pesquisa formada por especialistas em:

- educação de pessoas surdas;
- linguística da Libras e do português brasileiro;
- aquisição de primeira e segunda língua;
- letramento e compreensão leitora;
- psicolinguística e leitura;
- acessibilidade cognitiva e linguagem simples;
- legendagem em tempo real;
- interação humano-computador e tecnologia assistiva;
- processamento de linguagem natural e simplificação textual;
- avaliação de modelos generativos;
- revisão sistemática e síntese de evidências.

Faça uma **pesquisa científica profunda, crítica, verificável e orientada à implementação**. Não entregue apenas uma lista de recomendações genéricas. Toda recomendação relevante deve ser ligada a evidências, às características da população estudada, às limitações dos estudos e ao nível de confiança da conclusão.

A pesquisa deve ser concluída em **português brasileiro**, mas deve pesquisar fontes em português, inglês e, quando útil, espanhol. Considere o conhecimento disponível até **12 de agosto de 2026**.

## Objetivo central

Queremos construir no projeto **Semantia** um agente de IA que transforme um segmento final de transcrição literal em **português escrito mais direto, claro e rápido de compreender para pessoas surdas**, preservando integralmente o significado.

O resultado **não é tradução para Libras**, não deve imitar a gramática da Libras e não substitui intérpretes humanos. É uma adaptação derivada de português escrito para português escrito.

A pergunta central é:

> Quais características linguísticas, cognitivas, educacionais, etárias, socioculturais e contextuais influenciam a leitura e a compreensão de português escrito por diferentes pessoas surdas, e como transformar essas evidências em regras seguras para adaptação automática de legendas em tempo real?

## Princípio essencial: não tratar pessoas surdas como um grupo homogêneo

A pesquisa deve rejeitar generalizações como “surdos leem desta forma”. Investigue, diferencie e compare, sempre que houver evidência:

- pessoas surdas e pessoas com deficiência auditiva;
- surdez pré-linguística e pós-linguística;
- idade de início da perda auditiva;
- grau e trajetória da perda auditiva, apenas quando cientificamente pertinente;
- aquisição precoce ou tardia de uma língua plenamente acessível;
- Libras como L1, L2 ou ausência de fluência em Libras;
- português escrito como L1 ou L2;
- pessoas oralizadas, sinalizantes, bilíngues e com trajetórias mistas;
- nível real de proficiência em português escrito;
- histórico de escolarização e qualidade do acesso linguístico;
- idade cronológica versus idade de aquisição linguística;
- crianças, adolescentes, adultos e idosos;
- pessoas com diferentes níveis de letramento;
- diferentes contextos culturais, sociais, regionais e educacionais;
- possíveis deficiências associadas, sem misturar resultados de populações distintas;
- usuários brasileiros versus populações de outros países e outras línguas de sinais.

Não use idade, diagnóstico ou uso de Libras como substituto automático de proficiência leitora. Determine, com evidência, quais variáveis realmente predizem compreensão e quais são apenas proxies fracos ou estereótipos.

## Contexto técnico atual do Semantia

Considere esta arquitetura atual:

1. O navegador envia áudio efêmero ao backend.
2. Um ASR privado produz um segmento final de português.
3. Uma limpeza conservadora remove apenas disfluências inequívocas.
4. O texto literal final é persistido e emitido primeiro.
5. Só então o agente de IA tenta produzir uma adaptação.
6. Literal e adaptação permanecem separados.
7. Em qualquer falha ou risco, o sistema mostra o literal.
8. Replay e reconexão usam a adaptação persistida e não geram nova inferência.

Cada segmento geralmente corresponde a uma janela curta de fala, aproximadamente cinco segundos. Portanto, o agente pode receber frases incompletas, fragmentos, referências anafóricas ou ideias que continuam no próximo segmento.

Atualmente, o modelo recebe:

```text
literalText
language = pt-BR
contextVersion
audienceContext:
  meetingType: escola | empresa | palestra | evento | comunidade
  ageRange: criancas | adolescentes | adultos | misto
  portugueseFamiliarity: baixa | media | alta
  domain: texto livre com o assunto
  simplificationLevel: leve | moderada | alta
```

A saída atual é estruturada:

```json
{
  "adaptedText": "string",
  "decision": "adapted | literal",
  "risk": "none | urgent | ambiguous | preservation-risk"
}
```

O modelo inicial é `openai/gpt-oss-20b` pela Groq, mas as conclusões devem ser **independentes de fornecedor e modelo**.

O prompt atual apenas orienta a preservar significado, nomes, entidades, números, datas, horários, negações, condições, comandos, proibições e urgência; dividir períodos longos; preferir ordem direta; usar palavras mais comuns; não inventar; e retornar o literal quando a adaptação não for segura.

Isso é uma base defensiva, mas ainda não possui regras científicas detalhadas por perfil.

### Observações internas de engenharia — não tratar como evidência científica

Considere estes achados apenas como problemas a resolver, não como conclusões sobre leitura de pessoas surdas:

- o mesmo texto produziu saídas diferentes para perfis diferentes, mostrando que o contexto influencia o modelo;
- em uma sonda, três perfis diferentes produziram adaptações que falharam nas guardas de preservação e virariam literal;
- o perfil “crianças + baixa familiaridade + simplificação alta” ainda recebeu uma frase relativamente longa;
- guardas lexicais atuais podem não detectar inversão de sujeito e objeto ou mudança no sentido de um comando;
- se o modelo declarar `ambiguous` ou `preservation-risk`, o sistema deve provavelmente retornar o literal;
- o formulário de contexto pode falhar ao salvar, e essa falha precisa ser visível;
- o contexto deve ser capturado de forma consistente no momento correto para não aplicar um perfil novo a um segmento antigo;
- chamadas isoladas tiveram baixa latência, mas estabilidade e capacidade sob carga ainda não foram comprovadas.

## Missão da pesquisa

Produza uma base científica que permita decidir:

1. **se** a adaptação automática é benéfica;
2. **para quais perfis** ela é benéfica;
3. **em quais condições** ela pode piorar a compreensão;
4. **quais transformações linguísticas** ajudam;
5. **quais transformações devem ser proibidas**;
6. como personalizar sem estereotipar;
7. como avaliar segurança, clareza, velocidade e compreensão;
8. como transformar as conclusões em prompt, regras, guardas, corpus e experimento humano.

---

# 1. Perguntas de pesquisa obrigatórias

## 1.1 Leitura e compreensão de português por pessoas surdas

Investigue:

- Quais fatores estão associados à compreensão de textos escritos por pessoas surdas?
- Qual é a contribuição relativa de vocabulário, sintaxe, morfologia, inferência, memória de trabalho, conhecimento de mundo, consciência fonológica, reconhecimento ortográfico e fluência leitora?
- Quais resultados são robustos e quais são controversos?
- Há diferenças entre leitura silenciosa de texto estático e leitura de legendas em tempo real?
- Quais dificuldades decorrem da língua do texto, da aquisição linguística, da escolarização, do desenho da legenda ou da qualidade do conteúdo, e não da surdez em si?
- Quais estudos usam compreensão real e quais usam apenas velocidade, preferência ou métricas indiretas?

## 1.2 Efeito da idade e do desenvolvimento

Investigue separadamente:

- infância, adolescência, vida adulta e velhice;
- desenvolvimento de vocabulário, sintaxe, inferência e fluência leitora;
- diferença entre idade cronológica, idade de aquisição de Libras, idade de aquisição do português e anos de escolarização;
- se existem evidências para adaptar comprimento de frase, vocabulário, coesão, densidade informacional ou velocidade conforme a idade;
- se a faixa etária isolada tem poder explicativo suficiente para personalização;
- riscos de infantilização de adultos com baixa proficiência em português;
- necessidades de pessoas surdas idosas, incluindo velocidade de leitura, visão, atenção e familiaridade tecnológica, sem confundir envelhecimento com surdez.

Para cada conclusão sobre idade, informe explicitamente se o efeito permanece após controlar proficiência, escolarização e aquisição linguística.

## 1.3 Libras, bilinguismo e português como segunda língua

Investigue:

- como a aquisição precoce ou tardia de Libras se relaciona com leitura em português;
- efeitos de privação linguística e acesso tardio a uma língua plenamente acessível;
- transferência entre Libras e português escrito;
- diferenças relevantes de estrutura entre Libras e português, sem sugerir português sinalizado;
- papel de ordem sintática, marcação temporal, concordância, preposições, artigos, pronomes, voz passiva, orações subordinadas, anáforas, elipses, metáforas e expressões idiomáticas;
- se tornar sujeitos e referentes explícitos melhora compreensão e em quais contextos;
- se repetir um referente pode melhorar clareza ou gerar texto artificial e mais lento;
- como manter coesão sem depender de pronomes ambíguos;
- como preservar terminologia técnica necessária sem exigir conhecimento externo do modelo.

## 1.4 Transformações linguísticas potencialmente úteis

Avalie evidências específicas para cada transformação:

- uma ideia principal por frase;
- frases mais curtas;
- ordem sujeito–verbo–objeto quando natural e semanticamente fiel;
- voz ativa em vez de passiva;
- sujeito e objeto explícitos;
- ordem cronológica dos acontecimentos;
- condição antes da consequência ou consequência antes da condição;
- divisão de orações subordinadas;
- redução de nominalizações;
- substituição de palavras raras por palavras frequentes;
- preservação e eventual explicação de termos técnicos;
- remoção de redundância versus redundância útil;
- explicitação de conectivos causais, temporais, condicionais e adversativos;
- resolução de pronomes e anáforas;
- tratamento de negação dupla;
- tratamento de ironia, sarcasmo, metáfora, humor, polissemia e linguagem figurada;
- siglas, abreviações, códigos, nomes próprios, datas, valores, unidades e percentuais;
- listas e sequências de instruções;
- perguntas, ordens, proibições, permissões e obrigações;
- linguagem emocional e marcadores pragmáticos;
- pontuação e segmentação visual.

Para cada transformação, classifique:

- evidência de benefício;
- população estudada;
- contexto estudado;
- risco de alterar significado;
- situações em que deve ser aplicada;
- situações em que deve ser proibida;
- necessidade de validação humana.

## 1.5 Legendas e leitura em tempo real

Pesquise evidências e recomendações sobre:

- palavras por minuto e caracteres por segundo;
- quantidade de texto por linha;
- número de linhas;
- segmentação por unidades sintáticas e semânticas;
- quebra de linha e quebra de frase;
- tempo mínimo e máximo de exposição;
- latência aceitável;
- relação entre atraso e ganho de clareza;
- estabilidade visual e alterações tardias no texto;
- esforço de acompanhar legenda, apresentação, slides e rosto do comunicador;
- atenção dividida e perda de conteúdo;
- leitura de segmentos curtos e fragmentados;
- efeito de ASR incorreto sobre compreensão;
- quando é melhor mostrar o literal imediatamente e a adaptação depois;
- risco de uma adaptação chegar tarde e competir com o segmento seguinte;
- diferenças entre aula, reunião, palestra, evento, comunidade, saúde, segurança e emergência.

Não transforme limites de legendagem audiovisual gravada em regras para legenda ao vivo sem discutir transferibilidade.

## 1.6 Clareza, linguagem simples e “easy language”

Compare criticamente:

- plain language;
- linguagem simples brasileira;
- easy language/easy-to-read;
- simplificação textual para aprendizes de segunda língua;
- simplificação para deficiência intelectual;
- simplificação para pessoas surdas.

Não transfira recomendações de uma população para outra sem evidência. Identifique o que pode ser compartilhado e o que é específico.

Investigue também se simplificação excessiva pode:

- remover nuance;
- infantilizar;
- reduzir autonomia;
- apagar termos necessários;
- prejudicar aprendizagem;
- tornar o texto mais longo;
- quebrar coesão;
- alterar tom, certeza, obrigação ou autoridade.

## 1.7 Contexto e personalização

Avalie cientificamente os campos atuais do formulário:

```text
meetingType
ageRange
portugueseFamiliarity
domain
simplificationLevel
```

Para cada campo, responda:

- há justificativa científica para coletá-lo?
- ele influencia de forma acionável a adaptação?
- é um bom preditor ou apenas um proxy?
- o usuário consegue respondê-lo de forma confiável?
- pode induzir estereótipos ou discriminação?
- deveria ser obrigatório, opcional, inferido ou removido?
- quais valores e descrições seriam mais claros?

Investigue quais variáveis alternativas podem ser mais úteis e menos invasivas, por exemplo:

- preferência por literal ou adaptado;
- comprimento preferido de frase;
- necessidade de termos técnicos;
- preferência por explicitação de referentes;
- nível autodeclarado de conforto com português escrito;
- Libras como língua principal;
- objetivo da reunião;
- domínio e vocabulário esperado;
- velocidade de leitura preferida;
- exemplos A/B de adaptação para o usuário escolher.

Projete um **formulário mínimo**, de baixo esforço e não medicalizante. Diferencie:

- dados necessários antes da reunião;
- preferências que podem ser escolhidas durante a reunião;
- dados que nunca deveriam ser coletados;
- configurações por sala versus preferência individual.

Considere que uma adaptação compartilhada por sala não pode satisfazer perfeitamente participantes com necessidades diferentes. Avalie evidências e trade-offs entre:

- uma adaptação única por plateia;
- perfis individuais;
- escolha individual literal/adaptado;
- múltiplas intensidades de adaptação;
- custo, privacidade, latência e consistência.

## 1.8 Contexto discursivo entre segmentos

Como o sistema trabalha com segmentos curtos, pesquise:

- quanto contexto anterior é necessário para resolver pronomes, elipses e continuidade;
- risco de adaptar um fragmento isoladamente;
- uso de uma ou duas frases anteriores;
- resumo de contexto versus texto anterior integral;
- impacto em privacidade, custo e latência;
- risco de o modelo alterar um segmento usando informação de outro;
- como impedir que contexto anterior seja reescrito na saída atual;
- como preservar sequência, causalidade e referências sem introduzir fatos.

Se a literatura não oferecer resposta suficiente, proponha experimentos controlados, não uma regra inventada.

## 1.9 Segurança semântica e modelos generativos

Pesquise métodos para detectar e reduzir:

- inversão de sujeito e objeto;
- mudança de agente, paciente ou destinatário;
- mudança de negação;
- mudança de possibilidade, obrigação, permissão ou proibição;
- mudança de condição e consequência;
- alteração de ordem temporal;
- alteração de causalidade;
- omissão de ressalvas;
- invenção de explicações;
- mudança de nomes, números, unidades e datas;
- suavização indevida de alerta ou urgência;
- mudança de pergunta para afirmação;
- mudança de incerteza para certeza;
- alteração de tom jurídico, médico ou operacional.

Compare abordagens como:

- regras determinísticas;
- extração de entidades e relações;
- semantic role labeling;
- natural language inference/entailment bidirecional;
- question answering de consistência;
- comparação de triples ou grafos semânticos;
- segundo modelo verificador;
- múltiplas amostras e consenso;
- constrained decoding e structured outputs;
- retorno obrigatório do literal em ambiguidade;
- revisão humana em contextos críticos.

Não recomende uma técnica como garantia absoluta. Discuta latência, custo, falsos positivos, falsos negativos e adequação ao português brasileiro.

## 1.10 Avaliação automática e humana

Avalie a utilidade e limitações de:

- SARI;
- BLEU, ROUGE e BERTScore;
- métricas de legibilidade para português;
- NILC-Metrix e Coh-Metrix-Port, se pertinentes;
- comprimento de frase e frequência lexical;
- métricas de preservação semântica;
- NLI;
- tempo de leitura;
- eye tracking;
- perguntas de compreensão;
- recordação imediata e tardia;
- carga cognitiva e esforço percebido;
- confiança na compreensão;
- preferência do usuário;
- taxa de fallback;
- severidade de erros de significado;
- latência p50/p95;
- capacidade por número de salas simultâneas.

Determine quais métricas foram validadas especificamente com pessoas surdas e quais não foram.

---

# 2. Protocolo de busca científica obrigatório

## 2.1 Bases e fontes

Pesquise prioritariamente:

- Scopus;
- Web of Science;
- PubMed/MEDLINE;
- ERIC;
- PsycINFO, quando acessível;
- SciELO;
- Portal de Periódicos CAPES;
- Google Scholar apenas para descoberta e rastreamento de citações;
- ACM Digital Library;
- IEEE Xplore;
- ACL Anthology;
- periódicos de deaf studies, educação de surdos, linguística, psicolinguística, acessibilidade e legendagem;
- teses e dissertações brasileiras relevantes;
- normas e guias oficiais, quando sustentados por metodologia identificável;
- arXiv e outros preprints somente como evidência preliminar claramente marcada.

Priorize estudos revisados por pares, revisões sistemáticas, meta-análises, estudos experimentais, estudos de eye tracking, pesquisas participativas e trabalhos com participantes surdos.

Inclua estudos fundamentais anteriores a 2000 quando forem essenciais. Para tecnologia, legendagem automática e LLMs, priorize evidência recente.

Procure ativamente:

- pesquisas brasileiras;
- estudos em português brasileiro e Libras;
- autores surdos;
- trabalhos conduzidos com participação de comunidades surdas;
- diretrizes produzidas com pessoas surdas, não apenas sobre elas.

## 2.2 Consultas sugeridas

Crie e refine strings em português e inglês combinando termos como:

```text
surdez OR surdo OR deaf OR hard of hearing
reading comprehension OR literacy OR written language
Portuguese OR Brazilian Portuguese OR second language OR L2
Libras OR Brazilian Sign Language OR sign language
captioning OR live captions OR real-time captions OR subtitles
text simplification OR plain language OR easy language
syntactic complexity OR lexical complexity OR sentence length
age OR children OR adolescents OR adults OR older adults
age of acquisition OR language deprivation OR bilingualism
eye tracking OR reading speed OR cognitive load
accessible communication OR assistive technology
large language model OR LLM OR semantic preservation OR factual consistency
```

Apresente no relatório final as strings efetivamente utilizadas, as bases consultadas, a data da busca e os critérios de inclusão/exclusão.

## 2.3 Critérios de inclusão

Inclua estudos que apresentem pelo menos um dos seguintes:

- participantes surdos ou com deficiência auditiva claramente caracterizados;
- dados sobre leitura, compreensão, legendas ou português escrito;
- comparação de transformações linguísticas;
- resultados por idade, aquisição linguística, proficiência ou escolarização;
- avaliação de texto simplificado;
- métricas de compreensão, velocidade, esforço ou preferência;
- implicações diretamente transferíveis para adaptação em tempo real, com justificativa explícita.

## 2.4 Critérios de exclusão ou uso restrito

Não use como evidência principal:

- posts sem autoria ou metodologia;
- material comercial;
- afirmações de snippets de busca;
- estudos que misturam populações sem separar resultados;
- trabalhos sobre deficiência intelectual usados como se fossem estudos com pessoas surdas;
- estudos sobre tradução automática para língua de sinais usados como se fossem simplificação de português;
- métricas de legibilidade sem validação de compreensão;
- opiniões sem participantes ou base empírica;
- estudos exclusivamente com ouvintes transferidos sem ressalvas;
- uma única amostra pequena tratada como regra universal.

## 2.5 Verificação das fontes

Para cada fonte usada:

- verifique se título, autores, ano, periódico e DOI/URL correspondem;
- abra a fonte original, não cite apenas o resultado de busca;
- informe quando apenas o resumo estava acessível;
- não invente DOI, páginas, amostra ou resultado;
- inclua trecho exato ou localização da evidência para as conclusões mais importantes;
- use no máximo três fontes por afirmação;
- procure pelo menos duas fontes independentes para conclusões centrais;
- apresente estudos conflitantes em vez de esconder divergências.

Almeje entre **40 e 70 fontes de boa qualidade**, sem preencher cota com estudos fracos. Se a literatura específica for escassa, informe a lacuna.

---

# 3. Extração e classificação das evidências

Crie uma tabela de evidências com estas colunas:

| Campo | Conteúdo obrigatório |
|---|---|
| ID | Identificador da fonte |
| Referência | Autores, ano e título |
| DOI/URL | Link verificável |
| País/língua | Contexto linguístico e cultural |
| População | Número, idade e perfil dos participantes |
| Perfil linguístico | Libras/língua de sinais, português/língua oral, idade de aquisição quando informado |
| Escolarização/letramento | Como foi caracterizado |
| Desenho | Revisão, experimento, eye tracking, qualitativo etc. |
| Tarefa | Texto, legenda, compreensão, leitura etc. |
| Transformação/variável | O que foi testado |
| Resultado | Resultado relevante com tamanho de efeito quando disponível |
| Limitações | Limitações declaradas e identificadas |
| Transferibilidade | Alta, média ou baixa para Semantia, com justificativa |
| Regra candidata | Possível implicação implementável |
| Confiança | Alta, moderada, baixa ou evidência insuficiente |

Classifique cada recomendação final em:

- **E1 — evidência direta forte:** múltiplos estudos com pessoas surdas e resultados convergentes;
- **E2 — evidência direta limitada:** poucos estudos, amostras pequenas ou contexto restrito;
- **E3 — evidência indireta:** outra população/língua, com transferência plausível e ressalvas;
- **H — hipótese de produto:** sem evidência suficiente; precisa de experimento;
- **N — não recomendado:** evidência de dano, inconsistência ou risco semântico.

Não apresente E3 ou H como fato científico estabelecido.

---

# 4. Entregáveis obrigatórios

## Entregável A — resumo executivo

Em até duas páginas, responda:

- O que a ciência sustenta com maior confiança?
- O que ainda não sabemos?
- Quais ideias atuais do Semantia estão corretas?
- Quais são frágeis ou estereotipadas?
- Quais mudanças são bloqueantes antes de promover o agente?
- É cientificamente defensável personalizar por idade?
- Quais variáveis deveriam substituir ou complementar idade?

## Entregável B — mapa de perfis sem estereótipos

Crie uma matriz de perfis baseada em variáveis realmente acionáveis, não em diagnósticos.

Para cada perfil, apresente:

- sinais observáveis ou preferências autodeclaradas;
- necessidades prováveis;
- transformações permitidas;
- transformações proibidas;
- incertezas;
- como o usuário pode corrigir a personalização;
- evidência que sustenta cada regra.

Não associe automaticamente “surdo”, “criança”, “usuário de Libras” ou “baixa escolaridade” a baixa capacidade cognitiva.

## Entregável C — avaliação do formulário atual

Analise campo por campo:

```text
meetingType
ageRange
portugueseFamiliarity
domain
simplificationLevel
```

Entregue:

1. campos a manter;
2. campos a reformular;
3. campos a remover;
4. campos novos;
5. redação exata das perguntas e alternativas;
6. justificativa científica;
7. risco de viés;
8. formulário mínimo recomendado;
9. momento ideal de coleta: antes da sala, dentro da sala ou preferência persistente;
10. estratégia quando o formulário não for preenchido ou falhar ao salvar.

## Entregável D — especificação linguística implementável

Crie um manual operacional com regras numeradas. Cada regra deve conter:

```text
ID da regra
objetivo
transformação permitida
pré-condições
exemplo literal
exemplo adaptado
contraexemplo perigoso
informações que devem permanecer idênticas
nível/perfil em que se aplica
evidência e grau E1/E2/E3/H/N
método de validação automática
quando retornar o literal
```

Inclua regras para:

- estrutura da frase;
- vocabulário;
- coesão;
- referências;
- condições;
- causalidade;
- tempo;
- modalidade;
- instruções;
- alertas;
- termos técnicos;
- linguagem figurada;
- fragmentos;
- pontuação;
- segmentação de legenda.

## Entregável E — matriz dos níveis de adaptação

Defina cientificamente, se possível:

### Leve

O que pode mudar, o que não muda e qual objetivo de leitura.

### Moderada

O que pode mudar, o que não muda e qual objetivo de leitura.

### Alta

O que pode mudar, o que não muda e qual objetivo de leitura.

Para cada nível, especifique limites mensuráveis apenas quando houver evidência. Se não houver base para um número, marque-o como hipótese de experimento.

Considere se “alta” deve preservar termos técnicos acompanhados de contextualização curta, em vez de simplesmente removê-los.

## Entregável F — proposta de `pt-br-accessible-v2`

Com base somente nas regras sustentadas, produza:

1. um system prompt completo;
2. um bloco de dados não confiáveis;
3. instruções condicionais por perfil;
4. política explícita para fragmentos;
5. política explícita para ambiguidade;
6. política para termos técnicos;
7. política para idade sem infantilização;
8. política para comandos, condições e urgência;
9. política de não invenção;
10. critérios objetivos para `decision="literal"`;
11. critérios objetivos para os estados de risco;
12. schema de saída recomendado;
13. exemplos positivos e negativos;
14. justificativa e evidência de cada grupo de instruções.

O prompt deve instruir o modelo a transformar somente o segmento atual. Contexto anterior, se recomendado, serve apenas para interpretação e nunca deve aparecer novamente na saída.

Não inclua regras sem evidência como se fossem universais. Marque instruções experimentais.

## Entregável G — contrato de saída e guardas

Recomende se o schema atual é suficiente. Considere campos como:

```json
{
  "adaptedText": "...",
  "decision": "adapted | literal",
  "risk": "none | urgent | ambiguous | preservation-risk | fragment | context-insufficient",
  "appliedRuleIds": ["..."],
  "confidence": "..."
}
```

Não aceite autodeclaração de confiança do modelo como prova. Explique quais campos são apenas metadados e quais devem controlar fallback.

Defina uma arquitetura de guardas para:

- entidades e valores;
- relações agente–ação–objeto;
- condições e consequências;
- causalidade;
- temporalidade;
- modalidade;
- negação;
- instruções;
- ambiguidade;
- segurança.

Informe o que pode ser determinístico, o que exige modelo auxiliar e o que exige validação humana.

## Entregável H — corpus científico de avaliação

Projete um corpus de pelo menos 300 casos sintéticos e uma fase posterior com material humano autorizado.

Estratifique por:

- idade;
- proficiência em português;
- trajetória linguística, quando eticamente apropriada;
- níveis de adaptação;
- tipo de encontro;
- domínio;
- comprimento;
- complexidade sintática;
- fragmentação;
- nomes e entidades;
- números e datas;
- condições;
- comandos;
- negações;
- causalidade;
- referências;
- linguagem figurada;
- urgência;
- ASR com erros plausíveis;
- contexto anterior necessário;
- casos em que o correto é manter literal.

Para cada caso, defina:

- literal;
- contexto;
- transformações obrigatórias;
- transformações permitidas;
- transformações proibidas;
- invariantes semânticas;
- uma ou mais referências humanas;
- critérios de aceitação;
- severidade do erro.

Não trate uma única adaptação de referência como a única resposta correta quando várias formulações forem equivalentes.

## Entregável I — protocolo de avaliação com pessoas surdas

Desenhe um estudo participativo, ético e executável no Brasil.

Inclua:

- participação de pesquisadores, consultores ou avaliadores surdos desde o desenho;
- critérios de amostragem sem tratar o grupo como homogêneo;
- tamanho de amostra justificado ou plano de estudo piloto;
- consentimento acessível em português e Libras;
- proteção de dados e não versionamento de transcrições privadas;
- condições comparadas: literal, adaptação atual, adaptação v2 e controle;
- randomização e contrabalanceamento;
- perguntas de compreensão factual e inferencial;
- tempo de leitura;
- esforço percebido;
- confiança;
- preferência;
- erros críticos;
- análise por perfil sem criar conclusões estigmatizantes;
- critérios de interrupção;
- remuneração ou reconhecimento da participação;
- processo de incorporação do feedback ao produto.

Diferencie:

- teste de usabilidade;
- teste de compreensão;
- teste de segurança semântica;
- validação linguística;
- evidência de benefício real.

## Entregável J — métricas e gates de promoção

Proponha critérios objetivos para:

- segurança semântica;
- benefício de compreensão;
- velocidade de leitura;
- esforço;
- preferência;
- latência;
- taxa de fallback;
- estabilidade sob carga;
- custo;
- privacidade.

Crie gates separados:

1. laboratório sintético;
2. revisão linguística especializada;
3. estudo com pessoas surdas;
4. piloto controlado;
5. produção limitada;
6. promoção geral.

Nenhum gate pode ser marcado como aprovado apenas porque o modelo gerou JSON válido ou porque algumas frases pareceram melhores.

## Entregável K — riscos, limites e perguntas em aberto

Inclua um registro de riscos com:

- risco;
- população afetada;
- probabilidade;
- impacto;
- detectabilidade;
- mitigação;
- fallback;
- evidência;
- responsável pela decisão.

Inclua obrigatoriamente:

- infantilização;
- perda de nuance;
- alteração de comando;
- erro em saúde ou emergência;
- latência;
- adaptação atrasada;
- perfil incorreto;
- contexto não salvo;
- contexto desatualizado;
- viés cultural;
- dependência de fornecedor;
- privacidade;
- falsa sensação de acessibilidade;
- uso da adaptação como substituto indevido de Libras ou intérprete.

---

# 5. Formato obrigatório da resposta

Estruture o relatório assim:

1. **Resumo executivo**
2. **Escopo e definições**
3. **Método de busca**
4. **Fluxo de seleção de estudos, estilo PRISMA quando possível**
5. **Características da população e heterogeneidade**
6. **Síntese científica por pergunta de pesquisa**
7. **Resultados específicos para Brasil, português e Libras**
8. **Evidências sobre idade e desenvolvimento**
9. **Evidências sobre texto e legendas em tempo real**
10. **Tabela completa de evidências**
11. **Conclusões conflitantes e lacunas**
12. **Avaliação do formulário atual**
13. **Formulário mínimo recomendado**
14. **Especificação linguística implementável**
15. **Matriz leve/moderada/alta**
16. **Prompt `pt-br-accessible-v2`**
17. **Schema e guardas de segurança**
18. **Corpus e benchmark**
19. **Protocolo de avaliação humana**
20. **Gates de promoção**
21. **Registro de riscos**
22. **Backlog priorizado: P0, P1 e P2**
23. **Perguntas ainda sem resposta**
24. **Bibliografia com DOI/URL verificados**
25. **Apêndice com strings de busca e trechos de evidência**

Use citações inline numeradas ou autor-data em toda afirmação externa. Cada recomendação implementável deve apontar para as evidências e para a classificação E1/E2/E3/H/N.

---

# 6. Regras de honestidade científica

Você não pode:

- inventar fontes, autores, DOI, resultados, tamanhos de efeito ou amostras;
- concluir causalidade a partir de correlação;
- confundir preferência com compreensão;
- confundir texto mais curto com texto mais claro;
- usar legibilidade automática como prova de acessibilidade;
- extrapolar estudos com ouvintes sem marcar a evidência como indireta;
- extrapolar uma língua de sinais para Libras sem discutir diferenças;
- tratar surdez como déficit cognitivo;
- assumir que pessoas usuárias de Libras têm baixa proficiência em português;
- assumir que adultos com baixa proficiência precisam de linguagem infantil;
- afirmar que uma adaptação é “para surdos” sem identificar perfil e evidência;
- chamar adaptação em português de tradução para Libras;
- recomendar que a IA explique ou complete conteúdo que não aparece no transcript;
- ocultar resultados nulos, conflitos ou lacunas;
- prometer preservação semântica perfeita;
- substituir validação com pessoas surdas por opinião de especialistas ouvintes.

Quando a literatura não for suficiente, escreva explicitamente:

```text
EVIDÊNCIA INSUFICIENTE — requer experimento com pessoas surdas.
```

---

# 7. Resultado esperado

O relatório deve permitir que uma equipe de engenharia implemente uma versão seguinte do agente sem transformar achados científicos em slogans vagos.

Ao final, entregue uma resposta direta para estas perguntas:

1. Quais mudanças de texto possuem melhor evidência de ajudar a compreensão?
2. Quais mudanças apresentam maior risco de alterar significado?
3. Idade deve fazer parte do perfil? Com qual peso e ressalvas?
4. Quais variáveis são mais importantes do que idade?
5. Como diferenciar leve, moderada e alta de forma não arbitrária?
6. Quais dados mínimos devem ser perguntados ao comunicador ou participante?
7. A adaptação deve ser compartilhada por sala ou individual?
8. Quanto contexto anterior é necessário?
9. Quais situações exigem literal obrigatório?
10. Quais métricas comprovam valor real para pessoas surdas?
11. O que precisa ser validado antes de afirmar que o agente melhora acessibilidade?
12. Qual é o prompt v2 recomendado, e qual evidência sustenta cada parte?

A qualidade será avaliada pela rastreabilidade:

```text
fonte científica
→ achado
→ população à qual se aplica
→ grau de confiança
→ regra de adaptação
→ guarda de segurança
→ caso de teste
→ métrica
→ validação com pessoas surdas
```

Se esse encadeamento não puder ser construído para uma recomendação, marque-a como hipótese, não como regra comprovada.

# FIM DO PROMPT
