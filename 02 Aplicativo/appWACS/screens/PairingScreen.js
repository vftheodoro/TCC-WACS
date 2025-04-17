import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, RefreshControl, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PairingScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Check for initial connection prompt
  useEffect(() => {
    const checkFirstLaunch = async () => {
      const firstLaunch = await AsyncStorage.getItem('@firstLaunch');
      if (firstLaunch === null) {
        AsyncStorage.setItem('@firstLaunch', 'false');
        showConnectionPrompt();
      }
    };
    checkFirstLaunch();
  }, []);

  const showConnectionPrompt = () => {
    Alert.alert(
      'Conectar agora?',
      'Deseja conectar à cadeira de rodas agora?',
      [
        { 
          text: 'Agora não', 
          onPress: () => navigation.navigate('Main'), 
          style: 'cancel' 
        },
        { 
          text: 'Sim', 
          onPress: () => startScan() 
        },
      ]
    );
  };

  // Load previously connected device
  useEffect(() => {
    const loadConnectedDevice = async () => {
      const savedDevice = await AsyncStorage.getItem('@connectedDevice');
      if (savedDevice) {
        setConnectedDevice(JSON.parse(savedDevice));
      }
    };
    loadConnectedDevice();
  }, []);

  // Simulate Bluetooth scanning
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setDevices([
          { id: '1', name: 'WACS-Controller-01', signal: 'strong', strength: -40 },
          { id: '2', name: 'WACS-Controller-02', signal: 'medium', strength: -65 },
          { id: '3', name: 'HC-05', signal: 'weak', strength: -85 },
        ]);
        setIsScanning(false);
        setRefreshing(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const startScan = () => {
    setError('');
    setIsScanning(true);
    setDevices([]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    startScan();
  };

  const connectToDevice = async (device) => {
    setIsConnecting(true);
    setError('');
    
    // Simulate connection with 30% chance of failure
    const willFail = Math.random() < 0.3;
    
    setTimeout(async () => {
      setIsConnecting(false);
      
      if (!willFail && device.name.startsWith('WACS')) {
        setConnectedDevice(device);
        await AsyncStorage.setItem('@connectedDevice', JSON.stringify(device));
        Vibration.vibrate(100);
        
        // Show success message
        Alert.alert(
          'Conectado!',
          `Conexão estabelecida com ${device.name}`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Main') 
            }
          ]
        );
      } else {
        setError(willFail 
          ? 'Falha na conexão. Tente novamente.' 
          : 'Falha ao conectar. Dispositivo não compatível.');
      }
    }, 1500);
  };

  const getSignalStrengthText = (strength) => {
    if (strength > -50) return 'Excelente';
    if (strength > -70) return 'Bom';
    if (strength > -85) return 'Fraco';
    return 'Muito Fraco';
  };

  const getSignalColor = (strength) => {
    if (strength > -50) return '#2ecc71';
    if (strength > -70) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00f2fe']}
            tintColor="#00f2fe"
          />
        }
      >
        <View style={styles.header}>
          <Image 
            source={require('../assets/bluetooth.png')}
            style={[styles.bluetoothIcon, isScanning && styles.scanningIcon]}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Conectar Dispositivo</Text>
          <Text style={styles.subtitle}>
            {connectedDevice 
              ? `Conectado a ${connectedDevice.name}`
              : 'Selecione seu dispositivo WACS na lista abaixo'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={startScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#0a0e14" />
          ) : (
            <Text style={styles.scanButtonText}>
              {devices.length > 0 ? 'BUSCAR NOVAMENTE' : 'BUSCAR DISPOSITIVOS'}
            </Text>
          )}
        </TouchableOpacity>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {isScanning && devices.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00f2fe" />
            <Text style={styles.loadingText}>Buscando dispositivos...</Text>
          </View>
        )}
        
        {devices.length > 0 && (
          <View style={styles.devicesContainer}>
            <View style={styles.devicesHeader}>
              <Text style={styles.devicesTitle}>DISPOSITIVOS DISPONÍVEIS</Text>
              <TouchableOpacity onPress={() => setShowInstructions(!showInstructions)}>
                <Icon name="help-circle" size={24} color="#7a828a" />
              </TouchableOpacity>
            </View>
            
            {devices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceButton,
                  connectedDevice?.id === device.id && styles.connectedDevice
                ]}
                onPress={() => connectToDevice(device)}
                disabled={isConnecting}
              >
                <View style={styles.deviceInfo}>
                  <Icon 
                    name={device.signal === 'strong' ? 'wifi-strength-4' : 
                          device.signal === 'medium' ? 'wifi-strength-2' : 'wifi-strength-1'} 
                    size={24} 
                    color={getSignalColor(device.strength)} 
                  />
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={[styles.signalText, { color: getSignalColor(device.strength) }]}>
                      {getSignalStrengthText(device.strength)}
                    </Text>
                  </View>
                </View>
                
                {isConnecting && connectedDevice?.id === device.id ? (
                  <ActivityIndicator color="#00f2fe" />
                ) : (
                  <Icon 
                    name={connectedDevice?.id === device.id ? 'check-circle' : 'link'} 
                    size={24} 
                    color={connectedDevice?.id === device.id ? '#00f2fe' : '#7a828a'} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {showInstructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instruções de Pareamento</Text>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Certifique-se que o dispositivo WACS está ligado e com o Bluetooth ativado
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Clique em "Buscar Dispositivos" para listar os dispositivos disponíveis
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Selecione o dispositivo WACS na lista para iniciar a conexão
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {!connectedDevice && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.skipButtonText}>PULAR CONEXÃO</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bluetoothIcon: {
    width: 80,
    height: 80,
    tintColor: '#00f2fe',
    marginBottom: 15,
  },
  scanningIcon: {
    transform: [{ rotate: '0deg' }],
  },
  title: {
    color: '#00f2fe',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#7a828a',
    fontSize: 16,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#0a0e14',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  loadingText: {
    color: '#7a828a',
    marginTop: 10,
  },
  devicesContainer: {
    marginBottom: 30,
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  devicesTitle: {
    color: '#7a828a',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  deviceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1f27',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2e35',
  },
  connectedDevice: {
    borderColor: '#00f2fe',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 15,
  },
  deviceName: {
    color: 'white',
    fontSize: 16,
  },
  signalText: {
    fontSize: 12,
    marginTop: 2,
  },
  instructionsContainer: {
    backgroundColor: '#1a1f27',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2e35',
    marginBottom: 20,
  },
  instructionsTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stepNumber: {
    backgroundColor: '#00f2fe',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#0a0e14',
    fontWeight: 'bold',
  },
  instructionText: {
    color: 'white',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7a828a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#7a828a',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default PairingScreen;