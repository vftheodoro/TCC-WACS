import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WACS</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ACESSAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    justifyContent: 'center',
    padding: 30
  },
  title: {
    color: '#00f2fe',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 4,
    textShadowColor: 'rgba(0,242,254,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  formContainer: {
    backgroundColor: '#1a1f27',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#2a2e35'
  },
  input: {
    backgroundColor: '#14181d',
    color: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16
  },
  button: {
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#0a0e14',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1
  }
});

export default LoginScreen;