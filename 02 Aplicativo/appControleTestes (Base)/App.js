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
} from 'react-native';

const COMMANDS = {
  F: { label: 'Frente', color: '#2ecc71', icon: '↑' },
  B: { label: 'Trás', color: '#e67e22', icon: '↓' },
  E: { label: 'Esquerda', color: '#3498db', icon: '←' },
  D: { label: 'Direita', color: '#3498db', icon: '→' },
  S: { label: 'Parar', color: '#e74c3c', icon: '⏹' },
};

export default function App() {
  const [connected, setConnected] = useState(false);
  const [commandLog, setCommandLog] = useState([]);
  const [speed, setSpeed] = useState(50); // 0-100%
  const [lastCommandKey, setLastCommandKey] = useState(null);

  const calculateActualSpeed = (percentage) => 
    Math.round(60 + (percentage / 100) * (255 - 60));

  useEffect(() => {
    if (connected && lastCommandKey) {
      const debounceTimer = setTimeout(() => {
        sendCommand(lastCommandKey);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [speed, lastCommandKey]);

  const sendCommand = async (command) => {
    if (!connected) return;
    
    try {
      Vibration.vibrate(50);
      const actualSpeed = calculateActualSpeed(speed);
      await fetch('http://localhost:3000/send-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command + actualSpeed }),
      });

      const newLog = {
        id: Date.now().toString(),
        commandKey: command,
        command: COMMANDS[command].label,
        timestamp: new Date().toLocaleTimeString(),
        speedPercentage: speed,
        speedValue: actualSpeed,
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
          backgroundColor: COMMANDS[command].color,
          width: size,
          height: size,
          borderRadius: size/2,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.3)',
          ...style,
        },
      ]}
      onPress={() => sendCommand(command)}
      disabled={!connected}
    >
      <Text style={styles.buttonIcon}>{COMMANDS[command].icon}</Text>
      <Text style={styles.buttonText}>{COMMANDS[command].label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ROBOT CONTROL</Text>
        <TouchableOpacity
          style={[styles.connectButton, connected && styles.connectedButton]}
          onPress={() => setConnected(!connected)}
        >
          <Text style={styles.buttonText}>
            {connected ? '● CONECTADO' : 'CONECTAR'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlContainer}>
        <View style={styles.dPad}>
          <ControlButton command="F" style={{ top: 0, left: 110 }} />
          <ControlButton command="E" style={{ top: 110, left: 0 }} />
          <ControlButton command="D" style={{ top: 110, right: 0 }} />
          <ControlButton command="B" style={{ bottom: 0, left: 110 }} />
          
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => sendCommand('S')}
            disabled={!connected}
          >
            <Text style={[styles.buttonIcon, { fontSize: 32 }]}>{COMMANDS.S.icon}</Text>
            <Text style={styles.buttonText}>{COMMANDS.S.label}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.speedContainer}>
          <Text style={styles.speedLabel}>
            VELOCIDADE: {speed}% ({calculateActualSpeed(speed)})
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={speed}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#555"
            thumbTintColor="#3498db"
            onValueChange={(value) => setSpeed(Math.round(value))}
          />
        </View>
      </View>

      <View style={styles.logSection}>
        <Text style={styles.logTitle}>HISTÓRICO DE COMANDOS</Text>
        <ScrollView style={styles.logScroll}>
          {commandLog.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logText}>
                [{log.timestamp}] {log.command} ({log.commandKey}) -{' '}
                {log.speedPercentage}% ({log.speedValue})
              </Text>
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
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(255,255,255,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  connectButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  connectedButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  controlContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPad: {
    position: 'relative',
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  controlButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  stopButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e74c3c',
    position: 'absolute',
    top: 100,
    left: 100,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  speedContainer: {
    backgroundColor: '#2c2c2c',
    width: '100%',
    padding: 20,
    borderRadius: 15,
  },
  speedLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  slider: {
    height: 10,
    borderRadius: 5,
  },
  logSection: {
    height: 150,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 15,
  },
  logTitle: {
    color: '#7f8c8d',
    fontWeight: '700',
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: '#3c3c3c',
    padding: 10,
    marginVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  logText: {
    color: '#bdc3c7',
    fontSize: 12,
    fontFamily: 'Courier New',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
  },
  buttonIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});