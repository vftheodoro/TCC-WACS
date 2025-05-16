# Guia de Desenvolvimento

## Estrutura do Projeto
```
src/
  ├── components/     # Componentes reutilizáveis
  ├── screens/        # Telas da aplicação
  ├── navigation/     # Configuração de navegação
  ├── services/       # Serviços e APIs
  ├── utils/          # Funções utilitárias
  ├── hooks/          # Custom hooks
  ├── context/        # Contextos React
  ├── assets/         # Recursos estáticos
  └── constants/      # Constantes e configurações
```

## Padrões de Código

### Nomenclatura
- Componentes: PascalCase (ex: `NavigationScreen.js`)
- Arquivos utilitários: camelCase (ex: `formatDistance.js`)
- Constantes: UPPER_SNAKE_CASE (ex: `API_URL`)
- Variáveis e funções: camelCase (ex: `handlePress`)

### Componentes
- Usar componentes funcionais com hooks
- Separar lógica em hooks customizados
- Manter componentes pequenos e focados
- Usar PropTypes ou TypeScript para tipagem

### Estilização
- Usar StyleSheet.create para estilos
- Manter estilos próximos aos componentes
- Usar tema do React Native Paper
- Evitar estilos inline

### Estado
- Usar Context API para estado global
- Usar useState para estado local
- Usar useReducer para estado complexo
- Evitar prop drilling

## Fluxo de Desenvolvimento

1. Criar branch a partir de develop
2. Implementar feature
3. Testar localmente
4. Criar pull request
5. Revisão de código
6. Merge após aprovação

## Testes
- Testar componentes com Jest
- Testar navegação
- Testar integração com Firebase
- Testar em diferentes dispositivos

## Performance
- Otimizar renderizações
- Usar memo e useMemo
- Lazy loading de componentes
- Otimizar imagens

## Segurança
- Validar inputs
- Sanitizar dados
- Usar HTTPS
- Proteger chaves de API

## Debugging
- Usar React Native Debugger
- Logs estruturados
- Monitorar performance
- Testar em diferentes ambientes 