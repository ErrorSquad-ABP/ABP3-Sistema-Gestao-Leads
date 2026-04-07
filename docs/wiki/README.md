# Wiki (espelho da documentação versionada)

## Objetivo

A Wiki do GitHub (ou equivalente) deve manter **paridade 1:1** com a documentação em `docs/`, conforme [`../README.md`](../README.md). A **fonte primária** é sempre o repositório; este ficheiro serve como **índice** para quem replica conteúdo na Wiki e para navegação local.

## Mapa rápido

| Tema | Documento no repositório |
| --- | --- |
| Índice geral da documentação | [`../README.md`](../README.md) |
| Arquitetura (visão geral) | [`../architecture/README.md`](../architecture/README.md) |
| **Plano de IA/UX do frontend (implementação)** | [`../architecture/frontend-information-architecture.md`](../architecture/frontend-information-architecture.md) |
| Next.js / frontend técnico | [`../architecture/next-frontend.md`](../architecture/next-frontend.md) |
| Backend NestJS | [`../architecture/nest-backend.md`](../architecture/nest-backend.md) |
| Catálogo de diagramas | [`../diagrams/README.md`](../diagrams/README.md) |
| API | [`../api/README.md`](../api/README.md) |
| Dados / DER | [`../data/README.md`](../data/README.md) |
| Ágil | [`../agile/README.md`](../agile/README.md) |

## Ao atualizar a Wiki

1. Editar primeiro o Markdown em `docs/`.
2. Copiar ou sincronizar o mesmo conteúdo para a Wiki.
3. Registar na mensagem de commit do repositório o que mudou (a Wiki costuma ter histórico separado).

## Frontend — foco atual

Para alinhar a equipa às sprints de UI: usar como referência principal o plano de **Arquitetura da Informação** em [`../architecture/frontend-information-architecture.md`](../architecture/frontend-information-architecture.md) (diagramas Mermaid incluídos).
