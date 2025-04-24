/**
 * Configurações específicas para o controle da cadeira de rodas WACS
 * Este arquivo contém constantes e configurações para a comunicação Bluetooth
 * com o dispositivo da cadeira de rodas.
 */

// Identificadores Bluetooth para o dispositivo WACS
export const BLUETOOTH_CONFIG = {
  // UUIDs para serviço e características (padrão HC-05/HC-06)
  SERVICE_UUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC_UUID: '0000ffe1-0000-1000-8000-00805f9b34fb',
  
  // Prefixo para identificar dispositivos WACS
  DEVICE_NAME_PREFIX: 'WACS',
  
  // Tempo máximo de escaneamento em ms
  SCAN_TIMEOUT: 10000,
  
  // Intervalo de atualização de dados em ms
  UPDATE_INTERVAL: 1000,
  
  // Tempo máximo para tentativa de conexão em ms
  CONNECTION_TIMEOUT: 5000,
};

// Comandos para controle da cadeira
export const COMMANDS = {
  // Movimentação
  FORWARD: 'F',      // Frente
  BACKWARD: 'B',     // Ré
  LEFT: 'E',         // Esquerda
  RIGHT: 'D',        // Direita
  STOP: 'S',         // Parar
  
  // Funcionalidades
  HEADLIGHT: 'L',    // Farol
  BUZZER: 'Z',       // Buzina
  EMERGENCY: 'X',    // Emergência
  
  // Comandos de sistema
  GET_STATUS: 'G',   // Obter status do dispositivo
  RESET: 'R',        // Reiniciar controlador
};

// Limites de velocidade
export const SPEED_LIMITS = {
  MIN: 25,           // Velocidade mínima (%)
  MAX: 100,          // Velocidade máxima (%)
  REVERSE_MAX: 60,   // Velocidade máxima em ré (%)
  DEFAULT: 50,       // Velocidade padrão (%)
};

// Formato dos comandos enviados
export const COMMAND_FORMAT = {
  // Comando: CMD:X;SPD:50
  // X = comando (F, B, E, D, S, L, Z, X)
  // SPD = velocidade em porcentagem
  TEMPLATE: 'CMD:{command};SPD:{speed}',
  
  // Resposta esperada: BAT:85;DIST:120;LIGHT:1
  // BAT = nível de bateria em porcentagem
  // DIST = distância em cm
  // LIGHT = status do farol (0 = desligado, 1 = ligado)
  RESPONSE_REGEX: /([A-Z]+):([^;]+)/g,
};

// Configurações de segurança
export const SAFETY_CONFIG = {
  // Distância mínima para alerta de obstáculo (cm)
  MIN_OBSTACLE_DISTANCE: 30,
  
  // Nível mínimo de bateria para alerta (%)
  LOW_BATTERY_THRESHOLD: 20,
  
  // Tempo máximo sem comunicação antes de considerar desconectado (ms)
  CONNECTION_TIMEOUT: 3000,
  
  // Velocidade máxima quando obstáculo detectado (%)
  OBSTACLE_DETECTED_MAX_SPEED: 30,
};

export default {
  BLUETOOTH_CONFIG,
  COMMANDS,
  SPEED_LIMITS,
  COMMAND_FORMAT,
  SAFETY_CONFIG,
};
