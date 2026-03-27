# Sprint Goal - Sprint 1

## Objetivo

Formalizar o objetivo central da Sprint 1 de forma curta, executiva e compartilhável com o time, conectando a meta da sprint ao backlog priorizado e aos resultados esperados para o primeiro incremento do produto.

## Contexto

A Sprint 1 é o primeiro ciclo de implementação funcional do projeto. A base técnica do repositório já está pronta, então o desafio agora é transformar essa fundação em um fluxo mínimo utilizável, que prove a viabilidade da arquitetura e entregue valor inicial ao domínio do negócio.

O foco desta sprint recai sobre os épicos:

- `EP-01` Identidade e Acesso
- `EP-02` Estrutura Organizacional
- `EP-03` Clientes e Leads

## Direção adotada

- Priorizar o núcleo transacional antes de dashboards e analytics.
- Entregar um incremento demonstrável, não apenas estrutura de código.
- Manter segurança e autorização no backend desde a primeira entrega.
- Fechar a sprint com um fluxo mínimo que sustente a evolução para negociações na Sprint 2.

## Sprint Goal

Entregar um fluxo funcional inicial do sistema que permita autenticar usuários, aplicar controle de acesso por perfil e operar os dados mestres essenciais de usuários, equipes, lojas, clientes e leads.

## Resultado de negócio esperado

Ao final da sprint, a equipe deve conseguir demonstrar que:

- o acesso ao sistema está funcionando com segurança;
- o backend já respeita papéis e escopo básico de autorização;
- a operação inicial do funil comercial pode começar com cadastro de clientes e leads;
- a base do produto está pronta para evoluir para negociações na próxima sprint.

## Escopo que sustenta o goal

- `US-01` autenticação por e-mail e senha com JWT
- `US-02` atualização do próprio e-mail e da própria senha
- `US-03` RBAC no backend
- `US-04` gestão administrativa de usuários
- `US-05` gestão administrativa de equipes e lojas
- `US-06` cadastro e manutenção de clientes
- `US-07` cadastro, listagem e edição de leads

## O que não faz parte do Sprint Goal

- dashboards operacionais e analíticos;
- negociações e histórico de negociação;
- trilha completa de logs administrativos;
- pacote final de documentação de banca.

## Critérios para considerar o goal atingido

- login funcional com JWT emitido corretamente;
- atualização do próprio acesso disponível para usuário autenticado;
- perfis principais com autorização aplicada no backend;
- usuários, equipes e lojas operáveis no escopo inicial da sprint;
- clientes e leads cadastráveis e relacionáveis;
- demonstração funcional do fluxo rodando em ambiente local via Docker.

## Impactos e implicações

- O objetivo da sprint mantém o time focado no núcleo do sistema e evita dispersão prematura em analytics.
- O goal cria a base necessária para a Sprint 2 atacar negociações sem retrabalho estrutural.
- Se autenticação ou RBAC falharem, quase todo o restante da sprint perde valor operacional.

## Próximos passos

1. Executar a sprint backlog em cima das histórias comprometidas.
2. Revisar o goal no meio da sprint se houver risco real de escopo excessivo.
3. Validar ao fim da sprint se o incremento entregue sustenta a abertura do épico de negociações.
