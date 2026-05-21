# Frontend - Estado Atual, IA e Direção de Evolução

**Versão:** 4.0
**Data:** 2026-05-20
**Ramo de referência:** `develop`

## Objetivo

Registrar a arquitetura da informação e o estado funcional real do frontend no ponto atual do projeto.

## Premissas

- aplicação interna autenticada;
- autorização real no backend;
- frontend organiza navegação, estados, formulários e consumo de API;
- dashboards, veículos e negociações já fazem parte do produto demonstrável;
- identidade visual do produto consolidada como `Quantum CRM`.

## Mapa atual de áreas

| Área | Estado | Observação |
| --- | --- | --- |
| Login | Funcional | Fluxo real com backend |
| Perfil | Funcional | Atualização de e-mail e senha |
| Leads | Funcional | CRUD operacional e catálogos auxiliares |
| Clientes | Funcional | Gestão dedicada |
| Lojas | Funcional | Gestão dedicada |
| Equipes | Funcional | Gestão dedicada |
| Usuários | Funcional | Gestão administrativa |
| Veículos | Funcional | Catálogo operacional e gestão visual |
| Negociações | Funcional | Pipeline e vínculo com lead/veículo |
| Dashboard Operacional | Funcional | Indicadores reais do backend |
| Dashboard Analítico | Funcional | Funil, rankings, filtros temporais e motivos de finalização |
| Logs | Em fechamento | Audit log completo fica para a Sprint 3 |

## Rotas atuais

| Rota | Estado |
| --- | --- |
| `/login` | funcional |
| `/forgot-password` | informativa |
| `/app` | redirecionamento por papel |
| `/app/profile` | funcional |
| `/app/leads` | funcional |
| `/app/leads/[id]` | funcional |
| `/app/customers` | funcional |
| `/app/vehicles` | funcional |
| `/app/deals` | funcional |
| `/app/stores` | funcional |
| `/app/teams` | funcional |
| `/app/users` | funcional |
| `/app/dashboard/operational` | funcional |
| `/app/dashboard/analytic` | funcional |
| `/app/operations` | alias para `/app/stores` |
| `/401` | funcional |
| `/403` | funcional |

## Homes por papel

| Papel | Home |
| --- | --- |
| `ATTENDANT` | `/app/leads` |
| `MANAGER` | `/app/dashboard/operational` |
| `GENERAL_MANAGER` | `/app/dashboard/analytic` |
| `ADMINISTRATOR` | `/app/dashboard/analytic` |

## Navegação lateral atual

### Dashboards

- Dashboard Operacional
- Dashboard Analítico

### Workspace

- Clientes
- Leads
- Negociações
- Veículos

### Administração

- Lojas
- Equipes
- Usuários

## Matriz visual por papel

| Área | `ATTENDANT` | `MANAGER` | `GENERAL_MANAGER` | `ADMINISTRATOR` |
| --- | --- | --- | --- | --- |
| Leads | Sim | Sim | Sim | Sim |
| Clientes | Sim | Sim | Sim | Sim |
| Negociações | Sim | Sim | Sim | Sim |
| Veículos | Não | Não | Sim | Sim |
| Dashboard Operacional | Não | Sim | Sim | Sim |
| Dashboard Analítico | Não | Sim | Sim | Sim |
| Lojas | Não | Sim | Sim | Sim |
| Equipes | Não | Sim | Sim | Sim |
| Usuários | Não | Não | Não | Sim |

## Estado de UX

Hoje o frontend já consolidou:

- shell autenticado único;
- componentes modulares por feature;
- formulários com `React Hook Form` e `Zod`;
- tabelas administrativas e operacionais;
- pipeline de negociações;
- catálogo visual de veículos;
- dashboards com cards, gráficos e filtros reais;
- identidade visual `Quantum CRM`;
- telas de erro personalizadas;
- header simplificado sem busca global.

## Gaps explícitos para Sprint 3

- audit log completo como experiência administrativa final;
- refinamento visual fino para apresentação;
- revisão de consistência e qualidade de código entre módulos.
