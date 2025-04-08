import React, { useState, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Vibration,
  Modal,
} from 'react-native';

const COMMANDS = {
  F: { color: '#00f2fe', icon: '↑' },
  B: { color: '#00f2fe', icon: '↓' },
  E: { color: '#00f2fe', icon: '←' },
  D: { color: '#00f2fe', icon: '→' },
  S: { label: 'Parar', color: '#ff4444', icon: '⏹' },
};

// Potência mínima de 25%
const MIN_POWER = 25;

const ControlScreen = () => {
  const [connected, setConnected] = useState(false);
  const [commandLog, setCommandLog] = useState([]);
  const [speed, setSpeed] = useState(MIN_POWER);
  const [lastCommandKey, setLastCommandKey] = useState(null);
  const [manualSpeed, setManualSpeed] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Verificar status de conexão ao iniciar
  useEffect(() => {
    if (!connected) {
      setShowConnectionModal(true);
    }
  }, []);

  const calculateActualSpeed = (percentage) => 
    Math.round((percentage / 100) * 255);

  useEffect(() => {
    if (connected && lastCommandKey) {
      const debounceTimer = setTimeout(() => {
        sendCommand(lastCommandKey);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [speed, lastCommandKey]);

  const connectChair = () => {
    // Simula a conexão com a cadeira
    setConnected(true);
    setShowConnectionModal(false);
  };

  const sendCommand = async (command) => {
    if (!connected) {
      setShowConnectionModal(true);
      return;
    }
    
    try {
      Vibration.vibrate(50);
      const actualSpeed = calculateActualSpeed(speed);
      const newLog = {
        id: Date.now().toString(),
        commandKey: command,
        command: COMMANDS[command].label || command,
        timestamp: new Date().toLocaleTimeString(),
        speedPercentage: speed,
      };

      setCommandLog(prevLogs => [newLog, ...prevLogs.slice(0, 4)]);
      setLastCommandKey(command);
    } catch (error) {
      console.log('Erro de comunicação');
    }
  };

  const ControlButton = ({ command, style, size = 80 }) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        { 
          backgroundColor: connected ? '#141a24' : '#0d1218',
          width: size,
          height: size,
          borderRadius: size/2,
          borderWidth: 2,
          borderColor: connected ? COMMANDS[command].color : '#333',
          ...style,
        },
      ]}
      onPress={() => sendCommand(command)}
      disabled={!connected}
    >
      <Text style={[
        styles.buttonIcon, 
        { color: connected ? COMMANDS[command].color : '#333' }
      ]}>
        {COMMANDS[command].icon}
      </Text>
    </TouchableOpacity>
  );

  const ConnectionModal = () => (
    <Modal
      transparent={true}
      visible={showConnectionModal}
      animationType="fade"
      onRequestClose={() => setShowConnectionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Dispositivo Desconectado</Text>
          <Text style={styles.modalText}>
            A cadeira de rodas não está conectada. Deseja estabelecer conexão?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowConnectionModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonConnect]}
              onPress={connectChair}
            >
              <Text style={[styles.modalButtonText, {color: '#141a24'}]}>Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ConnectionModal />
        
        {/* Seção de Status */}
        <View style={styles.statusPanel}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, { color: connected ? '#00f2fe' : '#ff4444' }]}>
              {connected ? 'CONECTADO' : 'DESCONECTADO'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Bateria</Text>
            <Text style={[styles.statusValue, { color: connected ? 'white' : '#333' }]}>
              85% 🔋
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Potência</Text>
            <Text style={[styles.statusValue, { color: connected ? 'white' : '#333' }]}>
              {speed}%
            </Text>
          </View>
        </View>

        {/* Seção de Controle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: connected ? '#00f2fe' : '#333' }]}>
            🧭 Controle Direcional
          </Text>
          
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
                disabled={!connected}
              >
                <Text style={[
                  styles.buttonIcon, 
                  { fontSize: 32, color: connected ? '#ff4444' : '#333' }
                ]}>
                  {COMMANDS.S.icon}
                </Text>
                <Text style={[
                  styles.buttonText, 
                  { color: connected ? '#ff4444' : '#333' }
                ]}>
                  {COMMANDS.S.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.speedContainer}>
            <View style={styles.speedTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.speedTypeButton,
                  manualSpeed && styles.speedTypeActive,
                  !connected && styles.disabled
                ]}
                onPress={() => connected && setManualSpeed(true)}
                disabled={!connected}
              >
                <Text style={[
                  styles.speedTypeText,
                  manualSpeed && styles.speedTypeTextActive,
                  !connected && styles.disabledText
                ]}>
                  Manual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.speedTypeButton,
                  !manualSpeed && styles.speedTypeActive,
                  !connected && styles.disabled
                ]}
                onPress={() => connected && setManualSpeed(false)}
                disabled={!connected}
              >
                <Text style={[
                  styles.speedTypeText,
                  !manualSpeed && styles.speedTypeTextActive,
                  !connected && styles.disabledText
                ]}>
                  Automático
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.speedLabel, { color: connected ? '#8899a6' : '#333' }]}>
              Potência: {speed}%
            </Text>

            {manualSpeed && (
              <Slider
                style={styles.slider}
                minimumValue={MIN_POWER}
                maximumValue={100}
                step={1}
                value={speed}
                minimumTrackTintColor={connected ? "#00f2fe" : "#333"}
                maximumTrackTintColor={connected ? "#1e2833" : "#0d1218"}
                thumbTintColor={connected ? "#00f2fe" : "#333"}
                onValueChange={(value) => setSpeed(Math.round(value))}
                disabled={!connected}
              />
            )}
          </View>
        </View>

        {/* Seção de Ajustes Rápidos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: connected ? '#00f2fe' : '#333' }]}>
            ⚡ Ajustes Rápidos
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickButton, !connected && styles.disabled]}
              disabled={!connected}
            >
              <Text style={[styles.quickButtonText, !connected && styles.disabledText]}>
                🔦 Farol
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickButton, !connected && styles.disabled]}
              disabled={!connected}
            >
              <Text style={[styles.quickButtonText, !connected && styles.disabledText]}>
                📢 Buzina
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickButton, !connected && styles.disabled]}
              disabled={!connected}
            >
              <Text style={[styles.quickButtonText, !connected && styles.disabledText]}>
                🔄 Reversão
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Histórico */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: connected ? '#00f2fe' : '#333' }]}>
            🔁 Histórico de Comandos
          </Text>
          <ScrollView style={styles.logScroll}>
            {commandLog.map((log) => (
              <View key={log.id} style={[styles.logItem, !connected && styles.logItemDisabled]}>
                <Text style={[styles.logText, !connected && styles.disabledText]}>
                  [{log.timestamp}] {log.command} ({log.commandKey}) - {log.speedPercentage}%
                </Text>
              </View>
            ))}
            {commandLog.length === 0 && (
              <View style={[styles.logItem, !connected && styles.logItemDisabled]}>
                <Text style={[styles.logText, !connected && styles.disabledText]}>
                  Nenhum comando registrado
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Espaço adicional para garantir que tudo fique visível com scroll */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Botão flutuante para reconectar caso necessário */}
      {!connected && (
        <TouchableOpacity
          style={styles.floatingConnectButton}
          onPress={() => setShowConnectionModal(true)}
        >
          <Text style={styles.floatingConnectText}>📶 Conectar</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: '#0a0e14',
  },
  contentContainer: {
    padding: 10,
  },
  section: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statusPanel: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    color: '#8899a6',
    fontSize: 12,
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
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
  speedContainer: {
    width: '100%',
    marginTop: 15,
  },
  speedTypeToggle: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  speedTypeButton: {
    flex: 1,
    backgroundColor: '#1e2833',
    padding: 10,
    alignItems: 'center',
    margin: 3,
    borderRadius: 5,
  },
  speedTypeActive: {
    backgroundColor: '#00f2fe',
  },
  speedTypeText: {
    color: '#8899a6',
    fontWeight: '600',
  },
  speedTypeTextActive: {
    color: '#141a24',
  },
  speedLabel: {
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
    gap: 15,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#1e2833',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#00f2fe',
    fontWeight: '600',
  },
  logScroll: {
    maxHeight: 120,
  },
  logItem: {
    backgroundColor: '#1e2833',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  logItemDisabled: {
    backgroundColor: '#0d1218',
  },
  logText: {
    color: '#8899a6',
    fontSize: 12,
  },
  buttonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  disabled: {
    backgroundColor: '#0d1218',
    borderColor: '#333',
  },
  disabledText: {
    color: '#333',
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
  modalButtonConnect: {
    backgroundColor: '#00f2fe',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingConnectButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#00f2fe',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingConnectText: {
    color: '#141a24',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomPadding: {
    height: 80, // Espaço adicional no final para garantir que todo o conteúdo fique visível
  },
});

export default ControlScreen;