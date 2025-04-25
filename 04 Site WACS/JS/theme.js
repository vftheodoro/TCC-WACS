/**
 * WACS - Gerenciador de tema claro/escuro
 * Permite alternar entre tema claro e escuro com animação suave
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const themeIcon = themeSwitch.querySelector('i');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Verifica se há um tema salvo no localStorage
    const currentTheme = localStorage.getItem('theme');
    
    // Aplica o tema baseado na preferência ou no localStorage
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // Função para alternar o tema
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        
        // Atualiza o ícone
        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
        
        // Adiciona classe de animação
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 1000);
    }
    
    // Adiciona evento de clique ao botão
    themeSwitch.addEventListener('click', toggleTheme);
});
