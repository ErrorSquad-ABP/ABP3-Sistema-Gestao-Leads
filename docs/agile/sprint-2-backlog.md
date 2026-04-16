# Sprint 2 Backlog

## Objetivo

Registrar o backlog operacional da Sprint 2 em nível de épicos fullstack `end-to-end`, conectando cada card ao escopo da ABP e ao tipo de entrega esperada.

## Princípio de organização

Na Sprint 2, os cards do board representam features inteiras, não subtarefas por camada. Cada épico abaixo deve virar um card principal no Trello, com checklist interno de implementação.

## Backlog da sprint

## `S2-EPIC-07` - Gestão de veículos end-to-end

### Objetivo

Introduzir o veículo como objeto comercial do CRM, para que leads e negociações operem sobre uma oferta real da revenda.

### Requisitos relacionados

- `RF03`
- `RF04`
- `RNF05`
- `RNF13`

### Saída esperada

- módulo de veículos no backend;
- catálogo operacional ou CRUD de veículos;
- dados mínimos de identificação comercial do veículo;
- vínculo do veículo ao fluxo de lead e negociação;
- interface real no frontend para cadastro, consulta e seleção operacional.

## `S2-EPIC-01` - Gestão de negociações end-to-end

### Objetivo

Fechar o requisito `RF03`, permitindo que leads evoluam para negociações reais dentro do CRM sobre um veículo ofertado.

### Requisitos relacionados

- `RF03`
- `RF02`
- `RNF01`
- `RNF05`

### Saída esperada

- módulo de negociações no backend;
- criação de negociação vinculada ao lead e ao veículo;
- controle de importância, estágio e status;
- regra de no máximo uma negociação ativa por lead;
- histórico mínimo de mudanças;
- interface real no frontend para operar a negociação.

## `S2-EPIC-02` - Dashboard operacional end-to-end

### Objetivo

Fechar o `RF04` com visualização operacional demonstrável para gestão do pipeline.

### Requisitos relacionados

- `RF04`
- `RF02`
- `RNF03`
- `RNF04`

### Saída esperada

- indicadores de total de leads;
- leads por status;
- leads por origem;
- leads por loja;
- leads por importância;
- filtro padrão dos últimos 30 dias;
- dashboard operacional real no frontend;
- entrada inicial por perfil com cards-resumo e atalhos úteis.

## `S2-EPIC-03` - Dashboard analítico e filtros temporais end-to-end

### Objetivo

Fechar `RF05` e `RF06` com recortes temporais validados no backend e refletidos em UI.

### Requisitos relacionados

- `RF05`
- `RF06`
- `RF02`
- `RNF03`
- `RNF04`

### Saída esperada

- taxa de conversão;
- convertidos x não convertidos;
- leads por atendente;
- leads por equipa;
- distribuição por importância;
- motivos de finalização;
- tempo médio até atendimento;
- funil de conversão;
- ranking de atendentes e equipas;
- filtros por semana, mês, ano e período customizado;
- limite máximo de um ano para não administradores.

## `S2-EPIC-04` - Logs de auditoria end-to-end

### Objetivo

Fechar `RF07` com gravação e consulta administrativa de logs de acesso e operação.

### Requisitos relacionados

- `RF07`
- `RF02`
- `RNF02`
- `RNF05`

### Saída esperada

- registro de login;
- registro de criação, atualização e exclusão de clientes, utilizadores, times, leads e negociações;
- persistência com data, hora e utilizador responsável;
- API de consulta administrativa;
- tela de logs para administrador;
- filtros por utilizador, ação, entidade e período.

## `S2-EPIC-05` - Conformidade Docker/PostgreSQL e fechamento arquitetural

### Objetivo

Restaurar aderência ao edital em execução local e atualizar os artefatos arquiteturais impactados pela Sprint 2.

### Requisitos relacionados

- `RNF06`
- `RNF07`
- `RP02`
- `RP03`
- `RP06`

### Saída esperada

- `Docker Compose` com PostgreSQL local;
- fluxo local reproduzível para todo o time;
- documentação de setup atualizada;
- atualização de diagramas e registros arquiteturais impactados pelos épicos da sprint.

## `S2-EPIC-06` - Detalhe do lead e timeline operacional end-to-end

### Objetivo

Transformar o lead em um hub operacional completo do CRM, com visão consolidada, timeline e integração direta com cliente, negociação e reatribuição.

### Requisitos relacionados

- `RF02`
- `RF03`
- `RNF04`
- `RNF05`

### Saída esperada

- tela dedicada de detalhe do lead no frontend;
- dados consolidados de cliente, loja, responsável, origem, status e negociação vinculada;
- timeline cronológica do lead;
- atalhos para reatribuição, cliente e negociação;
- eventual endpoint agregador no backend, se a composição por recurso ficar cara demais.

## Ordem sugerida de execução

1. `S2-EPIC-07`
2. `S2-EPIC-01`
3. `S2-EPIC-02`
4. `S2-EPIC-03`
5. `S2-EPIC-04`
6. `S2-EPIC-05`
7. `S2-EPIC-06`

## Leitura de prioridade

- `S2-EPIC-07` e `S2-EPIC-01` formam a base de domínio mais importante da sprint;
- `S2-EPIC-02` mantém o melhor equilíbrio entre aderência ao edital e valor demonstrável;
- `S2-EPIC-03` depende parcialmente da estabilização analítica dos dados;
- `S2-EPIC-04` fecha governança e banca;
- `S2-EPIC-05` evita não conformidade técnica e documental no fechamento do ciclo.
- `S2-EPIC-06` aumenta fortemente valor percebido no frontend e reduz a sensação de CRM “sem tela principal” para operação diária.
