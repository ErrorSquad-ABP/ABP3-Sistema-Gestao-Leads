# Módulos do Frontend

Cada módulo deve conter telas, componentes, hooks e serviços específicos da sua feature.

## Estrutura sugerida por módulo

```text
modules/
└── leads/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── services/
    └── types/
```

## Regra prática

Se um item só faz sentido dentro de uma feature, ele fica no módulo. Se é compartilhado entre várias features, ele vai para `shared`.
