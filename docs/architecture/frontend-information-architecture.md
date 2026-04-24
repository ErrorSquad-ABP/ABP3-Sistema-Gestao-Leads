# Frontend - Estado Atual, IA e Direção de Evolução

**Versão:** 3.0  
**Data:** 2026-04-15  
**Ramo de referência:** `main`

## Objetivo

Registrar a arquitetura da informação e o estado funcional real do frontend no ponto atual do projeto.

## Premissas

- aplicação interna autenticada;
- autorização real no backend;
- frontend organiza navegação, estados, formulários e consumo de API;
- dashboards ainda não estão fechados como produto.

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
| Dashboard Operacional | Placeholder | Rota existente, sem analytics real |
| Dashboard Analítico | Placeholder | Rota existente, sem analytics real |
| Logs | Não implementado | Sem feature real no frontend |
| Negociações | Não implementado | Sem feature real no frontend |

## Rotas atuais

| Rota | Estado |
| --- | --- |
| `/login` | funcional |
| `/forgot-password` | informativa |
| `/app` | redirecionamento por papel |
| `/app/profile` | funcional |
| `/app/leads` | funcional |
| `/app/customers` | funcional |
| `/app/stores` | funcional |
| `/app/teams` | funcional |
| `/app/users` | funcional |
| `/app/dashboard/operational` | placeholder |
| `/app/dashboard/analytic` | placeholder |
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

### Administração

- Lojas
- Equipes
- Usuários

## Matriz visual por papel

| Área | `ATTENDANT` | `MANAGER` | `GENERAL_MANAGER` | `ADMINISTRATOR` |
| --- | --- | --- | --- | --- |
| Leads | Sim | Sim | Não na navegação atual | Sim |
| Clientes | Sim | Sim | Não na navegação atual | Sim |
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
- telas de erro personalizadas;
- header simplificado sem busca global.

## Gaps explícitos

- dashboard operacional real;
- dashboard analítico real;
- módulo de negociações;
- logs administrativos;
- filtros temporais avançados ligados ao backend.
