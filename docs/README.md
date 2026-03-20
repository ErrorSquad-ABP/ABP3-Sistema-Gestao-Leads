# Documentação do Projeto

Este diretório concentra os artefatos de apoio técnico, analítico e de gestão do projeto. A proposta é manter tudo versionado junto com o código para reduzir dispersão de conhecimento e facilitar rastreabilidade entre requisito, arquitetura, backlog e entrega.

## Estrutura

- `architecture/`: decisões arquiteturais, padrões adotados e diagramas.
- `api/`: convenções, contratos e inventário de endpoints.
- `data/`: modelo de dados, DER, dicionário e scripts SQL de apoio.
- `agile/`: backlog, cerimônias, Definition of Done, retrospectivas e planejamento de sprints.
- `quality/`: fluxo de validação, critérios de CI e convenções de revisão técnica.

## Entregáveis previstos

| Artefato | Local |
| --- | --- |
| Visão geral do produto | `../README.md` |
| Descrição da arquitetura adotada | `architecture/README.md` |
| Padrões de projeto utilizados | `architecture/README.md` |
| Descrição de endpoints e contratos | `api/README.md` |
| Modelo relacional e DER | `data/README.md` |
| Definition of Done | `agile/definition-of-done.md` |
| Product backlog inicial | `agile/product-backlog.md` |
| Sprints e cadência | `agile/sprints.md` |
| Fluxo de qualidade e revisão | `quality/README.md` |

## Princípios de documentação

- Documentar decisões e não apenas resultados.
- Evitar material solto fora do repositório.
- Manter uma trilha clara entre requisito, regra de negócio e implementação.
- Atualizar a documentação como parte da Definition of Done.
