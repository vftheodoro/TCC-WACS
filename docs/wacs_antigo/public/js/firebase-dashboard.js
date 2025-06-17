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
const db = firebase.firestore();

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

// Função para buscar dados do usuário do Firestore
function getUserData(user) {
  return db.collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        return doc.data();
      } else {
        // Se o documento não existir, criar um novo com dados básicos
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phoneNumber: user.phoneNumber || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          ADM: 0 // Valor padrão para novos usuários
        };
        
        // Salvar os dados do usuário
        return db.collection('users').doc(user.uid).set(userData)
          .then(() => userData);
      }
    })
    .catch(error => {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    });
}

// Função para atualizar UI com dados do usuário
function updateUIWithUserData(user) {
  if (user) {
    // Buscar dados adicionais do usuário do Firestore
    getUserData(user).then(userData => {
      // Mostrar email do usuário
      userEmailElement.textContent = user.email;
      
      // Usar dados do Firestore se disponíveis, ou fallback para dados do Auth
      const displayName = (userData && userData.displayName) || user.displayName || 'Usuário';
      userNameElement.textContent = displayName;
      
      // Adicionar badge de administrador se ADM === 1
      if (userData && userData.ADM === 1) {
        const adminBadge = document.createElement('span');
        adminBadge.className = 'admin-badge';
        adminBadge.textContent = 'Administrador';
        adminBadge.style.marginLeft = '8px';
        adminBadge.style.padding = '2px 8px';
        adminBadge.style.backgroundColor = '#4CAF50';
        adminBadge.style.color = 'white';
        adminBadge.style.borderRadius = '12px';
        adminBadge.style.fontSize = '12px';
        userNameElement.appendChild(adminBadge);
      }
      
      // Modificar avatar para mostrar iniciais ou ícone padrão
      if (displayName !== 'Usuário') {
        userAvatarElement.innerHTML = getInitials(displayName);
      } else {
        userAvatarElement.innerHTML = '<i class="fas fa-user"></i>';
      }
      
      // Se o usuário tiver foto, mostrar
      const photoURL = (userData && userData.photoURL) || user.photoURL;
      if (photoURL) {
        userAvatarElement.innerHTML = '';
        userAvatarElement.style.backgroundImage = `url(${photoURL})`;
        userAvatarElement.style.backgroundSize = 'cover';
        userAvatarElement.style.backgroundPosition = 'center';
      }
      
      // Atualizar timestamp de último login
      db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(error => {
        console.error('Erro ao atualizar último login:', error);
      });
    });
  } else {
    // Redirecionar para login se não estiver autenticado
    window.location.href = 'login/login.html';
  }
}

// Inicializar Google Maps
function initMap() {
  // Detectar tema atual
  const isDark = document.body.classList.contains('dark-theme');
  // Definir estilos do mapa para tema escuro
  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
  ];
  window._WACS_DASHBOARD_MAP_STYLES = { dark: darkMapStyles, light: [] };

  if (mapContainer) {
    // Criar o elemento para o mapa
    mapContainer.innerHTML = '<div id="map" style="width: 100%; height: 100%;"></div>';
    
    // Coordenadas iniciais (centro do Brasil)
    const initialLocation = { lat: -15.77972, lng: -47.92972 };

    try {
      // Criar o mapa
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: initialLocation,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: isDark ? darkMapStyles : []
      });
      // Guardar referência global para poder acessar depois
      window._WACS_DASHBOARD_MAP_INSTANCE = map;
      
      // Adicionar marcadores de exemplo (locais acessíveis)
      const accessibleLocations = [
        { position: { lat: -23.5505, lng: -46.6333 }, title: "Parque Ibirapuera", content: "Rampas de acesso, banheiros adaptados" },
        { position: { lat: -22.9068, lng: -43.1729 }, title: "Praia de Copacabana", content: "Áreas acessíveis, cadeiras anfíbias" },
        { position: { lat: -25.4284, lng: -49.2733 }, title: "Parque Barigui", content: "Trilhas acessíveis, estacionamento reservado" },
        { position: { lat: -24.7206, lng: -47.8815 }, title: "Shopping Center Registro", content: "Elevadores, banheiros adaptados" }
      ];
      
      // Criar marcadores e janelas de informação
      accessibleLocations.forEach(location => {
        const marker = new google.maps.Marker({
          position: location.position,
          map: map,
          title: location.title,
          animation: google.maps.Animation.DROP,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0055b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="7" r="4"/>
                <path d="M17 21v-2a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/>
                <circle cx="12" cy="12" r="10" stroke="#0055b3" stroke-width="1" opacity="0.3"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(30, 30)
          }
        });
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px; padding: 5px;">
              <h3 style="margin: 0 0 5px; font-size: 16px; color: #0055b3;">${location.title}</h3>
              <p style="margin: 0; font-size: 14px;">${location.content}</p>
              <a href="#" style="display: block; margin-top: 8px; color: #0055b3; text-decoration: none; font-size: 12px;">Ver detalhes</a>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
      
      // Adicionar o controle de pesquisa de lugares
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', 'Buscar local...');
      input.classList.add('map-search-input');
      
      const searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      
      // Evento para mudar os limites do mapa quando o usuário seleciona uma sugestão
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
          if (!place.geometry || !place.geometry.location) return;
          
          // Criar um marcador para o local pesquisado
          new google.maps.Marker({
            map,
            title: place.name,
            position: place.geometry.location
          });
          
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        
        map.fitBounds(bounds);
      });
      
      // Adicionar o botão de geolocalização
      const locationButton = document.createElement('button');
      locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
      locationButton.className = 'map-locator-button';
      locationButton.title = 'Minha localização';
      
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
      
      // Evento para centralizar o mapa na localização do usuário
      locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // Criar um marcador para a localização do usuário
            new google.maps.Marker({
              position: userLocation,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2
              },
              title: 'Você está aqui'
            });
            
            map.setCenter(userLocation);
            map.setZoom(15);
          }, () => {
            showAlert('Erro ao obter sua localização. Verifique as permissões.', 'error');
          });
        } else {
          showAlert('Seu navegador não suporta geolocalização.', 'error');
        }
      });
      
      // Adicionar CSS para os controles personalizados
      const mapStyles = document.createElement('style');
      mapStyles.textContent = `
        .map-search-input {
          margin: 10px;
          padding: 8px 15px;
          width: 300px;
          border: none;
          border-radius: 3px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          font-size: 14px;
          outline: none;
        }
        
        .map-locator-button {
          background: white;
          border: none;
          border-radius: 2px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          margin: 10px;
          padding: 0;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .map-locator-button i {
          color: #666;
          font-size: 18px;
        }
        
        .map-locator-button:hover {
          background: #f8f8f8;
        }
        
        body.dark-theme .map-search-input,
        body.dark-theme .map-locator-button {
          background: #333;
          color: #fff;
        }
        
        body.dark-theme .map-locator-button i {
          color: #fff;
        }
      `;
      
      document.head.appendChild(mapStyles);
      
      // Adicionar listener para troca de tema
      if (!window._WACS_DASHBOARD_THEME_LISTENER) {
        window._WACS_DASHBOARD_THEME_LISTENER = true;
        document.addEventListener('themechange', () => {
          const isDarkNow = document.body.classList.contains('dark-theme');
          const styles = isDarkNow ? window._WACS_DASHBOARD_MAP_STYLES.dark : window._WACS_DASHBOARD_MAP_STYLES.light;
          if (window._WACS_DASHBOARD_MAP_INSTANCE) {
            window._WACS_DASHBOARD_MAP_INSTANCE.setOptions({ styles });
          }
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
    mapContainer.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.6;"></i>
          <p>Erro ao carregar o mapa</p>
          <p style="font-size: 0.9rem; opacity: 0.7;">Verifique a conexão ou as permissões</p>
      </div>
    `;
    }
  }
}

// Função para buscar a contagem de locais acessíveis
function getAccessibleLocationsCount() {
  return db.collection('accessibleLocations').get()
    .then(snapshot => {
      const count = snapshot.size;
      // Busca o card pelo título
      const statCards = document.querySelectorAll('.stat-card');
      statCards.forEach(card => {
        const title = card.querySelector('.stat-content h3');
        if (title && title.textContent.trim().toLowerCase().includes('locais acessíveis')) {
          const countElement = card.querySelector('.stat-content p');
          if (countElement) {
            countElement.textContent = count;
          }
        }
      });
      return count;
    })
    .catch(error => {
      console.error('Erro ao buscar contagem de locais:', error);
      return 0;
    });
}

// Função para buscar a contagem de colaboradores
function getCollaboratorsCount() {
  return db.collection('users').get()
    .then(snapshot => {
      const count = snapshot.size;
      // Atualizar o elemento que mostra a contagem
      const countElement = document.querySelector('.stat-card:nth-child(2) .stat-content p');
      if (countElement) {
        countElement.textContent = count;
      }
      return count;
    })
    .catch(error => {
      console.error('Erro ao buscar contagem de colaboradores:', error);
      return 0;
    });
}

// Função para buscar as contribuições do usuário atual
function getUserContributions(userId) {
  return db.collection('locations')
    .where('addedBy', '==', userId)
    .get()
    .then(snapshot => {
      const count = snapshot.size;
      // Atualizar o elemento que mostra a contagem
      const countElement = document.querySelector('.stat-card:nth-child(3) .stat-content p');
      if (countElement) {
        countElement.textContent = count;
      }
      return count;
    })
    .catch(error => {
      console.error('Erro ao buscar contribuições do usuário:', error);
      return 0;
    });
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
    getAccessibleLocationsCount();
    getCollaboratorsCount();
    getUserContributions(user.uid);
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