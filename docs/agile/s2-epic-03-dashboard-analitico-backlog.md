# S2-EPIC-03 - Dashboard Analitico e Filtros Temporais End-to-End

## Objetivo

Organizar um mini backlog exclusivo da feature de dashboard analitico com filtros temporais, cobrindo o fechamento de `RF05` e `RF06` de ponta a ponta, desde contratos e validacoes no backend ate a experiencia final no frontend.

## Escopo da feature

Esta feature deve entregar:

- indicadores analiticos reais baseados em dados de leads e negociacoes;
- filtros por semana, mes, ano e periodo customizado;
- validacao obrigatoria do intervalo temporal no backend;
- limitacao maxima de um ano para perfis nao administradores;
- respostas coerentes com o escopo de visualizacao por papel;
- integracao completa entre backend e frontend para consulta dos dashboards.

## User Stories

| ID | User Story | Foco principal |
| --- | --- | --- |
| `US-DA-01` | Definir contrato de filtros temporais reutilizavel | Backend e integracao |
| `US-DA-02` | Validar limite temporal por papel no backend | Seguranca e regra de negocio |
| `US-DA-03` | Consolidar consultas analiticas reais do dashboard | Backend analitico |
| `US-DA-04` | Expor dashboard analitico por escopo hierarquico | Backend e autorizacao |
| `US-DA-05` | Implementar controle temporal no frontend do dashboard | Frontend e UX |
| `US-DA-06` | Renderizar indicadores analiticos reais na interface | Frontend e visualizacao |
| `US-DA-07` | Garantir fluxo end-to-end com testes e criterios de aceite | Qualidade e fechamento |

### `US-DA-01` - Definir contrato de filtros temporais reutilizavel

**Como** time de desenvolvimento  
**Quero** padronizar um contrato de filtros temporais para semana, mes, ano e periodo customizado  
**Para** reutilizar a mesma regra entre endpoints analiticos e evitar interpretacoes diferentes entre frontend e backend.

**Descricao breve**

Esta story cobre o desenho do payload ou query params, o formato de datas, os valores aceitos para cada modo de filtro e as regras de precedencia para o periodo customizado.

### `US-DA-02` - Validar limite temporal por papel no backend

**Como** organizacao  
**Quero** aplicar no backend a restricao de intervalo maximo de um ano para usuarios nao administradores  
**Para** garantir conformidade com `RF06` e impedir burla da regra pelo frontend.

**Descricao breve**

Esta story cobre validacoes centralizadas de data inicial e final, rejeicao de intervalos invalidos, tratamento de erros de contrato e diferenciacao explicita entre `Administrador` e os demais papeis.

### `US-DA-03` - Consolidar consultas analiticas reais do dashboard

**Como** gestor  
**Quero** consultar metricas analiticas reais do funil comercial  
**Para** acompanhar conversao, desempenho operacional e qualidade do atendimento com base em dados persistidos.

**Descricao breve**

Esta story cobre a implementacao dos indicadores de `RF05`, incluindo taxa de conversao, comparativo entre convertidos e nao convertidos, indicadores por atendente e equipe, distribuicao por importancia, motivos de finalizacao e tempo medio ate atendimento.

### `US-DA-04` - Expor dashboard analitico por escopo hierarquico

**Como** usuario gerencial  
**Quero** visualizar apenas os indicadores compatíveis com meu escopo organizacional  
**Para** manter coerencia entre o dashboard analitico e as regras de acesso por papel.

**Descricao breve**

Esta story cobre a aplicacao do recorte de dados no backend para `Atendente`, `Gerente`, `Gerente Geral` e `Administrador`, garantindo que a agregacao analitica respeite equipe, loja, responsavel e visao global quando permitido.

### `US-DA-05` - Implementar controle temporal no frontend do dashboard

**Como** usuario do dashboard  
**Quero** alternar entre semana, mes, ano e periodo customizado na interface  
**Para** explorar os indicadores em diferentes janelas temporais sem depender de ajustes manuais na URL ou na API.

**Descricao breve**

Esta story cobre os componentes de filtro temporal, estado da tela, envio correto dos parametros para a API, exibicao do periodo aplicado e tratamento orientado quando o backend rejeitar um intervalo invalido.

### `US-DA-06` - Renderizar indicadores analiticos reais na interface

**Como** gestor  
**Quero** visualizar os indicadores analiticos em cards, comparativos e graficos coerentes com os dados retornados pela API  
**Para** transformar a resposta analitica em informacao util para tomada de decisao.

**Descricao breve**

Esta story cobre a composicao visual do dashboard analitico, estados de carregamento, vazio e erro, adaptacao por papel e consistencia entre os numeros exibidos e o retorno do backend.

### `US-DA-07` - Garantir fluxo end-to-end com testes e criterios de aceite

**Como** equipe  
**Quero** validar a feature completa de ponta a ponta  
**Para** reduzir risco de regressao e assegurar que `RF05` e `RF06` estejam realmente fechados.

**Descricao breve**

Esta story cobre testes de validacao temporal, testes de autorizacao por papel, verificacao dos calculos analiticos principais, cenarios de erro e confirmacao de que frontend e backend funcionam juntos com dados reais.

## Sequencia sugerida

1. `US-DA-01`
2. `US-DA-02`
3. `US-DA-03`
4. `US-DA-04`
5. `US-DA-05`
6. `US-DA-06`
7. `US-DA-07`

## Dependencias criticas

- A modelagem de leads, negociacoes e historico precisa estar consistente para sustentar os indicadores.
- O escopo por papel no backend precisa estar consolidado antes do fechamento das agregacoes analiticas.
- O frontend depende de contratos estaveis para evitar retrabalho no filtro temporal e nos componentes visuais.

## Observacao

Este backlog representa apenas a feature `S2-EPIC-03` e pode ser quebrado em tarefas tecnicas menores no planejamento da sprint, mantendo a rastreabilidade entre regra de negocio, contrato de API, interface e validacao end-to-end.
