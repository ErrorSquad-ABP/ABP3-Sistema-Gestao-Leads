# Estado Atual de Auth, Sessão e RBAC

## Objetivo

Este documento registra o estado real atual do sistema de autenticação e autorização, com foco em:

- fluxos que já estão funcionais;
- responsabilidades entre frontend e backend;
- papéis existentes;
- rotas públicas e protegidas;
- gaps conhecidos.

## Resumo executivo

Hoje o projeto já possui:

- login real com backend;
- `JWT` de access;
- refresh token opaco persistido em PostgreSQL;
- `logout`;
- endpoint `me`;
- gate server-side no frontend para `/app/*`;
- `RBAC` real no backend;
- redirecionamento inicial por papel;
- `AppShell` autenticado como base da área interna.

O que ainda não está completo como feature de produto:

- gestão de usuários funcional em `/app/users`;
- tela de perfil com atualização das próprias credenciais;
- recuperação automática de senha;
- cadastro público de conta.

## Papéis existentes

Os papéis em uso no frontend hoje são:

- `ATTENDANT`
- `MANAGER`
- `GENERAL_MANAGER`
- `ADMINISTRATOR`

No banco/Prisma existe mapeamento entre domínio e persistência para o papel administrativo.

## Responsabilidade por camada

### Backend

Responsável por:

- autenticar;
- emitir e validar tokens;
- manter sessões de refresh;
- aplicar RBAC real;
- responder `401` e `403`.

Base técnica:

- [auth.controller.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/back/src/modules/auth/presentation/controllers/auth.controller.ts)
- [global-auth.guard.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/back/src/shared/presentation/guards/global-auth.guard.ts)

### Frontend

Responsável por:

- apresentar o login;
- bootstrapar a sessão na requisição;
- redirecionar por papel;
- renderizar ou esconder navegação conforme papel;
- organizar a experiência do usuário autenticado.

Base técnica:

- [session.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/lib/auth/session.ts)
- [permissions.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/lib/auth/permissions.ts)

## Endpoints de auth já funcionais

| Método | Endpoint | Estado |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Funcional |
| `POST` | `/api/auth/refresh` | Funcional |
| `POST` | `/api/auth/logout` | Funcional |
| `GET` | `/api/auth/me` | Funcional |
| `PATCH` | `/api/auth/me/email` | Funcional no backend |
| `PATCH` | `/api/auth/me/password` | Funcional no backend |

## Estratégia atual de sessão

### Access token

- JWT assinado com `RS256`
- usado nas rotas protegidas
- pode chegar por cookie HttpOnly e/ou `Authorization`

### Refresh token

- opaco
- persistido em PostgreSQL
- rotacionado no fluxo de refresh
- revogado em logout

## Fluxo atual do frontend

### Raiz `/`

Comportamento:

- se não houver sessão válida, redireciona para `/login`
- se houver sessão válida, redireciona para `/app`

Base:

- [front/src/app/page.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/page.tsx)

### Entrada `/app`

Comportamento:

- resolve o usuário autenticado
- redireciona para a home por papel

Base:

- [front/src/app/app/page.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/app/page.tsx)

### Homes por papel

| Papel | Destino |
| --- | --- |
| `ATTENDANT` | `/app/leads` |
| `MANAGER` | `/app/dashboard/operational` |
| `GENERAL_MANAGER` | `/app/dashboard/analytic` |
| `ADMINISTRATOR` | `/app/dashboard/analytic` |

## Rotas públicas

| Rota | Estado |
| --- | --- |
| `/login` | Funcional |
| `/forgot-password` | Informativa |
| `/register` | Fora do fluxo público efetivo |

### Observações

- `/forgot-password` não envia e-mail nem executa reset automático.
- `/register` foi removida do fluxo público de criação de conta e hoje não deve ser tratada como auto cadastro.

## Rotas protegidas

Todas as rotas sob `/app/*` exigem sessão válida.

Base:

- [front/src/app/app/layout.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/app/layout.tsx)

## Permissões atuais do frontend

Navegação e whitelists centrais:

- [permissions.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/lib/auth/permissions.ts)

Matriz atual:

| Área | Papéis |
| --- | --- |
| Dashboard Analítico | `MANAGER`, `GENERAL_MANAGER`, `ADMINISTRATOR` |
| Dashboard Operacional | `MANAGER`, `GENERAL_MANAGER`, `ADMINISTRATOR` |
| Leads | `ATTENDANT`, `MANAGER`, `ADMINISTRATOR` |
| Usuários | `ADMINISTRATOR` |

## AppShell atual

Depois do login, o usuário entra em um shell autenticado com:

- sidebar;
- topbar;
- busca;
- menu do usuário;
- área central de conteúdo.

Base:

- [front/src/app/app/layout.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/app/layout.tsx)
- [front/src/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar.tsx)

## Bootstrap de usuários de suporte

O seed atual cria usuários de apoio para validação do fluxo inicial:

| Papel | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@crm.com` | `admin123` |
| Gerente Geral | `geral@crm.com` | `admin123` |

Base:

- [dashboard-csv.seed.ts](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/back/prisma/seeds/dashboard-csv.seed.ts)

## Comportamentos deliberadamente fora de escopo

### Cadastro público

Não existe suporte a auto cadastro público no produto atual.

Motivo:

- o sistema é interno;
- o papel do usuário não deve ser definido por auto cadastro;
- o provisionamento de contas será responsabilidade da gestão administrativa de usuários.

### Recuperação automática de senha

Não existe fluxo automático por e-mail.

Motivo:

- a infraestrutura de recuperação ainda não foi implementada;
- manter uma UI que insinuasse envio automático seria falso affordance.

## Gaps conhecidos

- tela de perfil ainda não está pronta como produto final;
- `/app/users` ainda é placeholder;
- o dropdown do usuário hoje direciona perfil/credenciais para a área de usuários apenas como ponte temporária para admin;
- gestão administrativa real de usuários continua como próxima feature.
