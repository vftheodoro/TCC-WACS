/**
 * Serviço Bluetooth Mock para desenvolvimento e testes
 * Este serviço simula o comportamento do BluetoothService real
 * para permitir o desenvolvimento sem depender de hardware Bluetooth
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constantes para simulação
const MOCK_DEVICES = [
  { id: 'wacs-01', name: 'WACS-Controller-01', rssi: -45 },
  { id: 'wacs-02', name: 'WACS-Controller-02', rssi: -65 },
  { id: 'hc-05', name: 'HC-05', rssi: -85 }
];

class BluetoothServiceMock {
  constructor() {
    this.device = null;
    this.isConnected = false;
    this.isScanning = false;
    this.listeners = [];
    this.connectionListeners = [];
    this.dataListeners = [];
    this.batteryLevel = 75;
    this.distance = 120;
    this.headlightStatus = false;
    
    console.log('[BluetoothServiceMock] Inicializado no modo de simulação');
  }

  // Solicitar permissões necessárias para o Bluetooth (simulado)
  async requestPermissions() {
    console.log('[BluetoothServiceMock] Permissões solicitadas e concedidas (simulado)');
    return true;
  }

  // Iniciar o serviço Bluetooth (simulado)
  async start() {
    console.log('[BluetoothServiceMock] Serviço iniciado (simulado)');
    return Promise.resolve(true);
  }

  // Iniciar escaneamento de dispositivos (simulado)
  async startScan() {
    console.log('[BluetoothServiceMock] Iniciando escaneamento (simulado)');
    
    if (this.isScanning) {
      await this.stopScan();
    }

    this.isScanning = true;
    this.notifyListeners('scanStart');
    
    // Simular descoberta de dispositivos após um pequeno atraso
    setTimeout(() => {
      MOCK_DEVICES.forEach(device => {
        this.notifyListeners('deviceFound', device);
      });
      
      setTimeout(() => {
        this.stopScan();
      }, 2000);
    }, 1000);
    
    return Promise.resolve();
  }

  // Parar escaneamento (simulado)
  async stopScan() {
    if (this.isScanning) {
      console.log('[BluetoothServiceMock] Escaneamento parado (simulado)');
      this.isScanning = false;
      this.notifyListeners('scanStop');
    }
    return Promise.resolve();
  }

  // Conectar a um dispositivo (simulado)
  async connectToDevice(device) {
    console.log(`[BluetoothServiceMock] Conectando ao dispositivo ${device.name || device.id} (simulado)`);
    
    this.notifyListeners('connecting', device);
    
    // Simular conexão com 20% de chance de falha
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.2;
        
        if (success) {
          this.device = device;
          this.isConnected = true;
          this.batteryLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
          
          // Salvar no AsyncStorage
          AsyncStorage.setItem('@connectedDevice', JSON.stringify({
            id: device.id,
            name: device.name,
            rssi: device.rssi
          }));
          
          this.notifyListeners('connected', device);
          this.startDataSimulation();
          
          resolve(device);
        } else {
          this.notifyListeners('error', { message: 'Falha na conexão simulada' });
          reject(new Error('Falha na conexão simulada'));
        }
      }, 1500);
    });
  }

  // Simular atualizações de dados periódicas
  startDataSimulation() {
    if (this.dataSimulationInterval) {
      clearInterval(this.dataSimulationInterval);
    }
    
    this.dataSimulationInterval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(this.dataSimulationInterval);
        return;
      }
      
      // Simular variação na bateria (diminuindo lentamente)
      this.batteryLevel = Math.max(0, this.batteryLevel - 0.1);
      this.notifyListeners('batteryUpdate', Math.floor(this.batteryLevel));
      
      // Simular variação na distância (aleatória)
      this.distance = Math.floor(Math.random() * 200) + 20;
      this.notifyListeners('distanceUpdate', this.distance);
      
      // Simular dados recebidos
      const data = `BAT:${Math.floor(this.batteryLevel)};DIST:${this.distance};LIGHT:${this.headlightStatus ? '1' : '0'}`;
      this.notifyDataListeners(data);
      
      // Simular alertas ocasionais
      if (Math.random() < 0.05) {
        const alerts = ['OBSTACLE', 'LOW_BATTERY', 'OVERHEATING'];
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        this.notifyListeners('alert', randomAlert);
      }
    }, 2000);
  }

  // Enviar comando para o dispositivo (simulado)
  async sendCommand(command, speed = 50) {
    if (!this.isConnected || !this.device) {
      throw new Error('Dispositivo não conectado');
    }
    
    console.log(`[BluetoothServiceMock] Comando enviado: ${command} com velocidade ${speed} (simulado)`);
    
    // Simular efeitos dos comandos
    switch (command) {
      case 'L': // Farol
        this.headlightStatus = !this.headlightStatus;
        this.notifyListeners('headlightUpdate', this.headlightStatus);
        break;
      case 'B': // Ré - Simular distância menor
        this.distance = Math.floor(Math.random() * 50) + 10;
        this.notifyListeners('distanceUpdate', this.distance);
        break;
    }
    
    return Promise.resolve(true);
  }

  // Desconectar do dispositivo (simulado)
  async disconnect() {
    if (this.isConnected && this.device) {
      console.log('[BluetoothServiceMock] Desconectando (simulado)');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isConnected = false;
          this.device = null;
          
          if (this.dataSimulationInterval) {
            clearInterval(this.dataSimulationInterval);
          }
          
          AsyncStorage.removeItem('@connectedDevice');
          this.notifyListeners('disconnected', { device: this.device });
          
          resolve(true);
        }, 500);
      });
    }
    return Promise.resolve(false);
  }

  // Carregar dispositivo salvo anteriormente (simulado)
  async loadSavedDevice() {
    try {
      const savedDeviceJson = await AsyncStorage.getItem('@connectedDevice');
      
      if (savedDeviceJson) {
        const savedDevice = JSON.parse(savedDeviceJson);
        
        if (savedDevice && savedDevice.id) {
          console.log(`[BluetoothServiceMock] Carregando dispositivo salvo: ${savedDevice.name || savedDevice.id} (simulado)`);
          
          // Simular reconexão com 30% de chance de falha
          if (Math.random() > 0.3) {
            this.device = savedDevice;
            this.isConnected = true;
            this.batteryLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
            
            this.notifyListeners('connected', savedDevice);
            this.startDataSimulation();
            
            return savedDevice;
          } else {
            console.log('[BluetoothServiceMock] Falha ao reconectar ao dispositivo salvo (simulado)');
            await AsyncStorage.removeItem('@connectedDevice');
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('[BluetoothServiceMock] Erro ao carregar dispositivo salvo:', error);
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
        console.error('[BluetoothServiceMock] Erro em listener:', error);
      }
    });
  }

  // Notificar ouvintes sobre dados recebidos
  notifyDataListeners(data) {
    this.dataListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[BluetoothServiceMock] Erro em data listener:', error);
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
    if (this.dataSimulationInterval) {
      clearInterval(this.dataSimulationInterval);
    }
    console.log('[BluetoothServiceMock] Serviço destruído (simulado)');
  }
}

// Exportar uma única instância do serviço
export default new BluetoothServiceMock();
