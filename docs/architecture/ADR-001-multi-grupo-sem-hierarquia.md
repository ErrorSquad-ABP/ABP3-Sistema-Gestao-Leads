# ADR-001 - Múltiplos grupos de acesso por usuário sem herança hierárquica

## Status

Aprovada

## Contexto

Até a Sprint 3, cada usuário podia pertencer a no máximo um grupo de acesso
(`User.accessGroupId`, FK opcional com `ON DELETE SET NULL`). O grupo carrega a
lista de `featureKeys` que governa os módulos liberados na aplicação.

O cliente solicitou (S3-EPIC-10) que um usuário possa acumular permissões de
vários grupos ao mesmo tempo — por exemplo, um gerente que também opera
relatórios executivos. Surgiu a dúvida de modelagem: composição explícita de
grupos ou hierarquia de grupos (um grupo herdar features de outro).

Restrições relevantes:

- O conjunto de features de um usuário precisa ser auditável e previsível:
  olhar os grupos vinculados deve ser suficiente para saber o que ele acessa.
- O produto já usa `baseRole` apenas como rótulo orientativo de grupo; o papel
  canônico (`User.role`) continua sendo a primeira barreira de autorização.
- O contrato de API (`accessGroupId`/`accessGroup` no login, no `/auth/me` e no
  CRUD de usuários) é consumido pelo frontend e por sessões ativas.

## Decisão

1. **Composição explícita, sem herança.** Um usuário pode ser vinculado a N
   grupos via tabela de junção `UserAccessGroup` (`userId` + `accessGroupId`,
   PK composta, `ON DELETE CASCADE` nas duas pontas). Grupos não herdam
   features de outros grupos e papéis não implicam grupos.
2. **Autorização por união de features.** O conjunto efetivo de features do
   usuário é a união (deduplicada) dos `featureKeys` de todos os grupos
   vinculados. Usuário sem nenhum grupo mantém o comportamento atual:
   autorização apenas por papel (compatibilidade com contas legadas).
3. **Contrato legado preservado.** A API passa a expor `accessGroupIds`,
   `accessGroups` e `featureKeys` (união). Os campos `accessGroupId` e
   `accessGroup` continuam presentes como legado derivado (primeiro grupo na
   ordenação por nome), no mesmo padrão já adotado para `teamId`.
4. **Coluna antiga removida.** `User.accessGroupId` é descartada após a
   migração copiar os vínculos existentes para `UserAccessGroup`
   (breaking-schema previsto no card S3-EPIC-10).

## Alternativas consideradas

- **Hierarquia de grupos (grupo herda de grupo pai)** — rejeitada: torna o
  conjunto efetivo de features dependente de uma cadeia de resolução, dificulta
  auditoria e cria acoplamento entre grupos; o requisito do cliente é acumular
  permissões, não modelar árvore organizacional.
- **Manter FK única e duplicar grupos compostos** — rejeitada: explosão
  combinatória de grupos "Gerente + Relatórios", manutenção duplicada de
  featureKeys e perda da semântica de composição.
- **M2M implícito do Prisma (`_AccessGroupToUser`)** — rejeitada: a tabela de
  junção explícita permite metadados (`assignedAt`), nome de tabela previsível
  para auditoria/SQL e segue o nome pedido no backlog (`UserAccessGroup`).

## Consequências

- Autorização passa a ser determinística: `features(usuário) = papel ∩ união
  dos grupos`; nenhum acesso "aparece" por herança implícita.
- Breaking-schema controlado: migração `add_user_access_groups` copia os
  vínculos atuais antes de remover a coluna `accessGroupId`.
- Repositório, agregado `User`, presenter, DTOs e formulários precisam operar
  com listas de grupos; o custo é pago uma única vez nesta sprint.
- A exclusão de grupo deixa de usar `SET NULL` e passa a remover apenas o
  vínculo (cascade na junção), sem tocar no usuário.
- O filtro de grupos por `baseRole` no formulário de usuários deixa de fazer
  sentido (um usuário pode combinar grupos de papéis distintos) e é removido.

## Próximas ações

1. Migração `UserAccessGroup` com backfill dos vínculos existentes.
2. União de features no agregado `User` + exposição de `featureKeys` na API.
3. Refactor da tela de usuários (form multi-grupo, filtros server-side).
4. Testes de permissão garantindo união explícita e ausência de herança.
