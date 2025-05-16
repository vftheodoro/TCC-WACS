# Configuração do Firebase para o WACS

Este documento explica como configurar o Firebase Authentication para o aplicativo WACS.

## 1. Criar um projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao seu projeto (ex: "WACS-App")
4. Siga as instruções para criar o projeto

## 2. Configurar a Autenticação

1. No menu lateral do console do Firebase, clique em "Authentication"
2. Clique em "Começar"
3. Na guia "Sign-in method", habilite "Email/senha"
4. Clique em "Salvar"

## 3. Registrar seu aplicativo

1. Na página inicial do seu projeto Firebase, clique em "Adicionar app"
2. Selecione o ícone do Android ou iOS (dependendo da plataforma)
3. Registre o app com o ID do pacote (ex: "com.wacs.app")
4. Siga as instruções para concluir o registro

## 4. Obter as credenciais do Firebase

Depois de registrar seu aplicativo, o Firebase fornecerá as credenciais. Você precisa criar um arquivo `.env` na raiz do projeto com essas informações:

```
# Firebase
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
FIREBASE_APP_ID=seu_app_id

# Google Maps
GOOGLE_MAPS_API_KEY=sua_api_key_do_google_maps
```

## 5. Testar o login

Depois de configurar o Firebase e adicionar as credenciais ao arquivo `.env`, você poderá testar o login:

1. Primeiro, crie uma conta usando a opção "Registrar" na tela de login
2. Depois, faça login com o email e senha registrados

## 6. Gerenciar usuários

Você pode gerenciar os usuários do seu aplicativo pelo Console do Firebase:

1. No menu lateral, clique em "Authentication"
2. Clique na guia "Usuários"
3. Aqui você pode visualizar, adicionar, remover ou editar usuários

## 7. Configurações adicionais (opcional)

Você também pode configurar:

- **Reset de senha**: Habilite na guia "Sign-in method" > "Email/senha" > "Permitir que os usuários redefinam suas senhas"
- **Verificação de email**: Habilite na mesma guia > "Exigir verificação de email"
- **Provedores adicionais de login**: Como Google, Facebook, etc. (cada um exige configuração adicional) 