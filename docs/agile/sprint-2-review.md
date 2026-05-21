# Sprint 2 Review

## Objetivo

Consolidar o resultado real da Sprint 2 no estado atual da `develop`, registrando o incremento entregue, os requisitos funcionais cobertos e o escopo remanescente para a Sprint 3.

## Sprint

- Período oficial: `15/04/2026` a `21/05/2026`
- Fechamento documental: `20/05/2026`
- Goal original: entregar a evolução comercial do CRM com veículos, negociações, dashboards gerenciais, filtros temporais e trilha de auditoria, consolidando também a execução local aderente ao edital da ABP.

## Entregas efetivamente presentes na `develop`

### Fechadas

- refactor visual consolidado em todas as páginas principais da área autenticada;
- identidade visual própria do `Quantum CRM`, incluindo marca, sidebar, linguagem visual, componentes e padrão de telas;
- módulo de veículos `end-to-end`, com catálogo operacional, listagem, filtros, cadastro, edição, inativação e seleção em fluxos comerciais;
- módulo de negociações `end-to-end`, com pipeline, vínculo a lead e veículo, estágio, status, importância, valor, histórico e motivo de perda;
- detalhe operacional do lead com visão consolidada, timeline e integração com negociações;
- dashboard operacional consumindo dados reais;
- dashboard analítico consumindo dados reais, com funil, rankings, distribuição por importância, motivos de finalização e filtros temporais;
- validação temporal no backend, incluindo limite de um ano para usuários não administradores;
- execução local secundária com `front + back + PostgreSQL` via `docker-compose.local.yml`;
- documentação técnica, ágil, de API, runbooks e arquitetura atualizada para refletir o incremento da sprint.

### Requisitos funcionais cobertos

- `RF01`: autenticação e gestão de acesso;
- `RF02`: gestão operacional de leads;
- `RF03`: gestão de negociações;
- `RF04`: dashboard operacional;
- `RF05`: dashboard analítico;
- `RF06`: filtros temporais;
- `RF07`: base de trilha de auditoria e modelagem para logs administrativos.

### Parcialmente cobertas ou além do plano original

- a identidade visual evoluiu além do objetivo funcional da sprint e passou a posicionar o produto como `Quantum CRM`;
- o refactor visual deixou o frontend mais uniforme do que o planejado inicialmente para a Sprint 2;
- a documentação de IHC foi expandida para explicar as decisões de UI/UX aplicadas nas telas;
- a modelagem de auditoria já existe no backend, mas a cobertura completa de audit log fica como frente explícita da Sprint 3.

### Não fechadas na Sprint 2

- audit log completo como feature final, com cobertura ampla de eventos, consulta administrativa refinada e validação de ponta a ponta;
- refinamento visual fino para apresentação final;
- melhoria incremental de qualidade de código, redução de dívida técnica e revisão de consistência entre módulos.

## Leitura executiva

O goal da Sprint 2 foi atingido no que importava para transformar o CRM em um produto demonstrável: veículos, negociações, dashboards, filtros temporais, detalhe de lead e identidade visual foram consolidados. A Sprint 3 não carrega novo bloco funcional grande; ela deve focar em acabamento visual, qualidade de código e fechamento completo da auditoria.
