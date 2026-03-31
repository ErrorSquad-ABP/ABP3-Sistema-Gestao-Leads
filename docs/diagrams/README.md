# Diagramas

## Objetivo

Centralizar a referência dos diagramas do projeto, tanto os versionados diretamente no repositório quanto os mantidos em ferramentas externas com acesso `view-only`.

## Direção adotada

- manter uma única entrada para consulta de diagramas;
- registrar o tipo de cada diagrama sempre que ele estiver identificado;
- aceitar links externos `view-only` sem espalhá-los em múltiplos arquivos;
- migrar o diagrama para a seção correta assim que o conteúdo estiver classificado.

## Status atual

No momento, existem dois diagramas externos em `Mermaid` compartilhados em modo `view-only` já identificados como `diagramas de classes`.

Eles ficam registrados aqui como referência oficial externa enquanto a equipe decide se também vai versionar a fonte Mermaid dentro do repositório.

## Links externos classificados

| Código | Ferramenta | Tipo atual | Link |
| --- | --- | --- | --- |
| `DG-CLS-01` | Mermaid | Diagrama de classes | [Abrir diagrama 01](https://mermaid.ai/app/projects/26c31454-bd15-4064-8f25-ca1b82e1d29f/diagrams/74527d87-a224-4f95-9a4c-78d6b99e4eaa/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiNzQ1MjdkODctYTIyNC00Zjk1LTlhNGMtNzhkNmI5OWU0ZWFhIiwiYWNjZXNzIjoiVmlldyIsImlhdCI6MTc3NDkxNzIzOX0.BizKz05JwVG7NXHuELDGl9NVVdjmrfcx-u-qEx2z_-E) |
| `DG-CLS-02` | Mermaid | Diagrama de classes | [Abrir diagrama 02](https://mermaid.ai/app/projects/26c31454-bd15-4064-8f25-ca1b82e1d29f/diagrams/f9f8b87d-3f64-4a8e-88c8-5db65c3c007c/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiZjlmOGI4N2QtM2Y2NC00YThlLTg4YzgtNWRiNjVjM2MwMDdjIiwiYWNjZXNzIjoiVmlldyIsImlhdCI6MTc3NDkxODk5MX0.edBvujC2gvqjauClcXIpkMC-SSxGlcc6SoOOEnPBDfA) |

## Convenção de organização

Quando o conteúdo de cada diagrama estiver identificado, a recomendação é catalogar assim:

- `DER` e modelagem relacional: manter também referência em `docs/data/README.md`;
- `casos de uso`, `classes`, `componentes` e `sequência`: manter também referência em `docs/architecture/README.md`;
- diagramas temporários ou ainda em refinamento: manter primeiro aqui, até classificação final.

## Próximos passos

1. Referenciar `DG-CLS-01` e `DG-CLS-02` também nos artefatos de arquitetura onde fizer sentido.
2. Criar subseções ou arquivos específicos quando houver mais artefatos visuais.
3. Decidir se o conteúdo-fonte em Mermaid também será versionado no repositório.
