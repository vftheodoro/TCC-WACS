/**
 * WACS - Gerenciador de tema claro/escuro
 * Permite alternar entre tema claro e escuro com animação suave
 * Adaptado para o botão UIverse.io
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Verifica se há um tema salvo no localStorage
    const currentTheme = localStorage.getItem('theme');
    
    // Aplica o tema baseado na preferência ou no localStorage
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
    
    // Função para alternar o tema
    function toggleTheme() {
        // Obtem o estado atual do checkbox
        const isDark = themeSwitch.checked;
        
        if (isDark) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
        
        // Adiciona classe de animação
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 1000);
    }
    
    // Adiciona evento de change ao checkbox
    themeSwitch.addEventListener('change', toggleTheme);
});
