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
            if (userProfilePicElement) userProfilePicElement.src = userProfilePic || '../public/images/fotos-perfil/default-avatar.png'; // Adiciona avatar padrão
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
    };

    // Função de Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userProfilePic');
            localStorage.removeItem('userData'); // Garante que os dados do perfil sejam removidos
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

    // Helper para obter o nome do arquivo base ou o segmento de caminho relevante
    const getFileNameFromPath = (path) => {
        const parts = path.split('/').filter(p => p !== ''); // Remove partes vazias
        let fileName = parts[parts.length - 1] || ''; // Pega a última parte

        if (fileName.includes('.')) { // Se tiver uma extensão de arquivo
            return fileName;
        }
        // Se for um diretório ou a raiz, assume index.html para comparação
        return 'index.html'; 
    };

    // Lógica para destacar a página ativa na navbar e gerenciar transições de tela
    const currentEffectiveFileName = getFileNameFromPath(window.location.pathname);
    const navLinks = document.querySelectorAll('.navbar-menu a');

    navLinks.forEach(link => {
        let linkHref = link.getAttribute('href');

        // Adiciona um listener para a transição de saída
        link.addEventListener('click', (event) => {
            // Ignora links que são âncoras na mesma página ou links externos
            if (linkHref.startsWith('#') || linkHref.includes('://')) {
                return; // Deixa o navegador lidar com isso
            }

            event.preventDefault(); // Impede a navegação padrão

            const body = document.body;
            body.classList.remove('fade-in'); // Remove a classe fade-in se ainda estiver ativa
            body.classList.add('fade-out');

            // Espera a animação de fade-out terminar antes de navegar
            setTimeout(() => {
                window.location.href = link.href;
            }, 500); // Deve corresponder à duração da animação no CSS
        });

        // Lógica para destacar a página ativa
        link.classList.remove('active'); // Limpa o estado ativo para todos os links primeiro

        if (linkHref.startsWith('#')) {
            // Para âncoras internas, ativa o link "Home" se estiver na página inicial
            if (currentEffectiveFileName === 'index.html') {
                if (linkHref === '#home' || linkHref === '') { // Vazio para links de home no index.html
                    link.classList.add('active');
                }
            }
        } else {
            // Para links de página completa
            let linkAbsoluteUrl;
            try {
                linkAbsoluteUrl = new URL(link.href, window.location.href); // Resolve URL relativa para absoluta
            } catch (e) {
                console.warn(`Não foi possível analisar o URL para o link: ${link.href}`, e);
                return; // Pula este link se o URL for inválido
            }
            const linkEffectiveFileName = getFileNameFromPath(linkAbsoluteUrl.pathname);

            if (currentEffectiveFileName === linkEffectiveFileName) {
                link.classList.add('active');
            }
        }
    });

    // Lógica específica para a página da comunidade
    if (currentEffectiveFileName === 'comunidade.html') {
        // Dados simulados de posts (com imagens aleatórias)
        let simulatedPosts = [
            {
                id: 1,
                authorName: 'João Silva',
                authorPic: 'https://randomuser.me/api/portraits/men/32.jpg',
                timestamp: 'há 1 hora',
                content: 'Acabei de mapear um novo local acessível na minha cidade! É incrível como pequenos atos podem fazer uma grande diferença. #Acessibilidade #WACS',
                image: null,
                likes: 15,
                comments: 3
            },
            {
                id: 2,
                authorName: 'Maria Oliveira',
                authorPic: 'https://randomuser.me/api/portraits/women/44.jpg',
                timestamp: 'há 3 horas',
                content: 'Muito feliz em ver a comunidade WACS crescendo! Juntos somos mais fortes para promover a inclusão. #ComunidadeWACS',
                image: 'https://picsum.photos/600/400?random=1',
                likes: 28,
                comments: 7
            },
            {
                id: 3,
                authorName: 'Pedro Santos',
                authorPic: 'https://randomuser.me/api/portraits/men/78.jpg',
                timestamp: 'ontem',
                content: 'Participei de um evento incrível sobre tecnologia assistiva hoje. Tanta inovação sendo criada! #TechAcessivel',
                image: 'https://picsum.photos/600/400?random=3',
                likes: 42,
                comments: 12
            },
            {
                id: 4,
                authorName: 'Ana Clara',
                authorPic: 'https://randomuser.me/api/portraits/women/90.jpg',
                timestamp: '2 dias atrás',
                content: 'Dica rápida: use o recurso de mapa acessível do WACS para planejar suas rotas! Salvou meu dia hoje. #DicasWACS',
                image: null,
                likes: 10,
                comments: 1
            }
        ];

        // Dados simulados de chats (com imagens aleatórias)
        let simulatedChats = [
            {
                id: 1,
                contactName: 'Ana Paula',
                chatPic: 'https://randomuser.me/api/portraits/women/67.jpg',
                lastMessage: 'Olá, tudo bem?',
                unreadCount: 2
            },
            {
                id: 2,
                contactName: 'Carlos Diniz',
                chatPic: 'https://randomuser.me/api/portraits/men/12.jpg',
                lastMessage: 'Ótima iniciativa!',
                unreadCount: 0
            },
            {
                id: 3,
                contactName: 'Equipe de Suporte',
                chatPic: 'https://randomuser.me/api/portraits/lego/1.jpg',
                lastMessage: 'Seu ticket foi atualizado.',
                unreadCount: 1
            },
            {
                id: 4,
                contactName: 'Marta Lima',
                chatPic: 'https://randomuser.me/api/portraits/women/2.jpg',
                lastMessage: 'Nos encontramos amanhã!',
                unreadCount: 0
            }
        ];

        // Dados simulados de sugestões de usuários
        let simulatedSuggestions = [
            {
                id: 1,
                name: 'Felipe Souza',
                profilePic: 'https://randomuser.me/api/portraits/men/88.jpg',
                role: 'Engenheiro de Dados'
            },
            {
                id: 2,
                name: 'Larissa Costa',
                profilePic: 'https://randomuser.me/api/portraits/women/77.jpg',
                role: 'UX Designer'
            },
            {
                id: 3,
                name: 'Roberto Fernandes',
                profilePic: 'https://randomuser.me/api/portraits/men/55.jpg',
                role: 'Fisioterapeuta'
            },
            {
                id: 4,
                name: 'Camila Santos',
                profilePic: 'https://randomuser.me/api/portraits/women/11.jpg',
                role: 'Jornalista'
            }
        ];

        // Dados simulados de tópicos em destaque
        let simulatedTrendingTopics = [
            {
                id: 1,
                name: '#AcessibilidadeDigital',
                posts: '1.2K'
            },
            {
                id: 2,
                name: '#InovacaoPCD',
                posts: '850'
            },
            {
                id: 3,
                name: '#TransporteAcessivel',
                posts: '500'
            },
            {
                id: 4,
                name: '#TecnologiaAssistiva',
                posts: '1.5K'
            }
        ];

        const postsFeedContainer = document.querySelector('.posts-feed');
        const chatListContainer = document.querySelector('.chat-list');
        const postTextarea = document.querySelector('.post-textarea');
        const postButton = document.querySelector('.post-btn');

        // Função para renderizar posts
        const renderPosts = () => {
            if (!postsFeedContainer) return;
            postsFeedContainer.innerHTML = '<h3>Feed da Comunidade</h3>'; // Limpa e adiciona o título

            simulatedPosts.forEach(post => {
                const postCard = document.createElement('div');
                postCard.classList.add('post-card');
                postCard.innerHTML = `
                    <div class="post-header">
                        <img src="${post.authorPic}" alt="Foto de Perfil" class="post-author-pic">
                        <span class="post-author-name">${post.authorName}</span>
                        <span class="post-timestamp">${post.timestamp}</span>
                    </div>
                    <div class="post-content">
                        <p>${post.content}</p>
                        ${post.image ? `<img src="${post.image}" alt="Imagem do Post" class="post-image">` : ''}
                    </div>
                    <div class="post-footer">
                        <span class="post-stats like-btn" data-post-id="${post.id}"><i class="fas fa-thumbs-up"></i> <span class="likes-count">${post.likes}</span> Curtidas</span>
                        <span class="post-stats comment-btn" data-post-id="${post.id}"><i class="fas fa-comment"></i> <span class="comments-count">${post.comments}</span> Comentários</span>
                    </div>
                `;
                postsFeedContainer.appendChild(postCard);
            });

            // Adiciona listeners para curtir e comentar após renderizar
            document.querySelectorAll('.post-footer .like-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const postId = event.currentTarget.dataset.postId;
                    const post = simulatedPosts.find(p => p.id == postId);
                    if (post) {
                        // Simula toggle de like
                        if (!post.liked) {
                            post.likes++;
                            post.liked = true;
                            event.currentTarget.classList.add('liked'); // Adiciona uma classe para feedback visual
                        } else {
                            post.likes--;
                            post.liked = false;
                            event.currentTarget.classList.remove('liked');
                        }
                        event.currentTarget.querySelector('.likes-count').textContent = post.likes;
                        console.log(`Post ${postId} curtido: ${post.likes}`);
                    }
                });
            });

            document.querySelectorAll('.post-footer .comment-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const postId = event.currentTarget.dataset.postId;
                    // Em um cenário real, isso abriria um modal de comentários ou levaria para a página do post
                    alert(`Simulando comentários para o Post ${postId}.`);
                    // Apenas para demonstração, incrementa o contador
                    const post = simulatedPosts.find(p => p.id == postId);
                    if (post) {
                        post.comments++;
                        event.currentTarget.querySelector('.comments-count').textContent = post.comments;
                        console.log(`Simulando novo comentário para o Post ${postId}. Total: ${post.comments}`);
                    }
                });
            });
        };

        // Função para renderizar chats
        const renderChats = () => {
            if (!chatListContainer) return;
            chatListContainer.innerHTML = ''; // Limpa chats existentes

            simulatedChats.forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.classList.add('chat-item');
                chatItem.innerHTML = `
                    <img src="${chat.chatPic}" alt="Foto de Perfil" class="chat-pic">
                    <div class="chat-info">
                        <span class="chat-contact-name">${chat.contactName}</span>
                        <span class="last-message">${chat.lastMessage}</span>
                    </div>
                    ${chat.unreadCount > 0 ? `<span class="unread-count">${chat.unreadCount}</span>` : ''}
                `;
                chatListContainer.appendChild(chatItem);
            });
        };

        // Função para renderizar sugestões de usuários
        const renderSuggestions = () => {
            const suggestionListContainer = document.querySelector('.suggestion-list');
            if (!suggestionListContainer) return;
            suggestionListContainer.innerHTML = ''; // Limpa sugestões existentes

            simulatedSuggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.innerHTML = `
                    <img src="${suggestion.profilePic}" alt="Foto de Perfil" class="suggestion-pic">
                    <div class="suggestion-info">
                        <span class="suggestion-name">${suggestion.name}</span>
                        <span class="suggestion-role">${suggestion.role}</span>
                    </div>
                    <button class="btn btn-outline-gradient connect-btn" data-user-id="${suggestion.id}"><i class="fas fa-user-plus"></i> Conectar</button>
                `;
                suggestionListContainer.appendChild(suggestionItem);
            });

            // Adiciona listeners para os botões de conectar
            document.querySelectorAll('.connect-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const userId = event.currentTarget.dataset.userId;
                    alert(`Simulando conexão com o usuário ${userId}!`);
                    // Em um cenário real, você faria uma chamada API para conectar com o usuário
                    event.currentTarget.textContent = 'Conectado';
                    event.currentTarget.disabled = true;
                    event.currentTarget.classList.remove('btn-outline-gradient');
                    event.currentTarget.classList.add('btn-secondary');
                });
            });
        };

        // Função para renderizar tópicos em destaque
        const renderTrendingTopics = () => {
            const topicListContainer = document.querySelector('.topic-list');
            if (!topicListContainer) return;
            topicListContainer.innerHTML = ''; // Limpa tópicos existentes

            simulatedTrendingTopics.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.classList.add('topic-item');
                topicItem.innerHTML = `
                    <span class="topic-name">${topic.name}</span>
                    <span class="topic-posts">${topic.posts} Posts</span>
                `;
                topicListContainer.appendChild(topicItem);
            });
        };

        // Lógica para criar um novo post
        if (postButton && postTextarea) {
            postButton.addEventListener('click', () => {
                const postContent = postTextarea.value.trim();
                if (postContent) {
                    const loggedInUserName = localStorage.getItem('userName') || 'Usuário WACS';
                    const loggedInUserProfilePic = localStorage.getItem('userProfilePic') || '../public/images/fotos-perfil/default-avatar.png';

                    const newPost = {
                        id: simulatedPosts.length + 1,
                        authorName: loggedInUserName,
                        authorPic: loggedInUserProfilePic,
                        timestamp: 'agora',
                        content: postContent,
                        image: null, // Por enquanto, sem upload de imagem simulado
                        likes: 0,
                        comments: 0
                    };
                    simulatedPosts.unshift(newPost); // Adiciona o novo post no início do array
                    renderPosts(); // Re-renderiza todos os posts
                    postTextarea.value = ''; // Limpa a textarea
                }
            });
        }

        // Renderiza posts e chats ao carregar a página
        renderPosts();
        renderChats();
        renderSuggestions(); // Renderiza sugestões
        renderTrendingTopics(); // Renderiza tópicos em destaque

    }

    // Lógica específica para a página de edição de perfil
    if (currentEffectiveFileName === 'edit-profile.html') {
        const currentProfilePic = document.getElementById('currentProfilePic');
        const profilePictureInput = document.getElementById('profilePicture');
        const changeProfilePicBtn = document.getElementById('changeProfilePic');
        const userNameInput = document.getElementById('userName');
        const userEmailInput = document.getElementById('userEmail');
        const userBioInput = document.getElementById('userBio');
        const userLocationInput = document.getElementById('userLocation');
        const userSkillsInput = document.getElementById('userSkills');
        const userInstagramInput = document.getElementById('userInstagram');
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
        const editProfileForm = document.getElementById('editProfileForm');

        console.log('Edit Profile Page Script Loaded.');
        console.log('editProfileForm element:', editProfileForm);

        // Elementos da notificação flash
        const flashNotification = document.getElementById('flashNotification');
        const flashNotificationMessage = document.getElementById('flashNotificationMessage');
        const closeFlashNotificationBtn = document.querySelector('.close-flash-notification-btn');

        // Função para exibir a notificação flash
        const showFlashNotification = (message, type = 'info') => {
            flashNotificationMessage.textContent = message;
            flashNotification.className = 'flash-notification'; // Reseta classes
            flashNotification.classList.add(type);
            flashNotification.classList.add('show');

            // Oculta a notificação após 3 segundos
            setTimeout(() => {
                flashNotification.classList.remove('show');
                // Opcional: remover a classe de tipo após a transição para reuso
                setTimeout(() => {
                    flashNotification.className = 'flash-notification';
                }, 300); // Deve corresponder à duração da transição CSS
            }, 3000);
        };

        // Listener para fechar a notificação manualmente
        if (closeFlashNotificationBtn) {
            closeFlashNotificationBtn.addEventListener('click', () => {
                flashNotification.classList.remove('show');
                setTimeout(() => {
                    flashNotification.className = 'flash-notification';
                }, 300);
            });
        }

        // Pré-preencher o formulário com dados do usuário logado
        const loggedInUserName = localStorage.getItem('userName') || 'Usuário';
        const loggedInUserProfilePic = localStorage.getItem('userProfilePic') || '../public/images/fotos-perfil/default-avatar.png';
        const loggedInUserEmail = localStorage.getItem('userEmail') || 'usuario@example.com'; // Adiciona e-mail simulado
        const loggedInUserBio = localStorage.getItem('userBio') || 'Olá, sou um usuário WACS! Apaixonado por acessibilidade e tecnologia.';
        const loggedInUserLocation = localStorage.getItem('userLocation') || 'Cidade Exemplo, País';
        const loggedInUserSkills = localStorage.getItem('userSkills') || 'Acessibilidade, Inovação, Tecnologia, UX';
        const loggedInUserInstagram = localStorage.getItem('userInstagram') || '';

        if (currentProfilePic) currentProfilePic.src = loggedInUserProfilePic;
        if (userNameInput) userNameInput.value = loggedInUserName;
        if (userEmailInput) userEmailInput.value = loggedInUserEmail;
        if (userBioInput) userBioInput.value = loggedInUserBio;
        if (userLocationInput) userLocationInput.value = loggedInUserLocation;
        if (userSkillsInput) userSkillsInput.value = loggedInUserSkills;
        if (userInstagramInput) userInstagramInput.value = loggedInUserInstagram;

        // Lógica para alterar a foto de perfil (simulado)
        if (changeProfilePicBtn && profilePictureInput && currentProfilePic) {
            changeProfilePicBtn.addEventListener('click', () => {
                profilePictureInput.click(); // Dispara o clique no input de arquivo
            });

            profilePictureInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Simula upload: Apenas exibe a imagem localmente
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentProfilePic.src = e.target.result;
                        // Em um cenário real, você faria o upload para o Firebase Storage aqui
                        // e salvaria a URL retornada.
                        // Por enquanto, salvamos a URL do Data URL para persistência da simulação.
                        localStorage.setItem('userProfilePic', e.target.result);
                        // Atualiza o estado da navbar imediatamente para refletir a mudança
                        updateNavbarState();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Lógica para salvar as alterações do perfil (simulado)
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (event) => {
                console.log('Form submit event triggered.');
                event.preventDefault(); // Impedir o envio padrão do formulário
                console.log('event.preventDefault() called.');

                const newUserName = userNameInput ? userNameInput.value.trim() : loggedInUserName;
                const newPassword = newPasswordInput ? newPasswordInput.value : '';
                const confirmNewPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';
                const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
                const newUserBio = userBioInput ? userBioInput.value.trim() : loggedInUserBio;
                const newUserLocation = userLocationInput ? userLocationInput.value.trim() : loggedInUserLocation;
                const newUserSkills = userSkillsInput ? userSkillsInput.value.trim() : loggedInUserSkills;
                const newUserInstagram = userInstagramInput ? userInstagramInput.value.trim() : loggedInUserInstagram;

                // Validação básica da senha (simulado)
                if (newPassword && newPassword !== confirmNewPassword) {
                    showFlashNotification('As novas senhas não coincidem!', 'error');
                    console.log('Password mismatch, showing error.');
                    return;
                }

                // Simular carregamento
                showFlashNotification('Salvando alterações...', 'info');
                console.log('Showing loading notification.');

                setTimeout(() => {
                    console.log('Simulated saving data...');
                    // Atualiza os dados no localStorage
                    localStorage.setItem('userName', newUserName);
                    localStorage.setItem('userBio', newUserBio);
                    localStorage.setItem('userLocation', newUserLocation);
                    localStorage.setItem('userSkills', newUserSkills);
                    localStorage.setItem('userInstagram', newUserInstagram);

                    // Simula a mudança de senha, mas não a persiste de forma segura
                    if (newPassword) {
                        console.log('Senha alterada para: ', newPassword); // Apenas para debug
                    }

                    showFlashNotification('Perfil atualizado com sucesso!', 'success');
                    console.log('Showing success notification.');

                    // Redireciona de volta para a página anterior após um breve atraso
                    setTimeout(() => {
                        console.log('Navigating back to previous page.');
                        window.history.back();
                    }, 1500); // Espera a notificação de sucesso aparecer por um tempo
                    
                    // Re-renderiza o estado da navbar caso alguma mudança não tenha sido pega antes
                    updateNavbarState();

                }, 2000); // Simula 2 segundos de carregamento
            });
        } else {
            console.error('Elemento editProfileForm não encontrado!');
        }
    }
}); 