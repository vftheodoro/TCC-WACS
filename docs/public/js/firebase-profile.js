// Configuração do Firebase
const firebaseConfig = {
    apiKey: window.ENV.FIREBASE_API_KEY,
    authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV.FIREBASE_PROJECT_ID,
    storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
    appId: window.ENV.FIREBASE_APP_ID,
    measurementId: window.ENV.FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// Elementos DOM
const profileForm = document.getElementById('profileForm');
const displayNameInput = document.getElementById('displayName');
const emailInput = document.getElementById('email');
const profilePhoto = document.getElementById('profilePhoto');
const photoOverlay = document.getElementById('photoOverlay');
const fileInput = document.getElementById('fileInput');
const removePhotoBtn = document.getElementById('removePhotoBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtnSpinner = saveBtn.querySelector('.btn-spinner');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnMobile = document.getElementById('logoutBtnMobile');
const alertArea = document.getElementById('alertArea');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const debugPanel = document.getElementById('debugPanel');
const debugOutput = document.getElementById('debugOutput');

// Variáveis de estado
let currentUser = null;
let userPhotoURL = null;
let originalDisplayName = '';
let photoFile = null;
let photoChanged = false;
let photoRemoved = false;
let debug = false;

// Configurações de imagem
const IMAGE_CONFIG = {
    maxSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7, // 70% de qualidade
    allowedFormats: ['jpg', 'jpeg', 'png']
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar o estado de autenticação
    auth.onAuthStateChanged(handleAuthStateChanged);
    
    // Configurar debug (Ctrl+Shift+D)
    setupDebug();
    
    // Configurar event listeners
    setupEventListeners();
});

// Configurar modo de depuração (Ctrl+Shift+D)
function setupDebug() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            debug = !debug;
            debugPanel.style.display = debug ? 'block' : 'none';
            logDebug('Modo de depuração ' + (debug ? 'ativado' : 'desativado'));
        }
    });
    
    // Debug panel is hidden by default, even in development environment
    debug = false;
    debugPanel.style.display = 'none';
    logDebug('Modo de depuração desativado por padrão. Pressione Ctrl+Shift+D para ativar.');
}

// Configurar event listeners
function setupEventListeners() {
    // Formulário
    profileForm.addEventListener('submit', handleProfileSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    
    // Foto
    photoOverlay.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    removePhotoBtn.addEventListener('click', handleRemovePhoto);
    
    // Logout
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);
}

// Lidar com a mudança de estado de autenticação
function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user;
        logDebug('Usuário autenticado:', user.uid);
        
        // Preencher as informações do usuário no formulário
        loadUserData(user);
    } else {
        // Usuário não está autenticado, redirecionar para login
        logDebug('Usuário não autenticado, redirecionando para login');
        window.location.href = 'login/login.html';
    }
}

// Carregar dados do usuário no formulário
function loadUserData(user) {
    // Email (não editável)
    emailInput.value = user.email || '';
    
    // Nome de exibição
    displayNameInput.value = user.displayName || '';
    originalDisplayName = user.displayName || '';
    
    // Foto de perfil
    if (user.photoURL) {
        userPhotoURL = user.photoURL;
        updateProfilePhotoUI(user.photoURL);
        logDebug('Foto de perfil carregada:', user.photoURL);
    } else {
        // Exibir iniciais ou ícone padrão
        userPhotoURL = null;
        resetProfilePhotoUI();
        logDebug('Usuário não possui foto de perfil');
    }
}

// Atualizar a UI da foto de perfil
function updateProfilePhotoUI(photoURL) {
    // Limpar qualquer conteúdo anterior
    profilePhoto.innerHTML = '';
    profilePhoto.style.backgroundImage = `url(${photoURL})`;
    profilePhoto.style.backgroundSize = 'cover';
    profilePhoto.style.backgroundPosition = 'center';
    
    // Adicionar overlay para troca de foto
    photoOverlay.style.display = 'flex';
}

// Resetar a UI da foto de perfil para o estado padrão
function resetProfilePhotoUI() {
    profilePhoto.style.backgroundImage = '';
    
    // Exibir iniciais se tiver nome, ou ícone padrão
    if (displayNameInput.value) {
        profilePhoto.innerHTML = getInitials(displayNameInput.value);
    } else {
        profilePhoto.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    photoOverlay.style.display = 'flex';
}

// Obter as iniciais a partir do nome
function getInitials(name) {
    if (!name) return '';
    
    const names = name.split(' ');
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Função para lidar com o envio do formulário
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    const newDisplayName = displayNameInput.value.trim();
    const nameChanged = newDisplayName !== originalDisplayName;
    
    // Verificar se houve alguma alteração
    if (!nameChanged && !photoChanged) {
        showAlert('Nenhuma alteração foi feita.', 'info');
        return;
    }
    
    try {
        // Mostrar loading e desabilitar botão
        startLoading('Salvando alterações...');
        disableSaveButton(true);
        
        // Objeto com as alterações
        const profileUpdates = {};
        
        // Atualizar nome de exibição
        if (nameChanged) {
            logDebug('Atualizando nome de exibição:', newDisplayName);
            profileUpdates.displayName = newDisplayName;
        }
        
        // Processar alterações na foto
        if (photoChanged) {
            if (photoRemoved) {
                // Remover foto
                logDebug('Removendo foto de perfil');
                updateLoadingText('Removendo foto...');
                
                if (userPhotoURL) {
                    try {
                        await deleteProfilePicture(currentUser.uid, userPhotoURL);
                    } catch (error) {
                        logDebug('Erro ao deletar foto:', error);
                        // Continuar mesmo com erro
                    }
                }
                
                profileUpdates.photoURL = null;
                userPhotoURL = null;
            } else if (photoFile) {
                // Fazer upload da nova foto
                logDebug('Enviando nova foto de perfil');
                updateLoadingText('Enviando foto...');
                
                try {
                    const downloadURL = await uploadProfilePicture(
                        currentUser.uid,
                        photoFile,
                        updateProgressUI,
                        newDisplayName
                    );
                    
                    if (downloadURL) {
                        profileUpdates.photoURL = downloadURL;
                        userPhotoURL = downloadURL;
                        logDebug('Foto enviada com sucesso:', downloadURL);
                    } else {
                        throw new Error('Falha ao obter URL da foto após upload');
                    }
                } catch (error) {
                    logDebug('Erro no upload da foto:', error);
                    throw new Error(`Erro ao fazer upload da foto: ${error.message}`);
                }
            }
        }
        
        // Atualizar perfil no Firebase
        if (Object.keys(profileUpdates).length > 0) {
            updateLoadingText('Atualizando perfil...');
            await currentUser.updateProfile(profileUpdates);
            logDebug('Perfil atualizado com sucesso:', profileUpdates);
            
            // Recarregar usuário para garantir que as alterações foram aplicadas
            await currentUser.reload();
            currentUser = auth.currentUser;
            
            // Verificar se as alterações foram aplicadas corretamente
            const photoUpdated = photoChanged ? 
                (photoRemoved ? !currentUser.photoURL : 
                    photoFile ? currentUser.photoURL === userPhotoURL : true) 
                : true;
            
            const nameUpdated = nameChanged ? 
                currentUser.displayName === newDisplayName : true;
            
            if (!photoUpdated || !nameUpdated) {
                logDebug('Aviso: Algumas alterações podem não ter sido aplicadas corretamente');
                showAlert('Seu perfil foi atualizado, mas algumas alterações podem levar um tempo para serem exibidas.', 'warning');
            } else {
                showAlert('Perfil atualizado com sucesso!', 'success');
            }
            
            // Atualizar estado
            originalDisplayName = newDisplayName;
            photoChanged = false;
            photoRemoved = false;
            photoFile = null;
            
            // Atualizar UI
            loadUserData(currentUser);
        }
    } catch (error) {
        logDebug('Erro ao atualizar perfil:', error);
        showAlert(`Erro ao atualizar perfil: ${error.message}`, 'danger');
    } finally {
        // Esconder loading e habilitar botão
        stopLoading();
        disableSaveButton(false);
    }
}

// Função para lidar com a seleção de arquivo
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    logDebug('Arquivo selecionado:', file.name, file.type, file.size);
    
    // Validar arquivo
    if (!validateFile(file)) {
        return;
    }
    
    // Armazenar arquivo para upload posterior
    photoFile = file;
    photoChanged = true;
    photoRemoved = false;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        updateProfilePhotoUI(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Função para validar arquivo
function validateFile(file) {
    // Verificar tamanho
    if (file.size > IMAGE_CONFIG.maxSize) {
        const sizeMB = (IMAGE_CONFIG.maxSize / (1024 * 1024)).toFixed(1);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        
        showAlert(`Arquivo muito grande. O tamanho máximo é ${sizeMB}MB. Seu arquivo tem ${fileSizeMB}MB.`, 'danger');
        return false;
    }
    
    // Verificar formato
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!IMAGE_CONFIG.allowedFormats.includes(fileExtension)) {
        showAlert(`Formato de arquivo não suportado. Formatos aceitos: ${IMAGE_CONFIG.allowedFormats.join(', ')}`, 'danger');
        return false;
    }
    
    return true;
}

// Função para lidar com a remoção da foto
function handleRemovePhoto() {
    // Verificar se tem foto para remover
    if (!userPhotoURL && !photoFile) {
        showAlert('Você não tem uma foto de perfil para remover.', 'info');
        return;
    }
    
    photoChanged = true;
    photoRemoved = true;
    photoFile = null;
    
    // Atualizar UI
    resetProfilePhotoUI();
    
    logDebug('Foto de perfil marcada para remoção');
}

// Função para lidar com o cancelamento
function handleCancel() {
    // Restaurar valores originais
    displayNameInput.value = originalDisplayName;
    
    // Restaurar foto
    photoChanged = false;
    photoRemoved = false;
    photoFile = null;
    
    if (userPhotoURL) {
        updateProfilePhotoUI(userPhotoURL);
    } else {
        resetProfilePhotoUI();
    }
    
    // Limpar alerta
    hideAlert();
    
    logDebug('Alterações canceladas');
}

// Função para fazer logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            window.location.href = '../index.html';
        })
        .catch((error) => {
            logDebug('Erro ao fazer logout:', error);
            showAlert('Erro ao fazer logout. Tente novamente.', 'danger');
        });
}

// Upload de foto de perfil para o Firebase Storage
async function uploadProfilePicture(userId, file, progressCallback = null, userName = null) {
    if (!userId || !file) {
        logDebug('Parâmetros inválidos para upload:', { userId, file });
        throw new Error('Parâmetros inválidos para upload');
    }
    
    try {
        logDebug('Iniciando processo de upload da foto de perfil');
        
        // Deletar fotos antigas primeiro
        if (userPhotoURL) {
            try {
                await deleteProfilePicture(userId, userPhotoURL);
            } catch (error) {
                logDebug('Erro ao deletar foto antiga:', error);
                // Continuamos mesmo se a deleção falhar
            }
        }
        
        // Gerar nome de arquivo único
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const formattedName = formatNameForFile(userName || 'user');
        const fileName = `${userId}_${formattedName}_profile_${timestamp}.${fileExtension}`;
        
        // Referência para o arquivo no Storage
        const storageRef = storage.ref(`profile_pictures/${fileName}`);
        
        // Criar upload task
        const uploadTask = storageRef.put(file);
        
        // Monitorar progresso
        if (progressCallback) {
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressCallback(progress);
                },
                (error) => {
                    logDebug('Erro durante upload:', error);
                    throw error;
                }
            );
        }
        
        // Aguardar conclusão do upload
        await uploadTask;
        
        // Obter URL do arquivo
        const downloadURL = await storageRef.getDownloadURL();
        logDebug('Upload concluído com sucesso. URL:', downloadURL);
        
        return downloadURL;
    } catch (error) {
        logDebug('Erro ao fazer upload da foto de perfil:', error);
        throw error;
    }
}

// Deletar foto de perfil do Firebase Storage
async function deleteProfilePicture(userId, photoURL) {
    if (!userId) {
        throw new Error('ID do usuário não fornecido');
    }
    
    try {
        logDebug('Iniciando deleção da foto de perfil');
        
        // Se temos a URL, podemos extrair a referência
        let storageRef;
        
        if (photoURL && photoURL.includes('firebase')) {
            try {
                // Obter a referência a partir da URL
                const storageUrl = new URL(photoURL);
                const pathMatch = storageUrl.pathname.match(/\/o\/(.+?)(?:\?|$)/);
                
                if (pathMatch && pathMatch[1]) {
                    // Decodificar o caminho
                    const decodedPath = decodeURIComponent(pathMatch[1]);
                    storageRef = storage.ref(decodedPath);
                } else {
                    throw new Error('Formato de URL de armazenamento inválido');
                }
            } catch (error) {
                logDebug('Erro ao extrair referência da URL:', error);
                // Tentar abordagem alternativa
                storageRef = storage.refFromURL(photoURL);
            }
        } else {
            // Buscar todas as fotos de perfil do usuário
            const profilePicsRef = storage.ref('profile_pictures');
            // Listar todas as fotos do perfil
            try {
                const listResult = await profilePicsRef.listAll();
                
                // Filtrar imagens que começam com o ID do usuário
                const userPics = listResult.items.filter(item => {
                    const name = item.name;
                    return name.startsWith(userId);
                });
                
                // Deletar todas as fotos antigas do usuário
                const deletePromises = userPics.map(pic => pic.delete());
                await Promise.all(deletePromises);
                
                logDebug(`${userPics.length} fotos antigas deletadas com sucesso.`);
                return true;
            } catch (error) {
                logDebug('Erro ao listar/deletar fotos:', error);
                throw error;
            }
        }
        
        // Deletar o arquivo
        if (storageRef) {
            await storageRef.delete();
            logDebug('Foto deletada com sucesso');
            return true;
        }
        
        return false;
    } catch (error) {
        logDebug('Erro ao deletar foto de perfil:', error);
        throw error;
    }
}

// Formatar nome para usar em nomes de arquivos
function formatNameForFile(name) {
    if (!name) return 'user';
    
    // Remover caracteres especiais, acentos e espaços
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
}

// Atualizar o progresso da UI
function updateProgressUI(progress) {
    updateLoadingText(`Enviando foto... ${progress.toFixed(0)}%`);
}

// Mostrar alerta
function showAlert(message, type = 'danger') {
    alertArea.textContent = message;
    alertArea.className = `alert alert-${type}`;
    alertArea.style.display = 'block';
    
    // Auto-esconder após 5 segundos
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

// Esconder alerta
function hideAlert() {
    alertArea.style.display = 'none';
    alertArea.className = 'alert hidden';
}

// Iniciar carregamento
function startLoading(message = 'Carregando...') {
    loadingText.textContent = message;
    loadingOverlay.classList.add('active');
    
    // Timeout de segurança para evitar loading infinito
    setTimeout(() => {
        if (loadingOverlay.classList.contains('active')) {
            stopLoading();
            showAlert('A operação está demorando mais do que o esperado. Tente novamente.', 'warning');
        }
    }, 30000); // 30 segundos
}

// Parar carregamento
function stopLoading() {
    loadingOverlay.classList.remove('active');
}

// Atualizar texto de carregamento
function updateLoadingText(message) {
    loadingText.textContent = message;
}

// Habilitar/desabilitar botão de salvar
function disableSaveButton(disabled) {
    saveBtn.disabled = disabled;
    saveBtnSpinner.classList.toggle('hidden', !disabled);
}

// Log de depuração
function logDebug(...args) {
    console.log(...args);
    
    if (debug && debugOutput) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logEntry = `[${timestamp}] ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ')}`;
        
        debugOutput.innerHTML += logEntry + '\n';
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
} 