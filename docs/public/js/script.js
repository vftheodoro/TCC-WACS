/* public/js/script.js */

// Este arquivo pode ser usado para adicionar interatividade ao site,
// como animações de scroll, carrosséis, ou outras funcionalidades dinâmicas.

document.addEventListener('DOMContentLoaded', () => {

    console.log('Script carregado.');
    console.log('Largura da tela ao carregar:', window.innerWidth, 'px');

    // Ocultar overlay de carregamento assim que a página carrega (para navegação e refresh)
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }

    // Lógica do Tema Claro/Escuro
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const html = document.documentElement;
    const themeTransitionOverlay = document.querySelector('.theme-transition-overlay');

    const setTheme = (theme) => {
        if (theme === 'light') {
            html.classList.add('light-theme'); // Adicionar ao <html>
            if (themeToggleBtn) {
                themeToggleBtn.querySelector('i').classList.remove('fa-sun');
                themeToggleBtn.querySelector('i').classList.add('fa-moon');
            }
        } else {
            html.classList.remove('light-theme'); // Remover do <html>
            if (themeToggleBtn) {
                themeToggleBtn.querySelector('i').classList.remove('fa-moon');
                themeToggleBtn.querySelector('i').classList.add('fa-sun');
            }
        }
        localStorage.setItem('theme', theme);
    };

    // Carregar tema salvo ou usar o padrão (escuro)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('dark'); // Padrão é tema escuro
    }

    // Alternar tema ao clicar no botão
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (themeTransitionOverlay) {
                themeTransitionOverlay.classList.add('show');
                setTimeout(() => {
                    const currentTheme = html.classList.contains('light-theme') ? 'light' : 'dark';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);

                    setTimeout(() => {
                        themeTransitionOverlay.classList.remove('show');
                    }, 300); // Tempo para o novo tema renderizar antes de esconder o overlay
                }, 500); // Deve corresponder à duração da transição do overlay no CSS
            }
        });
    }

    // Lógica para mostrar overlay de carregamento ao clicar em links de navegação
    document.querySelectorAll('a').forEach(link => {
        // Ignora links que são âncoras internas ou não têm href
        if (link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', (event) => {
                // Evita o comportamento padrão imediatamente
                event.preventDefault();

                if (loadingOverlay) {
                    loadingOverlay.classList.add('show');
                }

                // Pequeno atraso para a animação do carregamento aparecer
                setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 300); // Ajuste este tempo para corresponder ao início da sua animação de carregamento
            });
        }
    });

    // Lógica para destacar a página ativa na navbar e gerenciar transições de tela
    const currentEffectiveFileName = getFileNameFromPath(window.location.pathname);

    // Lógica de Login/Logout e Estado da Navbar
    const loggedOutActions = document.querySelector('.logged-out-actions');
    const loggedInActions = document.querySelector('.logged-in-actions');
    const userProfilePicElement = document.querySelector('.profile-pic');
    const userNameElement = document.querySelector('.user-name');
    const logoutBtn = document.querySelector('.logout-btn');

    // Novos elementos do menu móvel
    const mobileUserStatus = document.querySelector('.mobile-user-status');
    const mobileProfilePicElement = mobileUserStatus ? mobileUserStatus.querySelector('.profile-pic-mobile') : null;
    const mobileLoginBtn = mobileUserStatus ? mobileUserStatus.querySelector('.login-btn-mobile') : null;

    const menuToggleBtn = document.querySelector('.menu-toggle-btn');
    const closeMenuBtnMobile = document.querySelector('.close-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const loggedOutActionsMobile = document.querySelector('.logged-out-actions-mobile');
    const loggedInActionsMobile = document.querySelector('.logged-in-actions-mobile');
    const mobileMenuProfilePicElement = mobileMenuOverlay ? mobileMenuOverlay.querySelector('.user-profile .profile-pic') : null;
    const mobileMenuUserNameElement = mobileMenuOverlay ? mobileMenuOverlay.querySelector('.user-profile .user-name') : null;
    const mobileLogoutBtnFromOverlay = mobileMenuOverlay ? mobileMenuOverlay.querySelector('.logout-btn') : null; // Renomeado para evitar conflito

    const updateNavbarState = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');
        const userProfilePic = localStorage.getItem('userProfilePic');

        // Lógica para desktop navbar
        if (isLoggedIn) {
            if (loggedOutActions) loggedOutActions.classList.add('hidden');
            if (loggedInActions) loggedInActions.classList.remove('hidden');
            if (userProfilePicElement) userProfilePicElement.src = userProfilePic || '../public/images/fotos-perfil/default-avatar.png';
            if (userNameElement) userNameElement.textContent = userName || 'Usuário';

            // Simula dados do usuário para a página da comunidade
            // Estes seriam carregados de um backend real em um cenário de produção
            const userData = JSON.parse(localStorage.getItem('userData')) || {
                contributions: 15,
                ratings: 23,
                points: 1250,
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            // Popula o perfil da comunidade se estiver na página de comunidade
            if (currentEffectiveFileName === 'comunidade.html') {
                const profileCardPic = document.querySelector('.profile-card-pic');
                const profileCardName = document.querySelector('.profile-card-name');
                const userContributions = document.getElementById('user-contributions');
                const userRatings = document.getElementById('user-ratings');
                const userPoints = document.getElementById('user-points');

                if (profileCardPic) profileCardPic.src = userProfilePic || '../public/images/fotos-perfil/default-avatar.png';
                if (profileCardName) profileCardName.textContent = userName || 'Usuário';
                if (userContributions) userContributions.textContent = userData.contributions;
                if (userRatings) userRatings.textContent = userData.ratings;
                if (userPoints) userPoints.textContent = userData.points;
            }

        } else {
            if (loggedOutActions) loggedOutActions.classList.remove('hidden');
            if (loggedInActions) loggedInActions.classList.add('hidden');

            // Limpa dados simulados de perfil se não estiver logado
            localStorage.removeItem('userData');
        }

        // Lógica para mobile navbar (cabeçalho principal)
        // A visibilidade do .mobile-user-status é controlada via CSS @media query
        if (mobileUserStatus) {
            if (isLoggedIn) {
                if (mobileProfilePicElement) {
                    mobileProfilePicElement.src = userProfilePic || '../public/images/fotos-perfil/default-avatar.png';
                    mobileProfilePicElement.classList.remove('hidden');
                }
                if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
            } else {
                if (mobileProfilePicElement) mobileProfilePicElement.classList.add('hidden');
                if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
            }
        }

        // Lógica para mobile navbar (overlay)
        if (mobileMenuOverlay) {
            if (isLoggedIn) {
                if (loggedOutActionsMobile) loggedOutActionsMobile.classList.add('hidden');
                if (loggedInActionsMobile) loggedInActionsMobile.classList.remove('hidden');
                if (mobileMenuProfilePicElement) mobileMenuProfilePicElement.src = userProfilePic || '../public/images/fotos-perfil/default-avatar.png';
                if (mobileMenuUserNameElement) mobileMenuUserNameElement.textContent = userName || 'Usuário';
            } else {
                if (loggedOutActionsMobile) loggedOutActionsMobile.classList.remove('hidden');
                if (loggedInActionsMobile) loggedInActionsMobile.classList.add('hidden');
            }
        }
    };

    // Função de Logout (botão desktop)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (themeTransitionOverlay) {
                themeTransitionOverlay.classList.add('show');
                // Espera a animação do overlay para esconder o conteúdo
                setTimeout(async () => {
                    try {
                        await firebase.auth().signOut();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userProfilePic');
                        localStorage.removeItem('userData');
                        updateNavbarState(); // Atualiza o estado visual da navbar

                        // *** INÍCIO: AJUSTE TEMPORÁRIO PARA AMBIENTE FILE:// ***
                        // Este é um HACK específico para o protocolo file:/// para desenvolvimento local sem servidor.
                        // Em um ambiente de servidor web (http://localhost), caminhos relativos simples funcionariam.
                        let redirectTo = 'index.html'; // Fallback padrão
                        const currentHref = window.location.href;
                        // Tenta encontrar a pasta 'docs' no caminho para construir um caminho absoluto.
                        // Isso assume que 'docs' é a raiz do seu projeto quando acessado via file://
                        const docsPathSegment = '/TCC-WACS/docs/'; // Ajuste se o nome da pasta raiz for diferente
                        const docsIndex = currentHref.indexOf(docsPathSegment);

                        if (docsIndex !== -1) {
                            redirectTo = currentHref.substring(0, docsIndex + docsPathSegment.length) + 'index.html';
                        } else if (window.location.pathname.includes('/views/')) {
                            // Se não encontrou o segmento 'docs', mas está em 'views', tenta subir um nível
                            redirectTo = '../index.html';
                        }
                        console.log('Tentando redirecionar para (desktop): ', redirectTo);
                        window.location.href = redirectTo;
                        // *** FIM: AJUSTE TEMPORÁRIO PARA AMBIENTE FILE:// ***

                    } catch (error) {
                        console.error("Erro ao fazer logout:", error);
                        showFlashNotification('Erro ao sair. Por favor, tente novamente.', 'error');
                        themeTransitionOverlay.classList.remove('show'); // Esconde o overlay se houver erro
                    }
                }, 500); // Deve corresponder à duração da transição do overlay no CSS
            }
        });
    }

    // Adicionar listener ao botão de login mobile
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            window.location.href = 'views/login.html';
        });
    }

    // Logout para o botão do menu móvel (overlay)
    if (mobileLogoutBtnFromOverlay) { // Usar a nova variável
        mobileLogoutBtnFromOverlay.addEventListener('click', async () => {
            if (themeTransitionOverlay) {
                themeTransitionOverlay.classList.add('show');
                // Espera a animação do overlay para esconder o conteúdo
                setTimeout(async () => {
                    try {
                        await firebase.auth().signOut();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userProfilePic');
                        localStorage.removeItem('userData');
                        updateNavbarState(); // Atualiza o estado visual da navbar

                        // *** INÍCIO: AJUSTE TEMPORÁRIO PARA AMBIENTE FILE:// ***
                        // Este é um HACK específico para o protocolo file:/// para desenvolvimento local sem servidor.
                        // Em um ambiente de servidor web (http://localhost), caminhos relativos simples funcionariam.
                        let redirectTo = 'index.html'; // Fallback padrão
                        const currentHref = window.location.href;
                        // Tenta encontrar a pasta 'docs' no caminho para construir um caminho absoluto.
                        // Isso assume que 'docs' é a raiz do seu projeto quando acessado via file://
                        const docsPathSegment = '/TCC-WACS/docs/'; // Ajuste se o nome da pasta raiz for diferente
                        const docsIndex = currentHref.indexOf(docsPathSegment);

                        if (docsIndex !== -1) {
                            redirectTo = currentHref.substring(0, docsIndex + docsPathSegment.length) + 'index.html';
                        } else if (window.location.pathname.includes('/views/')) {
                            // Se não encontrou o segmento 'docs', mas está em 'views', tenta subir um nível
                            redirectTo = '../index.html';
                        }
                        console.log('Tentando redirecionar para (mobile): ', redirectTo);
                        window.location.href = redirectTo;
                        // *** FIM: AJUSTE TEMPORÁRIO PARA AMBIENTE FILE:// ***

                    } catch (error) {
                        console.error("Erro ao fazer logout (mobile):", error);
                        showFlashNotification('Erro ao sair. Por favor, tente novamente.', 'error');
                        themeTransitionOverlay.classList.remove('show'); // Esconde o overlay se houver erro
                    }
                }, 500); // Deve corresponder à duração da transição do overlay no CSS
            }
        });
    }

    // Atualizar o estado da navbar ao carregar a página
    updateNavbarState();
    setNavbarActiveLink(); // Chamar para destacar o link ativo

    // Lógica para carregar imagens de perfil (background-image)
    document.querySelectorAll('.team-photo').forEach(photoDiv => {
        const imageUrl = photoDiv.getAttribute('data-src');
        if (imageUrl) {
            photoDiv.style.backgroundImage = `url('${imageUrl}')`;
        }
    });

    // Lógica para destacar a página ativa na navbar
    function setNavbarActiveLink() {
        const currentPathname = window.location.pathname;

        // Seleciona todos os links de navegação nos menus desktop e mobile
    const navLinks = document.querySelectorAll('.navbar-menu a, .mobile-navbar-menu a');

    navLinks.forEach(link => {
            // Remove a classe 'active' de todos os links primeiro
            link.parentElement.classList.remove('active');
            link.classList.remove('active');

            // Obtém o pathname absoluto do href do link
            const linkPathname = link.pathname;

            // Normaliza os pathnames para comparação: trata '/' e '/index.html' como iguais para a raiz
            // E remove barras finais se existirem para consistência
            const normalizedCurrentPathname = currentPathname === '/' ? '/index.html' : currentPathname.endsWith('/') ? currentPathname.slice(0, -1) : currentPathname;
            const normalizedLinkPathname = linkPathname === '/' ? '/index.html' : linkPathname.endsWith('/') ? linkPathname.slice(0, -1) : linkPathname;

            if (normalizedLinkPathname === normalizedCurrentPathname) {
                link.parentElement.classList.add('active'); // Adiciona a classe ao <li> pai
                link.classList.add('active'); // Adiciona também ao <a>, se necessário para estilização direta
            }
        });
    }

    // Lógica para gerenciamento de modais (ex: modal de feedback, de agendamento, etc.)
    const feedbackButton = document.getElementById('feedback-button');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeModal = document.querySelector('.close-modal');
    const sendFeedbackButton = document.getElementById('send-feedback');

    if (feedbackButton) {
        feedbackButton.addEventListener('click', () => {
            feedbackModal.style.display = 'flex';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            feedbackModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
        }
    });

    if (sendFeedbackButton) {
        sendFeedbackButton.addEventListener('click', () => {
            // Implementar lógica de envio de feedback (e.g., via AJAX/fetch para um backend)
            alert('Feedback enviado! (Funcionalidade em desenvolvimento)');
            feedbackModal.style.display = 'none';
        });
    }

    // Lógica para a funcionalidade de alternância do menu mobile
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
                mobileMenuOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Impede o scroll do body
        });
            }

    if (closeMenuBtnMobile) {
        closeMenuBtnMobile.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('show');
            document.body.style.overflow = ''; // Restaura o scroll do body
        });
    }

    // Fechar o menu móvel ao clicar fora dele
            if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // Fechar o menu móvel ao clicar em um link (para uma experiência mais suave)
    const mobileNavLinks = document.querySelectorAll('.mobile-navbar-menu a');
    mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    });

    // Lógica para a seção de estatísticas (index.html)
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statNumbers = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.textContent, 10);
                        let current = 0;
                        const increment = target / 100; // Ajuste para velocidade da contagem

                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                stat.textContent = target;
                                clearInterval(timer);
                            } else {
                                stat.textContent = Math.ceil(current);
                            }
                        }, 20); // Intervalo menor para uma contagem mais suave
                    });
                    observer.unobserve(statsSection); // Para de observar depois de animar
                }
            });
        }, {
            threshold: 0.5
        }); // Ativa quando 50% da seção está visível

        observer.observe(statsSection);
    }

    // Lógica para exibir posts na página de comunidade (apenas um exemplo simulado)
    const communityContentWrapper = document.getElementById('community-content-wrapper');
    if (currentEffectiveFileName === 'comunidade.html' && communityContentWrapper) {
        const postsContainer = document.querySelector('.community-posts');
        const chatContainer = document.querySelector('.community-chat');
        const suggestionsContainer = document.querySelector('.community-suggestions');
        const trendingTopicsContainer = document.querySelector('.trending-topics-list');

        const postsData = [
            {
                id: 1,
                author: 'Usuário Teste',
                avatar: '../public/images/fotos-perfil/user1.png',
                time: '5 mins ago',
                content: 'Acabei de descobrir um café super acessível no centro! As rampas são ótimas e o atendimento impecável.',
                likes: 12,
                comments: 3,
                shares: 1
            },
            {
                id: 2,
                author: 'Maria S.',
                avatar: '../public/images/fotos-perfil/user2.png',
                time: '2 horas atrás',
                content: 'Alguém tem recomendações de parques com boa infraestrutura para cadeirantes em São Paulo?',
                likes: 25,
                comments: 8,
                shares: 2
            },
            {
                id: 3,
                author: 'João P.',
                avatar: '../public/images/fotos-perfil/user3.png',
                time: '1 dia atrás',
                content: 'Participei de um evento online sobre acessibilidade digital. Muito inspirador!',
                likes: 8,
                comments: 1,
                shares: 0
            }
        ];

        const chatData = [
            {
                id: 1,
                sender: 'Ana C.',
                message: 'Bom dia, pessoal! Alguma dica para transporte acessível em eventos grandes?',
                time: '10:30',
                avatar: '../public/images/fotos-perfil/user4.png'
            },
            {
                id: 2,
                sender: 'Pedro L.',
                message: 'Recomendo verificar aplicativos de transporte que oferecem veículos adaptados. Alguns eventos também têm vans específicas.',
                time: '10:35',
                avatar: '../public/images/fotos-perfil/user5.png'
            }
        ];

        const suggestionData = [
            {
                id: 1,
                title: 'Sugestão de Recurso: Roteiros Acessíveis',
                description: 'Criar rotas de viagem com pontos de interesse 100% acessíveis.',
                votes: 45
            },
            {
                id: 2,
                title: 'Sugestão de Melhoria: Tradução em Libras no App',
                description: 'Adicionar suporte a Libras para comunicação dentro do aplicativo.',
                votes: 30
            }
        ];

        const trendingTopicsData = [
            { name: '#InclusaoDigital', count: '1.2K Posts' },
            { name: '#AcessibilidadeUrbana', count: '980 Posts' },
            { name: '#VidaCadeirante', count: '750 Posts' },
            { name: '#TecnologiaAssistiva', count: '600 Posts' }
        ];

        const renderPosts = () => {
            if (postsContainer) {
                postsContainer.innerHTML = postsData.map(post => `
                    <div class="community-post-card">
                    <div class="post-header">
                            <img src="${post.avatar}" alt="${post.author}" class="post-author-avatar">
                            <div class="post-info">
                                <span class="post-author-name">${post.author}</span>
                                <span class="post-time">${post.time}</span>
                            </div>
                    </div>
                        <p class="post-content">${post.content}</p>
                        <div class="post-actions">
                            <span><i class="fas fa-thumbs-up"></i> ${post.likes}</span>
                            <span><i class="fas fa-comment"></i> ${post.comments}</span>
                            <span><i class="fas fa-share"></i> ${post.shares}</span>
                    </div>
                    </div>
                `).join('');
            }
        };

        const renderChats = () => {
            if (chatContainer) {
                chatContainer.innerHTML = chatData.map(chat => `
                    <div class="chat-message-card">
                        <img src="${chat.avatar}" alt="${chat.sender}" class="chat-sender-avatar">
                        <div class="chat-content">
                            <span class="chat-sender-name">${chat.sender}</span>
                            <p class="chat-message-text">${chat.message}</p>
                            <span class="chat-time">${chat.time}</span>
                        </div>
                    </div>
                `).join('');
            }
        };

        const renderSuggestions = () => {
            if (suggestionsContainer) {
                suggestionsContainer.innerHTML = suggestionData.map(suggestion => `
                    <div class="suggestion-card">
                        <h3>${suggestion.title}</h3>
                        <p>${suggestion.description}</p>
                        <div class="suggestion-actions">
                            <span><i class="fas fa-thumbs-up"></i> ${suggestion.votes} votos</span>
                            <button class="btn btn-secondary btn-small">Ver Mais</button>
                        </div>
                    </div>
                `).join('');
            }
        };

        const renderTrendingTopics = () => {
            if (trendingTopicsContainer) {
                trendingTopicsContainer.innerHTML = trendingTopicsData.map(topic => `
                    <li><a href="#">${topic.name} <span>${topic.count}</span></a></li>
                `).join('');
            }
        };

        renderPosts();
        renderChats();
        renderSuggestions();
        renderTrendingTopics();
}

// Lógica para notificações flash
const flashNotification = document.getElementById('flashNotification');
const flashNotificationMessage = document.getElementById('flashNotificationMessage');
const closeFlashNotificationBtn = document.querySelector('.close-flash-notification-btn');

closeFlashNotificationBtn.addEventListener('click', () => {
    flashNotification.classList.remove('show');
});

function showFlashNotification(message, type = 'info') {
    flashNotificationMessage.textContent = message;
    flashNotification.className = 'flash-notification'; // Reset classes
    flashNotification.classList.add(type);
    flashNotification.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        flashNotification.classList.remove('show');
    }, 5000);
}

// Exemplo de uso (chame esta função quando precisar mostrar uma notificação)
// showFlashNotification('Perfil atualizado com sucesso!', 'success');
// showFlashNotification('Erro ao salvar dados.', 'error');

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        document.body.classList.remove('fade-out');
        document.body.classList.add('fade-in');
    }
}); 
});

// Função auxiliar para obter o nome do arquivo da URL
// Esta função foi movida para auth-check.js para centralização
/*
const getFileNameFromPath = (path) => {
    const parts = path.split('/');
    return parts[parts.length - 1].split('#')[0].split('?')[0];
};
*/

// Esta função será removida pois a showFlashNotification é globalmente disponível via auth-check.js
/*
function showFlashNotification(message, type = 'info') {
    const flashNotificationElement = document.createElement('div');
    flashNotificationElement.classList.add('flash-notification', type, 'show');
    flashNotificationElement.textContent = message;
    document.body.appendChild(flashNotificationElement);

    setTimeout(() => {
        flashNotificationElement.classList.remove('show');
        flashNotificationElement.remove();
    }, 5000);
}
*/ 