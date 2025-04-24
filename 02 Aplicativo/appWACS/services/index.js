/**
 * Ponto de entrada para os serviços da aplicação
 * Este arquivo exporta os serviços adequados dependendo do ambiente
 */

import { Platform } from 'react-native';

// Importar serviço mock para desenvolvimento e testes
import BluetoothServiceMock from './BluetoothServiceMock';

// Se você realmente quiser forçar o uso do mock, defina global.USE_BLUETOOTH_MOCK = true antes de carregar os serviços
const isDevelopmentMode = __DEV__;

// Exportar o serviço Bluetooth apropriado
let BluetoothService;

try {
  // Log para debug: mostrar qual serviço será usado
  console.log('BluetoothService: ambiente __DEV__ =', __DEV__, 'global.__BRIDGELESS__ =', global.__BRIDGELESS__);

  // Tentar sempre usar o serviço real primeiro
  const RealBluetoothService = require('./BluetoothService').default;

  // Se quisermos forçar o mock, ou se estivermos num ambiente Bridgeless, lançamos para catch
  if (global.USE_BLUETOOTH_MOCK === true || global.__BRIDGELESS__ === true) {
    throw new Error('Mock forçado ou ambiente Bridgeless activo');
  }

  // Checagem simples para garantir que o BleManager foi criado corretamente
  if (!RealBluetoothService || !RealBluetoothService.manager) {
    throw new Error('BluetoothService real não pôde ser inicializado');
  }

  console.log('Usando BluetoothService real');
  BluetoothService = RealBluetoothService;
} catch (error) {
  console.warn('BluetoothService real indisponível. Usando versão mock. Motivo:', error?.message || error);
  BluetoothService = BluetoothServiceMock;
}

export { BluetoothService };
