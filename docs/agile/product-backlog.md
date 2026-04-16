# Product Backlog

## Objetivo

Organizar o backlog inicial do produto em formato de épicos e `User Stories`, com prioridade orientada por criticidade de implementação, valor de negócio e dependências técnicas. Este documento foi elaborado a partir do enunciado oficial do ABP e do estado atual do repositório, para que a equipe consiga trabalhar sem depender da leitura constante do PDF da disciplina.

## Contexto do produto

A 1000 Valle Multimarcas precisa de um sistema para registrar e acompanhar leads comerciais originados por múltiplos canais, associando cada lead a cliente, loja, atendente responsável, veículo ofertado e negociação. Além do fluxo operacional, a solução deve entregar dashboards gerenciais e analíticos, com filtros temporais e controle de acesso por perfil hierárquico.

O repositório já parte de uma base técnica pronta para evolução incremental:

- `front` em `Next.js`;
- `back` em `NestJS`;
- PostgreSQL com estratégia de `migrations` e `seeds`;
- Docker e Docker Compose;
- quality gate com Biome, ESLint e TypeScript;
- documentação arquitetural e de governança já iniciada.

Isso significa que o backlog abaixo foca principalmente o que ainda precisa ser implementado como produto e como capacidade real de negócio.

## Estado do produto após a Sprint 1

Leitura executiva da `main` no início da Sprint 2:

- `EP-01` Identidade e Acesso: fechado no núcleo funcional;
- `EP-02` Estrutura Organizacional: fechado no núcleo funcional;
- `EP-03` Clientes e Leads: fechado no núcleo transacional;
- `EP-07` Veículos: não iniciado como módulo de produto;
- `EP-04` Negociações: não iniciado como módulo de produto;
- `EP-05` Dashboards e Filtros: não iniciado como produto; telas atuais ainda são placeholder;
- `EP-06` Auditoria e Entrega Final: parcial, com base documental e arquitetural, mas sem logs operacionais de produto e com pendência de aderência total do Compose ao edital.

Implicação prática:

- a Sprint 2 deve priorizar veículos, negociações, dashboards, filtros temporais e auditoria;
- o valor percebido pelo parceiro precisa crescer no frontend, não só na fundação do backend.

## Requisitos funcionais de referência

| Código | Resumo executivo |
| --- | --- |
| `RF01` | Autenticação por e-mail e senha com emissão de JWT contendo identificador do usuário, papel e expiração, além de atualização do próprio e-mail e senha |
| `RF02` | Controle de acesso baseado em papéis para `Atendente`, `Gerente`, `Gerente Geral` e `Administrador`, com autorização aplicada exclusivamente no backend |
| `RF03` | Gestão de negociações vinculadas ao lead, com importância, estágio, status, situação aberta ou encerrada e histórico de mudanças |
| `RF04` | Dashboard operacional com total de leads, distribuição por status, origem, loja e importância, com filtro padrão dos últimos 30 dias |
| `RF05` | Dashboard analítico com taxa de conversão, comparativo convertidos x não convertidos, indicadores por atendente e equipe, importância, motivos de finalização e tempo médio até atendimento |
| `RF06` | Filtros temporais por semana, mês, ano e período customizado, com limite máximo de um ano para não administradores e validação obrigatória no backend |
| `RF07` | Logs de login e operações de clientes, usuários, times, leads e negociações, com data, hora, responsável e visualização completa para administrador |

## Requisitos não funcionais de referência

| Código | Resumo executivo |
| --- | --- |
| `RNF01` | Separação clara entre frontend e backend, API REST estruturada e organização modular de código |
| `RNF02` | Segurança com hash seguro de senha, JWT, middleware/guards, variáveis de ambiente e permissão validada somente no backend |
| `RNF03` | Consultas analíticas otimizadas e dashboard com boa resposta interativa |
| `RNF04` | Interface responsiva, navegação intuitiva e feedback visual adequado |
| `RNF05` | Integridade referencial, tratamento de exceções e consistência transacional |
| `RNF06` | Documentação completa com visão geral, DER, UML, endpoints, README e instruções de execução |
| `RNF07` | Execução via Docker com PostgreSQL, backend e frontend orquestrados por Docker Compose |
| `RNF08` | Práticas ágeis com backlog priorizado, sprint backlog, papéis, DoD, retrospectivas e entregas incrementais |
| `RNF09` | Versionamento com Git, repositório público, branches organizadas e commits descritivos |
| `RNF10` | Uso explícito e justificado de padrões de projeto GoF |
| `RNF11` | Adoção explícita de padrão arquitetural reconhecido |
| `RNF12` | Organização em camadas com apresentação, aplicação, domínio e acesso a dados |
| `RNF13` | Separação de responsabilidades, baixo acoplamento, alta coesão e aderência ao SRP |

## Restrições transversais

As histórias abaixo devem ser implementadas respeitando continuamente:

- `RP01`: frontend em React com TypeScript, backend em Node.js com TypeScript e banco PostgreSQL;
- `RP02`: execução completa exclusivamente via containers Docker;
- `RP03`: modelo relacional implementado com migrations e seeds versionados no fluxo do backend;
- `RP04`: desenvolvimento incremental ao longo das sprints;
- `RP05`: evidência clara de padrão arquitetural, padrões GoF e separação de responsabilidades;
- `RP06`: documentação arquitetural obrigatória no repositório.

## Estratégia de priorização

A ordem do backlog segue quatro perguntas:

1. O item destrava outros itens?
2. O item entrega valor direto ao fluxo comercial principal?
3. O item reduz risco técnico, de segurança ou de banca?
4. O item consegue ser demonstrado incrementalmente ao fim de uma sprint?

## Estado atual da base

Os pontos abaixo já estão parcialmente ou totalmente cobertos pela fundação do repositório e, por isso, não aparecem como histórias principais de implementação:

- separação `front` e `back` em `single repository`;
- arquitetura base do backend em `NestJS` com modularidade e camadas;
- quality gate, governança de branches e regras de commits;
- Docker Compose, estratégia inicial de banco e documentação estrutural.

## Mapa de épicos

| Épico | Nome | Objetivo | Prioridade | Sprint foco |
| --- | --- | --- | --- | --- |
| `EP-01` | Identidade e Acesso | Garantir autenticação, atualização de credenciais e RBAC no backend | Crítica | Sprint 1 |
| `EP-02` | Estrutura Organizacional | Sustentar usuários, equipes, lojas e vínculos administrativos | Alta | Sprint 1 |
| `EP-03` | Clientes e Leads | Entregar o núcleo operacional do processo comercial | Alta | Sprint 1 |
| `EP-07` | Veículos | Representar o objeto comercial negociado e vinculá-lo ao funil | Alta | Sprint 2 |
| `EP-04` | Negociações | Controlar evolução comercial e histórico do funil | Alta | Sprint 2 |
| `EP-05` | Dashboards e Filtros | Expor indicadores operacionais e analíticos com recorte temporal | Alta | Sprint 2 e Sprint 3 |
| `EP-06` | Auditoria e Entrega Final | Garantir logs, documentação final, segurança, desempenho e estabilidade | Alta | Sprint 3 e contínuo |

## Foco confirmado para Sprint 2

Os cards da Sprint 2 deixam de ser tarefas por camada e passam a ser épicos fullstack `end-to-end`, com responsável único por feature. O recorte confirmado é:

- negociações;
- veículos;
- dashboard operacional;
- dashboard analítico com filtros temporais;
- logs de auditoria;
- conformidade de execução local com PostgreSQL em Docker Compose e fechamento arquitetural impactado.

## Visão priorizada dos épicos e stories

| Ordem | Épico | Stories |
| --- | --- | --- |
| 1 | `EP-01` | `US-01`, `US-02`, `US-03` |
| 2 | `EP-02` | `US-04`, `US-05` |
| 3 | `EP-03` | `US-06`, `US-07`, `US-08` |
| 4 | `EP-07` | `US-17`, `US-18` |
| 5 | `EP-04` | `US-09`, `US-10` |
| 6 | `EP-05` | `US-11`, `US-12`, `US-13` |
| 7 | `EP-06` | `US-14`, `US-15`, `US-16` |

## EP-01 - Identidade e Acesso

### Objetivo do épico

Criar a base de autenticação e autorização que sustenta todos os fluxos protegidos do sistema.

### Requisitos relacionados

- `RF01`
- `RF02`
- `RNF02`
- `RNF11`
- `RNF12`
- `RNF13`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-01` | Implementar autenticação por e-mail e senha com JWT | Crítica | Sprint 1 | Não iniciado |
| `US-02` | Permitir atualização do próprio e-mail e da própria senha | Crítica | Sprint 1 | Não iniciado |
| `US-03` | Implementar RBAC no backend para todos os perfis | Crítica | Sprint 1 | Não iniciado |

### US-01 - Implementar autenticação por e-mail e senha com JWT

**Como** usuário do sistema  
**Quero** autenticar com e-mail e senha  
**Para** acessar apenas os recursos compatíveis com o meu papel no sistema.

**Contexto**

Sem autenticação não existe fluxo protegido, nem rastreabilidade por usuário, nem base confiável para RBAC, logs ou dashboards por perfil.

**Requisitos relacionados**

- `RF01`: autenticação por e-mail e senha com token JWT;
- `RNF02`: segurança com hash seguro, JWT e proteção de rotas;
- `RNF12`: separação entre apresentação, aplicação e domínio;
- `RNF13`: regra de negócio não acoplada à interface.

**Saída esperada**

- endpoint de login;
- validação de credenciais;
- emissão de JWT com `userId`, `role` e expiração;
- hash seguro de senha no backend.

**Dependências**

- modelagem inicial de usuários no banco;
- estratégia de segredos e variáveis de ambiente.

### US-02 - Permitir atualização do próprio e-mail e da própria senha

**Como** usuário autenticado  
**Quero** atualizar minhas credenciais de acesso  
**Para** manter meus dados corretos e seguros sem depender de intervenção administrativa.

**Contexto**

Esse item é parte explícita do `RF01` e evita que o sistema fique dependente apenas de ações administrativas para manutenção de acesso.

**Requisitos relacionados**

- `RF01`: atualização do próprio e-mail e senha;
- `RNF02`: segurança das credenciais;
- `RNF05`: tratamento seguro de alteração de dados críticos.

**Saída esperada**

- rota protegida para atualização do próprio acesso;
- validação de senha atual e nova senha;
- atualização segura de e-mail e senha com auditoria futura.

### US-03 - Implementar RBAC no backend para todos os perfis

**Como** organização  
**Quero** que cada perfil enxergue e execute apenas o que lhe é permitido  
**Para** preservar governança, segurança e aderência ao enunciado.

**Contexto**

Esta é a história mais crítica depois da autenticação, porque praticamente todo o restante do sistema depende dela. O ABP deixa explícito que a autorização não pode existir só no frontend.

**Requisitos relacionados**

- `RF02`: regras para `Atendente`, `Gerente`, `Gerente Geral` e `Administrador`;
- `RNF02`: autorização no backend;
- `RNF11`: padrão arquitetural reconhecido;
- `RNF12`: organização em camadas;
- `RNF13`: baixo acoplamento e SRP.

**Saída esperada**

- guards, policies ou mecanismo equivalente no backend;
- restrição por papel e por escopo de dados;
- reaproveitamento da regra de autorização entre módulos.

## EP-02 - Estrutura Organizacional

### Objetivo do épico

Representar a estrutura administrativa e comercial que permitirá distribuir responsabilidade, escopo e governança dentro do sistema.

### Requisitos relacionados

- `RF02`
- `RNF01`
- `RNF05`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-04` | Implementar gestão administrativa de usuários | Alta | Sprint 1 | Não iniciado |
| `US-05` | Implementar gestão administrativa de equipes e lojas | Alta | Sprint 1 | Não iniciado |

### US-04 - Implementar gestão administrativa de usuários

**Como** administrador  
**Quero** criar, listar, editar e excluir usuários  
**Para** manter a estrutura operacional do sistema.

**Contexto**

Sem usuários consistentes, o sistema não consegue associar responsabilidades a leads, equipes, lojas ou dashboards.

**Requisitos relacionados**

- `RF02`: permissões do administrador sobre usuários;
- `RNF01`: API REST estruturada;
- `RNF05`: integridade e consistência transacional.

**Saída esperada**

- CRUD administrativo de usuários;
- suporte aos perfis obrigatórios do sistema;
- consistência entre usuário, equipe e papel.

### US-05 - Implementar gestão administrativa de equipes e lojas

**Como** administrador  
**Quero** administrar equipes e lojas  
**Para** refletir a estrutura comercial real da empresa e viabilizar segmentação de leads e dashboards.

**Contexto**

Equipes e lojas são dependências diretas do cadastro de leads, da visão gerencial e dos filtros operacionais. Embora o enunciado detalhe explicitamente o CRUD de equipes, as lojas fazem parte do domínio descrito no desafio e são obrigatórias para vincular leads, compor dashboards e refletir a operação real da parceira.

**Requisitos relacionados**

- `RF02`: permissões do administrador sobre equipes;
- `RF04`: dashboard por loja;
- `RNF05`: integridade referencial.

**Saída esperada**

- CRUD de equipes;
- cadastro de lojas;
- vínculos entre usuários, equipes e lojas;
- base para escopo gerencial e geral.

## EP-03 - Clientes e Leads

### Objetivo do épico

Entregar o fluxo operacional principal do sistema, permitindo registrar clientes, leads e escopo de atuação por perfil.

### Requisitos relacionados

- `RF02`
- `RF04`
- `RNF05`
- `RNF13`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-06` | Implementar cadastro e manutenção de clientes | Alta | Sprint 1 | Não iniciado |
| `US-07` | Implementar cadastro, listagem e edição de leads com vínculo completo | Alta | Sprint 1 | Não iniciado |
| `US-08` | Garantir escopo de visualização e edição de leads por perfil | Alta | Sprint 1 | Não iniciado |

### US-06 - Implementar cadastro e manutenção de clientes

**Como** atendente ou administrador autorizado  
**Quero** cadastrar e atualizar clientes relacionados aos leads  
**Para** não perder o histórico comercial do potencial comprador.

**Contexto**

O lead não pode existir isolado do cliente no domínio do negócio. O relacionamento entre ambos é parte central do problema descrito pela parceira.

**Requisitos relacionados**

- `RF02`: criação e atualização de clientes pelos perfis permitidos;
- `RNF05`: integridade referencial;
- `RNF13`: regras de negócio separadas da camada de interface.

**Saída esperada**

- entidade e persistência de cliente;
- vínculo entre cliente e lead;
- rotas para cadastro e manutenção dentro do escopo permitido.

### US-07 - Implementar cadastro, listagem e edição de leads com vínculo completo

**Como** atendente ou administrador autorizado  
**Quero** registrar e manter leads com origem, cliente, loja e atendente responsável  
**Para** iniciar e acompanhar o processo comercial corretamente.

**Contexto**

Este é o coração operacional do produto. Sem lead estruturado, não existe negociação, dashboard ou rastreabilidade gerencial.

**Requisitos relacionados**

- `RF02`: criação, listagem e edição de leads conforme perfil;
- `RF04`: uso de origem, loja e importância no dashboard operacional;
- `RNF05`: consistência transacional.

**Saída esperada**

- CRUD de leads dentro do escopo permitido;
- associação a cliente, origem, loja e atendente;
- dados prontos para dashboards e negociações.

### US-08 - Garantir escopo de visualização e edição de leads por perfil

**Como** organização  
**Quero** controlar quem vê e edita quais leads  
**Para** respeitar hierarquia, privacidade operacional e regras do ABP.

**Contexto**

Não basta ter RBAC de rota. O sistema precisa respeitar também o escopo do dado: atendente vê os próprios leads, gerente vê os da equipe, gerente geral vê visão consolidada e administrador vê tudo.

**Requisitos relacionados**

- `RF02`: escopos específicos por papel;
- `RNF02`: autorização exclusivamente no backend;
- `RNF03`: consultas preparadas para filtros e visões por equipe.

**Saída esperada**

- filtros e regras por escopo de usuário;
- listagens coerentes com a hierarquia;
- proteção contra acesso indevido a dados de outras equipes.

## EP-07 - Veículos

### Objetivo do épico

Representar o veículo como objeto comercial negociado, permitindo que o CRM trate o interesse do cliente em algo concreto do portfólio da revenda.

### Requisitos relacionados

- `RF03`
- `RF04`
- `RNF05`
- `RNF13`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-17` | Implementar catálogo operacional de veículos | Alta | Sprint 2 | Não iniciado |
| `US-18` | Vincular veículo ao fluxo de lead e negociação | Alta | Sprint 2 | Não iniciado |

### US-17 - Implementar catálogo operacional de veículos

**Como** administrador ou operação autorizada  
**Quero** cadastrar e manter veículos negociáveis no CRM  
**Para** que as negociações sejam feitas sobre um objeto comercial real, e não sobre um registro abstrato.

**Contexto**

O módulo de negociação perde aderência ao domínio da revenda se não houver um veículo associado ao interesse comercial. O veículo passa a ser a peça que conecta lead, oferta e parte dos indicadores gerenciais.

**Requisitos relacionados**

- `RF03`: negociação vinculada ao processo comercial do lead;
- `RF04`: necessidade de leitura operacional coerente do pipeline;
- `RNF05`: integridade referencial entre os elementos do fluxo;
- `RNF13`: separação de responsabilidade entre catálogo, lead e negociação.

**Saída esperada**

- entidade e persistência de veículo;
- CRUD ou catálogo operacional de veículos;
- campos mínimos para identificação comercial do veículo;
- API pronta para seleção e vínculo no fluxo operacional.

### US-18 - Vincular veículo ao fluxo de lead e negociação

**Como** atendente ou gestor autorizado  
**Quero** associar um veículo ao interesse comercial do cliente  
**Para** que o lead e a negociação reflitam o objeto real da venda.

**Contexto**

Não basta ter o catálogo disponível. O valor do módulo aparece quando o veículo entra no contexto operacional do lead e no contrato da negociação.

**Requisitos relacionados**

- `RF03`: criação e evolução de negociação com contexto comercial completo;
- `RNF05`: consistência transacional;
- `RNF12`: contrato e regra de vínculo bem definidos entre os módulos.

**Saída esperada**

- vínculo do veículo ao lead, à negociação ou ao modelo de relação definido pela sprint;
- exibição do veículo no detalhe do lead e da negociação;
- proteção de regra para evitar vínculos inválidos;
- base pronta para leituras analíticas futuras envolvendo portfólio comercial.

## EP-04 - Negociações

### Objetivo do épico

Controlar a evolução comercial do lead até a conclusão da negociação, com histórico, consistência de estados e vínculo ao veículo ofertado.

### Requisitos relacionados

- `RF03`
- `RF07`
- `RNF05`
- `RNF12`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-09` | Implementar gestão de negociações por lead | Alta | Sprint 2 | Não iniciado |
| `US-10` | Registrar histórico de estágio e status das negociações | Alta | Sprint 2 | Não iniciado |

### US-09 - Implementar gestão de negociações por lead

**Como** atendente responsável  
**Quero** criar e atualizar uma negociação vinculada ao lead  
**Para** registrar a evolução comercial com importância, estágio e status.

**Contexto**

A negociação transforma o lead em fluxo comercial real. Ela é o ponto de ligação entre operação, veículo ofertado e indicadores analíticos.

**Requisitos relacionados**

- `RF03`: criação de negociação, importância, aberto/encerrado, status e estágio;
- `RNF05`: consistência transacional;
- `RNF12`: separação entre regras, serviços e persistência.

**Saída esperada**

- entidade de negociação;
- endpoints e casos de uso para manutenção;
- vínculo explícito com o veículo do processo comercial;
- validação de estados da negociação no backend;
- garantia de que cada lead possua no máximo uma negociação ativa.

### US-10 - Registrar histórico de estágio e status das negociações

**Como** gestor ou administrador  
**Quero** consultar o histórico das mudanças de negociação  
**Para** entender a evolução do atendimento e a causa dos resultados.

**Contexto**

O histórico é essencial para auditoria, análise de desempenho e explicação de motivos de conversão ou perda.

**Requisitos relacionados**

- `RF03`: manutenção do histórico de mudanças;
- `RF07`: logs operacionais;
- `RNF05`: consistência e rastreabilidade.

**Saída esperada**

- registro de cada mudança relevante;
- vínculo com usuário responsável e data/hora;
- base pronta para logs e analytics.

## EP-05 - Dashboards e Filtros

### Objetivo do épico

Entregar visibilidade operacional e analítica do funil comercial, com filtros temporais e escopo adequado por perfil.

### Requisitos relacionados

- `RF04`
- `RF05`
- `RF06`
- `RNF03`
- `RNF04`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-11` | Entregar dashboard operacional com visão dos últimos 30 dias | Média | Sprint 2 | Não iniciado |
| `US-12` | Implementar filtros temporais com validação de limite por perfil | Média | Sprint 2 | Não iniciado |
| `US-13` | Entregar dashboard analítico conforme o papel do usuário | Alta | Sprint 3 | Não iniciado |

### US-11 - Entregar dashboard operacional com visão dos últimos 30 dias

**Como** gerente, gerente geral ou administrador  
**Quero** ver rapidamente o cenário operacional dos leads  
**Para** acompanhar volume, origem, distribuição e andamento da operação.

**Contexto**

Este dashboard é o primeiro grande ganho visível para gestão e deve surgir antes do analítico mais pesado.

**Requisitos relacionados**

- `RF04`: total de leads, status, origem, loja, importância e filtro padrão de 30 dias;
- `RNF03`: desempenho de consultas;
- `RNF04`: experiência responsiva e clara.

**Saída esperada**

- endpoint consolidado de dashboard operacional;
- frontend consumindo indicadores prontos;
- total de leads no período;
- distribuição por status;
- distribuição por origem;
- distribuição por loja;
- distribuição por importância;
- filtro padrão dos últimos 30 dias funcionando com boa resposta.

### US-12 - Implementar filtros temporais com validação de limite por perfil

**Como** usuário gerencial  
**Quero** filtrar dashboards por semana, mês, ano ou período customizado  
**Para** analisar o comportamento do funil comercial ao longo do tempo.

**Contexto**

O filtro temporal é transversal e impacta tanto dashboards quanto futuras listagens e relatórios.

**Requisitos relacionados**

- `RF06`: filtros por semana, mês, ano e período customizado;
- `RF06`: limite de um ano para não administradores;
- `RNF02`: validação obrigatória no backend;
- `RNF03`: consultas otimizadas.

**Saída esperada**

- contrato padrão de filtros temporais;
- validação de intervalo no backend;
- reutilização do filtro em dashboards operacionais e analíticos.

### US-13 - Entregar dashboard analítico conforme o papel do usuário

**Como** gestor  
**Quero** ver taxa de conversão, desempenho por atendente ou equipe e motivos de finalização  
**Para** tomar decisão gerencial baseada em dados.

**Contexto**

Este item depende de dados consistentes de leads, negociações, histórico e filtros temporais. Por isso ele entra depois da parte transacional.

**Requisitos relacionados**

- `RF05`: taxa de conversão, convertidos x não convertidos, atendente, equipe, importância, motivos e tempo médio;
- `RF02`: recortes diferentes por `Gerente`, `Gerente Geral` e `Administrador`;
- `RNF03`: otimização analítica.

**Saída esperada**

- indicadores consolidados por perfil;
- regras de visibilidade no backend;
- consultas analíticas orientadas a performance.

## EP-06 - Auditoria e Entrega Final

### Objetivo do épico

Garantir rastreabilidade, documentação final, segurança, desempenho e estabilidade da solução para a entrega acadêmica e para evolução do produto.

### Requisitos relacionados

- `RF07`
- `RNF02`
- `RNF03`
- `RNF05`
- `RNF06`
- `RNF07`
- `RNF08`
- `RNF09`
- `RNF10`
- `RNF11`

### User Stories do épico

| ID | História | Prioridade | Sprint sugerida | Status inicial |
| --- | --- | --- | --- | --- |
| `US-14` | Implementar auditoria e logs administrativos | Média | Sprint 3 | Não iniciado |
| `US-15` | Consolidar documentação técnica e artefatos finais do ABP | Alta | Sprint 3 | Em andamento |
| `US-16` | Endurecer segurança, desempenho e confiabilidade para entrega final | Alta | Contínuo | Em andamento |

### US-14 - Implementar auditoria e logs administrativos

**Como** administrador  
**Quero** visualizar logs de login e operações críticas  
**Para** auditar o uso do sistema e rastrear alterações relevantes.

**Contexto**

Auditoria é requisito funcional e também fortalece a defesa técnica da solução na banca.

**Requisitos relacionados**

- `RF07`: logs de login e operações em clientes, usuários, times, leads e negociações;
- `RNF02`: segurança;
- `RNF05`: confiabilidade e rastreabilidade.

**Saída esperada**

- registro de eventos com usuário responsável, data e hora;
- logs de login;
- logs de criação, atualização e exclusão de clientes;
- logs de criação, atualização e exclusão de usuários;
- logs de criação, atualização e exclusão de times;
- logs de criação, atualização e exclusão de leads;
- logs de criação, atualização e exclusão de negociações;
- consulta administrativa de logs;
- integração com eventos ou serviço transversal de auditoria.

### US-15 - Consolidar documentação técnica e artefatos finais do ABP

**Como** equipe  
**Quero** manter documentação técnica, UML, DER e endpoints atualizados  
**Para** sustentar a execução do projeto e a apresentação final.

**Contexto**

Este item não deve ser deixado para o final. A documentação precisa acompanhar a evolução para evitar retrabalho e perda de contexto.

**Requisitos relacionados**

- `RNF06`: visão geral, DER, UML, rotas e instruções de execução;
- `RNF08`: artefatos ágeis;
- `RNF10` e `RNF11`: registro dos padrões adotados.

**Saída esperada**

- atualização contínua do repositório;
- artefatos finais consistentes com o código;
- documentação defensável na banca.

### US-16 - Endurecer segurança, desempenho e confiabilidade para entrega final

**Como** equipe técnica  
**Quero** revisar segurança, desempenho e consistência antes da entrega final  
**Para** reduzir risco funcional, técnico e acadêmico.

**Contexto**

Este é um item contínuo, mas ganha peso maior nas últimas sprints, quando o sistema já possui fluxo funcional mais completo.

**Requisitos relacionados**

- `RNF02`: segurança;
- `RNF03`: desempenho;
- `RNF05`: confiabilidade;
- `RNF07`: execução conteinerizada;
- `RNF09`: versionamento e fluxo organizado.

**Saída esperada**

- revisão de índices, consultas e exceções;
- revisão de segredos, rotas sensíveis e logs;
- estabilização do fluxo completo em Docker.

## Sequência sugerida por sprint

### Sprint 1

- `EP-01`
- `EP-02`
- `EP-03`

### Sprint 2

- `EP-04`
- `EP-05` com foco em `US-11` e `US-12`

### Sprint 3

- `EP-05` com foco em `US-13`
- `EP-06`

### Contínuo

- `US-16`

## Dependências críticas

- Sem autenticação e RBAC, o restante do sistema fica bloqueado ou inseguro.
- Sem usuários, equipes, lojas, clientes e leads, a negociação não se sustenta.
- Sem negociação e histórico, os dashboards analíticos perdem sentido ou viram métricas frágeis.
- Sem documentação e hardening contínuos, a entrega final acumula risco desnecessário.

## Observação

Este backlog é um artefato vivo. Ele deve ser refinado ao final de cada sprint, quebrado em tarefas menores quando necessário e mantido coerente com o código, os PRs e os aprendizados do projeto.
