import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline as MapPolyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Polyline from '@mapbox/polyline';

const MapScreen = () => {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);

  const centralizarNoUsuario = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    let location = await Location.getCurrentPositionAsync({});
    const novaRegiao = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(novaRegiao);
    setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    if (mapRef.current) {
      mapRef.current.animateToRegion(novaRegiao, 1000);
    }
  };

  useEffect(() => {
    centralizarNoUsuario();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        loadingEnabled={true}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Minha Localização"
          />
        )}
        {routeCoords.length > 0 && (
          <MapPolyline
            coordinates={routeCoords}
            strokeColor="#007bff"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
