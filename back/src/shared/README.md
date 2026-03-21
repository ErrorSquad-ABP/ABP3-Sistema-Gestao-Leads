# Shared do Backend

Esta área deve concentrar apenas preocupações transversais:

- configuração;
- autenticação e autorização;
- tratamento de erro;
- filtros, guards e pipes;
- middlewares quando forem realmente globais;
- utilitários compartilhados;
- contratos compartilhados entre módulos.

Tudo que for específico de um único domínio deve permanecer dentro do respectivo módulo.
