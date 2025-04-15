import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PairingScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [error, setError] = useState('');

  // Simulação de dispositivos Bluetooth
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setDevices([
          { id: '1', name: 'WACS-Controller-01', signal: 'strong' },
          { id: '2', name: 'WACS-Controller-02', signal: 'medium' },
          { id: '3', name: 'HC-05', signal: 'weak' },
        ]);
        setIsScanning(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const startScan = () => {
    setError('');
    setIsScanning(true);
    setDevices([]);
  };

  const connectToDevice = (device) => {
    setIsConnecting(true);
    setError('');
    
    // Simulação de conexão
    setTimeout(() => {
      setIsConnecting(false);
      if (device.name.startsWith('WACS')) {
        setConnectedDevice(device);
        setTimeout(() => navigation.navigate('Main'), 1000);
      } else {
        setError('Falha ao conectar. Dispositivo não compatível.');
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={require('../assets/bluetooth.png')}
          style={styles.bluetoothIcon}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Conectar Dispositivo</Text>
        <Text style={styles.subtitle}>
          {connectedDevice 
            ? `Conectado a ${connectedDevice.name}`
            : 'Selecione seu dispositivo WACS na lista abaixo'}
        </Text>
        
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
            <Text style={styles.devicesTitle}>DISPOSITIVOS DISPONÍVEIS</Text>
            
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
                    color="#00f2fe" 
                  />
                  <Text style={styles.deviceName}>{device.name}</Text>
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
      </ScrollView>
      
      {connectedDevice && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.continueButtonText}>CONTINUAR PARA O APP</Text>
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
  },
  bluetoothIcon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
    tintColor: '#00f2fe',
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
    marginBottom: 30,
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
  devicesTitle: {
    color: '#7a828a',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
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
  },
  deviceName: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
  },
  instructionsContainer: {
    backgroundColor: '#1a1f27',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2e35',
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
  continueButton: {
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: '#0a0e14',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default PairingScreen;