# Mudanças no Sistema de Documentos do Firebase

## Resumo das Alterações

Este documento descreve as mudanças implementadas para que o nome do documento no Firebase seja o nome do usuário cadastrado, em vez do UID gerado automaticamente.

## Mudanças Implementadas

### 1. Arquivo de Cadastro (`docs/views/user/register.html`)

**Antes:**
```javascript
await firebase.firestore().collection('users').doc(user.uid).set({
    email: email,
    username: username,
    fullName: fullName,
    // ... outros campos
});
```

**Depois:** (agora usando username como ID)
```javascript
const userData = {
    uid: user.uid, // Manter o UID do Firebase Auth para referência
    email: email,
    username: username,
    fullName: fullName,
    // ... outros campos
};

await window.saveUserDocument(username, userData);
```

### 2. Arquivo de Edição de Perfil (`docs/views/user/edit-profile.html`)

**Antes:**
```javascript
const userDoc = await db.collection('users').doc(user.uid).get();
```

**Depois:** (preservando o ID do doc existente; usando username)
```javascript
const userDoc = await window.getUserDocument(user.uid);
```

### 3. Arquivo da Comunidade (`docs/public/js/community.js`)

**Antes:**
```javascript
db.collection('users').where('uid', '==', user.uid).get().then(querySnapshot => {
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        // ... processar dados
    }
});
```

**Depois:** (usando helper genérico)
```javascript
window.getUserDocument(user.uid).then(userDoc => {
    if (userDoc) {
        const userData = userDoc.data();
        // ... processar dados
    }
});
```

### 4. Funções Utilitárias (`docs/public/js/env-config.js`)

Foram adicionadas duas funções utilitárias para garantir compatibilidade:

#### `window.getUserDocument(userUid)`
- Busca o documento do usuário primeiro pelo UID (sistema antigo)
- Se não encontrar, busca pela query com UID (sistema novo)
- Retorna o documento encontrado ou null

#### `window.saveUserDocument(fullName, userData)`
- Salva o documento usando o nome do usuário como ID
- Mantém compatibilidade com o sistema existente

## Benefícios das Mudanças

1. **Identificação Mais Clara**: Os documentos no Firebase agora têm nomes significativos (nome do usuário) em vez de UIDs aleatórios
2. **Facilita Debugging**: É mais fácil identificar usuários no console do Firebase
3. **Compatibilidade**: O sistema mantém compatibilidade com usuários existentes
4. **Flexibilidade**: Permite buscar usuários tanto pelo nome quanto pelo UID

## Considerações Importantes

### 1. Nomes Únicos
- O sistema assume que cada usuário terá um nome único
- Se houver nomes duplicados, o último cadastro sobrescreverá o anterior
- Recomenda-se implementar validação de nomes únicos se necessário

### 2. Migração de Dados Existentes
- Usuários já cadastrados continuarão funcionando normalmente
- O sistema busca primeiro pelo UID (sistema antigo) e depois pela query (sistema novo)
- Para migrar dados existentes, seria necessário um script de migração

### 3. Segurança
- O UID do Firebase Auth continua sendo mantido no documento para referência
- A autenticação continua funcionando normalmente
- As regras de segurança do Firestore devem ser atualizadas se necessário

## Como Testar

1. Cadastre um novo usuário
2. Verifique no console do Firebase se o documento foi criado com o nome do usuário
3. Teste o login e edição de perfil
4. Verifique se os dados são carregados corretamente na comunidade

## Próximos Passos (Opcional)

1. **Validação de Nomes Únicos**: Implementar verificação antes do cadastro
2. **Script de Migração**: Criar script para migrar usuários existentes
3. **Regras de Segurança**: Atualizar regras do Firestore se necessário
4. **Monitoramento**: Adicionar logs para monitorar o uso do novo sistema
