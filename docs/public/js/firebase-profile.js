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
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
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
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            showAlert('Usuário não autenticado', 'error');
            return;
        }
        
        const displayName = displayNameInput.value.trim();
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validar senha se estiver alterando
        if (newPassword || currentPassword || confirmPassword) {
            if (!currentPassword) {
                showAlert('Por favor, insira sua senha atual', 'error');
                return;
            }
            if (!newPassword) {
                showAlert('Por favor, insira a nova senha', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showAlert('As senhas não coincidem', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showAlert('A nova senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }
        }
        
        try {
            startLoading('Atualizando perfil...');
            
            // Atualizar senha se necessário
            if (newPassword) {
                // Reautenticar o usuário antes de alterar a senha
                const credential = firebase.auth.EmailAuthProvider.credential(
                    currentUser.email,
                    currentPassword
                );
                
                await currentUser.reauthenticateWithCredential(credential);
                await currentUser.updatePassword(newPassword);
                logDebug('Senha atualizada com sucesso');
            }
            
            // Atualizar nome de exibição se alterado
            if (displayName !== originalDisplayName) {
                await currentUser.updateProfile({
                    displayName: displayName
                });
                logDebug('Nome de exibição atualizado:', displayName);
            }
            
            // Atualizar foto se alterada
            if (photoChanged && photoFile) {
                const photoURL = await uploadProfilePicture(photoFile);
                await currentUser.updateProfile({
                    photoURL: photoURL
                });
                logDebug('Foto de perfil atualizada:', photoURL);
            } else if (photoRemoved) {
                await currentUser.updateProfile({
                    photoURL: null
                });
                logDebug('Foto de perfil removida');
            }
            
            // Limpar campos de senha
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            showAlert('Perfil atualizado com sucesso!', 'success');
            
            // Atualizar dados originais
            originalDisplayName = displayName;
            photoChanged = false;
            photoRemoved = false;
            
        } catch (error) {
            logDebug('Erro ao atualizar perfil:', error);
            
            if (error.code === 'auth/wrong-password') {
                showAlert('Senha atual incorreta', 'error');
            } else if (error.code === 'auth/requires-recent-login') {
                showAlert('Por favor, faça login novamente para alterar sua senha', 'error');
            } else if (error.code === 'auth/network-request-failed') {
                showAlert('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
            } else if (error.code === 'auth/too-many-requests') {
                showAlert('Muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.', 'error');
            } else if (error.code === 'storage/unauthorized') {
                showAlert('Erro ao fazer upload da foto. Tente novamente.', 'error');
            } else if (error.code === 'storage/canceled') {
                showAlert('Upload da foto cancelado.', 'error');
            } else if (error.code === 'storage/retry-limit-exceeded') {
                showAlert('Erro ao fazer upload da foto. Tente novamente mais tarde.', 'error');
            } else if (error.code === 'storage/invalid-checksum') {
                showAlert('Erro ao fazer upload da foto. O arquivo pode estar corrompido.', 'error');
            } else if (error.code === 'storage/invalid-format') {
                showAlert('Formato de arquivo inválido para a foto.', 'error');
            } else if (error.code === 'storage/invalid-url') {
                showAlert('URL inválida para a foto de perfil.', 'error');
            } else if (error.code === 'storage/object-not-found') {
                showAlert('Arquivo não encontrado no servidor.', 'error');
            } else if (error.code === 'storage/quota-exceeded') {
                showAlert('Limite de armazenamento excedido.', 'error');
            } else if (error.code === 'storage/unauthenticated') {
                showAlert('Sessão expirada. Por favor, faça login novamente.', 'error');
            } else {
                console.error('Erro detalhado:', error);
                showAlert(`Erro ao atualizar perfil: ${error.message || 'Erro desconhecido'}`, 'error');
            }
        } finally {
            stopLoading();
        }
    });
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
async function uploadProfilePicture(file) {
    if (!currentUser || !file) {
        logDebug('Parâmetros inválidos para upload:', { currentUser, file });
        throw new Error('Parâmetros inválidos para upload');
    }
    
    try {
        logDebug('Iniciando processo de upload da foto de perfil');
        
        // Gerar nome de arquivo único
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const formattedName = formatNameForFile(currentUser.displayName || 'user');
        const fileName = `${currentUser.uid}_${formattedName}_profile_${timestamp}.${fileExtension}`;
        
        // Referência para o arquivo no Storage
        const storageRef = storage.ref(`profile_pictures/${fileName}`);
        
        // Criar upload task
        const uploadTask = storageRef.put(file);
        
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