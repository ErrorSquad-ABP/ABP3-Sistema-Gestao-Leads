# Sprint 3 Goal

## Objetivo

Formalizar o objetivo central da Sprint 3 a partir do feedback do parceiro comercial e do estado da `main` após a Sprint 2, concentrando o time em padronização visual, UX operacional, KPIs com valor real e fechamento do audit log.

## Contexto

A Sprint 2 entregou o bloco comercial e gerencial do CRM:

- veículos e negociações `end-to-end`;
- dashboards operacional e analítico com dados reais;
- detalhe do lead com timeline;
- identidade visual Quantum CRM consolidada nas telas principais.

O parceiro (1000 Valle Multimarcas) validou a direção funcional, mas apontou desconforto visual (cores vibrantes e inconsistentes), redundância de KPIs e gráficos em telas operacionais, e lacunas de acabamento em lojas, equipes, usuários e auditoria.

A retrospective da Sprint 2 já direcionava este ciclo para refinamento, qualidade e audit log completo.

## Direção adotada

- priorizar **simplicidade visual** sobre variedade cromática;
- congelar uma paleta pastel ancorada em `--brand-accent` e aplicá-la globalmente;
- extrair componentes compartilhados (`KpiCard`, paginação, zebra, utilitários de cor de gráfico) antes de refatorar telas;
- mover analytics para dashboards e deixar telas operacionais focadas em listagem e ação;
- revisar KPIs pela pergunta “que decisão isso habilita?”;
- tratar audit log e persistência estendida de lojas como frentes fullstack explícitas;
- manter o modelo `1 card Trello = 1 épico end-to-end`.

## Sprint Goal

Entregar alinhamento de padronização e UX em todo o Quantum CRM, com paleta única, KPIs úteis, modais de detalhe onde couber, audit log consultável (`RF07`), integração Google Calendar (leitura) em negociações e evolução de lojas, equipes e usuários conforme feedback do cliente.

## Resultado de negócio esperado

Ao final da sprint, a equipe deve conseguir demonstrar que:

- o sistema parece **um produto único**, sem choque de cores entre dashboards, negociações e listagens;
- gestores leem indicadores com conforto visual e cores semânticas previsíveis;
- operadores encontram leads trabalháveis por padrão, sem gráficos redundantes na listagem;
- administradores consultam trilha de auditoria completa;
- lojas possuem cadastro persistido além do nome;
- equipes e usuários refletem a organização real da revenda;
- negociações exibem atividades importantes vindas do Google Calendar do usuário logado.

## Escopo que sustenta o goal

- design system compartilhado (tokens, KPIs, gráficos, paginação, tabelas);
- dashboards operacional e analítico refinados;
- clientes, leads, negociações, veículos, lojas, equipes e usuários alinhados ao design system;
- audit log `end-to-end`;
- Google Calendar OAuth (leitura);
- documentação ágil e especificação técnica do feedback do cliente.

## O que não faz parte do Sprint Goal

- recuperação de senha por e-mail;
- cadastro público de conta;
- polimento final de apresentação de banca (julho);
- Google Calendar com escrita de eventos;
- gestão completa de estoque de veículos;
- novos módulos funcionais grandes fora do feedback registrado.

## Critérios para considerar o goal atingido

- paleta e componentes compartilhados aplicados nas telas prioritárias;
- feedback documentado em [`sprint-3-client-feedback-spec.md`](./sprint-3-client-feedback-spec.md) atendido ou explicitamente diferido com justificativa;
- `RF07` fechado com API, cobertura de eventos e UI administrativa;
- lojas com campos persistidos no banco;
- usuários com edição ampliada e suporte a múltiplos grupos sem herança hierárquica implícita;
- cards da Sprint 3 criados no Trello com checklists alinhados ao breakdown;
- documentação impactada atualizada junto das entregas.
