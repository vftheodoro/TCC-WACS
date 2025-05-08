import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Importando as telas
import ControlScreen from './screens/ControlScreen';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const PerfilStack = createStackNavigator();

// Componente principal do app
const App = () => {
  const [email, setEmail] = useState('');

  const handleLogout = () => {
    setEmail('');
  };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#fff',
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen
          name="Controle"
          component={ControlScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>🎮</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Mapa"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>🗺️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Configurações"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>⚙️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={() => (
            <PerfilStack.Navigator>
              <PerfilStack.Screen
                name="Perfil"
                component={ProfileScreen}
                options={{
                  headerShown: false,
                }}
                initialParams={{ email, handleLogout }}
              />
            </PerfilStack.Navigator>
          )}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>👤</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  centerButton: {
    backgroundColor: '#007bff',
  },
  controlButtonText: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'bold',
  },
  velocidadeContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  routeButton: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    position: 'absolute',
    bottom: 170,
    left: 24,
    right: 24,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeInfoBox: {
    position: 'absolute',
    top: 40,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  routeInfoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});
