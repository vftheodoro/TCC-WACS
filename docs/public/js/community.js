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

// Função para criar dados de usuários de exemplo (apenas para desenvolvimento)
async function createSampleUsers() {
    const firebase = initializeFirebase();
    if (!firebase) return;

    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    if (!currentUser) {
        console.log('Usuário não está logado');
        return;
    }

    // Verificar se já existem usuários de exemplo
    const existingUsers = await db.collection('users').limit(5).get();
    if (!existingUsers.empty) {
        console.log('Já existem usuários no banco de dados');
        return;
    }

    const sampleUsers = [
        {
            uid: 'sample_user_1',
            displayName: 'João Silva',
            name: 'João Silva',
            email: 'joao.silva@example.com',
            photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
            userRole: 'cadeirante',
            mobilityType: 'cadeirante',
            cidade: 'Registro',
            profissao: 'Professor',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_2',
            displayName: 'Maria Oliveira',
            name: 'Maria Oliveira',
            email: 'maria.oliveira@example.com',
            photoURL: 'https://randomuser.me/api/portraits/women/44.jpg',
            userRole: 'deficiente_visual',
            mobilityType: 'visual',
            cidade: 'São Paulo',
            profissao: 'Advogada',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_3',
            displayName: 'Pedro Santos',
            name: 'Pedro Santos',
            email: 'pedro.santos@example.com',
            photoURL: 'https://randomuser.me/api/portraits/men/67.jpg',
            userRole: 'deficiente_auditivo',
            mobilityType: 'auditiva',
            cidade: 'Santos',
            profissao: 'Designer',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_4',
            displayName: 'Ana Costa',
            name: 'Ana Costa',
            email: 'ana.costa@example.com',
            photoURL: 'https://randomuser.me/api/portraits/women/23.jpg',
            userRole: 'cadeirante',
            mobilityType: 'cadeirante',
            cidade: 'Campinas',
            profissao: 'Médica',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_5',
            displayName: 'Carlos Ferreira',
            name: 'Carlos Ferreira',
            email: 'carlos.ferreira@example.com',
            photoURL: 'https://randomuser.me/api/portraits/men/89.jpg',
            userRole: 'deficiente_motor',
            mobilityType: 'muleta',
            cidade: 'Ribeirão Preto',
            profissao: 'Engenheiro',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_6',
            displayName: 'Lucia Mendes',
            name: 'Lucia Mendes',
            email: 'lucia.mendes@example.com',
            photoURL: 'https://randomuser.me/api/portraits/women/56.jpg',
            userRole: 'cadeirante',
            mobilityType: 'cadeirante',
            cidade: 'Sorocaba',
            profissao: 'Fisioterapeuta',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_7',
            displayName: 'Roberto Lima',
            name: 'Roberto Lima',
            email: 'roberto.lima@example.com',
            photoURL: 'https://randomuser.me/api/portraits/men/12.jpg',
            userRole: 'deficiente_visual',
            mobilityType: 'visual',
            cidade: 'São José dos Campos',
            profissao: 'Músico',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            uid: 'sample_user_8',
            displayName: 'Fernanda Rocha',
            name: 'Fernanda Rocha',
            email: 'fernanda.rocha@example.com',
            photoURL: 'https://randomuser.me/api/portraits/women/78.jpg',
            userRole: 'cadeirante',
            mobilityType: 'cadeirante',
            cidade: 'Piracicaba',
            profissao: 'Psicóloga',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];

    try {
        // Criar documentos para cada usuário de exemplo
        for (const userData of sampleUsers) {
            await db.collection('users').doc(userData.uid).set(userData);
        }
        console.log('Usuários de exemplo criados com sucesso!');
        showNotification('Usuários de exemplo criados! Agora você pode testar a busca.', 'success');
        
        // Recarregar as sugestões
        setTimeout(() => {
            loadUserSuggestions();
            loadUsersForPrivateChats();
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao criar usuários de exemplo:', error);
        showNotification('Erro ao criar usuários de exemplo: ' + error.message, 'error');
    }
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
    let filteredUsers = allUsers.filter(user => {
        const userName = (user.displayName || user.name || user.email || '').toLowerCase();
        const userRole = (user.userRole || user.profession || user.mobilityType || '').toLowerCase();
        const userCity = (user.cidade || user.city || '').toLowerCase();
        return userName.includes(searchTerm) || 
               userRole.includes(searchTerm) || 
               userCity.includes(searchTerm);
    });

    // Adicionar o próprio usuário se o termo de busca corresponder ao seu nome/email
    const firebase = initializeFirebase();
    const auth = firebase.auth();
    const currentUser = auth.currentUser;
    if (currentUser && searchTerm.length > 0) {
        const selfName = (currentUser.displayName || currentUser.email || '').toLowerCase();
        if (selfName.includes(searchTerm)) {
            // Verificar se já está na lista
            const alreadyInList = filteredUsers.some(user => user.uid === currentUser.uid);
            if (!alreadyInList) {
                // Montar objeto do próprio usuário
                const selfUser = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    name: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                    userRole: 'Você',
                    isSelf: true
                };
                filteredUsers.unshift(selfUser);
            }
        }
    }

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
                if (user.isSelf) {
                    suggestionItem.classList.add('self-profile');
                    // Adiciona indicação textual
                    const info = document.createElement('div');
                    info.className = 'self-profile-info';
                    info.textContent = 'Este é o seu perfil';
                    suggestionItem.appendChild(info);
                }
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

    // Mostrar mensagem informativa sobre o chat regional com botões para entrar
    chatList.innerHTML = `
        <div class="regional-chat-info">
            <div class="regional-chat-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="regional-chat-content">
                <h4>Chat Regional</h4>
                <p>Conecte-se com usuários da sua região para trocar experiências sobre acessibilidade local.</p>
                <div class="regional-chat-actions">
                    <button class="btn btn-gradient enter-chat-btn" onclick="enterValeRibeiraChat()">
                        <i class="fas fa-comments"></i>
                        Chat do Vale do Ribeira
                    </button>
                    <button class="btn btn-outline-gradient enter-chat-btn" onclick="enterRegistroChat()">
                        <i class="fas fa-city"></i>
                        Chat de Registro
                    </button>
                </div>
                <p style="font-size: 0.85em; margin-top: 10px; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-info-circle"></i>
                    Chat do Vale do Ribeira: Geral da região | Chat de Registro: Exclusivo para usuários da cidade de Registro e administradores
                </p>
            </div>
        </div>
    `;

    console.log('Chat Regional configurado - com opções para Chat do Vale do Ribeira e Chat de Registro');
}

// Função para entrar no Chat do Vale do Ribeira
function enterValeRibeiraChat() {
    const firebase = initializeFirebase();
    if (!firebase) {
        showNotification('Erro ao inicializar Firebase', 'error');
        return;
    }

    const auth = firebase.auth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        showNotification('Você precisa estar logado para acessar o chat.', 'error');
        return;
    }

    // Abrir chat do Vale do Ribeira em nova janela
    const chatWindow = window.open('', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    
    if (chatWindow) {
        chatWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat do Vale do Ribeira - WACS</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Poppins', sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .chat-header {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 20px;
                        color: white;
                        text-align: center;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .chat-header h1 {
                        font-size: 1.5em;
                        font-weight: 600;
                        margin-bottom: 5px;
                    }
                    
                    .chat-header p {
                        font-size: 0.9em;
                        opacity: 0.9;
                    }
                    
                    .chat-messages {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                        background: rgba(255, 255, 255, 0.05);
                    }
                    
                    .chat-messages::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    .chat-messages::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 3px;
                    }
                    
                    .chat-messages::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 3px;
                    }
                    
                    .message {
                        margin-bottom: 15px;
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                        max-width: 80%;
                    }
                    
                    .message.sent {
                        flex-direction: row-reverse;
                        margin-left: auto;
                    }
                    
                    .message.received {
                        margin-right: auto;
                    }
                    
                    .message-avatar {
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 0.8em;
                        font-weight: 600;
                        flex-shrink: 0;
                    }
                    
                    .message-content {
                        max-width: 100%;
                        padding: 12px 16px;
                        border-radius: 18px;
                        position: relative;
                    }
                    
                    .message.received .message-content {
                        background: rgba(255, 255, 255, 0.9);
                        color: #333;
                        border-bottom-left-radius: 4px;
                    }
                    
                    .message.sent .message-content {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border-bottom-right-radius: 4px;
                    }
                    
                    .message-user {
                        font-size: 0.8em;
                        font-weight: 600;
                        margin-bottom: 4px;
                        opacity: 0.8;
                    }
                    
                    .message-text {
                        font-size: 0.95em;
                        line-height: 1.4;
                        word-break: break-word;
                    }
                    
                    .message-time {
                        font-size: 0.7em;
                        opacity: 0.6;
                        margin-top: 4px;
                        text-align: right;
                    }
                    
                    .chat-input-container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 20px;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .chat-input-row {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    
                    .chat-input {
                        flex: 1;
                        padding: 12px 16px;
                        border: none;
                        border-radius: 25px;
                        background: rgba(255, 255, 255, 0.9);
                        font-family: 'Poppins', sans-serif;
                        font-size: 0.95em;
                        outline: none;
                        resize: none;
                        min-height: 45px;
                        max-height: 120px;
                    }
                    
                    .chat-input:focus {
                        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
                    }
                    
                    .send-btn {
                        width: 45px;
                        height: 45px;
                        border: none;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.1em;
                        transition: transform 0.2s ease;
                        flex-shrink: 0;
                    }
                    
                    .send-btn:hover {
                        transform: scale(1.05);
                    }
                    
                    .send-btn:active {
                        transform: scale(0.95);
                    }
                    
                    .send-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .welcome-message {
                        text-align: center;
                        padding: 20px;
                        color: rgba(255, 255, 255, 0.8);
                        font-style: italic;
                    }
                    
                    .system-message {
                        text-align: center;
                        padding: 1rem;
                        color: rgba(255, 255, 255, 0.7);
                        font-style: italic;
                    }
                    
                    .chat-loading {
                        text-align: center;
                        padding: 2rem;
                        color: rgba(255, 255, 255, 0.7);
                    }
                    
                    .message-delete-btn {
                        position: absolute;
                        top: 0.25rem;
                        right: 0.25rem;
                        opacity: 0;
                        transition: opacity 0.2s ease;
                        cursor: pointer;
                        color: rgba(255, 255, 255, 0.6);
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        font-size: 0.8rem;
                        background: rgba(0, 0, 0, 0.1);
                    }
                    
                    .message.received .message-delete-btn {
                        color: rgba(0, 0, 0, 0.5);
                    }
                    
                    .message:hover .message-delete-btn {
                        opacity: 1;
                    }
                    
                    .message-delete-btn:hover {
                        background-color: rgba(0, 0, 0, 0.2);
                        color: rgba(255, 255, 255, 0.9);
                    }
                    
                    .message.received .message-delete-btn:hover {
                        background-color: rgba(0, 0, 0, 0.1);
                        color: rgba(0, 0, 0, 0.8);
                    }
                    
                    .deleted-message {
                        font-style: italic;
                        opacity: 0.7;
                    }
                    
                    .deleted-message i {
                        margin-right: 0.25rem;
                    }
                    
                    /* Estilos para mensagens do sistema */
                    .system-message-item {
                        text-align: center;
                        margin: 15px 0;
                        padding: 8px 0;
                    }
                    
                    .system-message-content {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 8px 16px;
                        border-radius: 20px;
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 0.85em;
                        font-style: italic;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .system-message-content i {
                        color: #4CAF50;
                        font-size: 0.9em;
                    }
                    
                    .system-text {
                        font-weight: 500;
                    }
                    
                    .system-time {
                        font-size: 0.8em;
                        opacity: 0.7;
                        margin-left: 4px;
                    }
                    
                    @media (max-width: 600px) {
                        .system-message-content {
                            font-size: 0.8em;
                            padding: 6px 12px;
                        }
                        
                        .system-message-content i {
                            font-size: 0.8em;
                        }
                    }
                    
                    @media (max-width: 600px) {
                        .chat-header h1 {
                            font-size: 1.3em;
                        }
                        
                        .message {
                            max-width: 90%;
                        }
                        
                        .chat-input {
                            font-size: 0.9em;
                        }
                        
                        .chat-messages {
                            padding: 15px;
                        }
                        
                        .chat-input-container {
                            padding: 15px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="chat-header">
                    <h1><i class="fas fa-map-marker-alt"></i> Chat do Vale do Ribeira</h1>
                    <p>Conecte-se com usuários de toda a região</p>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-loading">
                        <i class="fas fa-spinner fa-pulse"></i> Carregando mensagens...
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-row">
                        <textarea 
                            class="chat-input" 
                            id="messageInput" 
                            placeholder="Digite sua mensagem..."
                            maxlength="500"
                            rows="1"></textarea>
                        <button class="send-btn" id="sendBtn" onclick="sendMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                
                <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
                <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
                <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
                
                <script>
                    // Configuração do Firebase
                    const firebaseConfig = {
                        apiKey: '${window.ENV.FIREBASE_API_KEY}',
                        authDomain: '${window.ENV.FIREBASE_AUTH_DOMAIN}',
                        projectId: '${window.ENV.FIREBASE_PROJECT_ID}',
                        storageBucket: '${window.ENV.FIREBASE_STORAGE_BUCKET}',
                        messagingSenderId: '${window.ENV.FIREBASE_MESSAGING_SENDER_ID}',
                        appId: '${window.ENV.FIREBASE_APP_ID}',
                        measurementId: '${window.ENV.FIREBASE_MEASUREMENT_ID}'
                    };
                    
                    // Inicializar Firebase
                    firebase.initializeApp(firebaseConfig);
                    const auth = firebase.auth();
                    const db = firebase.firestore();
                    
                    // Elementos do DOM
                    const messageInput = document.getElementById('messageInput');
                    const sendBtn = document.getElementById('sendBtn');
                    const chatMessages = document.getElementById('chatMessages');
                    
                    let currentUser = null;
                    let unsubscribe = null;
                    
                    // Verificar autenticação
                    auth.onAuthStateChanged(function(user) {
                        if (user) {
                            currentUser = user;
                            loadChatMessages();
                            setupChatListeners();
                            setupInputListeners();
                        } else {
                            chatMessages.innerHTML = '<div class="system-message">Erro: Usuário não autenticado</div>';
                        }
                    });
                    
                    // Carregar mensagens existentes
                    function loadChatMessages() {
                        db.collection('chats').doc('vale_do_ribeira').collection('messages')
                            .orderBy('timestamp', 'desc')
                            .limit(50)
                            .get()
                            .then((querySnapshot) => {
                                chatMessages.innerHTML = '';
                                
                                const messages = [];
                                querySnapshot.forEach((doc) => {
                                    messages.push({id: doc.id, ...doc.data()});
                                });
                                
                                if (messages.length === 0) {
                                    chatMessages.innerHTML = \`
                                        <div class="welcome-message">
                                            <i class="fas fa-users"></i>
                                            <p>Bem-vindo ao Chat do Vale do Ribeira!</p>
                                            <p>Compartilhe experiências sobre acessibilidade na região.</p>
                                        </div>
                                    \`;
                                } else {
                                    messages.reverse().forEach(message => {
                                        addMessageToUI(message);
                                    });
                                    scrollToBottom();
                                }
                            })
                            .catch((error) => {
                                console.error("Erro ao carregar mensagens:", error);
                                chatMessages.innerHTML = \`
                                    <div class="system-message">
                                        <p>Erro ao carregar mensagens. Por favor, tente novamente.</p>
                                    </div>
                                \`;
                            });
                    }
                    
                    // Configurar listeners para novas mensagens
                    function setupChatListeners() {
                        unsubscribe = db.collection('chats').doc('vale_do_ribeira').collection('messages')
                            .orderBy('timestamp', 'desc')
                            .limit(50)
                            .onSnapshot((snapshot) => {
                                snapshot.docChanges().forEach((change) => {
                                    if (change.type === 'added') {
                                        const message = {id: change.doc.id, ...change.doc.data()};
                                        
                                        if (!document.getElementById(\`message-\${message.id}\`)) {
                                            addMessageToUI(message);
                                            scrollToBottom();
                                        }
                                    } else if (change.type === 'modified') {
                                        const message = {id: change.doc.id, ...change.doc.data()};
                                        const messageElement = document.getElementById(\`message-\${message.id}\`);
                                        
                                        if (message.deleted && messageElement) {
                                            const messageText = messageElement.querySelector('.message-text');
                                            if (messageText) {
                                                messageText.innerHTML = \`<i class="fas fa-ban"></i> Esta mensagem foi apagada\`;
                                                messageText.classList.add('deleted-message');
                                            }
                                            
                                            const deleteBtn = messageElement.querySelector('.message-delete-btn');
                                            if (deleteBtn) {
                                                deleteBtn.remove();
                                            }
                                        }
                                    }
                                });
                            }, (error) => {
                                console.error("Erro no listener de mensagens:", error);
                            });
                    }
                    
                    // Configurar listeners de input
                    function setupInputListeners() {
                        sendBtn.addEventListener('click', sendMessage);
                        
                        messageInput.addEventListener('keydown', function(event) {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                sendMessage();
                            }
                        });
                        
                        // Auto-resize do textarea
                        messageInput.addEventListener('input', function() {
                            this.style.height = 'auto';
                            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
                        });
                    }
                    
                    // Enviar mensagem
                    function sendMessage() {
                        const messageText = messageInput.value.trim();
                        
                        if (!messageText || !currentUser) return;
                        
                        sendBtn.disabled = true;
                        
                        // Primeiro, contar as mensagens existentes para gerar o próximo número
                        db.collection('chats').doc('vale_do_ribeira').collection('messages')
                            .get()
                            .then((querySnapshot) => {
                                const messageCount = querySnapshot.size;
                                const nextNumber = messageCount + 1;
                                const messageId = \`mensagem\${String(nextNumber).padStart(2, '0')}\`;
                                
                                const message = {
                                    text: messageText,
                                    userId: currentUser.uid,
                                    userName: currentUser.displayName || currentUser.email || 'Usuário',
                                    userEmail: currentUser.email,
                                    photoURL: currentUser.photoURL || '',
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                    messageNumber: nextNumber
                                };
                                
                                // Salvar mensagem com ID personalizado
                                return db.collection('chats').doc('vale_do_ribeira').collection('messages').doc(messageId).set(message);
                            })
                            .then(() => {
                                messageInput.value = '';
                                messageInput.style.height = 'auto';
                                sendBtn.disabled = false;
                            })
                            .catch((error) => {
                                console.error("Erro ao enviar mensagem:", error);
                                alert("Erro ao enviar mensagem. Tente novamente.");
                                sendBtn.disabled = false;
                            });
                    }
                    
                    // Adicionar mensagem à interface
                    function addMessageToUI(message) {
                        const isCurrentUser = currentUser && message.userId === currentUser.uid;
                        const isSystemMessage = message.isSystemMessage || message.userId === 'system';
                        
                        // Se for mensagem do sistema, usar estilo especial
                        if (isSystemMessage) {
                            const systemElement = document.createElement('div');
                            systemElement.className = 'system-message-item';
                            systemElement.id = \`message-\${message.id}\`;
                            
                            const timestamp = message.timestamp ? message.timestamp.toDate() : new Date();
                            const timeFormatted = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            
                            systemElement.innerHTML = \`
                                <div class="system-message-content">
                                    <i class="fas fa-user-plus"></i>
                                    <span class="system-text">\${message.text}</span>
                                    <span class="system-time">\${timeFormatted}</span>
                                </div>
                            \`;
                            
                            chatMessages.appendChild(systemElement);
                            return;
                        }
                        
                        const messageElement = document.createElement('div');
                        messageElement.className = \`message \${isCurrentUser ? 'sent' : 'received'}\`;
                        messageElement.id = \`message-\${message.id}\`;
                        
                        const isDeleted = message.deleted === true;
                        const timestamp = message.timestamp ? message.timestamp.toDate() : new Date();
                        const timeFormatted = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        
                        let avatarContent = '';
                        if (message.photoURL) {
                            avatarContent = \`<div class="message-avatar" style="background-image: url('\${message.photoURL}'); background-size: cover;"></div>\`;
                        } else if (message.userName && message.userName !== 'Usuário') {
                            const initials = message.userName.split(' ').map(name => name[0]).join('').toUpperCase();
                            avatarContent = \`<div class="message-avatar">\${initials}</div>\`;
                        } else {
                            avatarContent = \`<div class="message-avatar"><i class="fas fa-user" style="font-size: 0.7rem"></i></div>\`;
                        }
                        
                        let messageText = '';
                        if (isDeleted) {
                            messageText = \`<p class="message-text deleted-message"><i class="fas fa-ban"></i> Esta mensagem foi apagada</p>\`;
                        } else {
                            messageText = \`<p class="message-text">\${escapeHtml(message.text)}</p>\`;
                        }
                        
                        if (!isDeleted && isCurrentUser) {
                            messageText += \`<div class="message-delete-btn" data-message-id="\${message.id}"><i class="fas fa-trash-alt"></i></div>\`;
                        }
                        
                        messageElement.innerHTML = \`
                            \${avatarContent}
                            <div class="message-content">
                                <div class="message-user">\${message.userName}</div>
                                \${messageText}
                                <div class="message-time">\${timeFormatted}</div>
                            </div>
                        \`;
                        
                        chatMessages.appendChild(messageElement);
                        
                        if (!isDeleted && isCurrentUser) {
                            const deleteBtn = messageElement.querySelector('.message-delete-btn');
                            if (deleteBtn) {
                                deleteBtn.addEventListener('click', function() {
                                    const messageId = this.getAttribute('data-message-id');
                                    if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
                                        deleteMessage(messageId);
                                    }
                                });
                            }
                        }
                    }
                    
                    // Apagar mensagem
                    function deleteMessage(messageId) {
                        if (!messageId || !currentUser) return;
                        
                        db.collection('chats').doc('vale_do_ribeira').collection('messages').doc(messageId).get()
                            .then(doc => {
                                if (doc.exists) {
                                    const message = doc.data();
                                    
                                    if (message.userId === currentUser.uid) {
                                        return db.collection('chats').doc('vale_do_ribeira').collection('messages').doc(messageId).update({
                                            deleted: true
                                        });
                                    } else {
                                        throw new Error('Você não tem permissão para apagar esta mensagem');
                                    }
                                } else {
                                    throw new Error('Mensagem não encontrada');
                                }
                            })
                            .then(() => {
                                console.log('Mensagem marcada como deletada');
                            })
                            .catch(error => {
                                console.error('Erro ao deletar mensagem:', error);
                                alert('Erro ao deletar mensagem: ' + error.message);
                            });
                    }
                    
                    // Funções auxiliares
                    function escapeHtml(unsafe) {
                        return unsafe
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");
                    }
                    
                    function scrollToBottom() {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                    
                    // Foco no input quando a janela carrega
                    window.addEventListener('load', function() {
                        messageInput.focus();
                    });
                    
                    // Limpar listener quando a janela for fechada
                    window.addEventListener('beforeunload', function() {
                        if (unsubscribe) {
                            unsubscribe();
                        }
                    });
                </script>
            </body>
            </html>
        `);
        
        showNotification('Chat do Vale do Ribeira aberto!', 'success');
    } else {
        showNotification('Erro ao abrir o chat. Verifique se o pop-up está bloqueado.', 'error');
    }
}

// Função para entrar no Chat de Registro
function enterRegistroChat() {
    const firebase = initializeFirebase();
    if (!firebase) {
        showNotification('Erro ao inicializar Firebase', 'error');
        return;
    }

    const auth = firebase.auth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        showNotification('Você precisa estar logado para acessar o chat.', 'error');
        return;
    }

    // Verificar se o usuário tem cidade = "Registro" ou é administrador
    const db = firebase.firestore();
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const userCity = userData.cidade || userData.city || '';
                const isAdmin = userData.ADM === 1 || userData.adm === 1 || userData.admin === 1;
                
                if (userCity.toLowerCase() === 'registro' || isAdmin) {
                    // Usuário tem cidade = Registro ou é administrador, permitir acesso
                    openRegistroChat();
                } else {
                    // Usuário não tem cidade = Registro nem é administrador
                    showNotification('Acesso restrito: Este chat é exclusivo para usuários da cidade de Registro ou administradores.', 'error', 'center');
                }
            } else {
                // Usuário não encontrado no banco
                showNotification('Erro: Dados do usuário não encontrados.', 'error', 'center');
            }
        })
        .catch((error) => {
            console.error('Erro ao verificar dados do usuário:', error);
            showNotification('Erro ao verificar permissão de acesso.', 'error', 'center');
        });
}

// Função para abrir o chat de Registro (separada para reutilização)
function openRegistroChat() {
    // Abrir chat de Registro em nova janela
    const chatWindow = window.open('', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    
    if (chatWindow) {
        chatWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat de Registro - WACS</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Poppins', sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .chat-header {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 20px;
                        color: white;
                        text-align: center;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .chat-header h1 {
                        font-size: 1.5em;
                        font-weight: 600;
                        margin-bottom: 5px;
                    }
                    
                    .chat-header p {
                        font-size: 0.9em;
                        opacity: 0.9;
                    }
                    
                    .chat-messages {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                        background: rgba(255, 255, 255, 0.05);
                    }
                    
                    .chat-messages::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    .chat-messages::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 3px;
                    }
                    
                    .chat-messages::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 3px;
                    }
                    
                    .message {
                        margin-bottom: 15px;
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                        max-width: 80%;
                    }
                    
                    .message.sent {
                        flex-direction: row-reverse;
                        margin-left: auto;
                    }
                    
                    .message.received {
                        margin-right: auto;
                    }
                    
                    .message-avatar {
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 0.8em;
                        font-weight: 600;
                        flex-shrink: 0;
                    }
                    
                    .message-content {
                        max-width: 100%;
                        padding: 12px 16px;
                        border-radius: 18px;
                        position: relative;
                    }
                    
                    .message.received .message-content {
                        background: rgba(255, 255, 255, 0.9);
                        color: #333;
                        border-bottom-left-radius: 4px;
                    }
                    
                    .message.sent .message-content {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border-bottom-right-radius: 4px;
                    }
                    
                    .message-user {
                        font-size: 0.8em;
                        font-weight: 600;
                        margin-bottom: 4px;
                        opacity: 0.8;
                    }
                    
                    .message-text {
                        font-size: 0.95em;
                        line-height: 1.4;
                        word-break: break-word;
                    }
                    
                    .message-time {
                        font-size: 0.7em;
                        opacity: 0.6;
                        margin-top: 4px;
                        text-align: right;
                    }
                    
                    .chat-input-container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 20px;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .chat-input-row {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    
                    .chat-input {
                        flex: 1;
                        padding: 12px 16px;
                        border: none;
                        border-radius: 25px;
                        background: rgba(255, 255, 255, 0.9);
                        font-family: 'Poppins', sans-serif;
                        font-size: 0.95em;
                        outline: none;
                        resize: none;
                        min-height: 45px;
                        max-height: 120px;
                    }
                    
                    .chat-input:focus {
                        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
                    }
                    
                    .send-btn {
                        width: 45px;
                        height: 45px;
                        border: none;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.1em;
                        transition: transform 0.2s ease;
                        flex-shrink: 0;
                    }
                    
                    .send-btn:hover {
                        transform: scale(1.05);
                    }
                    
                    .send-btn:active {
                        transform: scale(0.95);
                    }
                    
                    .send-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .welcome-message {
                        text-align: center;
                        padding: 20px;
                        color: rgba(255, 255, 255, 0.8);
                        font-style: italic;
                    }
                    
                    .system-message {
                        text-align: center;
                        padding: 1rem;
                        color: rgba(255, 255, 255, 0.7);
                        font-style: italic;
                    }
                    
                    .chat-loading {
                        text-align: center;
                        padding: 2rem;
                        color: rgba(255, 255, 255, 0.7);
                    }
                    
                    .message-delete-btn {
                        position: absolute;
                        top: 0.25rem;
                        right: 0.25rem;
                        opacity: 0;
                        transition: opacity 0.2s ease;
                        cursor: pointer;
                        color: rgba(255, 255, 255, 0.6);
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        font-size: 0.8rem;
                        background: rgba(0, 0, 0, 0.1);
                    }
                    
                    .message.received .message-delete-btn {
                        color: rgba(0, 0, 0, 0.5);
                    }
                    
                    .message:hover .message-delete-btn {
                        opacity: 1;
                    }
                    
                    .message-delete-btn:hover {
                        background-color: rgba(0, 0, 0, 0.2);
                        color: rgba(255, 255, 255, 0.9);
                    }
                    
                    .message.received .message-delete-btn:hover {
                        background-color: rgba(0, 0, 0, 0.1);
                        color: rgba(0, 0, 0, 0.8);
                    }
                    
                    .deleted-message {
                        font-style: italic;
                        opacity: 0.7;
                    }
                    
                    .deleted-message i {
                        margin-right: 0.25rem;
                    }
                    
                    /* Estilos para mensagens do sistema */
                    .system-message-item {
                        text-align: center;
                        margin: 15px 0;
                        padding: 8px 0;
                    }
                    
                    .system-message-content {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 8px 16px;
                        border-radius: 20px;
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 0.85em;
                        font-style: italic;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .system-message-content i {
                        color: #4CAF50;
                        font-size: 0.9em;
                    }
                    
                    .system-text {
                        font-weight: 500;
                    }
                    
                    .system-time {
                        font-size: 0.8em;
                        opacity: 0.7;
                        margin-left: 4px;
                    }
                    
                    @media (max-width: 600px) {
                        .system-message-content {
                            font-size: 0.8em;
                            padding: 6px 12px;
                        }
                        
                        .system-message-content i {
                            font-size: 0.8em;
                        }
                    }
                    
                    @media (max-width: 600px) {
                        .chat-header h1 {
                            font-size: 1.3em;
                        }
                        
                        .message {
                            max-width: 90%;
                        }
                        
                        .chat-input {
                            font-size: 0.9em;
                        }
                        
                        .chat-messages {
                            padding: 15px;
                        }
                        
                        .chat-input-container {
                            padding: 15px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="chat-header">
                    <h1><i class="fas fa-map-marker-alt"></i> Chat de Registro</h1>
                    <p>Conecte-se com usuários da cidade de Registro</p>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-loading">
                        <i class="fas fa-spinner fa-pulse"></i> Carregando mensagens...
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-row">
                        <textarea 
                            class="chat-input" 
                            id="messageInput" 
                            placeholder="Digite sua mensagem..."
                            maxlength="500"
                            rows="1"></textarea>
                        <button class="send-btn" id="sendBtn" onclick="sendMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                
                <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
                <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
                <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
                
                <script>
                    // Configuração do Firebase
                    const firebaseConfig = {
                        apiKey: '${window.ENV.FIREBASE_API_KEY}',
                        authDomain: '${window.ENV.FIREBASE_AUTH_DOMAIN}',
                        projectId: '${window.ENV.FIREBASE_PROJECT_ID}',
                        storageBucket: '${window.ENV.FIREBASE_STORAGE_BUCKET}',
                        messagingSenderId: '${window.ENV.FIREBASE_MESSAGING_SENDER_ID}',
                        appId: '${window.ENV.FIREBASE_APP_ID}',
                        measurementId: '${window.ENV.FIREBASE_MEASUREMENT_ID}'
                    };
                    
                    // Inicializar Firebase
                    firebase.initializeApp(firebaseConfig);
                    const auth = firebase.auth();
                    const db = firebase.firestore();
                    
                    // Elementos do DOM
                    const messageInput = document.getElementById('messageInput');
                    const sendBtn = document.getElementById('sendBtn');
                    const chatMessages = document.getElementById('chatMessages');
                    
                    let currentUser = null;
                    let unsubscribe = null;
                    
                    // Verificar autenticação
                    auth.onAuthStateChanged(function(user) {
                        if (user) {
                            currentUser = user;
                            loadChatMessages();
                            setupChatListeners();
                            setupInputListeners();
                        } else {
                            chatMessages.innerHTML = '<div class="system-message">Erro: Usuário não autenticado</div>';
                        }
                    });
                    
                    // Carregar mensagens existentes
                    function loadChatMessages() {
                        db.collection('chats').doc('registro').collection('messages')
                            .orderBy('timestamp', 'desc')
                            .limit(50)
                            .get()
                            .then((querySnapshot) => {
                                chatMessages.innerHTML = '';
                                
                                const messages = [];
                                querySnapshot.forEach((doc) => {
                                    messages.push({id: doc.id, ...doc.data()});
                                });
                                
                                if (messages.length === 0) {
                                    chatMessages.innerHTML = \`
                                        <div class="welcome-message">
                                            <i class="fas fa-users"></i>
                                            <p>Bem-vindo ao Chat de Registro!</p>
                                            <p>Compartilhe experiências sobre acessibilidade na cidade de Registro.</p>
                                        </div>
                                    \`;
                                } else {
                                    messages.reverse().forEach(message => {
                                        addMessageToUI(message);
                                    });
                                    scrollToBottom();
                                }
                            })
                            .catch((error) => {
                                console.error("Erro ao carregar mensagens:", error);
                                chatMessages.innerHTML = \`
                                    <div class="system-message">
                                        <p>Erro ao carregar mensagens. Por favor, tente novamente.</p>
                                    </div>
                                \`;
                            });
                    }
                    
                    // Configurar listeners para novas mensagens
                    function setupChatListeners() {
                        unsubscribe = db.collection('chats').doc('registro').collection('messages')
                            .orderBy('timestamp', 'desc')
                            .limit(50)
                            .onSnapshot((snapshot) => {
                                snapshot.docChanges().forEach((change) => {
                                    if (change.type === 'added') {
                                        const message = {id: change.doc.id, ...change.doc.data()};
                                        
                                        if (!document.getElementById(\`message-\${message.id}\`)) {
                                            addMessageToUI(message);
                                            scrollToBottom();
                                        }
                                    } else if (change.type === 'modified') {
                                        const message = {id: change.doc.id, ...change.doc.data()};
                                        const messageElement = document.getElementById(\`message-\${message.id}\`);
                                        
                                        if (message.deleted && messageElement) {
                                            const messageText = messageElement.querySelector('.message-text');
                                            if (messageText) {
                                                messageText.innerHTML = \`<i class="fas fa-ban"></i> Esta mensagem foi apagada\`;
                                                messageText.classList.add('deleted-message');
                                            }
                                            
                                            const deleteBtn = messageElement.querySelector('.message-delete-btn');
                                            if (deleteBtn) {
                                                deleteBtn.remove();
                                            }
                                        }
                                    }
                                });
                            }, (error) => {
                                console.error("Erro no listener de mensagens:", error);
                            });
                    }
                    
                    // Configurar listeners de input
                    function setupInputListeners() {
                        sendBtn.addEventListener('click', sendMessage);
                        
                        messageInput.addEventListener('keydown', function(event) {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                sendMessage();
                            }
                        });
                        
                        // Auto-resize do textarea
                        messageInput.addEventListener('input', function() {
                            this.style.height = 'auto';
                            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
                        });
                    }
                    
                    // Enviar mensagem
                    function sendMessage() {
                        const messageText = messageInput.value.trim();
                        
                        if (!messageText || !currentUser) return;
                        
                        sendBtn.disabled = true;
                        
                        // Primeiro, contar as mensagens existentes para gerar o próximo número
                        db.collection('chats').doc('registro').collection('messages')
                            .get()
                            .then((querySnapshot) => {
                                const messageCount = querySnapshot.size;
                                const nextNumber = messageCount + 1;
                                const messageId = \`mensagem\${String(nextNumber).padStart(2, '0')}\`;
                                
                                const message = {
                                    text: messageText,
                                    userId: currentUser.uid,
                                    userName: currentUser.displayName || currentUser.email || 'Usuário',
                                    userEmail: currentUser.email,
                                    photoURL: currentUser.photoURL || '',
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                    messageNumber: nextNumber
                                };
                                
                                // Salvar mensagem com ID personalizado
                                return db.collection('chats').doc('registro').collection('messages').doc(messageId).set(message);
                            })
                            .then(() => {
                                messageInput.value = '';
                                messageInput.style.height = 'auto';
                                sendBtn.disabled = false;
                            })
                            .catch((error) => {
                                console.error("Erro ao enviar mensagem:", error);
                                alert("Erro ao enviar mensagem. Tente novamente.");
                                sendBtn.disabled = false;
                            });
                    }
                    
                    // Adicionar mensagem à interface
                    function addMessageToUI(message) {
                        const isCurrentUser = currentUser && message.userId === currentUser.uid;
                        const isSystemMessage = message.isSystemMessage || message.userId === 'system';
                        
                        // Se for mensagem do sistema, usar estilo especial
                        if (isSystemMessage) {
                            const systemElement = document.createElement('div');
                            systemElement.className = 'system-message-item';
                            systemElement.id = \`message-\${message.id}\`;
                            
                            const timestamp = message.timestamp ? message.timestamp.toDate() : new Date();
                            const timeFormatted = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            
                            systemElement.innerHTML = \`
                                <div class="system-message-content">
                                    <i class="fas fa-user-plus"></i>
                                    <span class="system-text">\${message.text}</span>
                                    <span class="system-time">\${timeFormatted}</span>
                                </div>
                            \`;
                            
                            chatMessages.appendChild(systemElement);
                            return;
                        }
                        
                        const messageElement = document.createElement('div');
                        messageElement.className = \`message \${isCurrentUser ? 'sent' : 'received'}\`;
                        messageElement.id = \`message-\${message.id}\`;
                        
                        const isDeleted = message.deleted === true;
                        const timestamp = message.timestamp ? message.timestamp.toDate() : new Date();
                        const timeFormatted = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        
                        let avatarContent = '';
                        if (message.photoURL) {
                            avatarContent = \`<div class="message-avatar" style="background-image: url('\${message.photoURL}'); background-size: cover;"></div>\`;
                        } else if (message.userName && message.userName !== 'Usuário') {
                            const initials = message.userName.split(' ').map(name => name[0]).join('').toUpperCase();
                            avatarContent = \`<div class="message-avatar">\${initials}</div>\`;
                        } else {
                            avatarContent = \`<div class="message-avatar"><i class="fas fa-user" style="font-size: 0.7rem"></i></div>\`;
                        }
                        
                        let messageText = '';
                        if (isDeleted) {
                            messageText = \`<p class="message-text deleted-message"><i class="fas fa-ban"></i> Esta mensagem foi apagada</p>\`;
                        } else {
                            messageText = \`<p class="message-text">\${escapeHtml(message.text)}</p>\`;
                        }
                        
                        if (!isDeleted && isCurrentUser) {
                            messageText += \`<div class="message-delete-btn" data-message-id="\${message.id}"><i class="fas fa-trash-alt"></i></div>\`;
                        }
                        
                        messageElement.innerHTML = \`
                            \${avatarContent}
                            <div class="message-content">
                                <div class="message-user">\${message.userName}</div>
                                \${messageText}
                                <div class="message-time">\${timeFormatted}</div>
                            </div>
                        \`;
                        
                        chatMessages.appendChild(messageElement);
                        
                        if (!isDeleted && isCurrentUser) {
                            const deleteBtn = messageElement.querySelector('.message-delete-btn');
                            if (deleteBtn) {
                                deleteBtn.addEventListener('click', function() {
                                    const messageId = this.getAttribute('data-message-id');
                                    if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
                                        deleteMessage(messageId);
                                    }
                                });
                            }
                        }
                    }
                    
                    // Apagar mensagem
                    function deleteMessage(messageId) {
                        if (!messageId || !currentUser) return;
                        
                        db.collection('chats').doc('registro').collection('messages').doc(messageId).get()
                            .then(doc => {
                                if (doc.exists) {
                                    const message = doc.data();
                                    
                                    if (message.userId === currentUser.uid) {
                                        return db.collection('chats').doc('registro').collection('messages').doc(messageId).update({
                                            deleted: true
                                        });
                                    } else {
                                        throw new Error('Você não tem permissão para apagar esta mensagem');
                                    }
                                } else {
                                    throw new Error('Mensagem não encontrada');
                                }
                            })
                            .then(() => {
                                console.log('Mensagem marcada como deletada');
                            })
                            .catch(error => {
                                console.error('Erro ao deletar mensagem:', error);
                                alert('Erro ao deletar mensagem: ' + error.message);
                            });
                    }
                    
                    // Funções auxiliares
                    function escapeHtml(unsafe) {
                        return unsafe
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");
                    }
                    
                    function scrollToBottom() {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                    
                    // Foco no input quando a janela carrega
                    window.addEventListener('load', function() {
                        messageInput.focus();
                    });
                    
                    // Limpar listener quando a janela for fechada
                    window.addEventListener('beforeunload', function() {
                        if (unsubscribe) {
                            unsubscribe();
                        }
                    });
                </script>
            </body>
            </html>
        `);
        
        showNotification('Chat de Registro aberto!', 'success');
    } else {
        showNotification('Erro ao abrir o chat. Verifique se o pop-up está bloqueado.', 'error');
    }
}

// Mostrar notificação
function showNotification(message, type = 'info', position = 'top-right') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-${position}`;
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

    // Auto-remover após 5 segundos (apenas para notificações do canto)
    if (position === 'top-right') {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }
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

        // Limitar a 5 usuários para sugestões (sem filtrar por foto)
        const limitedUsers = allUsers.slice(0, 5);

        if (limitedUsers.length === 0) {
            suggestionList.innerHTML = `
                <div class="no-suggestions-message">
                    <p>Nenhuma sugestão disponível no momento.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Mais usuários se juntarão em breve!</p>
                </div>
            `;
            return;
        }

        // Processar cada sugestão
        limitedUsers.forEach((userData) => {
            const suggestionItem = createSuggestionItem(userData);
            suggestionList.appendChild(suggestionItem);
        });

        console.log(`Carregadas ${limitedUsers.length} sugestões de usuários`);

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
        ${userData.isSelf ? '' : `<button class="btn btn-outline-gradient connect-btn" data-user-id="${userData.uid}">
            <i class="fas fa-user-plus"></i> Conectar
        </button>`}
    `;

    // Adicionar evento de clique para o botão conectar, se não for o próprio usuário
    if (!userData.isSelf) {
        const connectBtn = suggestionItem.querySelector('.connect-btn');
        connectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            connectWithUser(userData);
        });
    }

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
    enterValeRibeiraChat,
    connectWithUser,
    showNotification,
    performSearch,
    initializeSearch
};

// --- INÍCIO: Upload de imagem em post ---
let selectedImageFile = null;

document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.querySelector('.post-image-input');
  const imageBtn = document.querySelector('.post-image-btn');
  const postBtn = document.querySelector('.post-btn');
  const textarea = document.querySelector('.post-textarea');

  if (imageBtn && imageInput) {
    imageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
    imageInput.addEventListener('change', (e) => {
      selectedImageFile = e.target.files[0];
    });
  }

  // --- PUBLICAÇÃO DE POST DESABILITADA PARA EVITAR DUPLICIDADE ---
  /*
  if (postBtn) {
    postBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      const firebase = initializeFirebase();
      if (!firebase) return showNotification('Erro ao inicializar Firebase', 'error');
      const auth = firebase.auth();
      const db = firebase.firestore();
      const storage = firebase.storage();
      const user = auth.currentUser;
      if (!user) {
        showNotification('Você precisa estar logado para postar.', 'error');
        return;
      }
      if (!text && !selectedImageFile) return;
      let imageUrl = null;
      if (selectedImageFile) {
        try {
          const fileName = `posts/${user.uid}_${Date.now()}`;
          const postImageRef = storage.ref().child(fileName);
          await postImageRef.put(selectedImageFile);
          imageUrl = await postImageRef.getDownloadURL();
        } catch (err) {
          showNotification('Erro ao fazer upload da imagem: ' + err.message, 'error');
          return;
        }
      }
      try {
        await db.collection('posts').add({
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL,
          text,
          imageUrl,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          likes: [],
          commentsCount: 0,
        });
        textarea.value = '';
        if (imageInput) imageInput.value = '';
        selectedImageFile = null;
        showNotification('Post publicado com sucesso!', 'success');
        if (typeof renderFeed === 'function') renderFeed();
      } catch (err) {
        showNotification('Erro ao publicar post: ' + err.message, 'error');
      }
    });
  }
  */
});
// --- FIM: Upload de imagem em post ---

// --- INÍCIO: Feed e comentários avançados ---

// Utilitário para data relativa
function getRelativeDate(date) {
  if (!date) return '';
  let d = typeof date === 'object' && date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - postDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString('pt-BR', { dateStyle: 'short' });
}

// --- RENDERIZAÇÃO DE FEED DESABILITADA PARA EVITAR DUPLICIDADE ---
/*
async function renderFeed() {
  const firebase = initializeFirebase();
  if (!firebase) return;
  const db = firebase.firestore();
  const auth = firebase.auth();
  const user = auth.currentUser;
  const feedEl = document.querySelector('.community-feed');
  if (!feedEl) return;
  feedEl.innerHTML = '<div class="loading-feed">Carregando posts...</div>';
  const postsSnap = await db.collection('posts').orderBy('createdAt', 'desc').limit(30).get();
  const posts = postsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      userName: data.userName || 'Usuário',
      userPhoto: data.userPhoto || null,
      text: data.text || '',
      imageUrl: data.imageUrl || null,
      likes: Array.isArray(data.likes) ? data.likes : [],
      commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
      createdAt: data.createdAt,
    };
  });
  feedEl.innerHTML = '';
  posts.forEach(post => {
    feedEl.appendChild(createPostCard(post, user));
  });
}

// Criar card de post
function createPostCard(post, user) {
  const isOwner = user && (user.uid === post.userId);
  const card = document.createElement('div');
  card.className = 'post-card' + (isOwner ? ' post-card-owner' : '');
  card.innerHTML = `
    <div class="post-header">
      <img src="${post.userPhoto || '../public/images/fotos-perfil/default-avatar.png'}" class="post-avatar" onerror="this.src='../public/images/fotos-perfil/default-avatar.png'">
      <div class="post-header-info">
        <span class="post-user">${post.userName || 'Usuário'}</span>
        <span class="post-date">${getRelativeDate(post.createdAt)}</span>
      </div>
      ${isOwner ? `<button class="post-menu-btn"><i class="fas fa-ellipsis-v"></i></button>` : ''}
    </div>
    <div class="post-text">${post.text || ''}</div>
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image">` : ''}
    <div class="post-actions">
      <button class="like-btn${post.likes && user && post.likes.includes(user.uid) ? ' liked' : ''}"><i class="fas fa-heart"></i> <span class="like-count">${post.likes ? post.likes.length : 0}</span></button>
      <button class="comment-btn"><i class="fas fa-comment"></i> <span class="comment-count">${typeof post.commentsCount === 'number' ? post.commentsCount : 0}</span></button>
    </div>
  `;
  // Like post
  card.querySelector('.like-btn').onclick = async () => {
    await handleLikePost(post, user);
    renderFeed();
  };
  // Comentários
  card.querySelector('.comment-btn').onclick = () => {
    renderCommentsModal(post, user);
  };
  // Menu de 3 pontos
  if (isOwner) {
    card.querySelector('.post-menu-btn').onclick = (e) => {
      e.stopPropagation();
      showPostMenu(card, post, user);
    };
  }
  return card;
}

// Mostrar menu de 3 pontos
function showPostMenu(card, post, user) {
  let menu = card.querySelector('.post-menu');
  if (menu) menu.remove();
  menu = document.createElement('div');
  menu.className = 'post-menu';
  menu.innerHTML = `
    <button class="edit-post-btn">Editar</button>
    <button class="delete-post-btn">Apagar</button>
  `;
  card.appendChild(menu);
  menu.querySelector('.edit-post-btn').onclick = () => {
    menu.remove();
    showEditPostModal(post, user);
  };
  menu.querySelector('.delete-post-btn').onclick = async () => {
    menu.remove();
    await handleDeletePost(post, user);
    renderFeed();
  };
  document.addEventListener('click', function hideMenu(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', hideMenu);
    }
  });
}

// Modal de edição de post
function showEditPostModal(post, user) {
  let modal = document.querySelector('.edit-post-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.className = 'edit-post-modal';
  modal.innerHTML = `
    <div class="edit-post-content">
      <h3>Editar post</h3>
      <textarea class="edit-post-textarea">${post.text || ''}</textarea>
      <div class="edit-post-actions">
        <button class="cancel-edit-btn">Cancelar</button>
        <button class="save-edit-btn">Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.cancel-edit-btn').onclick = () => modal.remove();
  modal.querySelector('.save-edit-btn').onclick = async () => {
    const newText = modal.querySelector('.edit-post-textarea').value.trim();
    if (!newText) return;
    await handleEditPost(post, newText, user);
    modal.remove();
    renderFeed();
  };
}
*/
// --- FIM: Feed e comentários avançados --- 