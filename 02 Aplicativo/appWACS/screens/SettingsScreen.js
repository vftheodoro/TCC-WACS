import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [voiceCommands, setVoiceCommands] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState(true);
  const [shareData, setShareData] = useState(false);

  const settingsSections = [
    {
      title: 'Aparência',
      icon: 'palette',
      items: [
        {
          label: 'Modo Escuro',
          icon: 'weather-night',
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          label: 'Tamanho da Fonte',
          icon: 'format-size',
          action: () => console.log('Font size settings'),
        },
        {
          label: 'Cor de Destaque',
          icon: 'invert-colors',
          action: () => console.log('Accent color settings'),
        },
      ],
    },
    {
      title: 'Notificações',
      icon: 'bell',
      items: [
        {
          label: 'Notificações',
          icon: 'bell-outline',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          label: 'Alertas de Emergência',
          icon: 'alert',
          value: emergencyAlert,
          onValueChange: setEmergencyAlert,
        },
        {
          label: 'Som de Notificação',
          icon: 'volume-high',
          action: () => console.log('Notification sound settings'),
        },
      ],
    },
    {
      title: 'Acessibilidade',
      icon: 'accessibility',
      items: [
        {
          label: 'Comandos por Voz',
          icon: 'microphone',
          value: voiceCommands,
          onValueChange: setVoiceCommands,
        },
        {
          label: 'Feedback Háptico',
          icon: 'vibrate',
          value: hapticFeedback,
          onValueChange: setHapticFeedback,
        },
        {
          label: 'Atalhos de Acessibilidade',
          icon: 'gesture-tap',
          action: () => console.log('Accessibility shortcuts'),
        },
      ],
    },
    {
      title: 'Privacidade',
      icon: 'shield-lock',
      items: [
        {
          label: 'Compartilhar Dados Anônimos',
          icon: 'chart-box',
          value: shareData,
          onValueChange: setShareData,
        },
        {
          label: 'Política de Privacidade',
          icon: 'file-document',
          action: () => console.log('Privacy policy'),
        },
        {
          label: 'Termos de Serviço',
          icon: 'file-certificate',
          action: () => console.log('Terms of service'),
        },
      ],
    },
    {
      title: 'Sobre',
      icon: 'information',
      items: [
        {
          label: 'Versão do Aplicativo',
          icon: 'cellphone',
          value: '1.0.0',
          isStatic: true,
        },
        {
          label: 'Avaliar o Aplicativo',
          icon: 'star',
          action: () => console.log('Rate app'),
        },
        {
          label: 'Sair',
          icon: 'logout',
          action: () => console.log('Logout'),
          isDestructive: true,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Configurações</Text>
      
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name={section.icon} size={20} color="#00f2fe" />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.settingItem}
              onPress={item.action}
              disabled={!item.action}
            >
              <View style={styles.settingLeft}>
                <Icon 
                  name={item.icon} 
                  size={22} 
                  color={item.isDestructive ? '#ff4444' : '#00f2fe'} 
                  style={styles.settingIcon} 
                />
                <Text 
                  style={[
                    styles.settingLabel,
                    item.isDestructive && { color: '#ff4444' }
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              
              {item.onValueChange ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: "#767577", true: "#00f2fe" }}
                  thumbColor={item.value ? "#f4f3f4" : "#f4f3f4"}
                />
              ) : item.isStatic ? (
                <Text style={styles.settingValue}>{item.value}</Text>
              ) : (
                <Icon name="chevron-right" size={20} color="#7a828a" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
      
      <View style={styles.advancedContainer}>
        <Text style={styles.advancedTitle}>Configurações Avançadas</Text>
        <Text style={styles.advancedText}>
          Ajustes técnicos e de desenvolvimento para controle avançado do dispositivo.
        </Text>
        <TouchableOpacity style={styles.advancedButton}>
          <Text style={styles.advancedButtonText}>ACESSAR CONFIGURAÇÕES AVANÇADAS</Text>
        </TouchableOpacity>
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
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
    marginBottom: 5,
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
  },
  settingValue: {
    color: '#7a828a',
    fontSize: 14,
  },
  advancedContainer: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#1e2833',
    alignItems: 'center',
  },
  advancedTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  advancedText: {
    color: '#7a828a',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  advancedButton: {
    backgroundColor: '#1e2833',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  advancedButtonText: {
    color: '#00f2fe',
    fontWeight: '600',
  },
});

export default SettingsScreen;