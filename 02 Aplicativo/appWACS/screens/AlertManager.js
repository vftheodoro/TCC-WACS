/**
 * Gerenciador de alertas para aplicativo WACS
 * Este componente lida com alertas visuais e táteis
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';

const ALERT_TYPES = {
  OBSTACLE: {
    message: 'OBSTÁCULO DETECTADO!',
    vibration: [200, 100, 200],
    color: '#ff4444'
  },
  LOW_BATTERY: {
    message: 'BATERIA BAIXA!',
    vibration: [300, 200, 300],
    color: '#ffcc00'
  },
  DISCONNECTED: {
    message: 'CONEXÃO PERDIDA!',
    vibration: [400, 300, 400],
    color: '#ff4444'
  },
  EMERGENCY: {
    message: 'MODO EMERGÊNCIA ATIVADO!',
    vibration: [200, 100, 200, 100, 200],
    color: '#ff4444'
  },
  CONNECTION_ERROR: {
    message: 'ERRO DE CONEXÃO!',
    vibration: [500, 200, 500],
    color: '#ff4444'
  }
};

const AlertManager = ({ alertType, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [blinkState, setBlinkState] = useState(true);
  
  useEffect(() => {
    if (!alertType) {
      setVisible(false);
      return;
    }
    
    // Mostrar alerta
    setVisible(true);
    setBlinkState(true);
    
    // Efeito de vibração
    const alertConfig = ALERT_TYPES[alertType] || { vibration: [500], color: '#ff4444' };
    Vibration.vibrate(alertConfig.vibration);
    
    // Efeito de piscar usando estados em vez de animação
    const blinkInterval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 300);
    
    // Limpeza automática após 5 segundos
    const dismissTimer = setTimeout(() => {
      clearInterval(blinkInterval);
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 5000);
    
    return () => {
      clearInterval(blinkInterval);
      clearTimeout(dismissTimer);
    };
  }, [alertType, onDismiss]);
  
  if (!visible || !alertType) return null;
  
  const alertConfig = ALERT_TYPES[alertType] || { 
    message: `ALERTA: ${alertType}`,
    color: '#ff4444'
  };
  
  return (
    <View style={[
      styles.alertContainer,
      { opacity: blinkState ? 1 : 0.5 }
    ]}>
      <Text style={styles.alertText}>
        {alertConfig.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF4444',
    padding: 10,
    zIndex: 9999,
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  }
});

export default AlertManager;
