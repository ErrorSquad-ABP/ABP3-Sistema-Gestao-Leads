# Sprint 1 Retrospective

## Objetivo

Registrar a retrospective da Sprint 1 com base no estado real da entrega, no processo adotado pelo time e na percepção do parceiro sobre o incremento apresentado.

## Contexto

- Sprint: `24/03/2026` a `14/04/2026`
- Resultado técnico: núcleo transacional entregue
- Resultado percebido: backend forte, frontend ainda com sensação de entrega visual menor do que o parceiro esperava

## O que funcionou bem

- o time conseguiu fechar autenticação, `RBAC`, dados mestres e operação inicial de leads sem bloqueios estruturais graves;
- a fundação técnica do backend sustentou bem a evolução incremental;
- o quality gate e a disciplina de documentação ajudaram a evitar regressões grandes;
- o deploy real em `Vercel + Neon` deixou o produto demonstrável fora do ambiente local;
- a organização por módulos e camadas ficou consistente com a arquitetura pretendida.

## O que não funcionou tão bem

- a percepção de valor do frontend ficou abaixo do esperado pelo parceiro;
- parte importante do esforço da sprint foi absorvida por fundação, contratos e backend, o que não apareceu tanto na demonstração visual;
- dashboards e indicadores, que são elementos naturalmente mais “apresentáveis”, ficaram fora da Sprint 1;
- a leitura externa do progresso ficou mais associada ao que era visível em tela do que ao que já estava sólido no domínio e na API.

## O que aprendemos

- robustez de backend sem expressão visual equivalente reduz a percepção de avanço do produto;
- em ciclos futuros, o time precisa equilibrar melhor base técnica e valor demonstrável de frontend;
- quando uma sprint fecha muito trabalho estrutural, a demo precisa explicitar isso com mais clareza para não parecer “pouca entrega”;
- o recorte por feature `end-to-end` é mais saudável para a próxima sprint do que cards quebrados por camada.

## Ajustes de processo para a Sprint 2

- tratar cada card principal como épico fullstack `end-to-end`;
- deixar explícito que o dono do card responde por backend, frontend, contratos, QA e documentação impactada;
- priorizar features com forte valor visual e demonstrável, especialmente dashboards e negociações;
- registrar impactos arquiteturais, `trade-offs` e diagramas no próprio fluxo da feature, e não como trabalho separado sem dono;
- preparar a demo com foco em narrativa de produto, não apenas em profundidade técnica.

## Resumo executivo

A Sprint 1 foi bem-sucedida no núcleo técnico e operacional do produto. O principal ponto de melhoria não está na qualidade da base entregue, mas no equilíbrio entre profundidade de backend e percepção visual de valor no frontend. A Sprint 2 deve corrigir exatamente isso.
