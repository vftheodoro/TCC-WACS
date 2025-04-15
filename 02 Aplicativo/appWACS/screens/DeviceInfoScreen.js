import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DeviceInfoScreen = () => {
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('connected');
  const [sensorData, setSensorData] = useState({
    front: 120,
    left: 80,
    right: 90,
    back: 60,
  });
  const [alerts, setAlerts] = useState([]);
  const [firmwareVersion, setFirmwareVersion] = useState('v2.1.4');
  const [hardwareVersion, setHardwareVersion] = useState('HW-Rev3');
  const [lastMaintenance, setLastMaintenance] = useState('15/05/2023');
  const [nextMaintenance, setNextMaintenance] = useState('15/11/2023');
  
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Simulação de dados do dispositivo
    const interval = setInterval(() => {
      setBatteryLevel(prev => {
        const newLevel = isCharging ? 
          Math.min(prev + 1, 100) : 
          Math.max(prev - 1, 0);
        
        if (newLevel <= 20 && !alerts.includes('low_battery')) {
          setAlerts(prev => [...prev, 'low_battery']);
        }
        
        return newLevel;
      });
      
      setSensorData({
        front: Math.max(10, sensorData.front + (Math.random() * 10 - 5)),
        left: Math.max(10, sensorData.left + (Math.random() * 10 - 5)),
        right: Math.max(10, sensorData.right + (Math.random() * 10 - 5)),
        back: Math.max(10, sensorData.back + (Math.random() * 10 - 5)),
      });
    }, 3000);
    
    // Animação de pulsação para status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => clearInterval(interval);
  }, [isCharging, alerts]);

  const handleMaintenanceReset = () => {
    setLastMaintenance(new Date().toLocaleDateString());
    setNextMaintenance(new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString());
    setAlerts(prev => prev.filter(a => a !== 'maintenance'));
  };

  const getStatusColor = () => {
    switch(deviceStatus) {
      case 'connected': return '#00f2fe';
      case 'disconnected': return '#ff4444';
      case 'error': return '#ff9900';
      default: return '#7a828a';
    }
  };

  const renderAlert = (alert) => {
    switch(alert) {
      case 'low_battery':
        return (
          <View style={[styles.alertItem, { backgroundColor: 'rgba(255, 68, 68, 0.2)' }]}>
            <Icon name="battery-alert" size={20} color="#ff4444" />
            <Text style={[styles.alertText, { color: '#ff4444' }]}>Bateria Fraca ({batteryLevel}%)</Text>
          </View>
        );
      case 'maintenance':
        return (
          <View style={[styles.alertItem, { backgroundColor: 'rgba(255, 153, 0, 0.2)' }]}>
            <Icon name="wrench" size={20} color="#ff9900" />
            <Text style={[styles.alertText, { color: '#ff9900' }]}>Manutenção Pendente</Text>
          </View>
        );
      case 'sensor_error':
        return (
          <View style={[styles.alertItem, { backgroundColor: 'rgba(255, 153, 0, 0.2)' }]}>
            <Icon name="alert" size={20} color="#ff9900" />
            <Text style={[styles.alertText, { color: '#ff9900' }]}>Problema no Sensor</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Status do Dispositivo</Text>
      
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Animated.View style={[styles.statusIndicator, { 
            backgroundColor: getStatusColor(),
            transform: [{ scale: pulseAnim }] 
          }]} />
          <Text style={styles.statusText}>
            {deviceStatus === 'connected' ? 'CONECTADO' : 
             deviceStatus === 'disconnected' ? 'DESCONECTADO' : 'ERRO DE CONEXÃO'}
          </Text>
        </View>
        
        <View style={styles.statusDetails}>
          <View style={styles.statusDetail}>
            <Icon name="access-point" size={20} color="#7a828a" />
            <Text style={styles.detailText}>WACS-Controller-01</Text>
          </View>
          <View style={styles.statusDetail}>
            <Icon name="bluetooth" size={20} color="#7a828a" />
            <Text style={styles.detailText}>Bluetooth 5.0</Text>
          </View>
        </View>
      </View>
      
      {/* Battery Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="battery" size={24} color={batteryLevel > 20 ? '#00f2fe' : '#ff4444'} />
          <Text style={styles.cardTitle}>Bateria</Text>
          <TouchableOpacity onPress={() => setIsCharging(!isCharging)}>
            <Icon 
              name={isCharging ? 'power-plug' : 'power-plug-off'} 
              size={24} 
              color={isCharging ? '#00f2fe' : '#7a828a'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.batteryContainer}>
          <View style={styles.batteryOuter}>
            <View 
              style={[
                styles.batteryInner,
                { 
                  width: `${batteryLevel}%`,
                  backgroundColor: batteryLevel > 20 ? '#00f2fe' : '#ff4444',
                }
              ]}
            />
          </View>
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
        
        <Text style={styles.batteryStatus}>
          {isCharging ? 'Carregando...' : batteryLevel > 20 ? 'Bateria OK' : 'Bateria Fraca'}
        </Text>
      </View>
      
      {/* Sensors Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="radar" size={24} color="#00f2fe" />
          <Text style={styles.cardTitle}>Sensores</Text>
        </View>
        
        <View style={styles.sensorsGrid}>
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>Frente</Text>
            <Text style={styles.sensorValue}>{sensorData.front} cm</Text>
          </View>
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>Esquerda</Text>
            <Text style={styles.sensorValue}>{sensorData.left} cm</Text>
          </View>
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>Direita</Text>
            <Text style={styles.sensorValue}>{sensorData.right} cm</Text>
          </View>
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>Trás</Text>
            <Text style={styles.sensorValue}>{sensorData.back} cm</Text>
          </View>
        </View>
      </View>
      
      {/* Alerts Card */}
      {alerts.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="alert" size={24} color="#ff4444" />
            <Text style={styles.cardTitle}>Alertas</Text>
          </View>
          
          <View style={styles.alertsContainer}>
            {alerts.map((alert, index) => (
              <View key={index}>
                {renderAlert(alert)}
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Device Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="chip" size={24} color="#00f2fe" />
          <Text style={styles.cardTitle}>Informações do Dispositivo</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versão do Firmware</Text>
          <Text style={styles.infoValue}>{firmwareVersion}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versão do Hardware</Text>
          <Text style={styles.infoValue}>{hardwareVersion}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Última Manutenção</Text>
          <Text style={styles.infoValue}>{lastMaintenance}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Próxima Manutenção</Text>
          <Text style={styles.infoValue}>{nextMaintenance}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.maintenanceButton}
          onPress={handleMaintenanceReset}
        >
          <Text style={styles.maintenanceButtonText}>REGISTRAR MANUTENÇÃO</Text>
        </TouchableOpacity>
      </View>
      
      {/* Recommendations Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="lightbulb-on" size={24} color="#ffcc00" />
          <Text style={styles.cardTitle}>Recomendações</Text>
        </View>
        
        <View style={styles.recommendationItem}>
          <Icon name="battery-charging" size={20} color="#ffcc00" />
          <Text style={styles.recommendationText}>
            Carregue completamente a bateria pelo menos uma vez por semana.
          </Text>
        </View>
        
        <View style={styles.recommendationItem}>
          <Icon name="wrench" size={20} color="#ffcc00" />
          <Text style={styles.recommendationText}>
            Realize manutenção preventiva a cada 6 meses.
          </Text>
        </View>
        
        <View style={styles.recommendationItem}>
          <Icon name="weather-windy" size={20} color="#ffcc00" />
          <Text style={styles.recommendationText}>
            Evite usar o dispositivo em chuva ou ambientes muito úmidos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 15,
  },
  header: {
    color: '#00f2fe',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#7a828a',
    marginLeft: 8,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  batteryOuter: {
    flex: 1,
    height: 20,
    backgroundColor: '#1e2833',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
  },
  batteryInner: {
    height: '100%',
    borderRadius: 10,
  },
  batteryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  batteryStatus: {
    color: '#7a828a',
    fontSize: 14,
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorItem: {
    width: '48%',
    backgroundColor: '#1a1f27',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  sensorLabel: {
    color: '#7a828a',
    fontSize: 14,
    marginBottom: 5,
  },
  sensorValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  alertsContainer: {
    marginTop: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
  infoLabel: {
    color: '#7a828a',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  maintenanceButton: {
    backgroundColor: '#1e2833',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  maintenanceButtonText: {
    color: '#00f2fe',
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
  recommendationText: {
    color: 'white',
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DeviceInfoScreen;