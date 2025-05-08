import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      {/* Adicione aqui os componentes de configuração */}
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
  },
});

export default SettingsScreen;
