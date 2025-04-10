import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, PermissionsAndroid, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';

// Componente de mapa simulado
const SimulatedMap = ({ location, accessiblePlaces, selectedRoute }) => {
  return (
    <View style={styles.mapContainer}>
      <Image 
        source={require('../assets/map-placeholder.jpg')} // Você pode usar qualquer imagem de mapa genérico
        style={styles.mapImage}
        resizeMode="cover"
      />
      
      {/* Simulação de marcadores */}
      {accessiblePlaces.map(place => (
        <View 
          key={place.id} 
          style={[
            styles.simulatedMarker,
            { 
              left: `${((place.coordinate.longitude + 46.65) * 100)}%`,
              top: `${((place.coordinate.latitude + 23.55) * 100)}%`
            }
          ]}
        >
          <IconFA 
            name={place.type === 'restaurant' ? 'utensils' : 
                  place.type === 'shopping' ? 'shopping-bag' : 
                  place.type === 'leisure' ? 'tree' : 'bus'}
            size={12} 
            color="#fff" 
          />
        </View>
      ))}
      
      {/* Simulação da localização do usuário */}
      {location && (
        <View style={[
          styles.userLocation,
          { 
            left: `${((location.longitude + 46.65) * 100)}%`,
            top: `${((location.latitude + 23.55) * 100)}%`
          }
        ]} />
      )}
      
      {/* Simulação da rota selecionada */}
      {selectedRoute && (
        <View style={styles.simulatedRouteContainer}>
          {selectedRoute.map((point, index) => (
            <View 
              key={index}
              style={[
                styles.simulatedRoutePoint,
                { 
                  left: `${((point.longitude + 46.65) * 100)}%`,
                  top: `${((point.latitude + 23.55) * 100)}%`
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const MapsScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [accessiblePlaces, setAccessiblePlaces] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapAvailable, setMapAvailable] = useState(true);

  // Pontos de acessibilidade mockados (simulando dados do Firebase)
  const mockAccessiblePlaces = [
    {
      id: '1',
      title: 'Restaurante Acessível',
      description: 'Rampas de acesso, banheiro adaptado',
      coordinate: { latitude: -23.5505, longitude: -46.6333 },
      rating: 4.5,
      type: 'restaurant',
      features: ['ramp', 'bathroom', 'parking']
    },
    {
      id: '2',
      title: 'Shopping Central',
      description: 'Elevadores, banheiros adaptados em todos os andares',
      coordinate: { latitude: -23.5570, longitude: -46.6420 },
      rating: 5.0,
      type: 'shopping',
      features: ['elevator', 'bathroom', 'parking', 'braille']
    },
    {
      id: '3',
      title: 'Parque Municipal',
      description: 'Trilhas adaptadas, estacionamento reservado',
      coordinate: { latitude: -23.5430, longitude: -46.6380 },
      rating: 3.8,
      type: 'leisure',
      features: ['ramp', 'parking']
    },
    {
      id: '4',
      title: 'Ponto de Ônibus Adaptado',
      description: 'Piso tátil, rampa de acesso',
      coordinate: { latitude: -23.5505, longitude: -46.6380 },
      rating: 4.0,
      type: 'transport',
      features: ['tactile_paving', 'ramp']
    }
  ];

  // Rota acessível mockada
  const mockAccessibleRoute = [
    { latitude: -23.5605, longitude: -46.6333 },
    { latitude: -23.5585, longitude: -46.6350 },
    { latitude: -23.5570, longitude: -46.6380 },
    { latitude: -23.5540, longitude: -46.6400 },
    { latitude: -23.5505, longitude: -46.6380 }
  ];

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          return true;
        }
        return false;
      } catch (error) {
        console.log('Erro ao solicitar permissão de localização (iOS)', error);
        return false;
      }
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permissão de Localização",
            message: "Este app precisa acessar sua localização para mostrar rotas acessíveis.",
            buttonNeutral: "Pergunte-me depois",
            buttonNegative: "Cancelar",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Erro ao solicitar permissão de localização (Android)', err);
        return false;
      }
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const hasPermission = await requestLocationPermission();
        
        if (!hasPermission) {
          console.log('Permissão de localização negada');
          setMapAvailable(false);
          setErrorMsg('Permissão de localização negada');
        }

        try {
          // Simulando localização fixa (Centro de São Paulo) já que não temos API
          setLocation({
            latitude: -23.5505,
            longitude: -46.6333,
          });
        } catch (error) {
          console.log('Erro ao acessar geolocalização:', error);
          setMapAvailable(false);
          setErrorMsg('Serviço de localização indisponível');
        }
      } catch (error) {
        console.log('Erro na inicialização:', error);
        setMapAvailable(false);
        setErrorMsg('Não foi possível inicializar os serviços de mapa');
      } finally {
        setTimeout(() => {
          setAccessiblePlaces(mockAccessiblePlaces);
          setIsLoading(false);
        }, 1500);
      }
    };

    initApp();
  }, []);

  const filterPlaces = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setAccessiblePlaces(mockAccessiblePlaces);
    } else {
      setAccessiblePlaces(
        mockAccessiblePlaces.filter(place => place.features.includes(filter))
      );
    }
  };

  const showRoute = (placeId) => {
    setSelectedRoute(mockAccessibleRoute);
  };

  const renderFeatureIcon = (feature) => {
    switch (feature) {
      case 'ramp':
        return <IconFA name="wheelchair" size={14} color="#00f2fe" />;
      case 'bathroom':
        return <IconFA name="restroom" size={14} color="#00f2fe" />;
      case 'parking':
        return <IconFA name="parking" size={14} color="#00f2fe" />;
      case 'elevator':
        return <Icon name="elevator" size={14} color="#00f2fe" />;
      case 'tactile_paving':
        return <Icon name="texture" size={14} color="#00f2fe" />;
      case 'braille':
        return <IconFA name="braille" size={14} color="#00f2fe" />;
      default:
        return null;
    }
  };

  const renderMapArea = () => {
    if (isLoading) {
      return (
        <View style={[styles.mapPlaceholder, styles.centered]}>
          <ActivityIndicator size="large" color="#00f2fe" />
          <Text style={styles.loadingText}>Carregando mapa de acessibilidade...</Text>
        </View>
      );
    }

    if (!mapAvailable) {
      return (
        <View style={[styles.mapPlaceholder, styles.centered]}>
          <Icon name="map-off" size={48} color="#00f2fe" />
          <Text style={styles.mapUnavailableTitle}>Mapa Temporariamente Indisponível</Text>
          <Text style={styles.mapUnavailableText}>
            {errorMsg || "Não foi possível carregar o mapa. Verifique sua conexão com a internet ou permissões de localização."}
          </Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <SimulatedMap 
          location={location}
          accessiblePlaces={accessiblePlaces}
          selectedRoute={selectedRoute}
        />
        
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Icon name="my-location" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Icon name="add-location" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00f2fe" />
        <Text style={styles.loadingText}>Carregando informações de acessibilidade...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NAVEGAÇÃO</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterActive]}
          onPress={() => filterPlaces('all')}>
          <Text style={styles.filterText}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'ramp' && styles.filterActive]}
          onPress={() => filterPlaces('ramp')}>
          <IconFA name="wheelchair" size={16} color="#fff" />
          <Text style={styles.filterText}>Rampas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'bathroom' && styles.filterActive]}
          onPress={() => filterPlaces('bathroom')}>
          <IconFA name="restroom" size={16} color="#fff" />
          <Text style={styles.filterText}>Banheiros</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'parking' && styles.filterActive]}
          onPress={() => filterPlaces('parking')}>
          <IconFA name="parking" size={16} color="#fff" />
          <Text style={styles.filterText}>Estacionamento</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'tactile_paving' && styles.filterActive]}
          onPress={() => filterPlaces('tactile_paving')}>
          <Icon name="texture" size={16} color="#fff" />
          <Text style={styles.filterText}>Piso Tátil</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderMapArea()}

      <View style={styles.placesListContainer}>
        <Text style={styles.sectionTitle}>Locais Acessíveis Próximos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {accessiblePlaces.map(place => (
            <TouchableOpacity 
              key={place.id} 
              style={styles.placeCard}
              onPress={() => showRoute(place.id)}
            >
              <View style={styles.placeIconContainer}>
                <IconFA 
                  name={place.type === 'restaurant' ? 'utensils' : 
                        place.type === 'shopping' ? 'shopping-bag' : 
                        place.type === 'leisure' ? 'tree' : 'bus'}
                  size={20} 
                  color="#fff" />
              </View>
              <Text style={styles.placeTitle} numberOfLines={1}>{place.title}</Text>
              <View style={styles.ratingContainer}>
                <IconFA name="star" solid size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.featuresContainer}>
                {place.features.map((feature, index) => (
                  <View key={index} style={styles.featureIcon}>
                    {renderFeatureIcon(feature)}
                  </View>
                ))}
              </View>
              <View style={styles.routeButton}>
                <IconFA name="route" size={12} color="#fff" />
                <Text style={styles.routeButtonText}>Rota</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 20
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#00f2fe',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 15,
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
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  mapContainer: {
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#1a1f27',
    borderWidth: 1,
    borderColor: '#2a2e35',
    position: 'relative'
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7
  },
  simulatedMarker: {
    position: 'absolute',
    backgroundColor: '#00f2fe',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ translateX: -12 }, { translateY: -12 }]
  },
  userLocation: {
    position: 'absolute',
    backgroundColor: '#00f2fe',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ translateX: -8 }, { translateY: -8 }]
  },
  simulatedRouteContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  simulatedRoutePoint: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 242, 254, 0.5)',
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateX: -4 }, { translateY: -4 }]
  },
  mapPlaceholder: {
    height: 300,
    borderRadius: 15,
    backgroundColor: '#1c2331',
    marginBottom: 15,
    padding: 20,
  },
  mapUnavailableTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  mapUnavailableText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    maxWidth: '80%',
  },
  retryButton: {
    backgroundColor: '#00f2fe',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#0a0e14',
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
  controlButton: {
    backgroundColor: 'rgba(10, 14, 20, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  placesListContainer: {
    marginTop: 10,
  },
  placeCard: {
    backgroundColor: '#1c2331',
    borderRadius: 15,
    padding: 15,
    width: 150,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeIconContainer: {
    backgroundColor: '#273349',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  featureIcon: {
    backgroundColor: 'rgba(0, 242, 254, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginBottom: 5,
  },
  routeButton: {
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  routeButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 5,
  }
});

export default MapsScreen;