import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Image, 
  Alert,
  BackHandler 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const AccountScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [priorityAccessibility, setPriorityAccessibility] = useState('wheelchair');
  const [notifications, setNotifications] = useState({
    locationAlerts: true,
    achievements: true
  });

  // Dados do usuário
  const userData = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    points: 1200,
    nextLevelPoints: 1500,
    level: 'Explorador de Acessibilidade - Nível 3',
    achievements: [
      'Cadastrou 10 locais acessíveis',
      'Validou 5 avaliações',
      'Ganhou 100 pontos em uma semana',
    ],
  };

  const accessibilityTypes = [
    { id: 'wheelchair', label: 'Cadeira de Rodas', icon: 'wheelchair-accessibility' },
    { id: 'blind', label: 'Deficiência Visual', icon: 'eye' },
    { id: 'deaf', label: 'Surdez', icon: 'ear-hearing' },
  ];

  // Carrega preferências salvas
  useEffect(() => {
    if (isFocused) {
      const loadPreferences = async () => {
        try {
          const savedPreferences = await AsyncStorage.getItem('userPreferences');
          if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            setDarkMode(preferences.darkMode || false);
            setFontSize(preferences.fontSize || 'medium');
            setPriorityAccessibility(preferences.priorityAccessibility || 'wheelchair');
            setNotifications(preferences.notifications || {
              locationAlerts: true,
              achievements: true
            });
          }
        } catch (error) {
          console.error('Erro ao carregar preferências:', error);
        }
      };

      loadPreferences();
    }
  }, [isFocused]);

  // Configura o handler para o botão de voltar
  useEffect(() => {
    const backAction = () => {
      if (hasUnsavedChanges) {
        showUnsavedChangesAlert();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [hasUnsavedChanges]);

  // Verifica se há alterações não salvas quando a tela perde o foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (hasUnsavedChanges) {
        showUnsavedChangesAlert();
      }
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const showUnsavedChangesAlert = () => {
    Alert.alert(
      'Alterações não salvas',
      'Você tem alterações não salvas. Deseja salvar antes de sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Não salvar', onPress: () => navigation.goBack() },
        { 
          text: 'Salvar', 
          onPress: () => {
            savePreferences().then(() => navigation.goBack());
          }
        }
      ]
    );
  };

  const markAsChanged = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  const savePreferences = async () => {
    try {
      const preferences = {
        darkMode,
        fontSize,
        priorityAccessibility,
        notifications
      };
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      setHasUnsavedChanges(false);
      Alert.alert('Sucesso', 'Preferências salvas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      Alert.alert('Erro', 'Não foi possível salvar as preferências');
      return false;
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => console.log('Usuário deslogado') }
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Esta ação é irreversível. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => console.log('Conta excluída') }
      ]
    );
  };

  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    markAsChanged();
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    markAsChanged();
  };

  const handleAccessibilityChange = (type) => {
    setPriorityAccessibility(type);
    markAsChanged();
  };

  const handleDarkModeChange = (value) => {
    setDarkMode(value);
    markAsChanged();
  };

  const navigateToSupport = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Alterações não salvas',
        'Deseja salvar antes de ir para a tela de suporte?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Não salvar', onPress: () => navigation.navigate('Support') },
          { 
            text: 'Salvar', 
            onPress: () => {
              savePreferences().then(() => navigation.navigate('Support'));
            }
          }
        ]
      );
    } else {
      navigation.navigate('Support');
    }
  };

  const progressPercentage = (userData.points / userData.nextLevelPoints) * 100;

  return (
    <ScrollView style={styles.container}>
      {/* Seção: Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧾 Informações da Conta</Text>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: 'https://siga.cps.sp.gov.br/image/CQ5DH79QE3WBJDBFH6HIF7LL6Y8Z4C25-04-2023_12i07i50.TMB.JPG' }}
            style={styles.profileImage} 
          />
          <Text style={styles.userName}>{userData.name}</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="email" size={20} color="#00f2fe" />
          <Text style={styles.infoText}>{userData.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="account" size={20} color="#00f2fe" />
          <Text style={styles.infoText}>Tipo: Usuário Comum</Text>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar Dados Pessoais</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount}>
          <Text style={styles.deleteButtonText}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Sistema de Pontos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Sistema de Pontos</Text>
        <Text style={styles.pointsText}>Você tem {userData.points} pontos!</Text>
        <Text style={styles.levelText}>{userData.level}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>Faltam {userData.nextLevelPoints - userData.points} pontos para o próximo nível</Text>

        <Text style={styles.subtitle}>Histórico de Conquistas</Text>
        {userData.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Icon name="trophy" size={16} color="#FFD700" />
            <Text style={styles.achievementText}>{achievement}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.howToEarnButton}>
          <Text style={styles.howToEarnText}>Como Ganhar Pontos?</Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Preferências */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Preferências</Text>
        
        <Text style={styles.subtitle}>Tipo de Acessibilidade Prioritária</Text>
        <View style={styles.accessibilityOptions}>
          {accessibilityTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.accessibilityButton,
                priorityAccessibility === type.id && styles.selectedAccessibility,
              ]}
              onPress={() => handleAccessibilityChange(type.id)}
            >
              <Icon name={type.icon} size={24} color={priorityAccessibility === type.id ? '#FFFFFF' : '#00f2fe'} />
              <Text style={styles.accessibilityText}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceTextContainer}>
            <Icon name="weather-night" size={20} color="#00f2fe" />
            <Text style={styles.preferenceText}>Modo Escuro</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeChange}
            trackColor={{ false: "#767577", true: "#00f2fe" }}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceTextContainer}>
            <Icon name="format-size" size={20} color="#00f2fe" />
            <Text style={styles.preferenceText}>Tamanho da Fonte</Text>
          </View>
          <View style={styles.fontSizeButtons}>
            {['Pequeno', 'Médio', 'Grande'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.fontSizeButton,
                  fontSize === size.toLowerCase() && styles.selectedFontSize,
                ]}
                onPress={() => handleFontSizeChange(size.toLowerCase())}
              >
                <Text style={styles.fontSizeText}>{size.charAt(0)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Seção: Notificações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notificações</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceTextContainer}>
            <Icon name="map-marker-radius" size={20} color="#00f2fe" />
            <Text style={styles.preferenceText}>Alertas de Locais Próximos</Text>
          </View>
          <Switch
            value={notifications.locationAlerts}
            onValueChange={() => toggleNotification('locationAlerts')}
            trackColor={{ false: "#767577", true: "#00f2fe" }}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceTextContainer}>
            <Icon name="trophy" size={20} color="#00f2fe" />
            <Text style={styles.preferenceText}>Conquistas</Text>
          </View>
          <Switch
            value={notifications.achievements}
            onValueChange={() => toggleNotification('achievements')}
            trackColor={{ false: "#767577", true: "#00f2fe" }}
          />
        </View>
      </View>

      {/* Seção: Suporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Suporte</Text>
        
        <TouchableOpacity 
          style={styles.supportItem}
          onPress={navigateToSupport}
        >
          <View style={styles.supportTextContainer}>
            <Icon name="help-circle" size={20} color="#00f2fe" />
            <Text style={styles.supportText}>FAQ / Ajuda Rápida</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#00f2fe" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <View style={styles.supportTextContainer}>
            <Icon name="email" size={20} color="#00f2fe" />
            <Text style={styles.supportText}>Enviar Feedback</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#00f2fe" />
        </TouchableOpacity>
      </View>

      {/* Botão Salvar Preferências */}
      {hasUnsavedChanges && (
        <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
          <Text style={styles.saveButtonText}>Salvar Preferências</Text>
        </TouchableOpacity>
      )}

      {/* Botão de Sair */}
      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 15,
  },
  section: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  sectionTitle: {
    color: '#00f2fe',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: 'white',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#1e2833',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  editButtonText: {
    color: '#00f2fe',
  },
  deleteButton: {
    backgroundColor: '#1e2833',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#ff4444',
  },
  pointsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  levelText: {
    color: '#7a828a',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1e2833',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00f2fe',
    borderRadius: 4,
  },
  progressText: {
    color: '#7a828a',
    fontSize: 12,
    marginBottom: 15,
  },
  subtitle: {
    color: '#00f2fe',
    fontSize: 14,
    marginBottom: 10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText: {
    color: 'white',
    marginLeft: 8,
  },
  howToEarnButton: {
    backgroundColor: '#1e2833',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  howToEarnText: {
    color: '#00f2fe',
  },
  accessibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  accessibilityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1e2833',
    marginHorizontal: 4,
  },
  selectedAccessibility: {
    backgroundColor: '#00f2fe',
  },
  accessibilityText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  preferenceTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    color: 'white',
    marginLeft: 10,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    backgroundColor: '#1e2833',
    borderRadius: 8,
    padding: 2,
  },
  fontSizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  selectedFontSize: {
    backgroundColor: '#00f2fe',
  },
  fontSizeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  supportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2833',
  },
  supportTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    color: 'white',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#00f2fe',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#0a0e14',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#1e2833',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
  },
});

export default AccountScreen;