// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Referências DOM
const userNameElement = document.getElementById('userName');
const userEmailElement = document.getElementById('userEmail');
const userAvatarElement = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnMobile = document.getElementById('logoutBtnMobile');
const mapContainer = document.querySelector('.map-container');

// Função para logout
function logout() {
  auth.signOut().then(() => {
    // Redirecionar para a página de login após logout
    window.location.href = 'login/logout.html';
  }).catch((error) => {
    console.error('Erro ao realizar logout:', error);
    showAlert('Ocorreu um erro ao sair. Tente novamente.', 'error');
  });
}

// Função para mostrar alertas
function showAlert(message, type = 'error') {
  // Verificar se já existe um alerta e removê-lo
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  // Criar novo alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <div class="alert-content">
      <span>${message}</span>
      <button class="alert-close">&times;</button>
    </div>
  `;

  // Adicionar o alerta ao documento
  document.body.appendChild(alertDiv);

  // Configurar evento para fechar alerta
  const closeBtn = alertDiv.querySelector('.alert-close');
  closeBtn.addEventListener('click', () => {
    alertDiv.remove();
  });

  // Auto remover após 5 segundos
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Função para gerar iniciais do nome
function getInitials(name) {
  if (!name) return 'U';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Função para atualizar UI com dados do usuário
function updateUIWithUserData(user) {
  if (user) {
    // Mostrar email do usuário
    userEmailElement.textContent = user.email;
    
    // Mostrar nome do usuário ou 'Usuário' se não tiver nome
    const displayName = user.displayName || 'Usuário';
    userNameElement.textContent = displayName;
    
    // Modificar avatar para mostrar iniciais ou ícone padrão
    if (user.displayName) {
      userAvatarElement.innerHTML = getInitials(user.displayName);
    } else {
      userAvatarElement.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    // Se o usuário tiver foto, mostrar
    if (user.photoURL) {
      userAvatarElement.innerHTML = '';
      userAvatarElement.style.backgroundImage = `url(${user.photoURL})`;
      userAvatarElement.style.backgroundSize = 'cover';
      userAvatarElement.style.backgroundPosition = 'center';
    }
  } else {
    // Redirecionar para login se não estiver autenticado
    window.location.href = 'login/login.html';
  }
}

// Inicializar Google Maps (placeholder)
function initMap() {
  if (mapContainer) {
    mapContainer.innerHTML = '<div id="map" style="width: 100%; height: 100%;"></div>';
    
    // Placeholder para inicialização futura do Google Maps
    mapContainer.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.6;"></i>
        <p>Mapa em desenvolvimento</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">A API do Google Maps será integrada aqui</p>
      </div>
    `;
  }
}

// Evento para botão de logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (logoutBtnMobile) {
  logoutBtnMobile.addEventListener('click', logout);
}

// Observador de estado de autenticação
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('Usuário logado:', user.email);
    updateUIWithUserData(user);
    initMap();
  } else {
    // Usuário não está logado
    console.log('Nenhum usuário logado');
    window.location.href = 'login/login.html';
  }
});

// Adicionar CSS para alerta
const alertStyles = document.createElement('style');
alertStyles.textContent = `
  .alert {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease forwards;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .alert-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--background-color, #fff);
    color: var(--text-color, #1f2937);
  }
  
  body.dark-theme .alert-content {
    background: var(--dark-card, #1e1e2d);
    color: var(--dark-text, #e2e8f0);
  }
  
  .alert-error .alert-content {
    border-left: 4px solid #ef4444;
  }
  
  .alert-success .alert-content {
    border-left: 4px solid #10b981;
  }
  
  .alert-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.25rem;
    cursor: pointer;
    margin-left: 12px;
    opacity: 0.7;
  }
  
  .alert-close:hover {
    opacity: 1;
  }
`;

document.head.appendChild(alertStyles); 