import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Vibration,
} from 'react-native';

const COMMANDS = {
  F: { label: 'Frente', color: '#4CAF50' },
  B: { label: 'Trás', color: '#FF9800' },
  E: { label: 'Esquerda', color: '#2196F3' },
  D: { label: 'Direita', color: '#2196F3' },
  S: { label: 'Parar', color: '#f44336' },
};

export default function App() {
  const [connected, setConnected] = useState(false);
  const [lastCommand, setLastCommand] = useState('Nenhum');
  const [commandLog, setCommandLog] = useState([]);

  const sendCommand = async (command) => {
    if (!connected) return;
    
    try {
      Vibration.vibrate(50);
      // Simulação de chamada API
      await fetch('http://localhost:3000/send-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const newLog = {
        id: Date.now().toString(),
        command: COMMANDS[command].label,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Correção na atualização do estado
      setCommandLog(prevLogs => [newLog, ...prevLogs.slice(0, 4)]);
      setLastCommand(COMMANDS[command].label);
    } catch (error) {
      console.log('Erro de comunicação');
    }
  };

  const ControlButton = ({ command, color }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => sendCommand(command)}
      disabled={!connected}
    >
      <Text style={styles.buttonText}>{COMMANDS[command].label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Controle do Robô</Text>
        <TouchableOpacity
          style={[styles.connectButton, connected && styles.connectedButton]}
          onPress={() => setConnected(!connected)}
        >
          <Text style={styles.buttonText}>
            {connected ? 'Desconectar' : 'Conectar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.statusValue, connected && styles.connectedStatus]}>
            {connected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
      </View>

      <View style={styles.controlSection}>
        <ControlButton command="F" color="#4CAF50" />
        
        <View style={styles.horizontalControls}>
          <ControlButton command="E" color="#2196F3" />
          <ControlButton command="D" color="#2196F3" />
        </View>

        <ControlButton command="B" color="#FF9800" />
        <ControlButton command="S" color="#f44336" />
      </View>

      <View style={styles.logSection}>
        <Text style={styles.logTitle}>Últimos Comandos</Text>
        <ScrollView 
          style={styles.logScroll}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {commandLog.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logType}>{log.command}</Text>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  connectButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  connectedButton: {
    backgroundColor: '#4CAF50',
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    width: '40%',
  },
  statusValue: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: 'bold',
  },
  connectedStatus: {
    color: '#4CAF50',
  },
  controlSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    elevation: 3,
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  logTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logType: {
    fontWeight: 'bold',
    color: '#666',
  },
  logTimestamp: {
    color: '#999',
    fontSize: 12,
  },
});