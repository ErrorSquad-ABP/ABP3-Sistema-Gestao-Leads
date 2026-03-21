# Seeds

Esta pasta será usada para dados controlados de referência, mantendo `DML` explícito e reprodutível.

## Objetivo

- cadastrar dados-base que o sistema precisa para desenvolvimento ou bootstrap funcional;
- evitar dependência de inserts manuais espalhados;
- manter a carga inicial versionada junto do projeto.

## Regras

- usar seeds apenas para dados estáveis e compartilháveis;
- evitar dados descartáveis ou específicos de uma máquina;
- manter scripts idempotentes quando aplicável.

## Situação atual

Ainda não há seed oficial do domínio. Os primeiros arquivos devem surgir quando o modelo relacional principal for fechado.
