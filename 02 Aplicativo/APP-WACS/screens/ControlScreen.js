import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const ControlScreen = () => {
  const [logs, setLogs] = useState([]);
  const [velocidade, setVelocidade] = useState(50);

  const registrarLog = (acao) => {
    setLogs((prev) => [acao, ...prev]);
  };

  const alterarVelocidade = (valor) => {
    setVelocidade(valor);
    registrarLog(`Velocidade ajustada para ${Math.round(valor)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle</Text>
      <View style={styles.controlContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.controlButton} onPress={() => registrarLog('CIMA')}>
            <Text style={styles.controlButtonText}>▲</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.controlButton} onPress={() => registrarLog('ESQUERDA')}>
            <Text style={styles.controlButtonText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.centerButton]} onPress={() => registrarLog('CENTRO')}>
            <Text style={styles.controlButtonText}>●</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => registrarLog('DIREITA')}>
            <Text style={styles.controlButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.controlButton} onPress={() => registrarLog('BAIXO')}>
            <Text style={styles.controlButtonText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.velocidadeContainer}>
        <Text style={{fontWeight: 'bold', marginBottom: 8}}>Velocidade: {Math.round(velocidade)}</Text>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={velocidade}
          onValueChange={alterarVelocidade}
          minimumTrackTintColor="#007bff"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007bff"
        />
      </View>
      <Text style={{marginTop: 24, fontWeight: 'bold'}}>Logs:</Text>
      <View style={{maxHeight: 120, width: '100%', marginTop: 8}}>
        {logs.length === 0 && <Text style={{color: '#888'}}>Nenhuma ação registrada ainda.</Text>}
        {logs.map((log, idx) => (
          <Text key={idx} style={{color: '#333'}}>{log}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  controlContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  centerButton: {
    backgroundColor: '#dc3545',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  velocidadeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default ControlScreen;
