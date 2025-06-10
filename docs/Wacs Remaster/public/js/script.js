/* public/js/script.js */

// Este arquivo pode ser usado para adicionar interatividade ao site,
// como animações de scroll, carrosséis, ou outras funcionalidades dinâmicas.

document.addEventListener('DOMContentLoaded', () => {
    const closeBannerBtn = document.querySelector('.close-banner-btn');
    const alphaNoticeBanner = document.querySelector('.alpha-notice-banner');

    console.log('Script carregado.');

    // Lógica do Aviso Alpha
    const hasSeenAlphaNotice = localStorage.getItem('hasSeenAlphaNotice');

    if (alphaNoticeBanner && !hasSeenAlphaNotice) {
        console.log('Banner Alpha encontrado e não foi visto antes. Exibindo...');
        alphaNoticeBanner.style.display = 'flex'; // Garante que o banner esteja visível no início
        localStorage.setItem('hasSeenAlphaNotice', 'true'); // Marca como visto

        // Função para esconder o banner
        const hideBanner = () => {
            if (alphaNoticeBanner.style.display !== 'none') { // Evita esconder múltiplas vezes
                console.log('Escondendo banner...');
                alphaNoticeBanner.style.opacity = '0';
                setTimeout(() => {
                    alphaNoticeBanner.style.display = 'none';
                }, 500); // Tempo da transição CSS
                // Remove os listeners e timeouts após o banner desaparecer
                if (scrollListener) window.removeEventListener('scroll', scrollListener);
                if (autoHideTimeout) clearTimeout(autoHideTimeout);
            }
        };

        // Desaparecer após 5 segundos
        const autoHideTimeout = setTimeout(hideBanner, 5000); // 5000 milissegundos = 5 segundos

        // Desaparecer ao rolar
        const scrollListener = () => {
            if (window.scrollY > 200) { // Aumentado para 200px de tolerância
                console.log('Scroll detectado, escondendo banner.');
                hideBanner();
            }
        };
        window.addEventListener('scroll', scrollListener);

        // Fechar ao clicar no botão 'X'
        if (closeBannerBtn) {
            closeBannerBtn.addEventListener('click', () => {
                console.log('Botão de fechar clicado, escondendo banner.');
                hideBanner();
            });
        }
    } else if (alphaNoticeBanner && hasSeenAlphaNotice) {
        console.log('Banner Alpha já foi visto antes. Escondendo...');
        alphaNoticeBanner.style.display = 'none'; // Esconde o banner imediatamente se já foi visto
    }

    // Lógica do Tema Claro/Escuro
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const html = document.documentElement;

    console.log('Botão de tema encontrado:', themeToggleBtn);
    console.log('Elemento HTML (root):', html);

    const setTheme = (theme) => {
        console.log('setTheme chamado com tema:', theme);
        if (theme === 'light') {
            html.classList.add('light-theme'); // Adicionar ao <html>
            console.log('Classe light-theme adicionada ao html.');
            if (themeToggleBtn) {
                themeToggleBtn.querySelector('i').classList.remove('fa-sun');
                themeToggleBtn.querySelector('i').classList.add('fa-moon');
                console.log('Ícone mudado para lua.');
            }
        } else {
            html.classList.remove('light-theme'); // Remover do <html>
            console.log('Classe light-theme removida do html.');
            if (themeToggleBtn) {
                themeToggleBtn.querySelector('i').classList.remove('fa-moon');
                themeToggleBtn.querySelector('i').classList.add('fa-sun');
                console.log('Ícone mudado para sol.');
            }
        }
        localStorage.setItem('theme', theme);
        console.log('Tema salvo no localStorage:', localStorage.getItem('theme'));
    };

    // Carregar tema salvo ou usar o padrão (escuro)
    const savedTheme = localStorage.getItem('theme');
    console.log('Tema salvo no localStorage (ao carregar):', savedTheme);
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        console.log('Nenhum tema salvo, definindo tema escuro como padrão.');
        setTheme('dark'); // Padrão é tema escuro
    }

    // Alternar tema ao clicar no botão
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            console.log('Botão de tema clicado.');
            const currentTheme = html.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    // Lógica de Login/Logout e Estado da Navbar
    const loggedOutActions = document.querySelector('.logged-out-actions');
    const loggedInActions = document.querySelector('.logged-in-actions');
    const userProfilePicElement = document.querySelector('.profile-pic');
    const userNameElement = document.querySelector('.user-name');
    const logoutBtn = document.querySelector('.logout-btn');

    const updateNavbarState = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');
        const userProfilePic = localStorage.getItem('userProfilePic');

        if (isLoggedIn) {
            if (loggedOutActions) loggedOutActions.classList.add('hidden');
            if (loggedInActions) loggedInActions.classList.remove('hidden');
            if (userProfilePicElement) userProfilePicElement.src = userProfilePic || '';
            if (userNameElement) userNameElement.textContent = userName || 'Usuário';
        } else {
            if (loggedOutActions) loggedOutActions.classList.remove('hidden');
            if (loggedInActions) loggedInActions.classList.add('hidden');
        }
    };

    // Função de Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userProfilePic');
            updateNavbarState(); // Atualiza a navbar para o estado deslogado
            // Opcional: redirecionar para a página inicial ou tela de login
            // window.location.href = 'index.html'; 
        });
    }

    // Atualizar o estado da navbar ao carregar a página
    updateNavbarState();

    // Lógica para carregar imagens de perfil (background-image)
    document.querySelectorAll('.team-photo').forEach(photoDiv => {
        const imageUrl = photoDiv.getAttribute('data-src');
        if (imageUrl) {
            photoDiv.style.backgroundImage = `url('${imageUrl}')`;
            console.log(`Imagem de fundo carregada para ${imageUrl}`);
        }
    });
}); 