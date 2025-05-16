# Configuração do Firebase Storage para Fotos de Perfil

Este documento contém instruções para configurar o Firebase Storage para o armazenamento seguro de fotos de perfil dos usuários.

## Índice

1. [Regras de Segurança](#regras-de-segurança)
2. [Deploy das Regras](#deploy-das-regras)
3. [Estrutura de Armazenamento](#estrutura-de-armazenamento)
4. [Políticas de Retenção](#políticas-de-retenção)
5. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

## Regras de Segurança

As regras de segurança do Firebase Storage estão definidas no arquivo `storage.rules` e garantem que:

- Apenas usuários autenticados podem fazer upload de suas próprias fotos
- O tamanho das imagens é limitado a 5MB
- Apenas imagens são permitidas (verificação de tipo de conteúdo)
- Os usuários só podem modificar ou excluir suas próprias imagens
- As imagens de perfil são publicamente legíveis

## Deploy das Regras

Para fazer o deploy das regras de segurança, siga os passos abaixo:

1. Certifique-se de que o Firebase CLI está instalado:
   ```bash
   npm install -g firebase-tools
   ```

2. Faça login na sua conta Firebase:
   ```bash
   firebase login
   ```

3. Inicialize o projeto Firebase (se ainda não tiver feito):
   ```bash
   firebase init storage
   ```

4. Deploy das regras de segurança:
   ```bash
   firebase deploy --only storage
   ```

## Estrutura de Armazenamento

As fotos de perfil são armazenadas no seguinte formato:

```
/profile_pictures/{userId}_{userName}_profile_{timestamp}.jpg
```

Onde:
- `userId` é o ID do usuário no Firebase Authentication
- `userName` é o nome do usuário formatado para uso em arquivos (sem acentos ou caracteres especiais)
- `timestamp` é um timestamp que garante unicidade e evita problemas de cache

## Gerenciamento de Fotos

O sistema gerencia automaticamente as fotos de perfil da seguinte forma:

1. **Upload de nova foto**: 
   - A imagem é comprimida e redimensionada para otimizar o armazenamento
   - As fotos antigas do mesmo usuário são excluídas automaticamente
   - O nome do arquivo inclui o nome do usuário para melhor organização

2. **Remoção de foto**:
   - O usuário pode remover sua foto a qualquer momento
   - Um avatar com as iniciais do usuário é exibido quando não há foto de perfil

## Políticas de Retenção

Recomendamos configurar as seguintes políticas de retenção:

1. Imagens de perfil não utilizadas (sem referência no banco de dados) por mais de 90 dias devem ser removidas automaticamente
2. Considere a implementação de backups regulares 

Para configurar as políticas de retenção, acesse o console do Firebase:
1. Vá para Storage > Rules > Lifecycle
2. Configure as regras de ciclo de vida apropriadas

## Monitoramento e Manutenção

Para monitorar o uso do Storage:

1. Configure alertas de utilização no console do Firebase
2. Acompanhe regularmente o uso de armazenamento para evitar custos inesperados
3. Considere implementar uma rotina automática para remoção de fotos de usuários inativos

## Otimização de Custos

- As imagens são redimensionadas e comprimidas antes do upload
- Use o cache do navegador de forma eficiente configurando os cabeçalhos apropriados
- Considere implementar um CDN para casos de tráfego intenso

---

**Dica**: Sempre faça o backup das regras de segurança antes de alterá-las, e teste as alterações em um ambiente de desenvolvimento antes de aplicá-las em produção. 