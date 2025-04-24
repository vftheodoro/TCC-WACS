import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from './theme';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ControlScreen from './screens/ControlScreen';
import MapsScreen from './screens/MapsScreen';
import HistoryScreen from './screens/HistoryScreen';
import AccountScreen from './screens/AccountScreen';
import DeviceInfoScreen from './screens/DeviceInfoScreen';
import PairingScreen from './screens/PairingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Controle':
              iconName = focused ? 'game-controller-outline' : 'game-controller-outline';
              break;
            case 'Mapas':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Histórico':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Conta':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00f2fe',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          backgroundColor: '#0a0e14',
          borderTopWidth: 1,
          borderTopColor: '#1a1f27',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Controle" component={ControlScreen} />
      <Tab.Screen name="Mapas" component={MapsScreen} />
      <Tab.Screen name="Histórico" component={HistoryScreen} />
      <Tab.Screen name="Conta" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Pairing" component={PairingScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="DeviceInfo" component={DeviceInfoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}