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

Os route handlers em `src/app/api` devem apenas delegar para esses módulos, preservando o backend como monólito modular mesmo usando Next.js como runtime de API.
