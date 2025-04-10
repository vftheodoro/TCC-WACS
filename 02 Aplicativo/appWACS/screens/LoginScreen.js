import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulação de chamada API
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Main');
    }, 1500);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Logo */}
          <Image 
            source={require('../assets/wacs-logo.jpg')} // Substitua pelo seu logo
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>WACS</Text>
          <Text style={styles.subtitle}>Controle de Acesso</Text>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0a0e14" />
              ) : (
                <Text style={styles.buttonText}>ACESSAR</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#00f2fe',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,242,254,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#7a828a',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: '#1a1f27',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#2a2e35',
    marginBottom: 20,
  },
  label: {
    color: '#7a828a',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#14181d',
    color: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2e35',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14181d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2e35',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 15,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 15,
  },
  showPasswordText: {
    color: '#00f2fe',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#00f2fe',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0a0e14',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#7a828a',
    marginRight: 5,
  },
  footerLink: {
    color: '#00f2fe',
    fontWeight: '600',
  },
});

export default LoginScreen;