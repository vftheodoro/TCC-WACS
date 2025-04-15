import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Vibration,
  Modal,
  Animated,
  Easing,
  SafeAreaView,
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const COMMANDS = {
  F: { color: '#00f2fe', icon: 'arrow-up-bold', label: 'Frente' },
  B: { color: '#00f2fe', icon: 'arrow-down-bold', label: 'Ré' },
  E: { color: '#00f2fe', icon: 'arrow-left-bold', label: 'Esquerda' },
  D: { color: '#00f2fe', icon: 'arrow-right-bold', label: 'Direita' },
  S: { color: '#ff4444', icon: 'stop', label: 'Parar' },
  L: { color: '#ffcc00', icon: 'lightbulb-on', label: 'Farol' },
  Z: { color: '#ff9900', icon: 'alarm', label: 'Buzina' },
  X: { color: '#ff4444', icon: 'alert-octagon', label: 'Emergência' }
};

const MIN_POWER = 25;
const MAX_POWER = 100;
const REVERSE_MAX = 60;

const ControlScreen = () => {
  const [connected, setConnected] = useState(false);
  const [commandLog, setCommandLog] = useState([]);
  const [speed, setSpeed] = useState(MIN_POWER);
  const [lastCommand, setLastCommand] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [distance, setDistance] = useState(null);
  const [alert, setAlert] = useState(null);
  const [battery, setBattery] = useState(75);
  const [headlight, setHeadlight] = useState(false);
  const [buzzer, setBuzzer] = useState(false);
  const [usageTime, setUsageTime] = useState(0);
  const [reverseMode, setReverseMode] = useState(false);
  const [emergency, setEmergency] = useState(false);
  
  const flashAnim = useRef(new Animated.Value(0)).current;
  const socketRef = useRef(null);

  // Simulação de conexão Bluetooth
  useEffect(() => {
    // Em uma implementação real, aqui seria a conexão com o dispositivo Bluetooth
    const timer = setTimeout(() => {
      setConnected(true);
      setBattery(85);
      setUsageTime(1250);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAlert = (alertType) => {
    let alertMessage = '';
    let vibrationPattern = [500];
    
    switch(alertType) {
      case 'OBSTACLE':
        alertMessage = 'OBSTÁCULO PRÓXIMO!';
        vibrationPattern = [500, 200, 500];
        break;
      case 'LOW_BATTERY':
        alertMessage = 'BATERIA FRACA!';
        vibrationPattern = [1000, 500];
        break;
      case 'DISCONNECTED':
        alertMessage = 'CONEXÃO PERDIDA!';
        vibrationPattern = [100, 100, 100, 500];
        break;
      case 'EMERGENCY':
        alertMessage = 'MODO EMERGÊNCIA ATIVADO!';
        vibrationPattern = [200, 100, 200, 100, 200];
        break;
      default:
        alertMessage = 'ALERTA: ' + alertType;
    }
    
    setAlert(alertMessage);
    Vibration.vibrate(vibrationPattern);
    
    // Flash animation
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ]).start();
    
    setTimeout(() => setAlert(null), 5000);
  };

  const sendCommand = (command) => {
    if (!connected) {
      setShowConnectionModal(true);
      return;
    }
    
    try {
      Vibration.vibrate(50);
      
      // Simulação de envio de comando
      console.log(`Comando enviado: ${command} com velocidade ${speed}%`);
      
      const newLog = {
        id: Date.now().toString(),
        commandKey: command,
        command: COMMANDS[command]?.label || command,
        timestamp: new Date().toLocaleTimeString(),
        speedPercentage: speed,
      };
      
      setCommandLog(prev => [newLog, ...prev.slice(0, 4)]);
      setLastCommand(command);
      
      if (command === 'X') {
        const newEmergencyState = !emergency;
        setEmergency(newEmergencyState);
        if (newEmergencyState) {
          handleAlert('EMERGENCY');
        }
      }
      
      if (command === 'L') {
        setHeadlight(prev => !prev);
      }

      if (command === 'B') {
        setReverseMode(true);
        setDistance(Math.floor(Math.random() * 100) + 1);
      } else if (command !== 'S') {
        setReverseMode(false);
      }

      if (command === 'Z') {
        setBuzzer(true);
        setTimeout(() => setBuzzer(false), 1000);
      }
    } catch (error) {
      console.log('Erro de comunicação:', error);
      handleAlert('COMMUNICATION_ERROR');
    }
  };

  const connectDevice = () => {
    setConnected(true);
    setShowConnectionModal(false);
    sendCommand('S'); // Envia comando de parada ao conectar
    Alert.alert('Conectado', 'Dispositivo conectado com sucesso!');
  };

  const disconnectDevice = () => {
    setConnected(false);
    setShowConnectionModal(false);
    Alert.alert('Desconectado', 'Dispositivo desconectado com sucesso!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const ControlButton = ({ command, size = 80, style }) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: connected ? '#141a24' : '#0d1218',
          borderColor: connected 
            ? (lastCommand === command ? COMMANDS[command].color : '#333') 
            : '#333',
          ...style,
        },
      ]}
      onPress={() => sendCommand(command)}
      disabled={!connected || emergency}
    >
      <Icon 
        name={COMMANDS[command].icon} 
        size={size * 0.5} 
        color={connected 
          ? (lastCommand === command ? COMMANDS[command].color : '#555') 
          : '#333'} 
      />
    </TouchableOpacity>
  );

  const ConnectionModal = () => (
    <Modal
      transparent
      visible={showConnectionModal}
      animationType="fade"
      onRequestClose={() => setShowConnectionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {connected ? 'Gerenciar Conexão' : 'Dispositivo Desconectado'}
          </Text>
          
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusLed,
              { backgroundColor: connected ? '#00f2fe' : '#ff4444' }
            ]} />
            <Text style={styles.statusText}>
              {connected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
          
          <Text style={styles.modalText}>
            {connected
              ? 'Deseja desconectar da cadeira de rodas?'
              : 'A cadeira de rodas não está conectada. Deseja estabelecer conexão?'}
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowConnectionModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonAction]}
              onPress={connected ? disconnectDevice : connectDevice}
            >
              <Text style={[styles.modalButtonText, { color: '#141a24' }]}>
                {connected ? 'Desconectar' : 'Conectar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Alert Banner */}
        {alert && (
          <Animated.View style={[
            styles.alertBox,
            { opacity: flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.3]
            })}
          ]}>
            <Text style={styles.alertText}>{alert}</Text>
          </Animated.View>
        )}
        
        {/* Status Panel */}
        <View style={styles.statusPanel}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.connectionLed,
                { backgroundColor: connected ? '#00f2fe' : '#ff4444' }
              ]} />
              <Text style={[
                styles.statusValue,
                { color: connected ? '#00f2fe' : '#ff4444' }
              ]}>
                {connected ? 'CONECTADO' : 'DESCONECTADO'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Bateria</Text>
            <View style={styles.statusRow}>
              <Icon 
                name={battery > 30 ? "battery" : battery > 15 ? "battery-50" : "battery-alert"} 
                size={20} 
                color={
                  battery > 30 ? '#00f2fe' : 
                  battery > 15 ? '#ffcc00' : '#ff4444'
                } 
              />
              <Text style={[
                styles.statusValue,
                { 
                  color: battery > 30 ? 'white' : 
                        battery > 15 ? '#ffcc00' : '#ff4444'
                }
              ]}>
                {battery}%
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Uso</Text>
            <Text style={styles.statusValue}>
              {formatTime(usageTime)}
            </Text>
          </View>
        </View>
        
        {/* Control Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧭 Controle Direcional</Text>
          
          <View style={styles.controlContainer}>
            <View style={styles.dPad}>
              <ControlButton command="F" style={{ top: 0, left: 110 }} />
              <ControlButton command="E" style={{ top: 110, left: 0 }} />
              <ControlButton command="D" style={{ top: 110, right: 0 }} />
              <ControlButton command="B" style={{ bottom: 0, left: 110 }} />
              
              <TouchableOpacity
                style={[
                  styles.stopButton,
                  { 
                    backgroundColor: connected ? '#141a24' : '#0d1218',
                    borderColor: connected ? '#ff4444' : '#333'
                  }
                ]}
                onPress={() => sendCommand('S')}
                disabled={!connected || emergency}
              >
                <Icon 
                  name={COMMANDS.S.icon} 
                  size={32} 
                  color={connected ? '#ff4444' : '#333'} 
                />
                <Text style={[
                  styles.buttonText, 
                  { color: connected ? '#ff4444' : '#333' }
                ]}>
                  {COMMANDS.S.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Speed Control */}
          <View style={styles.speedContainer}>
            <Text style={styles.speedLabel}>
              Potência: {speed}%
              {reverseMode && ` (Limitado a ${REVERSE_MAX}% em Ré)`}
            </Text>
            
            <Slider
              style={styles.slider}
              minimumValue={MIN_POWER}
              maximumValue={reverseMode ? REVERSE_MAX : MAX_POWER}
              step={1}
              value={speed}
              minimumTrackTintColor={connected ? "#00f2fe" : "#333"}
              maximumTrackTintColor={connected ? "#1e2833" : "#0d1218"}
              thumbTintColor={connected ? "#00f2fe" : "#333"}
              onValueChange={setSpeed}
              disabled={!connected || emergency}
            />
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ajustes Rápidos</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickButton,
                !connected && styles.disabled,
                headlight && styles.quickButtonActive
              ]}
              onPress={() => sendCommand('L')}
              disabled={!connected || emergency}
            >
              <Icon 
                name={headlight ? 'lightbulb-on' : 'lightbulb-outline'} 
                size={24} 
                color={
                  connected 
                    ? (headlight ? '#ffcc00' : '#00f2fe') 
                    : '#333'
                } 
              />
              <Text style={[
                styles.quickButtonText,
                { color: connected ? (headlight ? '#ffcc00' : '#00f2fe') : '#333' }
              ]}>
                Farol
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.quickButton,
                !connected && styles.disabled
              ]}
              onPress={() => sendCommand('Z')}
              disabled={!connected || emergency}
            >
              <Icon 
                name="alarm" 
                size={24} 
                color={connected ? '#ff9900' : '#333'} 
              />
              <Text style={[
                styles.quickButtonText,
                { color: connected ? '#ff9900' : '#333' }
              ]}>
                Buzina
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.quickButton,
                !connected && styles.disabled,
                styles.emergencyButton,
                emergency && styles.emergencyButtonActive
              ]}
              onPress={() => sendCommand('X')}
              disabled={!connected}
            >
              <Icon 
                name="alert-octagon" 
                size={24} 
                color={emergency ? 'white' : '#141a24'} 
              />
              <Text style={[
                styles.quickButtonText,
                { color: emergency ? 'white' : '#141a24' }
              ]}>
                Emergência
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Distance Indicator (only visible in reverse mode) */}
        {reverseMode && distance !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📏 Sensor de Distância</Text>
            <View style={[
              styles.distanceIndicator,
              { backgroundColor: distance < 30 ? '#ff4444' : '#00f2fe' }
            ]}>
              <Text style={styles.distanceText}>
                {distance.toFixed(1)} cm
              </Text>
              {distance < 30 && (
                <Text style={styles.distanceWarning}>OBSTÁCULO PRÓXIMO!</Text>
              )}
            </View>
          </View>
        )}
        
        {/* Command Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔁 Histórico de Comandos</Text>
          
          {commandLog.length > 0 ? (
            commandLog.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logText}>
                  [{log.timestamp}] {log.command} - {log.speedPercentage}%
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.logItem}>
              <Text style={styles.logText}>Nenhum comando registrado</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Connection Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          connected ? styles.floatingDisconnect : styles.floatingConnect
        ]}
        onPress={() => setShowConnectionModal(true)}
      >
        <Icon 
          name={connected ? 'link-off' : 'link'} 
          size={20} 
          color="#141a24" 
        />
        <Text style={styles.floatingButtonText}>
          {connected ? 'Desconectar' : 'Conectar'}
        </Text>
      </TouchableOpacity>
      
      <ConnectionModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0e14',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  alertBox: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statusPanel: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    color: '#8899a6',
    fontSize: 12,
    marginBottom: 5,
  },
  statusValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  connectionLed: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  controlContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dPad: {
    position: 'relative',
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  controlButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  stopButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
    top: 100,
    left: 100,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  speedContainer: {
    width: '100%',
    marginTop: 15,
  },
  speedLabel: {
    color: '#8899a6',
    fontSize: 14,
    marginBottom: 10,
  },
  slider: {
    height: 10,
    borderRadius: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#1e2833',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  quickButtonActive: {
    borderColor: '#ffcc00',
  },
  quickButtonText: {
    marginTop: 5,
    fontWeight: '600',
    fontSize: 12,
  },
  emergencyButton: {
    backgroundColor: '#ff4444',
  },
  emergencyButtonActive: {
    backgroundColor: '#141a24',
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  distanceIndicator: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceText: {
    color: '#141a24',
    fontSize: 24,
    fontWeight: 'bold',
  },
  distanceWarning: {
    color: '#141a24',
    fontWeight: 'bold',
    marginTop: 5,
  },
  logItem: {
    backgroundColor: '#1e2833',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  logText: {
    color: '#8899a6',
    fontSize: 12,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingConnect: {
    backgroundColor: '#00f2fe',
  },
  floatingDisconnect: {
    backgroundColor: '#ff4444',
  },
  floatingButtonText: {
    color: '#141a24',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: '#141a24',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  modalTitle: {
    color: '#00f2fe',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLed: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#1e2833',
    borderWidth: 1,
    borderColor: '#8899a6',
  },
  modalButtonAction: {
    backgroundColor: '#00f2fe',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ControlScreen;