# Runbooks Operacionais

Este diretório concentra os guias operacionais do projeto: setup local, bootstrap de ambiente, execução com Docker Compose e procedimentos de validação depois de subir a stack.

O objetivo destes runbooks é reduzir dependência de contexto oral. Um novo dev deve conseguir:

- subir `front`, `back` e `postgres` sem depender de outro membro;
- entender quais variáveis de ambiente são obrigatórias;
- gerar ou configurar as chaves JWT corretamente;
- aplicar migrations e seed;
- validar login, sessão autenticada e sanidade mínima do backend;
- entender o que é fluxo real e o que ainda está em placeholder.

## Arquivos

- `local-setup.md`: bootstrap local ponta a ponta para desenvolvimento.
- `deploy.md`: checklist operacional para subir a stack local com Compose e operar a produção atual em Vercel + Neon.

## Escopo

Estes documentos descrevem o estado real atual do repositório. Se algum fluxo mudar em código, o runbook correspondente deve ser atualizado na mesma entrega.
