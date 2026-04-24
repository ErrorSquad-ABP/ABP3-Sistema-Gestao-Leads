# AppShell Autenticado

## Objetivo

Documentar a base visual e estrutural da área autenticada do frontend no estado atual da `main`.

## Estado atual

O `AppShell` já é a moldura oficial da área autenticada.

Ele é composto por:

- sidebar;
- header simplificado;
- menu de utilizador;
- área principal de conteúdo;
- navegação por papel.

Base principal:

- [front/src/app/app/layout.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/app/layout.tsx)

## Implementação

Arquivos centrais:

- [app-sidebar.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar.tsx)
- [site-header.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/site-header.tsx)
- [nav-main.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/nav-main.tsx)
- [user-dropdown.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown.tsx)

## Header

Estado atual:

- não possui busca global;
- não possui notificações;
- mantém trigger da sidebar e dropdown do utilizador.

## Dropdown do utilizador

Estado atual:

- `Sair` executa logout real;
- `Perfil` e `Credenciais` apontam para `/app/profile`;
- o fluxo de perfil já é tela dedicada e não depende mais da gestão de utilizadores.

## Rotas que hoje renderizam dentro do shell

| Rota | Estado |
| --- | --- |
| `/app/profile` | funcional |
| `/app/leads` | funcional |
| `/app/customers` | funcional |
| `/app/stores` | funcional |
| `/app/teams` | funcional |
| `/app/users` | funcional |
| `/app/dashboard/analytic` | placeholder protegido |
| `/app/dashboard/operational` | placeholder protegido |

## Home por papel

| Papel | Entrada no shell |
| --- | --- |
| `ATTENDANT` | Leads |
| `MANAGER` | Dashboard Operacional |
| `GENERAL_MANAGER` | Dashboard Analítico |
| `ADMINISTRATOR` | Dashboard Analítico |

## O que ainda não está completo

- dashboards reais;
- módulo de negociações;
- logs administrativos.
