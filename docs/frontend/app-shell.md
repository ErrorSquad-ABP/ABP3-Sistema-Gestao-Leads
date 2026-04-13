# AppShell Autenticado

## Objetivo

Documentar a base visual e estrutural da área autenticada do frontend, para que o time não precise redescobrir:

- onde o shell entra;
- como a navegação é montada;
- como a paleta do login foi reaproveitada;
- quais partes já são definitivas e quais ainda são placeholder.

## Estado atual

O `AppShell` já é a moldura oficial da área autenticada do sistema.

Ele é composto por:

- sidebar;
- header com busca;
- menu de utilizador;
- área principal de conteúdo;
- navegação por papel.

Base principal:

- [front/src/app/app/layout.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/app/layout.tsx)

## Implementação

O shell atual foi montado a partir da referência do bloco `dashboard-shell-01`, mas adaptado ao design system do projeto.

Arquivos centrais:

- [app-sidebar.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar.tsx)
- [site-header.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/site-header.tsx)
- [nav-main.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/nav-main.tsx)
- [user-dropdown.tsx](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown.tsx)

## Direção visual

O shell deve seguir a mesma identidade do login.

Paleta de referência:

| Token | Cor |
| --- | --- |
| Background | `#F4F6F8` |
| Surface | `#FFFFFF` |
| Foreground | `#1B2430` |
| Primary | `#2D3648` |
| Primary hover | `#232B3B` |
| Accent / Ember | `#D96C3F` |
| Muted foreground | `#6B7687` |
| Border | `#D6DCE5` |

Base:

- [front/src/app/styles.css](/home/jvl0pes/Desktop/ABP3-Sistema-Gestao-Leads/front/src/app/styles.css)

## Comportamento esperado

### Sidebar

- apresenta apenas itens permitidos ao papel atual;
- hover usa `ember`;
- não deve usar fundo persistente de hover nos itens em repouso;
- deve manter separadores discretos, não agressivos.

### Header

- usa o mesmo fundo geral da página;
- não possui sistema de notificações por decisão de produto atual;
- mantém menu do utilizador como ponto de saída da sessão.

### Menu do utilizador

Estado atual:

- `Sair` executa logout real;
- `Perfil` e `Credenciais` ainda são ponte temporária para a área de usuários quando o papel permite;
- `Configurações` foi removido.

## Rotas que hoje renderizam dentro do shell

| Rota | Estado |
| --- | --- |
| `/app/dashboard/analytic` | Placeholder protegido |
| `/app/dashboard/operational` | Placeholder protegido |
| `/app/leads` | Placeholder protegido |
| `/app/users` | Placeholder protegido, admin only |

## Home por papel

| Papel | Entrada no shell |
| --- | --- |
| `ATTENDANT` | Leads |
| `MANAGER` | Dashboard Operacional |
| `GENERAL_MANAGER` | Dashboard Analítico |
| `ADMINISTRATOR` | Dashboard Analítico |

## Dependências novas introduzidas pelo shell

O shell trouxe novos componentes compartilhados da base `shadcn`, incluindo:

- sidebar;
- dropdown-menu;
- sheet;
- scroll-area;
- tooltip;
- avatar;
- badge;
- chart;
- table;

Isso já foi absorvido no frontend como fundação da área autenticada.

## O que ainda não está completo

- dashboards reais;
- listagem funcional de leads;
- gestão funcional de usuários;
- perfil próprio e credenciais como tela dedicada.

## Próxima camada natural

A próxima evolução sobre o shell deve privilegiar:

1. dashboard operacional real;
2. listagem de leads;
3. gestão de usuários;
4. perfil e credenciais do próprio usuário.
