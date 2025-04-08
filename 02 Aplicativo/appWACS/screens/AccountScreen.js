import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch 
} from 'react-native';
import Slider from '@react-native-community/slider';

const ProfileScreen = () => {
  const [speed, setSpeed] = useState(50);
  const [remoteControl, setRemoteControl] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('Joystick');

  return (
    <ScrollView style={styles.container}>
      {/* Seção 1: Cabeçalho */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://siga.cps.sp.gov.br/image/CQ5DH79QE3WBJDBFH6HIF7LL6Y8Z4C25-04-2023_12i07i50.TMB.JPG' }}
            style={styles.profileImage}
          />
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>João da Silva</Text>
        <Text style={styles.userEmail}>joao@email.com</Text>
      </View>

      {/* Seção 2: Configurações da Cadeira */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configurações da Cadeira</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Velocidade padrão ({speed}%)</Text>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            minimumValue={0}
            maximumValue={100}
            step={10}
            minimumTrackTintColor="#00f2fe"
            maximumTrackTintColor="#1e2833"
            thumbTintColor="#00f2fe"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Modo de controle</Text>
          <View style={styles.buttonsContainer}>
            {['Joystick', 'Botões', 'Voz'].map((mode) => (
              <TouchableOpacity 
                key={mode} 
                style={[
                  styles.modeButton,
                  selectedMode === mode && styles.selectedModeButton
                ]}
                onPress={() => setSelectedMode(mode)}
              >
                <Text style={styles.buttonText}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Controle remoto</Text>
          <Switch
            value={remoteControl}
            onValueChange={setRemoteControl}
            trackColor={{ false: "#767577", true: "#00f2fe" }}
            thumbColor={remoteControl ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Seção 3: Informações Pessoais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Informações Pessoais</Text>
        
        <InfoItem label="Telefone" value="(11) 99999-9999" />
        <InfoItem label="Endereço" value="Rua Example, 123" />
        <InfoItem label="Data Nasc." value="01/01/1980" />
        <InfoItem label="Contato Emergência" value="Maria (11) 98888-8888" />
        
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Em caso de emergência:</Text>
          <Text style={styles.emergencyText}>Portador de esclerose múltipla. Alergia à penicilina.</Text>
        </View>
      </View>

      {/* Seção 5: Preferências */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Preferências</Text>
        
        <ToggleItem 
          label="Modo Escuro" 
          value={darkMode} 
          onValueChange={setDarkMode} 
        />
        <ToggleItem 
          label="Comandos por Voz" 
          value={false} 
        />
        <ToggleItem 
          label="Notificações" 
          value={true} 
        />
      </View>

      {/* Seção 6: Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Conta</Text>
        
        <ActionButton label="Alterar Senha" />
        <ActionButton label="Alterar E-mail" />
        <ActionButton label="Excluir Conta" color="#ff4444" />
        <ActionButton label="Sair" />
      </View>
    </ScrollView>
  );
};

// Componentes auxiliares
const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const ToggleItem = ({ label, value, onValueChange }) => (
  <View style={styles.settingItem}>
    <Text style={styles.label}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#767577", true: "#00f2fe" }}
      thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
    />
  </View>
);

const ActionButton = ({ label, color }) => (
  <TouchableOpacity style={styles.actionButton}>
    <Text style={[styles.buttonText, { color: color || '#00f2fe' }]}>{label}</Text>
  </TouchableOpacity>
);

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 15,
  },
  section: {
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 5,
  },
  editText: {
    color: '#00f2fe',
    fontSize: 12,
  },
  userName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userEmail: {
    color: '#8899a6',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  settingItem: {
    marginBottom: 20,
  },
  label: {
    color: '#8899a6',
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    color: 'white',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modeButton: {
    backgroundColor: '#1e2833',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  selectedModeButton: {
    borderColor: '#00f2fe',
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
  },
  emergencySection: {
    backgroundColor: '#1d2733',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  emergencyTitle: {
    color: '#ff6961',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emergencyText: {
    color: 'white',
    fontSize: 14,
  },
  infoItem: {
    marginBottom: 15,
  },
  actionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
});

export default ProfileScreen;