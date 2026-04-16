# Sprint 2 Planning

## Objetivo

Documentar o planejamento da Sprint 2 com base no enunciado oficial da ABP e no estado real da `main`, definindo escopo comprometido, forma de execução e critérios de sucesso.

## Contexto

A Sprint 2 acontece de `15/04/2026` a `21/05/2026`. O projeto já possui fundação técnica suficiente para sair do núcleo transacional e atacar o bloco funcional que ainda falta para aderência mais forte ao edital:

- negociações;
- dashboards;
- filtros temporais;
- auditoria;
- conformidade local de execução via Docker com PostgreSQL.

Ao mesmo tempo, a retrospective da Sprint 1 mostrou que o parceiro percebeu pouco volume de entrega visual no frontend, apesar da base de backend já estar madura. Isso influencia diretamente a priorização desta sprint.

## Direção adotada

- cada card principal da sprint representa uma feature inteira `end-to-end`;
- o responsável do card assume backend, frontend, contrato, QA e documentação impactada;
- se a feature alterar desenho do sistema, o mesmo responsável atualiza diagramas, decisões e `trade-offs`;
- a sprint prioriza features com alto valor demonstrável em produto;
- o backlog não será quebrado em “card de backend” e “card de frontend” para a mesma feature.

## Meta da sprint

Fechar o bloco de evolução comercial e visibilidade gerencial do CRM, adicionando negociações, dashboards, filtros temporais, auditoria e conformidade local de execução.

## Escopo comprometido

### Épicos priorizados

- `S2-EPIC-01` Gestão de negociações `end-to-end`
- `S2-EPIC-02` Dashboard operacional `end-to-end`
- `S2-EPIC-03` Dashboard analítico e filtros temporais `end-to-end`
- `S2-EPIC-04` Logs de auditoria `end-to-end`
- `S2-EPIC-05` Conformidade Docker/PostgreSQL e fechamento arquitetural
- `S2-EPIC-06` Detalhe do lead e timeline operacional `end-to-end`

## Fora de escopo nesta sprint

- recuperação de senha por e-mail;
- cadastro público de conta;
- polimento final de apresentação;
- expansões não pedidas pelo edital fora do bloco de negociação, analytics e auditoria.

## Ajustes após avaliação do levantamento de telas

O levantamento de telas foi revisado contra o estado atual da `main` e contra o foco da Sprint 2. A decisão não foi abrir um card por tela.

### Entrou como épico próprio

- detalhe do lead com timeline operacional, por ser lacuna real do produto e forte gerador de valor percebido no frontend.

### Foi absorvido em épicos já existentes

- dashboard inicial por perfil: incorporado ao épico de dashboard operacional;
- funil de conversão: incorporado ao épico de dashboard analítico;
- ranking de atendentes e equipas: incorporado ao épico de dashboard analítico;
- filtros mais ricos da tela de logs: incorporados ao épico de auditoria;
- abertura da negociação a partir do detalhe do lead: incorporada ao épico de negociações.

## Modelo de execução da sprint

### Regra dos cards

- `1 card = 1 feature/épico`
- o card não é repassado entre pessoas por camada;
- o dono da feature leva até o incremento utilizável;
- checklist interno do card representa subtarefas e `user stories` menores.

### Responsabilidade mínima por card

Cada épico deve considerar, no mínimo:

- regra de negócio e domínio;
- API/backend;
- interface/frontend;
- `RBAC` e segurança;
- documentação de contrato impactada;
- diagrama/arquitetura se houver mudança estrutural;
- validação local e critérios de aceite.

## Dependências críticas

1. Negociações destravam parte importante dos dashboards.
2. Dashboards e filtros temporais dependem de consultas e agregações consistentes.
3. Logs de auditoria dependem de definição clara dos eventos que entram nesta sprint.
4. O ajuste de `Docker Compose` com PostgreSQL impacta documentação, setup local e validação final da sprint.
5. O detalhe do lead depende parcialmente do desenho final de negociação e auditoria, então o contrato dessa tela precisa ser fechado cedo.

## Riscos e atenção

- o épico de dashboard analítico pode crescer demais se não tiver contrato e escopo fechados cedo;
- auditoria pode espalhar alteração transversal em vários módulos;
- o detalhe do lead pode crescer demais se tentar absorver tudo o que ainda não existe de negociação e logs sem recorte claro;
- se a sprint perder foco e tentar reabrir escopo da Sprint 1, o ganho de produto visível volta a cair;
- a conformidade de execução local não deve ser tratada como “detalhe de infraestrutura”, porque é requisito explícito do edital.

## Critérios de sucesso da sprint

- pelo menos um fluxo completo de negociação demonstrável;
- tela de detalhe do lead funcionando como hub operacional do CRM;
- dashboards deixando de ser placeholder e consumindo dados reais;
- filtros temporais funcionando com limitação por papel no backend;
- trilha de auditoria visível para administrador;
- documentação atualizada no repositório e na wiki;
- execução local aderente ao modelo `frontend + backend + PostgreSQL`.
