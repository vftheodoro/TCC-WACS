// community.js - Funcionalidades específicas da página de comunidade

// Verificar se Firebase está disponível
function getFirebaseApp() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase não está carregado');
        return null;
    }
    return firebase;
}

// Inicializar Firebase se necessário
function initializeFirebase() {
    const firebase = getFirebaseApp();
    if (!firebase) return null;

    if (!firebase.apps.length) {
        const firebaseConfig = {
            apiKey: window.ENV.FIREBASE_API_KEY,
            authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
            projectId: window.ENV.FIREBASE_PROJECT_ID,
            storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.ENV.FIREBASE_APP_ID,
            measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
        };
        firebase.initializeApp(firebaseConfig);
    }

    return firebase;
}

// Mostrar estado de carregamento
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.innerHTML = '';
    }
}

// Esconder estado de carregamento
function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
    }
}

// Variáveis globais para busca
let allUsers = [];
let currentSearchTerm = '';
let searchTimeout = null;

// Inicializar funcionalidade de busca
function initializeSearch() {
    const searchInput = document.getElementById('user-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const searchResultsInfo = document.getElementById('search-results-info');
    const searchResultsText = document.getElementById('search-results-text');

    if (!searchInput) return;

    // Evento de digitação na busca
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        currentSearchTerm = searchTerm;

        // Mostrar/ocultar botão de limpar
        if (searchTerm.length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
            searchResultsInfo.style.display = 'none';
        }

        // Debounce para evitar muitas buscas
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);
    });

    // Evento de clique no botão limpar
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchTerm = '';
        clearBtn.style.display = 'none';
        searchResultsInfo.style.display = 'none';
        performSearch('');
    });

    // Evento de foco na busca
    searchInput.addEventListener('focus', () => {
        const searchWrapper = searchInput.closest('.search-input-wrapper');
        if (searchWrapper) {
            searchWrapper.classList.add('searching');
        }
    });

    // Evento de blur na busca
    searchInput.addEventListener('blur', () => {
        const searchWrapper = searchInput.closest('.search-input-wrapper');
        if (searchWrapper) {
            searchWrapper.classList.remove('searching');
        }
    });

    // Evento de tecla Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(currentSearchTerm);
        }
    });
}

// Realizar busca de usuários
function performSearch(searchTerm) {
    const suggestionList = document.querySelector('.suggestion-list');
    const searchResultsInfo = document.getElementById('search-results-info');
    const searchResultsText = document.getElementById('search-results-text');

    if (!suggestionList || allUsers.length === 0) return;

    // Filtrar usuários baseado no termo de busca
    const filteredUsers = allUsers.filter(user => {
        const userName = (user.displayName || user.name || user.email || '').toLowerCase();
        const userRole = (user.userRole || user.profession || user.mobilityType || '').toLowerCase();
        const userCity = (user.cidade || user.city || '').toLowerCase();
        
        return userName.includes(searchTerm) || 
               userRole.includes(searchTerm) || 
               userCity.includes(searchTerm);
    });

    // Limpar lista atual
    suggestionList.innerHTML = '';

    // Mostrar resultados da busca
    if (searchTerm.length > 0) {
        if (filteredUsers.length > 0) {
            searchResultsText.textContent = `Encontrados ${filteredUsers.length} usuário(s) para "${searchTerm}"`;
            searchResultsInfo.style.display = 'block';
            
            // Mostrar usuários filtrados
            filteredUsers.forEach(user => {
                const suggestionItem = createSuggestionItem(user);
                suggestionItem.classList.add('highlighted');
                suggestionList.appendChild(suggestionItem);
            });
        } else {
            searchResultsText.textContent = `Nenhum usuário encontrado para "${searchTerm}"`;
            searchResultsInfo.style.display = 'block';
            
            suggestionList.innerHTML = `
                <div class="no-suggestions-message">
                    <p>Nenhum usuário encontrado para "${searchTerm}"</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Tente buscar por nome, profissão ou cidade</p>
                </div>
            `;
        }
    } else {
        // Mostrar sugestões originais
        searchResultsInfo.style.display = 'none';
        loadUserSuggestions();
    }
}

// Carregar usuários para a seção de chats privados
async function loadUsersForPrivateChats() {
    const firebase = initializeFirebase();
    if (!firebase) return;

    const auth = firebase.auth();
    const db = firebase.firestore();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.log('Usuário não está logado');
        return;
    }

    const chatList = document.querySelector('.chat-list');
    if (!chatList) {
        console.error('Elemento .chat-list não encontrado');
        return;
    }

    // Mostrar estado de carregamento
    showLoading(chatList);

    try {
        // Buscar todos os usuários cadastrados, exceto o usuário atual
        const usersSnapshot = await db.collection('users')
            .where('uid', '!=', currentUser.uid)
            .limit(10) // Buscar mais usuários para filtrar no cliente
            .get();

        // Esconder estado de carregamento
        hideLoading(chatList);

        if (usersSnapshot.empty) {
            chatList.innerHTML = `
                <div class="no-chats-message">
                    <p>Nenhum usuário encontrado para iniciar conversas.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Convide amigos para se juntarem à comunidade WACS!</p>
                </div>
            `;
            return;
        }

        // Filtrar usuários com foto no lado do cliente
        const usersWithPhotos = [];
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            const hasPhoto = (userData.photoURL && userData.photoURL.trim() !== '') || 
                           (userData.photo && userData.photo.trim() !== '');
            
            if (hasPhoto) {
                usersWithPhotos.push(userData);
            }
        });

        // Limitar a 2 usuários com foto
        const limitedUsers = usersWithPhotos.slice(0, 2);

        if (limitedUsers.length === 0) {
            chatList.innerHTML = `
                <div class="no-chats-message">
                    <p>Nenhum usuário com foto de perfil encontrado.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Convide amigos para se juntarem à comunidade WACS!</p>
                </div>
            `;
            return;
        }

        // Verificar se "Aguinaldo" está presente, se não, adicionar
        const hasAguinaldo = limitedUsers.some(user => 
            (user.displayName && user.displayName.toLowerCase().includes('aguinaldo')) ||
            (user.name && user.name.toLowerCase().includes('aguinaldo')) ||
            (user.email && user.email.toLowerCase().includes('aguinaldo'))
        );

        if (!hasAguinaldo && limitedUsers.length < 2) {
            const aguinaldoUser = {
                uid: 'aguinaldo_sample',
                displayName: 'Aguinaldo',
                name: 'Aguinaldo',
                email: 'aguinaldo@wacs.com',
                photoURL: 'https://randomuser.me/api/portraits/men/75.jpg',
                photo: 'https://randomuser.me/api/portraits/men/75.jpg',
                userRole: 'Membro da Comunidade',
                mobilityType: 'cadeirante'
            };
            limitedUsers.unshift(aguinaldoUser);
        }

        // Processar cada usuário encontrado com foto
        limitedUsers.forEach((userData) => {
            const chatItem = createChatItem(userData);
            chatList.appendChild(chatItem);
        });

        console.log(`Carregados ${limitedUsers.length} usuários com foto para chats privados`);

    } catch (error) {
        console.error('Erro ao carregar usuários para chats privados:', error);
        hideLoading(chatList);
        
        chatList.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar usuários. Tente novamente mais tarde.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Detalhes: ${error.message}</p>
            </div>
        `;
    }
}

// Criar elemento de chat para um usuário
function createChatItem(userData) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.setAttribute('data-user-id', userData.uid);

    // Usar foto do usuário ou foto padrão
    const userPhoto = userData.photoURL || userData.photo || '../public/images/fotos-perfil/default-avatar.png';
    
    // Usar nome do usuário ou email como fallback
    const userName = userData.displayName || userData.name || userData.email || 'Usuário';
    
    // Gerar mensagem de exemplo baseada no tipo de usuário
    const lastMessage = generateExampleMessage(userData);

    // Determinar se deve mostrar contador de mensagens não lidas
    const hasUnreadMessages = Math.random() > 0.7; // 30% de chance de ter mensagens não lidas
    const unreadCount = hasUnreadMessages ? Math.floor(Math.random() * 5) + 1 : 0;

    chatItem.innerHTML = `
        <img src="${userPhoto}" alt="Foto de ${userName}" class="chat-pic" onerror="this.src='../public/images/fotos-perfil/default-avatar.png'">
        <div class="chat-info">
            <span class="chat-contact-name">${userName}</span>
            <span class="last-message">${lastMessage}</span>
        </div>
        ${hasUnreadMessages ? `<span class="unread-count">${unreadCount}</span>` : ''}
    `;

    // Adicionar evento de clique para iniciar chat
    chatItem.addEventListener('click', () => {
        initiatePrivateChat(userData);
    });

    return chatItem;
}

// Gerar mensagem de exemplo baseada nos dados do usuário
function generateExampleMessage(userData) {
    const messages = [
        'Olá! Como você está?',
        'Gostaria de conversar sobre acessibilidade?',
        'Que tal trocarmos experiências?',
        'Oi! Tudo bem?',
        'Interessante seu perfil!',
        'Podemos conversar?',
        'Olá! Bem-vindo à comunidade WACS!',
        'Que tal compartilharmos experiências?',
        'Muito legal conhecer você!',
        'Tem alguma dica de acessibilidade?'
    ];

    // Se o usuário tem informações específicas, personalizar a mensagem
    if (userData.mobilityType) {
        const mobilityMessages = {
            'cadeirante': 'Olá! Que tal conversarmos sobre acessibilidade?',
            'deficiente_visual': 'Oi! Como está sua experiência com acessibilidade?',
            'deficiente_auditivo': 'Olá! Podemos trocar experiências?',
            'deficiente_motor': 'Oi! Que tal compartilharmos experiências?'
        };
        return mobilityMessages[userData.mobilityType] || messages[Math.floor(Math.random() * messages.length)];
    }

    // Se o usuário tem cidade, personalizar a mensagem
    if (userData.cidade) {
        return `Olá! Que tal conversarmos sobre acessibilidade em ${userData.cidade}?`;
    }

    return messages[Math.floor(Math.random() * messages.length)];
}

// Iniciar chat privado com um usuário
function initiatePrivateChat(userData) {
    const userName = userData.displayName || userData.name || userData.email || 'Usuário';
    
    // Abrir chat em nova janela
    const chatWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
    
    if (chatWindow) {
        chatWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Chat com ${userName} - WACS</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                    .chat-header { background: #6366f1; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    .chat-messages { height: 400px; overflow-y: auto; background: white; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    .message { margin-bottom: 10px; padding: 10px; border-radius: 8px; }
                    .message.sent { background: #6366f1; color: white; margin-left: 20%; }
                    .message.received { background: #e5e7eb; color: black; margin-right: 20%; }
                    .chat-input { display: flex; gap: 10px; }
                    .chat-input input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
                    .chat-input button { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="chat-header">
                    <h2>Chat com ${userName}</h2>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message received">
                        <strong>${userName}:</strong> Olá! Como você está?
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="messageInput" placeholder="Digite sua mensagem...">
                    <button onclick="sendMessage()">Enviar</button>
                </div>
                <script>
                    function sendMessage() {
                        const input = document.getElementById('messageInput');
                        const messages = document.getElementById('chatMessages');
                        const message = input.value.trim();
                        
                        if (message) {
                            messages.innerHTML += '<div class="message sent"><strong>Você:</strong> ' + message + '</div>';
                            input.value = '';
                            messages.scrollTop = messages.scrollHeight;
                            
                            // Simular resposta
                            setTimeout(() => {
                                messages.innerHTML += '<div class="message received"><strong>${userName}:</strong> Obrigado pela mensagem! Vou responder em breve.</div>';
                                messages.scrollTop = messages.scrollHeight;
                            }, 1000);
                        }
                    }
                    
                    document.getElementById('messageInput').addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    });
                </script>
            </body>
            </html>
        `);
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Adicionar ao body
    document.body.appendChild(notification);

    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Adicionar evento de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Carregar sugestões de usuários
async function loadUserSuggestions() {
    const firebase = initializeFirebase();
    if (!firebase) return;

    const auth = firebase.auth();
    const db = firebase.firestore();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const suggestionList = document.querySelector('.suggestion-list');
    if (!suggestionList) return;

    // Se há um termo de busca ativo, não carregar sugestões
    if (currentSearchTerm.length > 0) return;

    // Mostrar estado de carregamento
    showLoading(suggestionList);

    try {
        // Buscar usuários para sugestões (excluindo o usuário atual)
        const suggestionsSnapshot = await db.collection('users')
            .where('uid', '!=', currentUser.uid)
            .limit(20) // Buscar mais usuários para ter dados para busca
            .get();

        // Esconder estado de carregamento
        hideLoading(suggestionList);

        if (suggestionsSnapshot.empty) {
            suggestionList.innerHTML = `
                <div class="no-suggestions-message">
                    <p>Nenhuma sugestão disponível no momento.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Mais usuários se juntarão em breve!</p>
                </div>
            `;
            return;
        }

        // Armazenar todos os usuários para busca
        allUsers = [];
        suggestionsSnapshot.forEach((doc) => {
            const userData = doc.data();
            allUsers.push(userData);
        });

        // Filtrar usuários com foto no lado do cliente
        const usersWithPhotos = allUsers.filter(userData => {
            const hasPhoto = (userData.photoURL && userData.photoURL.trim() !== '') || 
                           (userData.photo && userData.photo.trim() !== '');
            return hasPhoto;
        });

        // Limitar a 5 usuários com foto para sugestões
        const limitedUsers = usersWithPhotos.slice(0, 5);

        if (limitedUsers.length === 0) {
            suggestionList.innerHTML = `
                <div class="no-suggestions-message">
                    <p>Nenhuma sugestão com foto disponível no momento.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Mais usuários se juntarão em breve!</p>
                </div>
            `;
            return;
        }

        // Processar cada sugestão com foto
        limitedUsers.forEach((userData) => {
            const suggestionItem = createSuggestionItem(userData);
            suggestionList.appendChild(suggestionItem);
        });

        console.log(`Carregadas ${limitedUsers.length} sugestões com foto`);

    } catch (error) {
        console.error('Erro ao carregar sugestões:', error);
        hideLoading(suggestionList);
        
        suggestionList.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar sugestões. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Criar elemento de sugestão para um usuário
function createSuggestionItem(userData) {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'suggestion-item';
    suggestionItem.setAttribute('data-user-id', userData.uid);

    const userPhoto = userData.photoURL || userData.photo || '../public/images/fotos-perfil/default-avatar.png';
    const userName = userData.displayName || userData.name || userData.email || 'Usuário';
    const userRole = userData.userRole || userData.profession || userData.mobilityType || 'Membro da Comunidade';

    suggestionItem.innerHTML = `
        <img src="${userPhoto}" alt="Foto de ${userName}" class="suggestion-pic" onerror="this.src='../public/images/fotos-perfil/default-avatar.png'">
        <div class="suggestion-info">
            <span class="suggestion-name">${userName}</span>
            <span class="suggestion-role">${formatUserRole(userRole)}</span>
        </div>
        <button class="btn btn-outline-gradient connect-btn" data-user-id="${userData.uid}">
            <i class="fas fa-user-plus"></i> Conectar
        </button>
    `;

    // Adicionar evento de clique para o botão conectar
    const connectBtn = suggestionItem.querySelector('.connect-btn');
    connectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        connectWithUser(userData);
    });

    return suggestionItem;
}

// Formatar papel do usuário para exibição
function formatUserRole(role) {
    const roleMap = {
        'cadeirante': 'Usuário Cadeirante',
        'deficiente_visual': 'Usuário com Deficiência Visual',
        'deficiente_auditivo': 'Usuário com Deficiência Auditiva',
        'deficiente_motor': 'Usuário com Deficiência Motora',
        'admin': 'Administrador',
        'moderator': 'Moderador',
        'user': 'Membro da Comunidade'
    };

    return roleMap[role] || role;
}

// Conectar com um usuário
function connectWithUser(userData) {
    const firebase = initializeFirebase();
    if (!firebase) return;

    const auth = firebase.auth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        showNotification('Você precisa estar logado para conectar com outros usuários.', 'error');
        return;
    }

    const userName = userData.displayName || userData.name || userData.email;
    
    // Por enquanto, apenas mostrar uma mensagem
    // Em uma implementação completa, isso criaria uma conexão no banco de dados
    showNotification(`Solicitação de conexão enviada para ${userName}`, 'success');
    
    // Aqui você pode implementar a lógica para salvar a conexão no Firestore
    console.log('Conectando com:', userData);
}

// Inicializar funcionalidades da página de comunidade
function initializeCommunityPage() {
    // Verificar se estamos na página de comunidade
    if (!window.location.pathname.includes('comunidade.html')) {
        return;
    }

    console.log('Inicializando página de comunidade...');

    // Inicializar busca
    initializeSearch();

    // Aguardar o Firebase estar disponível
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && window.ENV) {
            clearInterval(checkFirebase);
            
            // Aguardar autenticação
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('Usuário logado, carregando dados da comunidade...');
                    loadUsersForPrivateChats();
                    loadUserSuggestions();
                } else {
                    console.log('Usuário não logado');
                }
            });
        }
    }, 100);

    // Timeout para evitar loop infinito
    setTimeout(() => {
        clearInterval(checkFirebase);
        console.log('Timeout ao aguardar Firebase');
    }, 10000);
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeCommunityPage);

// Exportar funções para uso global (se necessário)
window.CommunityManager = {
    loadUsersForPrivateChats,
    loadUserSuggestions,
    initiatePrivateChat,
    connectWithUser,
    showNotification,
    performSearch,
    initializeSearch
}; 