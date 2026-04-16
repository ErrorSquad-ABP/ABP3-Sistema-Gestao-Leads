# Sprint 2 Goal

## Objetivo

Formalizar o objetivo central da Sprint 2 a partir do estado atual da `main`, concentrando o time nas lacunas funcionais mais relevantes da ABP e no aumento do valor percebido no frontend.

## Contexto

A Sprint 1 deixou pronto o núcleo transacional do sistema:

- autenticação;
- `RBAC`;
- usuários;
- equipas;
- lojas;
- clientes;
- leads.

O principal gap do produto agora está em:

- veículos;
- negociações;
- dashboards;
- detalhe operacional do lead;
- filtros temporais;
- logs de auditoria;
- conformidade local do `Docker Compose` com PostgreSQL.

## Direção adotada

- priorizar features `end-to-end`, não tarefas por camada;
- aumentar o valor demonstrável no frontend sem relaxar a qualidade do backend;
- manter autorização e validação sensível no backend;
- fazer cada épico carregar também seus impactos de documentação e arquitetura;
- evitar carregar escopo residual da Sprint 1 como se fosse backlog automático.

## Sprint Goal

Entregar a evolução comercial do CRM com veículos, negociações, dashboards gerenciais, filtros temporais e trilha de auditoria, consolidando também a execução local aderente ao edital da ABP.

## Resultado de negócio esperado

Ao final da sprint, a equipe deve conseguir demonstrar que:

- o catálogo de veículos já existe como objeto comercial do processo;
- o lead já pode evoluir para negociação com regras explícitas;
- a negociação passa a refletir o veículo ofertado ao cliente;
- o lead passa a ter uma tela de detalhe/timeline que concentra operação e contexto;
- gestores e administração conseguem acompanhar indicadores reais em dashboard;
- os recortes temporais funcionam com validação por perfil;
- operações críticas passam a gerar trilha de auditoria consultável;
- a execução local volta a aderir ao modelo de `frontend + backend + PostgreSQL` via `Docker Compose`.

## Escopo que sustenta o goal

- gestão de negociações `end-to-end`;
- gestão de veículos `end-to-end`;
- detalhe do lead e timeline operacional `end-to-end`;
- dashboard operacional `end-to-end`;
- dashboard analítico com filtros temporais `end-to-end`;
- logs de auditoria `end-to-end`;
- conformidade de execução local e atualização arquitetural impactada.

## O que não faz parte do Sprint Goal

- refinamento visual final de banca;
- recuperação de senha por e-mail;
- cadastro público de conta;
- pacote documental final completo da apresentação de julho;
- otimizações não necessárias para fechar o escopo funcional da sprint.

## Critérios para considerar o goal atingido

- negociação criada e evoluída a partir de lead, com restrições válidas de domínio;
- veículo disponível e vinculável no fluxo operacional;
- dashboards operacionais e analíticos consumindo dados reais;
- filtros temporais funcionando no backend e refletidos na UI;
- eventos auditáveis críticos registrados e consultáveis por administrador;
- stack local executável com PostgreSQL em `Docker Compose`;
- documentação impactada atualizada junto das features.
