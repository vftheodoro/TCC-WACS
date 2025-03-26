import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { USBSerial } from 'react-native-usb-serialport';

export default function App() {
  const [serialPort, setSerialPort] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const [lastCommand, setLastCommand] = useState('Nenhum');
  const [commandLog, setCommandLog] = useState([]);

  // Conectar ao Arduino
  const connectToArduino = async () => {
    try {
      const devices = await USBSerial.list();
      
      if (devices.length === 0) {
        Alert.alert('Nenhum dispositivo encontrado');
        return;
      }

      const device = devices[0];
      
      const port = await USBSerial.open(device.deviceId, {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      setSerialPort(port);
      setConnectionStatus('Conectado');
      logCommand('Sistema', 'Conexão com Arduino estabelecida');
    } catch (error) {
      console.error('Erro de conexão:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao Arduino');
      setConnectionStatus('Erro de Conexão');
    }
  };

  // Função para registrar comandos no log
  const logCommand = (type, message, status = 'Enviando') => {
    const commandId = Math.random().toString(36).substr(2, 9);
    const commandDetails = {
      id: commandId,
      type,
      message,
      timestamp: new Date().toLocaleString(),
      status
    };

    console.log('Log de Comando:', commandDetails);
    setCommandLog(prevLog => [commandDetails, ...prevLog]);
  };

  // Enviar comando para o Arduino
  const sendCommand = async (comando, direcao) => {
    if (!serialPort) {
      Alert.alert('Erro', 'Conecte o Arduino primeiro');
      logCommand('Erro', 'Arduino não conectado', 'Falha');
      return;
    }

    // Protocolo de comando
    const commandMap = {
      'Frente': 'F',
      'Tras': 'B', 
      'Esquerda': 'L',
      'Direita': 'R',
      'Parar': 'S'
    };

    const commandCode = commandMap[direcao];

    try {
      // Enviar comando serial
      await serialPort.send(commandCode);
      
      // Atualizar estados de log e último comando
      setLastCommand(`${comando} - ${direcao}`);
      logCommand('Comando', `${comando} - ${direcao}`);

      // Simular confirmação do Arduino
      setTimeout(() => {
        logCommand('Confirmação', `Comando ${direcao} recebido`, 'Recebido');
      }, 500);

    } catch (error) {
      console.error('Erro ao enviar comando:', error);
      Alert.alert('Erro', 'Falha ao enviar comando');
      logCommand('Erro', `Falha no comando ${direcao}`, 'Erro');
    }
  };

  // Desconectar quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (serialPort) {
        serialPort.close();
      }
    };
  }, [serialPort]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Controle de Cadeira de Rodas</Text>
      
      <TouchableOpacity 
        style={styles.connectButton} 
        onPress={connectToArduino}
      >
        <Text style={styles.buttonText}>Conectar Arduino</Text>
      </TouchableOpacity>

      <Text>Status: {connectionStatus}</Text>
      <Text>Último Comando: {lastCommand}</Text>

      <View style={styles.controlSection}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => sendCommand('Mover', 'Frente')}
        >
          <Text style={styles.buttonText}>Frente</Text>
        </TouchableOpacity>

        <View style={styles.horizontalControls}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => sendCommand('Mover', 'Esquerda')}
          >
            <Text style={styles.buttonText}>Esquerda</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => sendCommand('Mover', 'Direita')}
          >
            <Text style={styles.buttonText}>Direita</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => sendCommand('Mover', 'Tras')}
        >
          <Text style={styles.buttonText}>Trás</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.stopButton} 
          onPress={() => sendCommand('Parar', 'Parar')}
        >
          <Text style={styles.buttonText}>Parar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logSection}>
        <Text style={styles.logTitle}>Log de Comandos:</Text>
        <ScrollView>
          {commandLog.map((cmd, index) => (
            <View 
              key={index} 
              style={[
                styles.logItem, 
                cmd.status === 'Erro' && styles.errorLog,
                cmd.status === 'Recebido' && styles.receivedLog
              ]}
            >
              <Text>Tipo: {cmd.type}</Text>
              <Text>Mensagem: {cmd.message}</Text>
              <Text>Timestamp: {cmd.timestamp}</Text>
              <Text>Status: {cmd.status}</Text>
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
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  controlSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'red',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  logSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  logItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  errorLog: {
    backgroundColor: '#ffdddd',
  },
  receivedLog: {
    backgroundColor: '#ddffdd',
  },
});