# WACS - Site de Documentação e Autenticação

Este site contém as páginas de documentação, login e dashboard para o projeto WACS (Wheelchair Automation Control System).

## Configuração Rápida

Para configurar rapidamente o ambiente de desenvolvimento, execute um dos scripts de configuração:

### No Linux/macOS:
```bash
cd docs
chmod +x setup.sh
./setup.sh
```

### No Windows:
```bash
cd docs
setup.bat
```

Estes scripts irão:
1. Verificar se o arquivo `env-config.js` já existe e removê-lo por segurança
2. Criar um novo arquivo `env-config.js` a partir do modelo `env-config.example.js`
3. Verificar se o `.gitignore` está configurado corretamente

Depois de executar o script, edite o arquivo `public/js/env-config.js` e insira suas chaves reais.

## Configuração Manual de Variáveis de Ambiente

Para proteger as chaves de API e outras informações sensíveis, este projeto utiliza um sistema de variáveis de ambiente armazenadas em um arquivo JavaScript chamado `env-config.js`. 

### Como Configurar Manualmente

1. Copie o arquivo `public/js/env-config.example.js` para `public/js/env-config.js`:
   ```bash
   cp public/js/env-config.example.js public/js/env-config.js
   ```

2. Edite o arquivo `public/js/env-config.js` substituindo os valores de exemplo pelas suas próprias chaves:
   ```javascript
   window.ENV = {
       FIREBASE_API_KEY: 'sua-chave-api-aqui',
       FIREBASE_AUTH_DOMAIN: 'seu-projeto.firebaseapp.com',
       // Outros valores
   };
   ```

3. O arquivo `env-config.js` já está configurado para ser ignorado pelo Git no arquivo `.gitignore`. Isso garante que suas chaves não sejam enviadas para o repositório público.

### Configuração Avançada com Ambiente de Build

Para um ambiente de desenvolvimento e produção mais robusto, você pode usar variáveis de ambiente com um sistema de build:

1. Consulte o arquivo `public/js/load-env.js` para ver um exemplo de como carregar variáveis de ambiente durante o processo de build.

2. Configure um arquivo `.env` na raiz do projeto (este arquivo também será ignorado pelo Git):

```
# Firebase Configuration
FIREBASE_API_KEY=sua_chave_api
FIREBASE_AUTH_DOMAIN=seu_dominio.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_bucket.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Google Maps API Key
GOOGLE_MAPS_API_KEY=sua_chave_google_maps

# WebSocket (se necessário)
WEBSOCKET_URL=wss://seu-servidor.com/ws
```

3. Use ferramentas como `dotenv` e Webpack para injetar estas variáveis no processo de build, conforme demonstrado no arquivo `load-env.js`.

## Segurança

- **IMPORTANTE**: Nunca comite o arquivo `env-config.js` com suas chaves reais no repositório.
- O arquivo `.gitignore` já está configurado para ignorar arquivos sensíveis:
  - `public/js/env-config.js`
  - `.env` e quaisquer arquivos `.env.*` exceto `.env.example`
- Utilize o `env-config.example.js` como modelo apenas, sem chaves reais.
- Em equipes, compartilhe as chaves por canais seguros, não através do controle de versão.

## Estrutura do Projeto

- `views/`: Contém todas as páginas HTML
  - `login/`: Páginas de autenticação (login, registro)
  - `dashboard.html`: Painel principal do usuário
- `public/`: Recursos estáticos
  - `js/`: Scripts JavaScript
    - `env-config.js`: Configurações de ambiente (não versionado)
    - `env-config.example.js`: Modelo para configurações
    - `load-env.js`: Exemplo de carregamento de variáveis em build
  - `css/`: Estilos CSS
  - `images/`: Imagens
- `setup.sh`: Script de configuração para Linux/macOS
- `setup.bat`: Script de configuração para Windows

## Tecnologias Utilizadas

- Firebase Authentication para autenticação de usuários
- Google Maps API para o mapa de locais acessíveis
- Design responsivo com CSS moderno
- JavaScript para interatividade 