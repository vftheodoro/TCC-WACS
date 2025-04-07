import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONFIGURAÇÕES</Text>
      {/* Adicione os controles de configuração aqui */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 20
  },
  title: {
    color: '#00f2fe',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20
  }
});

export default SettingsScreen;