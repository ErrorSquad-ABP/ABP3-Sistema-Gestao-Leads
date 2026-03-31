# Seeds

Esta pasta representa um fluxo descontinuado de seeds baseado em scripts. A direção oficial do projeto é tratar seeds pelo fluxo da aplicação e do Prisma, mantendo reprodutibilidade sem depender de SQL manual.

## Objetivo

- cadastrar dados-base que o sistema precisa para desenvolvimento ou bootstrap funcional;
- evitar dependência de inserts manuais espalhados;
- manter a carga inicial versionada junto do projeto.

## Regras

- usar seeds apenas para dados estáveis e compartilháveis;
- evitar dados descartáveis ou específicos de uma máquina;
- manter reprodutibilidade e idempotência quando aplicável.

## Situação atual

Ainda não há seed oficial do domínio. Os primeiros arquivos devem surgir quando o modelo relacional principal for fechado.
