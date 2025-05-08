import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileScreen = ({ navigation, email, handleLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.content}>
        <Text style={styles.email}>{email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
