import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import das telas
import LoginScreen from './screens/LoginScreen';
import ControlScreen from './screens/ControlScreen';
import MapsScreen from './screens/MapsScreen';
import AccountScreen from './screens/AccountScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Configuração das abas
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch(route.name) {
            case 'Controle': iconName = 'gamepad'; break;
            case 'Mapas': iconName = 'map'; break;
            case 'Conta': iconName = 'account'; break;
          }
          return <Icon name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: '#00f2fe',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          backgroundColor: '#0a0e14',
          borderTopWidth: 1,
          borderTopColor: '#1a1f27'
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Controle" component={ControlScreen} />
      <Tab.Screen name="Mapas" component={MapsScreen} />
      <Tab.Screen name="Conta" component={AccountScreen} />
    </Tab.Navigator>
  );
};

// Configuração principal
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}