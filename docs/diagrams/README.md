# Diagramas

## Objetivo

Centralizar a referência dos diagramas do projeto, tanto os versionados diretamente no repositório quanto os mantidos em ferramentas externas com acesso `view-only`.

## Direção adotada

- manter uma única entrada para consulta de diagramas;
- registrar o tipo de cada diagrama sempre que ele estiver identificado;
- registrar o nome funcional de cada diagrama quando ele já estiver validado pela equipe;
- aceitar links externos `view-only` sem espalhá-los em múltiplos arquivos;
- referenciar os diagramas válidos também nos artefatos temáticos do projeto.

## Status atual

No momento, existem dois diagramas externos em `Mermaid` compartilhados em modo `view-only` já validados como `diagramas de classes`.

Eles ficam registrados aqui como referência oficial externa e devem ser considerados parte válida do conjunto arquitetural atual do projeto.

## Diagramas versionados no repositório (Mermaid em Markdown)

| Código | Local | Tipo | Descrição |
| --- | --- | --- | --- |
| `DG-IA-FRONT-01` | [`../architecture/frontend-information-architecture.md`](../architecture/frontend-information-architecture.md) | Vários (flowchart, sequence) | Mapa da app, RBAC UI, shell, jornada lead/negociação, widgets RF05 |

## Links externos classificados

| Código | Ferramenta | Tipo atual | Nome do diagrama | Link |
| --- | --- | --- | --- | --- |
| `DG-CLS-01` | Mermaid | Diagrama de classes | `Implementation Lead Management System` | [Abrir Implementation Lead Management System](https://mermaid.ai/app/projects/26c31454-bd15-4064-8f25-ca1b82e1d29f/diagrams/74527d87-a224-4f95-9a4c-78d6b99e4eaa/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiNzQ1MjdkODctYTIyNC00Zjk1LTlhNGMtNzhkNmI5OWU0ZWFhIiwiYWNjZXNzIjoiVmlldyIsImlhdCI6MTc3NDkxNzIzOX0.BizKz05JwVG7NXHuELDGl9NVVdjmrfcx-u-qEx2z_-E) |
| `DG-CLS-02` | Mermaid | Diagrama de classes | `Domain Lead Management System` | [Abrir Domain Lead Management System](https://mermaid.ai/app/projects/26c31454-bd15-4064-8f25-ca1b82e1d29f/diagrams/f9f8b87d-3f64-4a8e-88c8-5db65c3c007c/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiZjlmOGI4N2QtM2Y2NC00YThlLTg4YzgtNWRiNjVjM2MwMDdjIiwiYWNjZXNzIjoiVmlldyIsImlhdCI6MTc3NDkxODk5MX0.edBvujC2gvqjauClcXIpkMC-SSxGlcc6SoOOEnPBDfA) |

## Convenção de organização

Quando o conteúdo de cada diagrama estiver identificado, a recomendação é catalogar assim:

- `DER` e modelagem relacional: manter também referência em `docs/data/README.md`;
- `casos de uso`, `classes`, `componentes` e `sequência`: manter também referência em `docs/architecture/README.md`;
- diagramas temporários ou ainda em refinamento: manter primeiro aqui, até classificação final.

## Uso atual no projeto

1. `DG-CLS-01` e `DG-CLS-02` devem ser tratados como diagramas válidos de arquitetura do projeto.
2. As referências desses diagramas devem permanecer visíveis tanto em `docs/diagrams/README.md` quanto em `docs/architecture/README.md`.
3. Novos diagramas válidos devem entrar neste catálogo com código, nome funcional, tipo e link oficial.
