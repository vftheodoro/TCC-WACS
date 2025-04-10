import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const [speed, setSpeed] = useState(50);
  const [remoteControl, setRemoteControl] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('Joystick');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [userData, setUserData] = useState({
    name: 'João da Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua Example, 123',
    birthDate: '01/01/1980',
    emergencyContact: 'Maria (11) 98888-8888',
    medicalInfo: 'Portador de esclerose múltipla. Alergia à penicilina.'
  });

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    setUserData({...userData, [editingField]: tempValue});
    setEditModalVisible(false);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Excluir", 
          onPress: () => console.log("Account deleted"),
          style: "destructive"
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkModeContainer]}>
      {/* Modal de Edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar {editingField}</Text>
            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Seção 1: Cabeçalho */}
      <View style={styles.section}>
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => console.log("Change profile photo")}
          >
            <Image 
              source={{ uri: 'https://siga.cps.sp.gov.br/image/CQ5DH79QE3WBJDBFH6HIF7LL6Y8Z4C25-04-2023_12i07i50.TMB.JPG' }}
              style={styles.profileImage}
            />
            <View style={styles.editIcon}>
              <Icon name="edit" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => handleEdit('name', userData.name)}
            >
              <Text style={styles.editProfileText}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Seção 2: Configurações da Cadeira */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="settings" size={20} color="#00f2fe" />
          <Text style={styles.sectionTitle}>Configurações da Cadeira</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Icon name="speed" size={18} color="#8899a6" style={styles.settingIcon} />
            <Text style={styles.label}>Velocidade padrão</Text>
          </View>
          <View style={styles.speedValueContainer}>
            <Text style={styles.speedValue}>{speed}%</Text>
          </View>
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
          <View style={styles.settingLabelContainer}>
            <Icon name="gamepad" size={18} color="#8899a6" style={styles.settingIcon} />
            <Text style={styles.label}>Modo de controle</Text>
          </View>
          <View style={styles.buttonsContainer}>
            {[
              { mode: 'Joystick', icon: 'navigation' },
              { mode: 'Botões', icon: 'apps' },
              { mode: 'Voz', icon: 'mic' }
            ].map(({mode, icon}) => (
              <TouchableOpacity 
                key={mode} 
                style={[
                  styles.modeButton,
                  selectedMode === mode && styles.selectedModeButton
                ]}
                onPress={() => setSelectedMode(mode)}
              >
                <Icon name={icon} size={20} color={selectedMode === mode ? "#00f2fe" : "#fff"} />
                <Text style={[
                  styles.buttonText,
                  selectedMode === mode && styles.selectedButtonText
                ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.switchContainer}>
            <View style={styles.settingLabelContainer}>
              <Icon name="smartphone" size={18} color="#8899a6" style={styles.settingIcon} />
              <Text style={styles.label}>Controle remoto</Text>
            </View>
            <Switch
              value={remoteControl}
              onValueChange={setRemoteControl}
              trackColor={{ false: "#767577", true: "#00f2fe" }}
              thumbColor={remoteControl ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          <Text style={styles.hintText}>Permitir controle via dispositivo móvel</Text>
        </View>
      </View>

      {/* Seção 3: Informações Pessoais */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="person" size={20} color="#00f2fe" />
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        </View>
        
        <InfoItem 
          label="Telefone" 
          value={userData.phone} 
          onPress={() => handleEdit('phone', userData.phone)}
        />
        <InfoItem 
          label="Endereço" 
          value={userData.address} 
          onPress={() => handleEdit('address', userData.address)}
        />
        <InfoItem 
          label="Data Nasc." 
          value={userData.birthDate} 
          onPress={() => handleEdit('birthDate', userData.birthDate)}
        />
        <InfoItem 
          label="Contato Emergência" 
          value={userData.emergencyContact} 
          onPress={() => handleEdit('emergencyContact', userData.emergencyContact)}
        />
        
        <View style={styles.emergencySection}>
          <View style={styles.sectionHeader}>
            <Icon name="warning" size={18} color="#ff6961" />
            <Text style={styles.emergencyTitle}>Em caso de emergência:</Text>
          </View>
          <Text style={styles.emergencyText}>{userData.medicalInfo}</Text>
          <TouchableOpacity 
            style={styles.editMedicalInfo}
            onPress={() => handleEdit('medicalInfo', userData.medicalInfo)}
          >
            <Text style={styles.editMedicalText}>Editar informações médicas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seção 4: Preferências */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="tune" size={20} color="#00f2fe" />
          <Text style={styles.sectionTitle}>Preferências</Text>
        </View>
        
        <ToggleItem 
          label="Modo Escuro" 
          icon="brightness-2"
          value={darkMode} 
          onValueChange={setDarkMode} 
        />
        <ToggleItem 
          label="Comandos por Voz" 
          icon="mic"
          value={false} 
        />
        <ToggleItem 
          label="Notificações" 
          icon="notifications"
          value={true} 
        />
        <ToggleItem 
          label="Acessibilidade" 
          icon="accessibility"
          value={true} 
        />
      </View>

      {/* Seção 5: Conta */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="security" size={20} color="#00f2fe" />
          <Text style={styles.sectionTitle}>Conta</Text>
        </View>
        
        <ActionButton 
          label="Alterar Senha" 
          icon="lock"
          onPress={() => console.log("Change password")}
        />
        <ActionButton 
          label="Alterar E-mail" 
          icon="email"
          onPress={() => handleEdit('email', userData.email)}
        />
        <ActionButton 
          label="Excluir Conta" 
          icon="delete"
          color="#ff4444"
          onPress={confirmDeleteAccount}
        />
        <ActionButton 
          label="Sair" 
          icon="exit-to-app"
          onPress={() => console.log("Logout")}
        />
      </View>
    </ScrollView>
  );
};

// Componentes auxiliares
const InfoItem = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.infoItem} onPress={onPress}>
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
    <Icon name="chevron-right" size={20} color="#8899a6" />
  </TouchableOpacity>
);

const ToggleItem = ({ label, icon, value, onValueChange }) => (
  <View style={styles.settingItem}>
    <View style={styles.switchContainer}>
      <View style={styles.settingLabelContainer}>
        <Icon name={icon} size={18} color="#8899a6" style={styles.settingIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#767577", true: "#00f2fe" }}
        thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
      />
    </View>
  </View>
);

const ActionButton = ({ label, icon, color, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={styles.actionButtonContent}>
      <Icon name={icon} size={20} color={color || '#00f2fe'} style={styles.actionIcon} />
      <Text style={[styles.buttonText, { color: color || '#00f2fe' }]}>{label}</Text>
    </View>
    <Icon name="chevron-right" size={20} color={color || '#00f2fe'} />
  </TouchableOpacity>
);

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 15,
  },
  darkModeContainer: {
    backgroundColor: '#05080c',
  },
  section: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    padding: 4,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#8899a6',
    fontSize: 14,
    marginBottom: 8,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#1e2833',
  },
  editProfileText: {
    color: '#00f2fe',
    fontSize: 12,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingIcon: {
    marginRight: 8,
  },
  label: {
    color: '#8899a6',
    fontSize: 14,
  },
  value: {
    color: 'white',
    fontSize: 16,
    marginTop: 2,
  },
  speedValueContainer: {
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  speedValue: {
    color: '#00f2fe',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modeButton: {
    backgroundColor: '#1e2833',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedModeButton: {
    borderColor: '#00f2fe',
    borderWidth: 1,
    backgroundColor: '#1d2733',
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#00f2fe',
    fontWeight: 'bold',
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
    marginLeft: 8,
    fontSize: 14,
  },
  emergencyText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },
  editMedicalInfo: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  editMedicalText: {
    color: '#00f2fe',
    fontSize: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintText: {
    color: '#5a6878',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#1e2833',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1e2833',
  },
  saveButton: {
    backgroundColor: '#00f2fe',
  },
});

export default ProfileScreen;