import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const REGISTRO_SP = {
  latitude: -24.4871,
  longitude: -47.8442,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0922 * ASPECT_RATIO,
};

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'md-list', color: '#9b59b6' },
  { id: 'ramp', name: 'Rampas', icon: 'wheelchair', color: '#2ecc71' },
  { id: 'elevator', name: 'Elevadores', icon: 'elevator', color: '#e74c3c' },
  { id: 'bathroom', name: 'Banheiros', icon: 'restroom', color: '#3498db' },
  { id: 'parking', name: 'Estacionamento', icon: 'parking', color: '#f39c12' },
];

const MapScreen = () => {
  const [region, setRegion] = useState(REGISTRO_SP);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    category: '',
    accessibility: '',
    image: null,
    latitude: REGISTRO_SP.latitude,
    longitude: REGISTRO_SP.longitude,
  });

  // Load saved places and get user location
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load saved places
        const savedPlaces = await AsyncStorage.getItem('@accessibility_points');
        if (savedPlaces) setPlaces(JSON.parse(savedPlaces));

        // Get user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Filter places based on selected category
  const filteredPlaces = selectedFilter === 'all' 
    ? places 
    : places.filter(place => place.category === selectedFilter);

  // Save new place
  const handleSavePlace = async () => {
    if (!newPlace.name || !newPlace.category || !newPlace.accessibility) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const place = {
      id: Date.now().toString(),
      ...newPlace,
      createdAt: new Date().toISOString(),
      rating: 0,
    };

    try {
      const updatedPlaces = [...places, place];
      await AsyncStorage.setItem('@accessibility_points', JSON.stringify(updatedPlaces));
      setPlaces(updatedPlaces);
      setModalVisible(false);
      setNewPlace({
        name: '',
        category: '',
        accessibility: '',
        image: null,
        latitude: region.latitude,
        longitude: region.longitude,
      });
    } catch (error) {
      console.error('Error saving place:', error);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPlace({ ...newPlace, image: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        customMapStyle={mapStyle}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Sua localização">
            <View style={styles.userMarker}>
              <Icon name="account" size={20} color="#0ea5e9" />
            </View>
          </Marker>
        )}

        {/* Accessibility Places Markers */}
        {filteredPlaces.map(place => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={[
              styles.placeMarker,
              selectedPlace?.id === place.id && styles.selectedPlaceMarker,
              { backgroundColor: CATEGORIES.find(c => c.id === place.category)?.color || '#0ea5e9' }
            ]}>
              <IconFA 
                name={CATEGORIES.find(c => c.id === place.category)?.icon || 'map-marker-alt'} 
                size={16} 
                color="white" 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Filter Bar */}
      <ScrollView horizontal style={styles.filterContainer}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedFilter === category.id && styles.filterActive,
              { backgroundColor: category.color }
            ]}
            onPress={() => setSelectedFilter(category.id)}
          >
            <IconFA name={category.icon} size={16} color="white" />
            <Text style={styles.filterText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Place Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Place Details Panel */}
      {selectedPlace && (
        <View style={styles.placeDetails}>
          <View style={styles.placeHeader}>
            <View style={[
              styles.placeIcon,
              { backgroundColor: CATEGORIES.find(c => c.id === selectedPlace.category)?.color || '#0ea5e9' }
            ]}>
              <IconFA 
                name={CATEGORIES.find(c => c.id === selectedPlace.category)?.icon || 'map-marker-alt'} 
                size={20} 
                color="white" 
              />
            </View>
            <Text style={styles.placeTitle}>{selectedPlace.name}</Text>
          </View>

          <Text style={styles.placeDescription}>{selectedPlace.accessibility}</Text>

          {selectedPlace.image && (
            <Image source={{ uri: selectedPlace.image }} style={styles.placeImage} />
          )}

          <View style={styles.placeFooter}>
            <Text style={styles.placeDate}>
              Adicionado em: {new Date(selectedPlace.createdAt).toLocaleDateString()}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedPlace(null)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add Place Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Local Acessível</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do local*"
              value={newPlace.name}
              onChangeText={text => setNewPlace({ ...newPlace, name: text })}
            />

            <Text style={styles.label}>Categoria*</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    newPlace.category === category.id && styles.selectedCategory,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setNewPlace({ ...newPlace, category: category.id })}
                >
                  <IconFA name={category.icon} size={16} color={category.color} />
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Descrição da acessibilidade*"
              multiline
              value={newPlace.accessibility}
              onChangeText={text => setNewPlace({ ...newPlace, accessibility: text })}
            />

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Icon name="camera" size={20} color="#0ea5e9" />
              <Text style={styles.imageButtonText}>
                {newPlace.image ? 'Foto selecionada' : 'Adicionar foto (opcional)'}
              </Text>
            </TouchableOpacity>

            {newPlace.image && (
              <Image source={{ uri: newPlace.image }} style={styles.imagePreview} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePlace}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Dark map style (same as before)
const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1d2c4d" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8ec3b9" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a3646" }]
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }]
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }]
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c6675" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255763" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0d5ce" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#023e58" }]
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }]
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }]
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [{ color: "#283d6a" }]
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#3a4762" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  filterContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  filterActive: {
    borderWidth: 2,
    borderColor: 'white',
  },
  filterText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  userMarker: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0ea5e9',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  placeMarker: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectedPlaceMarker: {
    transform: [{ scale: 1.3 }],
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    zIndex: 10,
  },
  placeDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  placeDescription: {
    color: '#94a3b8',
    fontSize: 15,
    marginBottom: 15,
    lineHeight: 22,
  },
  placeImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeDate: {
    color: '#64748b',
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#0ea5e9',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#475569',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    color: '#94a3b8',
    marginBottom: 10,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#1e293b',
  },
  selectedCategory: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
  },
  categoryText: {
    color: '#f8fafc',
    marginLeft: 8,
    fontSize: 14,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#334155',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#475569',
  },
  imageButtonText: {
    color: '#f8fafc',
    marginLeft: 10,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  saveButton: {
    backgroundColor: '#0ea5e9',
  },
  cancelButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});

export default MapScreen;


/*Preciso completar a implementação do mapa acessível no meu aplicativo WACS (Wheelchair Automation Control System), que já possui funcionalidades como filtro por categoria, adição de locais, e uso de geolocalização. Agora, preciso adicionar as seguintes funcionalidades avançadas para enriquecer a experiência do usuário:

Funcionalidades Requeridas:
Múltiplos Tipos de Acessibilidade por Local:

Permitir que o usuário selecione diferentes tipos de acessibilidade para cada local, como rampas, banheiros acessíveis, vagas de estacionamento, etc.

A ideia é que cada local no mapa tenha um ou mais tipos de acessibilidade associados, para dar ao usuário uma visão mais detalhada sobre o local.

Seleção Manual de Local no Mapa:

Permitir que o usuário possa clicar em qualquer ponto do mapa para adicionar um local. O ponto escolhido deve exibir um marcador que o usuário pode editar antes de confirmar a adição.

O marcador deve ser visível na tela com as opções para adicionar as informações do local (nome, descrição, tipos de acessibilidade, imagem, etc.).

Botão de Centralizar no Usuário com Zoom:

Criar um botão que centralize o mapa na localização atual do usuário e dê um zoom automático para facilitar a visualização das opções ao redor.

O botão deve ser intuitivo e facilmente acessível, permitindo que o usuário volte rapidamente ao seu local sem precisar de muitos toques.

Edição e Exclusão de Locais:

Implementar uma funcionalidade que permita ao usuário editar ou excluir os locais já cadastrados no mapa.

Para editar, o usuário deve poder selecionar o marcador do local e alterar as informações. Para excluir, deve haver um botão de "Excluir" associado a cada local que o usuário possa clicar.

Ícones por Tipo de Estabelecimento ou Imagem do Google:

Exibir ícones diferenciados para cada tipo de estabelecimento (por exemplo, restaurante, shopping, hospital, etc.).

Se o Google Maps fornecer imagens do local, exibir essas imagens como ícones no lugar dos ícones padrão.

Essa funcionalidade deve garantir uma visualização mais clara e organizada no mapa, com os ícones facilitando a identificação dos tipos de locais.

Pesquisa de Locais Existentes (Usando Google Places API):

Integrar a Google Places API para permitir a pesquisa por locais já existentes. O usuário deve poder pesquisar pelo nome de um estabelecimento ou ponto de interesse e visualizar as opções disponíveis no mapa.

Se o local já estiver cadastrado, ele deve aparecer como um marcador com informações sobre a acessibilidade.

Votação e Validação de Acessibilidade:

Implementar uma funcionalidade onde os usuários possam votar na acessibilidade de um local. Cada local deverá ter uma opção de "Votar" para que os usuários possam indicar se o local é acessível ou não.

A votação pode ser feita com estrelas ou uma escala simples (Acessível / Não acessível).

Os votos devem ser usados para validar a informação de acessibilidade do local.

Botão de Rota a Pé até o Local:

Criar um botão que, ao ser clicado, traça uma rota a pé do local atual do usuário até o local selecionado no mapa.

A rota deve ser baseada nas opções de caminhada mais acessíveis, priorizando ruas com rampas e áreas sem obstáculos.

Ideias Adicionais:
Filtros Avançados:

Criar filtros no mapa para que o usuário possa visualizar apenas os locais com um ou mais tipos específicos de acessibilidade.

Os filtros podem incluir opções como "Locais com rampas", "Locais com banheiro acessível", "Locais com vagas para cadeirantes", etc.

Nível de Detalhamento nas Descrições:

Permitir que os usuários insiram informações adicionais sobre cada local, como imagens do local, comentários de usuários sobre a acessibilidade e outros detalhes relevantes.

Essas informações podem ser apresentadas ao clicar no marcador do local no mapa.

Histórico de Localizações Recentes:

Criar uma seção no aplicativo onde os usuários possam ver os locais que visitaram recentemente e as rotas feitas, facilitando a navegação para locais frequentes.

Gamificação da Validação de Acessibilidade:

Adicionar elementos de gamificação, como pontos ou medalhas, para incentivar os usuários a votar e validar a acessibilidade dos locais. Quanto mais locais um usuário votar ou validar, mais pontos ele ganha.

Notificações de Alterações nos Locais:

Quando um local for atualizado, o aplicativo pode enviar uma notificação para os usuários que já marcaram esse local ou para aqueles que configuraram notificações sobre mudanças nos locais acessíveis.

Suporte a Mapas Offline:

Permitir que o mapa continue acessível offline para que os usuários possam visualizar as localizações e rotas sem precisar de conexão com a internet. O armazenamento local pode ser utilizado para salvar informações de localização.

Com essas ideias e funcionalidades, o aplicativo WACS será ainda mais útil para as pessoas com deficiência, proporcionando uma navegação mais inclusiva, precisa e colaborativa. A integração das APIs do Google e a adição de funcionalidades de votação e gamificação tornarão o mapa mais interativo e dinâmico para os usuários.

quemande o codigo 100% completo para mim */

