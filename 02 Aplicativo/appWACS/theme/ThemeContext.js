import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definição dos temas
const themes = {
  dark: {
    name: 'dark',
    colors: {
      primary: '#00f2fe',
      secondary: '#7a828a',
      background: '#0a0e14',
      card: '#141a24',
      text: '#ffffff',
      border: '#1a1f27',
      notification: '#ff4444',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#3498db',
      disabled: '#555',
      highlight: '#1e2530',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      round: 9999,
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  light: {
    name: 'light',
    colors: {
      primary: '#0088cc',
      secondary: '#555555',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#333333',
      border: '#dddddd',
      notification: '#ff4444',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#3498db',
      disabled: '#aaaaaa',
      highlight: '#e9f7fd',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      round: 9999,
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
};

// Criar o contexto do tema
const ThemeContext = createContext({
  theme: themes.dark,
  toggleTheme: () => {},
});

// Hook personalizado para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
};

// Componente Provider do tema
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark);
  
  // Carregar tema salvo
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme) {
          setTheme(themes[savedTheme] || themes.dark);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // Alternar entre temas
  const toggleTheme = async () => {
    const newTheme = theme.name === 'dark' ? themes.light : themes.dark;
    setTheme(newTheme);
    
    try {
      await AsyncStorage.setItem('@theme', newTheme.name);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Exportar apenas o que ainda não foi exportado
export { ThemeContext, themes as default };
