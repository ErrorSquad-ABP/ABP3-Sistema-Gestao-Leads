# Sprint 2 Task Breakdown

## Objetivo

Transformar os épicos da Sprint 2 em checklists operacionais prontos para Trello, mantendo o modelo `1 card = 1 feature end-to-end`.

## Regra da sprint

Cada card da Sprint 2 deve conter checklist suficiente para o responsável levar a feature até um incremento utilizável, sem quebrar o trabalho em vários cards por camada.

## Estrutura padrão de checklist por épico

Cada card principal deve incluir, no mínimo, os blocos abaixo:

1. refinar regras de negócio e critérios de aceite;
2. ajustar ou criar modelagem/persistência quando necessário;
3. implementar contratos e casos de uso no backend;
4. implementar interface e fluxo no frontend;
5. garantir `RBAC`, escopo e validação sensível no backend;
6. atualizar documentação impactada;
7. atualizar diagrama/arquitetura se houver mudança estrutural;
8. validar qualidade, fluxo local e demonstração mínima.

## Checklists por card

## `S2-EPIC-07` - Gestão de veículos end-to-end

- backend já entregue na `main`; foco restante em frontend e integração operacional;
- fechar o recorte do módulo de veículos como catálogo comercial, não como gestão completa de estoque;
- definir modelo de persistência e campos mínimos do veículo;
- implementar casos de uso e API de veículos;
- construir interface de cadastro, listagem e seleção operacional;
- definir como o veículo se liga ao lead e à negociação;
- aplicar `RBAC` por perfil e escopo;
- documentar contratos e decisões;
- validar fluxo ponta a ponta.

## `S2-EPIC-01` - Gestão de negociações end-to-end

- backend já entregue na `main`; foco restante em frontend e integração com detalhe do lead;
- fechar regra de domínio da negociação e da relação com `lead` e `vehicle`;
- definir modelo de persistência e restrição de uma negociação ativa por lead;
- implementar casos de uso e API de negociação;
- implementar histórico mínimo de alterações;
- integrar a negociação na UX de leads;
- integrar seleção ou exibição do veículo no fluxo de negociação;
- integrar abertura/criação de negociação a partir do detalhe do lead;
- aplicar `RBAC` por perfil e escopo;
- documentar contratos e decisões;
- validar fluxo ponta a ponta.

## `S2-EPIC-02` - Dashboard operacional end-to-end

- fechar contrato dos indicadores operacionais;
- implementar consultas agregadas no backend;
- garantir filtros mínimos e recorte por papel;
- construir dashboard operacional no frontend;
- transformar o destino inicial pós-login em dashboard inicial por perfil com cards-resumo e atalhos;
- validar estados de carregamento, vazio e erro;
- documentar consultas e decisões;
- validar leitura dos dados em ambiente real.

## `S2-EPIC-03` - Dashboard analítico e filtros temporais end-to-end

- fechar definição dos indicadores analíticos;
- implementar filtros temporais e validação por papel no backend;
- implementar consultas analíticas e agregações;
- construir visualização analítica no frontend;
- adicionar funil de conversão;
- adicionar ranking de atendentes e equipas;
- garantir recortes coerentes por papel;
- documentar contrato e regra de limitação temporal;
- validar consistência dos indicadores.

## `S2-EPIC-04` - Logs de auditoria end-to-end

- fechar quais eventos entram no escopo da sprint;
- implementar persistência e repositório de auditoria;
- instrumentar login e operações críticas;
- expor consulta administrativa no backend;
- construir tela de auditoria no frontend;
- permitir filtro de logs por utilizador, ação, entidade e período;
- restringir acesso a administrador;
- documentar trilha auditável e decisões;
- validar leitura dos logs em ambiente local.

## `S2-EPIC-05` - Conformidade Docker/PostgreSQL e fechamento arquitetural

- Compose local secundário com PostgreSQL já entregue na `main`;
- restaurar PostgreSQL no `Docker Compose`;
- alinhar `migrations`, `seed` e setup local;
- revisar runbooks e instruções de execução;
- atualizar diagramas arquiteturais impactados;
- registrar `trade-offs` e ajustes estruturais da sprint;
- validar fluxo local completo com `frontend + backend + PostgreSQL`.

## `S2-EPIC-06` - Detalhe do lead e timeline operacional end-to-end

- definir contrato mínimo do detalhe do lead;
- decidir se a tela usa composição por recurso ou endpoint agregador;
- construir tela dedicada de detalhe do lead no frontend;
- exibir timeline unificada de eventos do lead;
- integrar atalhos para cliente, reatribuição e negociação;
- documentar decisões e contrato da tela;
- validar fluxo ponta a ponta.

## Critério mínimo de encerramento por card

Um card só pode ir para `Done` quando:

- backend e frontend da feature estiverem utilizáveis;
- quality gate passar;
- documentação impactada estiver atualizada;
- qualquer mudança arquitetural relevante estiver registrada;
- o responsável conseguir demonstrar a feature ponta a ponta.
