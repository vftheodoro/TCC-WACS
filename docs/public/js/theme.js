/**
 * WACS - Gerenciador de tema claro/escuro
 * Permite alternar entre tema claro e escuro com animação suave
 * Adaptado para o botão UIverse.io
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const html = document.documentElement;
    
    // Verifica se há um tema salvo no localStorage
    const currentTheme = localStorage.getItem('theme');
    
    // Aplica o tema baseado na preferência ou no localStorage
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-theme');
        html.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    } else {
        html.setAttribute('data-theme', 'light');
    }
    
    // Função para alternar o tema
    function toggleTheme() {
    // Disparar evento customizado após alternar o tema
    const fireThemeChange = () => {
        const event = new Event('themechange');
        document.dispatchEvent(event);
    };
        // Obtem o estado atual do checkbox
        const isDark = themeSwitch.checked;
        
        if (isDark) {
            document.body.classList.add('dark-theme');
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
        
        // Adiciona classe de animação
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 1000);
        // Notificar outros componentes sobre a troca de tema
        fireThemeChange();
    }
    
    // Adiciona evento de change ao checkbox
    themeSwitch.addEventListener('change', toggleTheme);
    
    // Adiciona listener para mudanças na preferência do sistema
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
                html.setAttribute('data-theme', 'dark');
                themeSwitch.checked = true;
            } else {
                document.body.classList.remove('dark-theme');
                html.setAttribute('data-theme', 'light');
                themeSwitch.checked = false;
            }
        }
    });
});
