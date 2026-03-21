# Módulos do Backend

Cada módulo do monólito modular deve refletir um domínio de negócio ou um subdomínio relevante.

## Estrutura recomendada por módulo

```text
modules/
└── leads/
    ├── application/
    ├── domain/
    ├── infrastructure/
    ├── presentation/
    └── leads.module.ts
```

## Objetivo da organização

- manter alta coesão por domínio;
- reduzir acoplamento entre features;
- permitir crescimento incremental sem virar um backend anêmico e desorganizado.

No backend em NestJS:

- controllers vivem em `presentation`;
- use cases e serviços vivem em `application`;
- regras centrais vivem em `domain`;
- infraestrutura concreta fica dentro do próprio módulo, não em uma pasta global.
