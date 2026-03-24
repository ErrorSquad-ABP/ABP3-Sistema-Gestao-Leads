# Fluxo de Requisição no Backend

## Objetivo

Explicar como uma requisição percorre o backend e qual responsabilidade pertence a cada etapa do fluxo.

## Contexto

Um dos riscos mais comuns em projetos web é deixar a regra de negócio escorrer para controllers, DTOs ou repositórios concretos. Este documento existe para alinhar como o fluxo deve acontecer dentro da arquitetura adotada.

## Fluxo base

O fluxo esperado é:

`Controller -> Use Case -> Domain -> Repository -> Banco`

Esse encadeamento não significa que toda requisição terá exatamente os mesmos objetos, mas define a direção correta da responsabilidade.

## Etapas do fluxo

### 1. Entrada HTTP

O controller recebe a requisição, extrai os dados necessários e delega a execução.

Responsabilidades do controller:

- receber a entrada;
- mapear DTOs de transporte;
- acionar o caso de uso correto;
- devolver resposta apropriada.

O controller não deve:

- decidir regra de negócio complexa;
- montar SQL;
- validar invariantes de domínio na mão.

### 2. Orquestração do caso de uso

O use case coordena a ação que o sistema precisa executar.

Responsabilidades do use case:

- interpretar a intenção da operação;
- coordenar dependências;
- instanciar objetos de domínio;
- acionar persistência por contratos;
- retornar o resultado esperado pelo fluxo.

O use case não deve:

- carregar detalhes de framework web;
- concentrar regra puramente de persistência;
- duplicar regra que pertence à entidade ou ao value object.

### 3. Validação e consistência no domínio

O domínio garante que o estado criado ou alterado permaneça válido.

É aqui que devem viver:

- invariantes;
- transições de estado;
- validações de valor;
- eventos de domínio;
- comportamento central da entidade.

### 4. Persistência

Depois que o domínio estiver consistente, o fluxo usa um contrato de repositório para persistir ou recuperar dados.

A infraestrutura faz:

- consulta;
- mapeamento;
- persistência;
- integração concreta com banco e outros serviços.

## Onde cada tipo de regra deve ficar

| Tipo de responsabilidade | Local esperado |
| --- | --- |
| Validação de formato e valor | `domain` por meio de entidades e value objects |
| Orquestração de fluxo | `application` |
| Transporte HTTP | `presentation` |
| Persistência concreta | `infrastructure` |
| Regras transversais de autenticação e filtros | `shared`, quando realmente forem transversais |

## Exemplo mental aplicado ao projeto

No caso de criação de lead, o fluxo esperado é:

1. o controller recebe a requisição HTTP;
2. o DTO de transporte representa os dados recebidos;
3. o use case inicia a execução da ação;
4. o domínio valida os valores e garante consistência;
5. o repositório persiste a entidade;
6. o sistema retorna a resposta apropriada.

Se houver necessidade de reação adicional, como auditoria ou atualização derivada, isso deve acontecer por mecanismo apropriado do módulo, preferencialmente sem transformar o controller em coordenador de efeitos colaterais.

## Antipadrões que devem ser evitados

- controller chamando banco diretamente;
- DTO assumindo papel de entidade;
- use case montando resposta HTTP;
- repositório concreto definindo regra de negócio;
- domínio dependendo de classes do NestJS.

## Impactos e implicações

- O fluxo fica mais previsível para o time.
- Fica mais fácil revisar PRs e identificar responsabilidades mal colocadas.
- Casos de uso tendem a ficar mais testáveis.
- O projeto reduz o risco de virar um backend acoplado em torno de controllers.

## Próximos passos

1. Reaplicar esse fluxo nos módulos reais do domínio.
2. Produzir diagramas de sequência dos fluxos críticos com base nessa convenção.
3. Usar esse documento como referência de review técnico nas primeiras sprints.
