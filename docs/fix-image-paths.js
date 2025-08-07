// Script para corrigir caminhos de imagens
// Execute este script no console do navegador para corrigir caminhos de imagens

function fixImagePaths() {
    console.log('🔧 Iniciando correção de caminhos de imagens...');
    
    // Função para corrigir caminho baseado na localização atual
    function getCorrectPath(basePath) {
        const currentPath = window.location.pathname;
        
        // Se estamos na raiz do site
        if (currentPath.endsWith('/') || currentPath.endsWith('/index.html')) {
            return basePath;
        }
        
        // Se estamos em uma subpágina (ex: views/comunidade.html)
        if (currentPath.includes('/views/')) {
            return '../' + basePath;
        }
        
        // Se estamos em uma subpágina de usuário (ex: views/user/login.html)
        if (currentPath.includes('/user/')) {
            return '../../' + basePath;
        }
        
        return basePath;
    }
    
    // Caminho base da imagem padrão
    const defaultAvatarPath = 'public/images/fotos-perfil/default-avatar.png';
    const correctPath = getCorrectPath(defaultAvatarPath);
    
    console.log(`📍 Caminho atual: ${window.location.pathname}`);
    console.log(`🖼️ Caminho correto para imagens: ${correctPath}`);
    
    // Encontrar todas as imagens com src vazio ou caminhos incorretos
    const images = document.querySelectorAll('img[src=""], img[src*="default-avatar.png"]');
    let fixedCount = 0;
    
    images.forEach((img, index) => {
        const oldSrc = img.src;
        
        // Se o src está vazio ou contém default-avatar.png, corrigir
        if (img.src === '' || img.src.includes('default-avatar.png')) {
            img.src = correctPath;
            img.onerror = function() {
                console.warn(`⚠️ Falha ao carregar imagem: ${this.src}`);
                // Tentar caminho alternativo
                if (this.src.includes('../')) {
                    this.src = this.src.replace('../', '');
                } else if (!this.src.startsWith('../')) {
                    this.src = '../' + this.src;
                }
            };
            
            console.log(`✅ Imagem ${index + 1} corrigida: ${oldSrc} → ${img.src}`);
            fixedCount++;
        }
    });
    
    console.log(`🎉 Correção concluída! ${fixedCount} imagens corrigidas.`);
    
    // Verificar se as imagens estão carregando
    setTimeout(() => {
        const failedImages = document.querySelectorAll('img[src*="default-avatar.png"]');
        let failedCount = 0;
        
        failedImages.forEach(img => {
            if (!img.complete || img.naturalWidth === 0) {
                failedCount++;
                console.error(`❌ Imagem falhou ao carregar: ${img.src}`);
            }
        });
        
        if (failedCount === 0) {
            console.log('✅ Todas as imagens carregadas com sucesso!');
        } else {
            console.warn(`⚠️ ${failedCount} imagens falharam ao carregar.`);
        }
    }, 2000);
}

// Função para aplicar correção em tempo real
function applyImagePathFix() {
    // Observar mudanças no DOM para corrigir novas imagens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const images = node.querySelectorAll ? node.querySelectorAll('img[src=""], img[src*="default-avatar.png"]') : [];
                    if (node.tagName === 'IMG' && (node.src === '' || node.src.includes('default-avatar.png'))) {
                        images.push(node);
                    }
                    
                    images.forEach(img => {
                        const correctPath = getCorrectPath('public/images/fotos-perfil/default-avatar.png');
                        if (img.src === '' || img.src.includes('default-avatar.png')) {
                            img.src = correctPath;
                        }
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('👁️ Observador de DOM ativado para correção automática de imagens.');
}

// Função auxiliar para obter caminho correto
function getCorrectPath(basePath) {
    const currentPath = window.location.pathname;
    
    if (currentPath.endsWith('/') || currentPath.endsWith('/index.html')) {
        return basePath;
    }
    
    if (currentPath.includes('/views/')) {
        return '../' + basePath;
    }
    
    if (currentPath.includes('/user/')) {
        return '../../' + basePath;
    }
    
    return basePath;
}

// Auto-executar quando o script for carregado
if (typeof window !== 'undefined') {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(fixImagePaths, 1000);
            applyImagePathFix();
        });
    } else {
        setTimeout(fixImagePaths, 1000);
        applyImagePathFix();
    }
}

// Exportar funções para uso manual
window.ImagePathFixer = {
    fixImagePaths,
    applyImagePathFix,
    getCorrectPath
};

console.log('🛠️ Script de correção de imagens carregado. Use ImagePathFixer.fixImagePaths() para corrigir manualmente.');
