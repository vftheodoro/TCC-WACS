import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function App() {
  // ID do usuário (por exemplo, 1 para teste; futuramente, isso virá do login)
  const id_usuario = 1;
  
  // Função para enviar comando à API PHP
  const sendCommand = (command) => {
    axios.post("http://<SEU_SERVIDOR>/cadeira_api/comandos.php", {
      id_usuario: id_usuario,
      comando: command
    })
    .then(response => {
      Alert.alert("Sucesso", response.data.message || "Comando enviado");
    })
    .catch(error => {
      console.error("Erro:", error);
      Alert.alert("Erro", "Falha ao enviar comando");
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle da Cadeira</Text>
      <View style={styles.buttonContainer}>
        <Button title="Frente" onPress={() => sendCommand("frente")} />
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <Button title="Esquerda" onPress={() => sendCommand("esquerda")} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Direita" onPress={() => sendCommand("direita")} />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Trás" onPress={() => sendCommand("tras")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  buttonContainer: { margin: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around' }
});
