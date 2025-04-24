import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

// Constantes para o serviço e características do dispositivo WACS
const WACS_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const WACS_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

class BluetoothService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.isConnected = false;
    this.isScanning = false;
    this.listeners = [];
    this.connectionListeners = [];
    this.dataListeners = [];
    this.batteryLevel = 0;
    this.distance = 0;
    this.headlightStatus = false;
  }

  // Solicitar permissões necessárias para o Bluetooth (Android)
  async requestPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const bluetoothScanPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Permissão para buscar dispositivos Bluetooth',
          message: 'O aplicativo precisa de permissão para buscar dispositivos Bluetooth próximos.',
          buttonPositive: 'OK',
        }
      );
      
      const bluetoothConnectPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Permissão para conectar dispositivos Bluetooth',
          message: 'O aplicativo precisa de permissão para conectar a dispositivos Bluetooth.',
          buttonPositive: 'OK',
        }
      );
      
      const fineLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permissão de localização',
          message: 'O aplicativo precisa de permissão de localização para buscar dispositivos Bluetooth.',
          buttonPositive: 'OK',
        }
      );

      return (
        bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
        bluetoothConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
        fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    
    return true;
  }

  // Iniciar o serviço Bluetooth
  async start() {
    return new Promise((resolve, reject) => {
      const subscription = this.manager.onStateChange(state => {
        if (state === 'PoweredOn') {
          subscription.remove();
          resolve(true);
        } else if (state === 'PoweredOff') {
          Alert.alert(
            'Bluetooth Desligado',
            'Por favor, ative o Bluetooth para conectar à cadeira de rodas.',
            [
              { text: 'OK', onPress: () => subscription.remove() }
            ]
          );
          reject('Bluetooth está desligado');
        }
      }, true);
    });
  }

  // Iniciar escaneamento de dispositivos
  async startScan() {
    console.log('[BluetoothService] Iniciando escaneamento REAL');
    console.log('BleManager disponível:', !!this.manager);
    try {
      const hasPermissions = await this.requestPermissions();
      
      if (!hasPermissions) {
        throw new Error('Permissões não concedidas');
      }

      if (this.isScanning) {
        await this.stopScan();
      }

      this.isScanning = true;
      
      // Notificar ouvintes que o escaneamento começou
      this.notifyListeners('scanStart');
      
      return new Promise((resolve, reject) => {
        this.manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            this.isScanning = false;
            this.notifyListeners('error', error);
            reject(error);
            return;
          }
          
          // Filtrar dispositivos com nome que começa com WACS
          if (device && device.name && device.name.startsWith('WACS')) {
            this.notifyListeners('deviceFound', device);
          }
        });
        
        // Parar o escaneamento após 10 segundos
        setTimeout(() => {
          if (this.isScanning) {
            this.stopScan();
            resolve();
          }
        }, 10000);
      });
    } catch (error) {
      this.isScanning = false;
      this.notifyListeners('error', error);
      throw error;
    }
  }

  // Parar escaneamento
  async stopScan() {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      this.notifyListeners('scanStop');
    }
  }

  // Conectar a um dispositivo
  async connectToDevice(device) {
    console.log('[BluetoothService] Tentando conectar ao dispositivo:', device.id);
    try {
      this.notifyListeners('connecting', device);
      
      // Conectar ao dispositivo
      const connectedDevice = await this.manager.connectToDevice(device.id);
      
      // Descobrir serviços e características
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      // Verificar se o dispositivo tem o serviço WACS
      const services = await connectedDevice.services();
      const hasWacsService = services.some(service => service.uuid.toLowerCase() === WACS_SERVICE_UUID.toLowerCase());
      
      if (!hasWacsService) {
        throw new Error('Dispositivo não compatível com WACS');
      }
      
      // Configurar monitoramento de características
      this.setupCharacteristicMonitoring(connectedDevice);
      
      // Salvar dispositivo conectado
      this.device = connectedDevice;
      this.isConnected = true;
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('@connectedDevice', JSON.stringify({
        id: device.id,
        name: device.name,
        rssi: device.rssi
      }));
      
      this.notifyListeners('connected', connectedDevice);
      
      // Configurar monitoramento de desconexão
      connectedDevice.onDisconnected((error, disconnectedDevice) => {
        this.isConnected = false;
        this.device = null;
        this.notifyListeners('disconnected', { error, device: disconnectedDevice });
      });
      
      return connectedDevice;
    } catch (error) {
      this.isConnected = false;
      this.device = null;
      this.notifyListeners('error', error);
      throw error;
    }
  }

  // Configurar monitoramento de características
  async setupCharacteristicMonitoring(device) {
    try {
      // Monitorar a característica de dados
      device.monitorCharacteristicForService(
        WACS_SERVICE_UUID,
        WACS_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            this.notifyListeners('error', error);
            return;
          }
          
          if (characteristic && characteristic.value) {
            const data = Buffer.from(characteristic.value, 'base64').toString('utf8');
            this.processIncomingData(data);
            this.notifyDataListeners(data);
          }
        }
      );
    } catch (error) {
      this.notifyListeners('error', error);
    }
  }

  // Processar dados recebidos do dispositivo
  processIncomingData(data) {
    try {
      // Formato esperado: BAT:85;DIST:120;LIGHT:1
      const parts = data.split(';');
      
      parts.forEach(part => {
        const [key, value] = part.split(':');
        
        switch (key) {
          case 'BAT':
            this.batteryLevel = parseInt(value, 10);
            this.notifyListeners('batteryUpdate', this.batteryLevel);
            break;
          case 'DIST':
            this.distance = parseInt(value, 10);
            this.notifyListeners('distanceUpdate', this.distance);
            break;
          case 'LIGHT':
            this.headlightStatus = value === '1';
            this.notifyListeners('headlightUpdate', this.headlightStatus);
            break;
          case 'ALERT':
            this.notifyListeners('alert', value);
            break;
        }
      });
    } catch (error) {
      console.error('Erro ao processar dados:', error);
    }
  }

  // Enviar comando para o dispositivo
  async sendCommand(command, speed = 50) {
    if (!this.isConnected || !this.device) {
      throw new Error('Dispositivo não conectado');
    }
    
    try {
      // Formato do comando: CMD:X;SPD:50
      const commandString = `CMD:${command};SPD:${speed}`;
      const data = Buffer.from(commandString).toString('base64');
      
      await this.device.writeCharacteristicWithResponseForService(
        WACS_SERVICE_UUID,
        WACS_CHARACTERISTIC_UUID,
        data
      );
      
      return true;
    } catch (error) {
      this.notifyListeners('error', error);
      throw error;
    }
  }

  // Desconectar do dispositivo
  async disconnect() {
    if (this.isConnected && this.device) {
      try {
        await this.device.cancelConnection();
        this.isConnected = false;
        this.device = null;
        await AsyncStorage.removeItem('@connectedDevice');
        this.notifyListeners('disconnected', { device: this.device });
        return true;
      } catch (error) {
        this.notifyListeners('error', error);
        throw error;
      }
    }
    return false;
  }

  // Carregar dispositivo salvo anteriormente
  async loadSavedDevice() {
    try {
      const savedDeviceJson = await AsyncStorage.getItem('@connectedDevice');
      
      if (savedDeviceJson) {
        const savedDevice = JSON.parse(savedDeviceJson);
        
        if (savedDevice && savedDevice.id) {
          try {
            // Tentar reconectar ao dispositivo salvo
            const device = await this.manager.connectToDevice(savedDevice.id);
            await device.discoverAllServicesAndCharacteristics();
            
            // Configurar monitoramento de características
            this.setupCharacteristicMonitoring(device);
            
            this.device = device;
            this.isConnected = true;
            
            this.notifyListeners('connected', device);
            
            // Configurar monitoramento de desconexão
            device.onDisconnected((error, disconnectedDevice) => {
              this.isConnected = false;
              this.device = null;
              this.notifyListeners('disconnected', { error, device: disconnectedDevice });
            });
            
            return device;
          } catch (error) {
            // Se não conseguir conectar, limpar o dispositivo salvo
            await AsyncStorage.removeItem('@connectedDevice');
            return null;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar dispositivo salvo:', error);
      return null;
    }
  }

  // Adicionar ouvinte para eventos
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Adicionar ouvinte para dados
  addDataListener(callback) {
    this.dataListeners.push(callback);
    return () => {
      this.dataListeners = this.dataListeners.filter(listener => listener !== callback);
    };
  }

  // Notificar ouvintes sobre eventos
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Erro em listener de Bluetooth:', error);
      }
    });
  }

  // Notificar ouvintes sobre dados recebidos
  notifyDataListeners(data) {
    this.dataListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Erro em listener de dados:', error);
      }
    });
  }

  // Obter status da conexão
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      device: this.device,
      batteryLevel: this.batteryLevel,
      distance: this.distance,
      headlightStatus: this.headlightStatus
    };
  }

  // Destruir o serviço Bluetooth
  destroy() {
    if (this.device) {
      this.device.cancelConnection();
    }
    this.manager.destroy();
  }
}

// Exportar uma única instância do serviço
export default new BluetoothService();
