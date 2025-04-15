import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = -23.5505;
const LONGITUDE = -46.6333;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const [region, setRegion] = useState({
    latitude: LATITUDE,
    longitude: LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: LATITUDE,
    longitude: LONGITUDE,
  });

  // Locais acessíveis mockados
  const accessiblePlaces = [
    {
      id: '1',
      title: 'Shopping Center',
      type: 'shopping',
      description: 'Elevadores e banheiros acessíveis em todos os andares',
      latitude: -23.5570,
      longitude: -46.6420,
      rating: 4.5,
      features: ['elevator', 'bathroom', 'parking'],
    },
    {
      id: '2',
      title: 'Restaurante Acessível',
      type: 'restaurant',
      description: 'Rampas de acesso e cardápio em braile',
      latitude: -23.5510,
      longitude: -46.6350,
      rating: 4.0,
      features: ['ramp', 'braille'],
    },
    {
      id: '3',
      title: 'Parque Municipal',
      type: 'park',
      description: 'Trilhas adaptadas e estacionamento reservado',
      latitude: -23.5430,
      longitude: -46.6380,
      rating: 4.2,
      features: ['ramp', 'parking'],
    },
  ];

  const filteredPlaces = selectedFilter === 'all' 
    ? accessiblePlaces 
    : accessiblePlaces.filter(place => place.features.includes(selectedFilter));

  const getPlaceIcon = (type) => {
    switch(type) {
      case 'shopping': return 'shopping-bag';
      case 'restaurant': return 'utensils';
      case 'park': return 'tree';
      default: return 'map-marker-alt';
    }
  };

  const getFeatureIcon = (feature) => {
    switch(feature) {
      case 'elevator': return 'elevator';
      case 'bathroom': return 'restroom';
      case 'parking': return 'parking';
      case 'ramp': return 'wheelchair';
      case 'braille': return 'braille';
      default: return 'info-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        customMapStyle={mapStyle} // Estilo escuro para o mapa
      >
        {/* Marcador da localização do usuário */}
        <Marker
          coordinate={userLocation}
          title="Sua localização"
          description="Você está aqui"
        >
          <View style={styles.userMarker}>
            <Icon name="account" size={20} color="#00f2fe" />
          </View>
        </Marker>

        {/* Marcadores dos locais acessíveis */}
        {filteredPlaces.map(place => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.title}
            description={place.description}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={[
              styles.placeMarker,
              selectedPlace?.id === place.id && styles.selectedPlaceMarker
            ]}>
              <IconFA 
                name={getPlaceIcon(place.type)} 
                size={16} 
                color="white" 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Controles do mapa */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="crosshairs-gps" size={24} color="#00f2fe" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="magnify-plus" size={24} color="#00f2fe" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="magnify-minus" size={24} color="#00f2fe" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={styles.filterText}>Todos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'ramp' && styles.filterActive
          ]}
          onPress={() => setSelectedFilter('ramp')}
        >
          <IconFA name="wheelchair" size={16} color="white" />
          <Text style={styles.filterText}>Rampas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'elevator' && styles.filterActive
          ]}
          onPress={() => setSelectedFilter('elevator')}
        >
          <Icon name="elevator" size={16} color="white" />
          <Text style={styles.filterText}>Elevadores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'bathroom' && styles.filterActive
          ]}
          onPress={() => setSelectedFilter('bathroom')}
        >
          <IconFA name="restroom" size={16} color="white" />
          <Text style={styles.filterText}>Banheiros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'parking' && styles.filterActive
          ]}
          onPress={() => setSelectedFilter('parking')}
        >
          <IconFA name="parking" size={16} color="white" />
          <Text style={styles.filterText}>Estacionamento</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Detalhes do local selecionado */}
      {selectedPlace && (
        <View style={styles.placeDetails}>
          <View style={styles.placeHeader}>
            <View style={styles.placeIcon}>
              <IconFA 
                name={getPlaceIcon(selectedPlace.type)} 
                size={20} 
                color="white" 
              />
            </View>
            <Text style={styles.placeTitle}>{selectedPlace.title}</Text>
            <View style={styles.placeRating}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{selectedPlace.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.placeDescription}>{selectedPlace.description}</Text>
          
          <View style={styles.featuresContainer}>
            {selectedPlace.features.map((feature, index) => (
              <View key={index} style={styles.featureBadge}>
                <IconFA 
                  name={getFeatureIcon(feature)} 
                  size={14} 
                  color="#00f2fe" 
                />
                <Text style={styles.featureText}>
                  {feature === 'elevator' && 'Elevador'}
                  {feature === 'bathroom' && 'Banheiro Acessível'}
                  {feature === 'parking' && 'Estacionamento'}
                  {feature === 'ramp' && 'Rampa'}
                  {feature === 'braille' && 'Braile'}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="directions" size={20} color="#00f2fe" />
              <Text style={styles.actionText}>Rotas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="thumb-up" size={20} color="#00f2fe" />
              <Text style={styles.actionText}>Avaliar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="share-variant" size={20} color="#00f2fe" />
              <Text style={styles.actionText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de locais próximos */}
      {!selectedPlace && (
        <View style={styles.placesListContainer}>
          <Text style={styles.sectionTitle}>Locais Acessíveis Próximos</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesListContent}
          >
            {filteredPlaces.map(place => (
              <TouchableOpacity 
                key={place.id}
                style={styles.placeCard}
                onPress={() => setSelectedPlace(place)}
              >
                <View style={styles.placeCardIcon}>
                  <IconFA 
                    name={getPlaceIcon(place.type)} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <Text style={styles.placeCardTitle}>{place.title}</Text>
                <View style={styles.placeCardRating}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.placeCardRatingText}>{place.rating}</Text>
                </View>
                <View style={styles.placeCardFeatures}>
                  {place.features.slice(0, 3).map((feature, index) => (
                    <IconFA 
                      key={index}
                      name={getFeatureIcon(feature)} 
                      size={12} 
                      color="#00f2fe" 
                      style={styles.placeCardFeatureIcon}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// Estilo escuro para o mapa
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
  },
  map: {
    width: '100%',
    height: '60%',
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 15,
    backgroundColor: 'rgba(10, 14, 20, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  controlButton: {
    padding: 8,
    alignItems: 'center',
  },
  filtersContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  filtersContent: {
    paddingBottom: 10,
  },
  filterButton: {
    backgroundColor: '#1c2331',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#00a8ff',
  },
  filterText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
  },
  userMarker: {
    backgroundColor: '#0a0e14',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00f2fe',
  },
  placeMarker: {
    backgroundColor: '#00f2fe',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0a0e14',
  },
  selectedPlaceMarker: {
    backgroundColor: '#ffcc00',
    borderColor: '#0a0e14',
    transform: [{ scale: 1.2 }],
  },
  placeDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141a24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeIcon: {
    backgroundColor: '#1e2833',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  placeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    marginLeft: 5,
  },
  placeDescription: {
    color: '#7a828a',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  featureBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  featureText: {
    color: '#00f2fe',
    fontSize: 12,
    marginLeft: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#00f2fe',
    fontSize: 12,
    marginTop: 5,
  },
  placesListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141a24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  placesListContent: {
    paddingBottom: 10,
  },
  placeCard: {
    width: 150,
    backgroundColor: '#1a1f27',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  placeCardIcon: {
    backgroundColor: '#1e2833',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  placeCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeCardRatingText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
  placeCardFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  placeCardFeatureIcon: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderRadius: 12,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default MapScreen;