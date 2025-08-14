// Lógica para a nova página do Mapa Acessível

document.addEventListener('DOMContentLoaded', () => {
    // Esta verificação garante que o Firebase foi inicializado antes de usá-lo.
    if (typeof firebase === 'undefined') {
        console.error('Firebase não foi carregado. Verifique a ordem dos scripts.');
        return;
    }

    // Variáveis globais para o mapa e dados
    let map;
    let geocoder;
    let markers = [];
    let allLocations = [];
    let activeLocationId = null;
    let infoWindow;

    // Elementos do DOM
    const locationsList = document.getElementById('locations-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const addLocationBtn = document.querySelector('.add-location-btn');
    const modal = document.getElementById('location-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const locationForm = document.getElementById('location-form');
    const modalTitle = document.getElementById('modal-title');
    const featuresGrid = document.querySelector('.features-grid');

    // Definição dos recursos de acessibilidade
    const ACCESSIBILITY_FEATURES = [
        { id: 'rampa', label: 'Rampa de Acesso' },
        { id: 'elevador', label: 'Elevador' },
        { id: 'banheiro_acessivel', label: 'Banheiro Acessível' },
        { id: 'piso_tatil', label: 'Piso Tátil' },
        { id: 'vaga_deficiente', label: 'Vaga para Deficientes' },
        { id: 'atendimento_libras', label: 'Atendimento em Libras' },
        { id: 'cardapio_braille', label: 'Cardápio em Braille' },
        { id: 'porta_larga', label: 'Portas Largas' }
    ];

    // Renderiza os checkboxes de recursos no modal
    function renderFeaturesCheckboxes() {
        featuresGrid.innerHTML = '';
        ACCESSIBILITY_FEATURES.forEach(feature => {
            const featureHtml = `
                <div class="feature-item">
                    <input type="checkbox" id="feature-${feature.id}" name="features" value="${feature.id}">
                    <label for="feature-${feature.id}">${feature.label}</label>
                </div>
            `;
            featuresGrid.innerHTML += featureHtml;
        });
    }

    // Inicialização do mapa (função global chamada pela API do Google Maps)
    window.initMap = () => {
        geocoder = new google.maps.Geocoder();
        infoWindow = new google.maps.InfoWindow();
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -23.55052, lng: -46.633308 }, // Padrão para São Paulo
            zoom: 12,
            styles: getMapStyles() // Estilos do mapa para o tema
        });

        fetchAndDisplayLocations();
    };

    // Busca locais no Firestore
    function fetchAndDisplayLocations() {
        const db = firebase.firestore();
        db.collection('accessibleLocations').onSnapshot(snapshot => {
            allLocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            filterAndRender();
        }, error => {
            console.error("Erro ao buscar locais: ", error);
            locationsList.innerHTML = '<div class="location-item-placeholder"><p>Erro ao carregar locais.</p></div>';
        });
    }

    // Filtra e renderiza os locais
    function filterAndRender() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const filtered = allLocations.filter(loc => {
            const nameMatch = loc.name.toLowerCase().includes(searchTerm);
            const addressMatch = (loc.address || '').toLowerCase().includes(searchTerm);
            const categoryMatch = !category || loc.category === category;
            return (nameMatch || addressMatch) && categoryMatch;
        });

        renderLocationsList(filtered);
        renderMapMarkers(filtered);
    }

    // Renderiza a lista de locais no painel lateral
    function renderLocationsList(locations) {
        locationsList.innerHTML = '';
        if (locations.length === 0) {
            locationsList.innerHTML = '<div class="location-item-placeholder"><p>Nenhum local encontrado.</p></div>';
            return;
        }

        locations.forEach(loc => {
            const item = document.createElement('div');
            item.className = 'location-item';
            item.dataset.id = loc.id;
            if (loc.id === activeLocationId) {
                item.classList.add('active');
            }

            const featuresHtml = (loc.features || [])
                .map(featureId => {
                    const feature = ACCESSIBILITY_FEATURES.find(f => f.id === featureId);
                    return feature ? `<span class="feature-tag">${feature.label}</span>` : '';
                })
                .join('');

            item.innerHTML = `
                <div class="location-item-content">
                    <h3>${loc.name}</h3>
                    <p>${loc.address || 'Endereço não informado'}</p>
                    <div class="features-display">${featuresHtml}</div>
                </div>
                <button class="btn-edit-location" title="Editar Local"><i class="fas fa-edit"></i></button>
            `;

            // Pan map and open InfoWindow on item click
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-edit-location')) {
                    const targetMarker = markers.find(m => m.id === loc.id);
                    if (targetMarker) {
                        map.panTo(targetMarker.getPosition());
                        map.setZoom(15);
                        // Dispara o evento de clique no marcador para reutilizar a lógica da InfoWindow
                        google.maps.event.trigger(targetMarker, 'click');
                    }
                }
            });

            // Open modal on edit button click
            item.querySelector('.btn-edit-location').addEventListener('click', () => {
                openModal(loc);
            });

            locationsList.appendChild(item);
        });
    }

    // Renderiza os marcadores no mapa
    function renderMapMarkers(locations) {
        // Limpa marcadores antigos
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        locations.forEach(loc => {
            if (loc.coordinates) {
                addMarker(loc);
            } else if (loc.address) {
                // Se não tiver coordenadas, tenta geocodificar o endereço
                geocodeAddress(loc);
            }
        });
    }

    // Adiciona um marcador ao mapa
    function addMarker(location) {
        if (!location.coordinates) return;

        const position = {
            lat: location.coordinates.latitude,
            lng: location.coordinates.longitude
        };

        const marker = new google.maps.Marker({
            position,
            map,
            title: location.name,
            id: location.id // Armazena o ID para referência
        });

        marker.addListener('click', () => {
            setActiveLocation(location.id);

            const featuresHtml = (location.features || [])
                .map(featureId => {
                    const feature = ACCESSIBILITY_FEATURES.find(f => f.id === featureId);
                    return feature ? `<li>${feature.label}</li>` : '';
                })
                .join('');

            const content = `
                <div class="info-window-content">
                    <h4>${location.name}</h4>
                    <p>${location.address || 'Endereço não informado'}</p>
                    ${featuresHtml ? `<h5>Recursos:</h5><ul>${featuresHtml}</ul>` : '<p>Nenhum recurso de acessibilidade informado.</p>'}
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    }

    // Converte endereço em coordenadas (Geocoding)
    function geocodeAddress(location) {
        geocoder.geocode({ 'address': location.address }, (results, status) => {
            if (status === 'OK') {
                const coords = {
                    latitude: results[0].geometry.location.lat(),
                    longitude: results[0].geometry.location.lng()
                };
                // Salva as coordenadas no Firestore para uso futuro
                const db = firebase.firestore();
                db.collection('accessibleLocations').doc(location.id).update({ coordinates: coords });
                
                // Adiciona o marcador com as novas coordenadas
                addMarker({ ...location, coordinates: coords });
            } else {
                console.warn('Geocode falhou para o endereço:', location.address, 'Status:', status);
            }
        });
    }

    // Define o local ativo (destaca na lista e no mapa)
    function setActiveLocation(locationId) {
        activeLocationId = locationId;
        
        // Atualiza a classe 'active' na lista
        document.querySelectorAll('.location-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === locationId);
        });

        // Poderia adicionar lógica para destacar o marcador no mapa aqui (ex: mudar ícone, abrir InfoWindow)
    }

    // --- Lógica do Modal ---

    function openModal(location = null) {
        locationForm.reset();
        // Garante que os checkboxes de features sejam resetados
        document.querySelectorAll('input[name="features"]').forEach(cb => cb.checked = false);

        if (location) {
            modalTitle.textContent = 'Editar Local';
            document.getElementById('location-id').value = location.id;
            document.getElementById('location-name').value = location.name;
            document.getElementById('location-address').value = location.address;
            document.getElementById('location-category').value = location.category;
            
            // Marca os checkboxes dos recursos existentes
            if (location.features && Array.isArray(location.features)) {
                location.features.forEach(featureId => {
                    const checkbox = document.getElementById(`feature-${featureId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        } else {
            modalTitle.textContent = 'Adicionar Novo Local';
            document.getElementById('location-id').value = '';
        }
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    addLocationBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Submissão do formulário do modal
    locationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('location-id').value;
        const name = document.getElementById('location-name').value;
        const address = document.getElementById('location-address').value;
        const category = document.getElementById('location-category').value;
        const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
                             .map(cb => cb.value);

        const locationData = { name, address, category, features };

        saveLocation(id, locationData);
    });

    // Salva (cria ou atualiza) o local no Firestore
    function saveLocation(id, data) {
        const db = firebase.firestore();
        const collection = db.collection('accessibleLocations');

        // Antes de salvar, geocodifica o endereço para obter as coordenadas
        geocoder.geocode({ 'address': data.address }, (results, status) => {
            if (status === 'OK') {
                data.coordinates = {
                    latitude: results[0].geometry.location.lat(),
                    longitude: results[0].geometry.location.lng()
                };

                const promise = id ? collection.doc(id).update(data) : collection.add(data);
                promise.then(() => {
                    closeModal();
                    // A atualização será automática devido ao onSnapshot
                }).catch(error => {
                    console.error('Erro ao salvar local:', error);
                    alert('Não foi possível salvar o local.');
                });

            } else {
                alert('Endereço não encontrado. Verifique e tente novamente.');
            }
        });
    }

    // Event Listeners para os filtros
    searchInput.addEventListener('input', filterAndRender);
    categoryFilter.addEventListener('change', filterAndRender);

    // Renderiza os checkboxes na inicialização
    renderFeaturesCheckboxes();

    // Função para obter estilos do mapa com base no tema
    function getMapStyles() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        if (isDarkTheme) {
            return [
                { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
                { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
                { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
                { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
                { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
                { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
                { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
            ];
        }
        return []; // Retorna o estilo padrão do Google Maps para o tema claro
    }
});
