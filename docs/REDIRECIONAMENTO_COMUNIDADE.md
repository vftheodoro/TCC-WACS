# Funcionalidade de Redirecionamento para Comunidade

## Descrição
Esta funcionalidade permite que usuários logados sejam redirecionados para a página `comunidade.html` ao clicar na foto ou nome do usuário no canto superior direito da navbar.

## Implementação

### Arquivos Modificados

#### 1. `public/js/auth-check.js`
- **Adicionado**: Event listeners para detectar cliques na área do perfil do usuário
- **Funcionalidades**:
  - Desktop: Clique na foto ou nome do usuário na navbar principal
  - Mobile: Clique na foto do usuário no cabeçalho mobile
  - Mobile: Clique na foto ou nome do usuário no menu overlay

#### 2. `public/css/navbar.css`
- **Adicionado**: Estilos para tornar a área do perfil claramente clicável
- **Melhorias**:
  - Cursor pointer na foto e nome do usuário
  - Efeitos hover com transform e mudança de cor
  - Background hover para a área do perfil
  - Transições suaves

#### 3. `public/css/main.css`
- **Adicionado**: Variável CSS `--background-color-hover`
- **Definições**:
  - Tema escuro: `#1A1A1A`
  - Tema claro: `#F5F5F5`

### Como Funciona

1. **Detecção de Clique**: O sistema detecta cliques em três áreas diferentes:
   - `.user-profile` (desktop navbar)
   - `.profile-pic-mobile` (mobile header)
   - `.mobile-menu-overlay .user-profile` (mobile menu)

2. **Redirecionamento Inteligente**: O sistema determina automaticamente o caminho correto baseado na localização atual:
   - Se estiver na raiz: `views/comunidade.html`
   - Se estiver em views/: `comunidade.html`

3. **Exclusão do Botão Logout**: O sistema exclui cliques no botão "Sair" para evitar conflitos.

## Teste

### Arquivo de Teste: `test-redirect.html`
- Simula um usuário logado
- Permite testar a funcionalidade sem necessidade de autenticação real
- Mostra feedback visual dos cliques detectados
- Inclui instruções claras para teste

### Como Testar
1. Abra `test-redirect.html` no navegador
2. Clique na foto do usuário no canto superior direito (desktop)
3. Clique no nome do usuário no canto superior direito (desktop)
4. Em mobile, teste a foto no cabeçalho
5. Em mobile, abra o menu e teste a foto/nome no overlay

## Compatibilidade

### Navegadores Suportados
- Chrome (recomendado)
- Firefox
- Safari
- Edge

### Dispositivos
- Desktop (todos os tamanhos de tela)
- Tablet
- Mobile (responsivo)

## Estrutura HTML Necessária

Para que a funcionalidade funcione, a navbar deve conter:

```html
<!-- Desktop -->
<div class="logged-in-actions">
    <div class="user-profile">
        <img src="..." alt="Foto de Perfil" class="profile-pic">
        <span class="user-name">Nome do Usuário</span>
    </div>
    <button class="btn btn-outline-gradient logout-btn">Sair</button>
</div>

<!-- Mobile Header -->
<div class="mobile-user-status">
    <img src="..." alt="Foto de Perfil" class="profile-pic-mobile">
</div>

<!-- Mobile Menu -->
<div class="mobile-menu-overlay">
    <div class="logged-in-actions-mobile">
        <div class="user-profile">
            <img src="..." alt="Foto de Perfil" class="profile-pic">
            <span class="user-name">Nome do Usuário</span>
        </div>
        <button class="btn btn-outline-gradient logout-btn">Sair</button>
    </div>
</div>
```

## Dependências

- Firebase SDK (para autenticação)
- `env-config.js` (configuração do Firebase)
- `auth-check.js` (lógica de autenticação e redirecionamento)

## Manutenção

### Adicionando Novas Áreas Clicáveis
Para adicionar novas áreas que redirecionem para a comunidade, adicione um novo event listener no `auth-check.js`:

```javascript
// Exemplo para nova área
if (e.target.closest('.nova-area-clicavel')) {
    const currentPath = window.location.pathname;
    let redirectPath = 'views/comunidade.html';
    
    if (currentPath.includes('/views/')) {
        redirectPath = 'comunidade.html';
    }
    
    window.location.href = redirectPath;
}
```

### Modificando o Destino
Para alterar o destino do redirecionamento, modifique as variáveis `redirectPath` no `auth-check.js`.

## Problemas Conhecidos

- Nenhum problema conhecido no momento
- A funcionalidade foi testada em diferentes cenários
- Compatível com o sistema de autenticação existente

## Versão
- **Versão**: 1.0
- **Data**: Dezembro 2024
- **Autor**: Sistema WACS 