// Configuração do Firebase (necessário apenas para Firestore)
const firebaseConfig = {
  apiKey: window.ENV.FIREBASE_API_KEY,
  projectId: window.ENV.FIREBASE_PROJECT_ID
};

// Inicializar Firebase se ainda não foi inicializado
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}
const db = firebase.firestore();

// Referência DOM para o contêiner do mapa na home
const homeMapContainer = document.querySelector('.map-container');

// Função para inicializar o mapa na página inicial
function initHomeMap() {
  // Detectar tema atual
  const isDark = document.body.classList.contains('dark-theme');
  // Definir estilos do mapa para tema escuro (replicando do dashboard.js)
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
  window._WACS_HOME_MAP_STYLES = { dark: darkMapStyles, light: [] };

  if (homeMapContainer) {
    // Criar o elemento para o mapa
    homeMapContainer.innerHTML = '<div id="home-map" style="width: 100%; height: 100%;"></div>';
    
    // Coordenadas iniciais (centro do Brasil)
    const initialLocation = { lat: -15.77972, lng: -47.92972 };

    try {
      const map = new google.maps.Map(document.getElementById("home-map"), {
        zoom: 5,
        center: initialLocation,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: isDark ? darkMapStyles : []
      });
      // Guardar referência global para poder acessar depois
      window._WACS_HOME_MAP_INSTANCE = map;
      
      // Adicionar marcadores do Firebase
      db.collection('accessibleLocations').get().then((snapshot) => {
        snapshot.forEach((doc) => {
          const location = doc.data();
          if (location.latitude && location.longitude) {
            const position = { lat: location.latitude, lng: location.longitude };
            const marker = new google.maps.Marker({
              position: position,
              map: map,
              title: location.name,
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
                  <h3 style="margin: 0 0 5px; font-size: 16px; color: #0055b3;">${location.name}</h3>
                  <p style="margin: 0; font-size: 14px;">${location.address || ''}</p>
                  <p style="margin: 0; font-size: 14px;">${location.accessibilityFeatures ? location.accessibilityFeatures.join(', ') : ''}</p>
                  <a href="#" style="display: block; margin-top: 8px; color: #0055b3; text-decoration: none; font-size: 12px;">Ver detalhes</a>
                </div>
              `
            });
            
            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          }
        });
      }).catch(error => {
        console.error('Erro ao buscar locais acessíveis do Firestore para a home:', error);
      });

      // Adicionar listener para troca de tema
      if (!window._WACS_HOME_THEME_LISTENER) {
        window._WACS_HOME_THEME_LISTENER = true;
        document.addEventListener('themechange', () => {
          const isDarkNow = document.body.classList.contains('dark-theme');
          const styles = isDarkNow ? window._WACS_HOME_MAP_STYLES.dark : window._WACS_HOME_MAP_STYLES.light;
          if (window._WACS_HOME_MAP_INSTANCE) {
            window._WACS_HOME_MAP_INSTANCE.setOptions({ styles });
          }
        });
      }

    } catch (error) {
      console.error('Erro ao inicializar o mapa da home:', error);
      homeMapContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.6;"></i>
            <p>Erro ao carregar o mapa</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">Verifique a conexão ou as permissões</p>
        </div>
      `;
    }
  }
}

// Tornar initHomeMap globalmente acessível para o callback da API do Google Maps
window.initHomeMap = initHomeMap; 