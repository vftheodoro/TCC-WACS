import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ControlScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle da Cadeira</Text>
      {/* Adicione seus componentes de controle aqui */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    color: '#00f2fe',
    fontSize: 24,
    fontWeight: 'bold'
  }
});

export default ControlScreen;