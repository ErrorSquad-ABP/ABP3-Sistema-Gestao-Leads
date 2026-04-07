# Sprint 1 Planning

## Objetivo

Documentar o planejamento da Sprint 1 com base no `Product Backlog`, definindo meta da sprint, escopo comprometido, backlog de trabalho, riscos, dependências e critérios de conclusão. Este documento funciona como referência operacional para a execução do primeiro ciclo de desenvolvimento.

## Contexto

A Sprint 1 acontece de `24/03/2026` a `14/04/2026` e inaugura a fase de implementação funcional do projeto. A fundação técnica do repositório já está estabelecida, com `front` em `Next.js`, `back` em `NestJS`, PostgreSQL, Docker, quality gate e documentação-base.

Com isso, o foco da sprint deixa de ser infraestrutura e passa a ser a entrega do núcleo transacional inicial do produto: autenticação, autorização, estrutura organizacional e primeiras entidades de negócio que destravam o fluxo de leads.

## Direção adotada

- Priorizar as histórias que desbloqueiam o restante do sistema.
- Fechar a sprint com um fluxo funcional mínimo demonstrável de acesso e operação inicial.
- Concentrar autorização exclusivamente no backend desde a primeira entrega.
- Entregar persistência, contratos de API e interface inicial de forma coerente com o domínio.
- Evitar dashboards e analytics nesta sprint para não competir com o núcleo transacional.

## Meta da sprint

Entregar um fluxo mínimo utilizável para acesso ao sistema e operação inicial de dados mestres e leads, contemplando:

- autenticação com JWT;
- atualização do próprio acesso;
- RBAC no backend;
- gestão inicial de usuários, equipes e lojas;
- cadastro de clientes;
- cadastro e manutenção de leads com vínculos básicos.

## Escopo comprometido

### Épicos priorizados

- `EP-01` Identidade e Acesso
- `EP-02` Estrutura Organizacional
- `EP-03` Clientes e Leads

### User Stories comprometidas


| ID      | História                                                              | Justificativa                                                   | Resultado esperado                                               |
| ------- | --------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `US-01` | Implementar autenticação por e-mail e senha com JWT                   | Destrava todos os fluxos protegidos                             | Login funcional com token JWT e expiração                        |
| `US-02` | Permitir atualização do próprio e-mail e da própria senha             | Fecha o escopo mínimo de acesso do `RF01`                       | Fluxo protegido de atualização de credenciais                    |
| `US-03` | Implementar RBAC no backend para todos os perfis                      | Sustenta segurança e escopo de dados do projeto                 | Guards, policies ou mecanismo equivalente funcionando no backend |
| `US-04` | Implementar gestão administrativa de usuários                         | Base para operação e associação de responsabilidades            | CRUD inicial de usuários por perfil                              |
| `US-05` | Implementar gestão administrativa de equipes e lojas                  | Necessário para estruturar escopo gerencial e vínculo dos leads | CRUD inicial de equipes e cadastro de lojas                      |
| `US-06` | Implementar cadastro e manutenção de clientes                         | Entidade central do processo comercial                          | Cadastro e manutenção de clientes vinculáveis a leads            |
| `US-07` | Implementar cadastro, listagem e edição de leads com vínculo completo | Núcleo operacional do sistema                                   | Lead associado a cliente, loja, origem e atendente               |


### Escopo condicional


| ID      | História                                                     | Condição                                                                                                       |
| ------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `US-08` | Garantir escopo de visualização e edição de leads por perfil | Entra integralmente se `US-03` e `US-07` estabilizarem cedo; caso contrário, permanece como início de Sprint 2 |


## Fora de escopo nesta sprint

- `US-09` e `US-10`: negociações e histórico
- `US-11`, `US-12` e `US-13`: dashboards e filtros temporais
- `US-14`: auditoria e logs administrativos completos
- Fechamento do pacote documental final de banca

## Sprint backlog inicial

### Frente 1 - Banco e modelagem

- consolidar schema inicial de usuários, papéis, equipes, lojas, clientes e leads;
- evoluir `migrations` necessárias para o escopo da sprint;
- preparar seeds mínimos de apoio quando necessário;
- garantir constraints e chaves estrangeiras para o fluxo principal.

### Frente 2 - Backend de acesso e segurança

- implementar autenticação com JWT;
- implementar hash seguro de senha;
- criar mecanismo de autorização por papel no backend;
- habilitar atualização do próprio e-mail e senha;
- preparar DTOs, use cases, controllers e contratos dos módulos de acesso.

### Frente 3 - Backend administrativo e operacional

- criar módulo de usuários;
- criar módulo de equipes e lojas;
- criar módulo de clientes;
- criar módulo de leads;
- garantir vínculo entre usuário, equipe, loja, cliente e lead.

### Frente 4 - Frontend inicial

- estruturar telas de login e sessão;
- criar fluxo inicial de acesso autenticado;
- preparar interfaces mínimas para usuários, clientes e leads;
- integrar a aplicação web com a API via contratos explícitos;
- decidir por tela quando usar composição com endpoints por recurso e quando justificar endpoint agregador;
- evitar tratar mocks como direção principal da sprint, priorizando integração real sempre que o backend já sustentar o fluxo.

### Frente 5 - Documentação e contratos

- atualizar contratos mínimos da Sprint 1 em `docs/api`;
- manter backlog e planejamento consistentes com o que for sendo refinado;
- registrar decisões arquiteturais relevantes caso surjam novas preocupações transversais.

## Dependências críticas

1. Banco e modelagem precisam estabilizar usuários, equipes, lojas, clientes e leads antes do fechamento dos contratos.
2. Autenticação precisa estar pronta antes da validação completa de RBAC.
3. RBAC precisa existir antes da liberação segura das rotas administrativas e operacionais.
4. Usuários, equipes e lojas precisam existir antes do fluxo completo de lead.
5. Clientes e leads precisam estar estáveis antes de abrir a próxima sprint para negociações.

## Regras e diretrizes da sprint

- Toda autorização continua centralizada no backend.
- Nenhuma história será considerada concluída sem aderência ao `Definition of Done`.
- O escopo deve privilegiar completude funcional mínima, não volume de endpoints.
- A API deve seguir orientação por recurso como padrão; endpoint agregador é exceção consciente para dashboards e telas realmente pesadas.
- Se houver risco de sobrecarga, `US-08` é a primeira candidata a sair do compromisso principal.
- O time deve fechar a sprint com demonstração funcional dos fluxos entregues.

## Riscos e atenção

- `US-03` pode se expandir demais se o modelo de permissão não for mantido simples no primeiro ciclo.
- `US-04`, `US-05`, `US-06` e `US-07` compartilham dependência forte de modelagem relacional; atraso nisso impacta quase toda a sprint.
- Existe risco de o frontend tentar avançar mais rápido que os contratos do backend; por isso a integração deve seguir contratos mínimos claros.
- Se a equipe tentar incluir dashboards cedo demais, a sprint perde foco no núcleo transacional.

## Critérios de sucesso da sprint

- usuário consegue autenticar e obter acesso válido;
- usuário autenticado consegue atualizar o próprio acesso;
- backend aplica restrições de papel no fluxo principal;
- administrador consegue operar usuários, equipes e lojas;
- cliente pode ser cadastrado e vinculado a lead;
- lead pode ser criado, listado e editado com os vínculos essenciais;
- a entrega consegue ser demonstrada em ambiente local via Docker.

## Relação com o Definition of Done

Esta sprint adota integralmente os critérios definidos em `[definition-of-done.md](./definition-of-done.md)`, especialmente:

- PR aberto com template preenchido;
- revisão técnica realizada;
- build local e CI aprovados;
- typecheck e lint sem falhas bloqueantes;
- documentação atualizada quando houver impacto técnico ou funcional.

## Próximos passos

1. Refinar as tasks de implementação por módulo e por responsável.
2. Validar com o time se `US-08` fica como compromisso principal ou escopo condicional.
3. Atualizar este planejamento ao final da sprint com o resultado real da execução.
