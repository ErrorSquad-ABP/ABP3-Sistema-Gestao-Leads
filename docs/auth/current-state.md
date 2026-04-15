# Estado Atual de Auth, Sessão e RBAC

## Resumo executivo

Hoje o sistema possui:

- login real com backend;
- `access token` JWT `RS256`;
- refresh token opaco persistido;
- logout;
- `GET /api/auth/session` como leitura opcional de sessão;
- `GET /api/auth/me` como leitura estrita autenticada;
- gate server-side no frontend para `/app/*`;
- `RBAC` real no backend;
- escopo multi-team no backend;
- perfil com atualização do próprio e-mail e senha.

## O que já está funcional

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/auth/me`
- `PATCH /api/auth/me/email`
- `PATCH /api/auth/me/password`

## O que ainda não está fechado

- recuperação automática de senha por e-mail;
- cadastro público de conta.

## Responsabilidade por camada

### Backend

Responsável por:

- autenticar;
- emitir e validar tokens;
- manter refresh token;
- aplicar `RBAC`;
- resolver escopo por equipa;
- responder `401` e `403`.

### Frontend

Responsável por:

- apresentar login;
- armazenar `access token` para chamadas autenticadas;
- bootstrapar sessão por requisição;
- redirecionar por papel;
- esconder navegação fora do escopo visual.

## Estratégia atual de sessão

### Cookies

O backend emite cookies HttpOnly de auth.

### Bearer token

O frontend também persiste o `access token` em `localStorage` e o envia em `Authorization: Bearer` via `apiFetch`.

Na prática atual:

- SSR usa cookies;
- cliente autenticado usa `Bearer`, com cookies ainda presentes.

## Bootstrap de sessão

### SSR

O SSR atual consulta `GET /api/auth/me` com o cabeçalho `Cookie` da requisição.

### Cliente

O cliente autenticado também consulta `GET /api/auth/me`.

### Endpoint opcional

`GET /api/auth/session` continua disponível quando o contrato desejado é “sem 401, com `data: null` sem sessão”.

## Papéis

- `ATTENDANT`
- `MANAGER`
- `GENERAL_MANAGER`
- `ADMINISTRATOR`

## Escopo organizacional

Campos canônicos:

- `memberTeamIds`
- `managedTeamIds`

Campo legado:

- `teamId`

Regra prática:

- `teamId` não é mais fonte de verdade para autorização;
- o backend já usa modelo multi-team;
- `accessGroup` complementa feature gating e navegação, sem substituir `role`.

## Homes por papel

| Papel | Destino |
| --- | --- |
| `ATTENDANT` | `/app/leads` |
| `MANAGER` | `/app/dashboard/operational` |
| `GENERAL_MANAGER` | `/app/dashboard/analytic` |
| `ADMINISTRATOR` | `/app/dashboard/analytic` |

## Rotas públicas

- `/`
- `/login`
- `/forgot-password`
- `/register`

Observações:

- `/` redireciona para `/login` sem sessão;
- `/register` está fora do fluxo público efetivo.

## Rotas protegidas

Todas as rotas sob `/app/*`.

## Estado do frontend autenticado

O shell autenticado hoje possui:

- sidebar;
- topbar sem search global;
- dropdown do utilizador;
- páginas reais para `profile`, `leads`, `customers`, `stores`, `teams` e `users`;
- dashboards ainda em placeholder.
