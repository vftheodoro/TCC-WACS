// Script para carregar variáveis de ambiente
// Este arquivo é apenas para demonstração de como carregar variáveis de ambiente
// de um arquivo .env para o objeto window.ENV

/**
 * Função para carregar variáveis de ambiente em um ambiente Node.js
 * Nota: Este código só funciona em um ambiente de build, não diretamente no navegador.
 */
function loadEnvVars() {
  try {
    // Em um ambiente de build real, você usaria algo como:
    // require('dotenv').config();
    
    // E então exportaria as variáveis:
    return {
      // Firebase Configuration
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || 'placeholder',
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || 'placeholder',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'placeholder',
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'placeholder',
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || 'placeholder',
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || 'placeholder',
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || 'placeholder',

      // Google Maps API Key
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'placeholder',

      // WebSocket (se necessário)
      WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'placeholder'
    };
  } catch (error) {
    console.error('Erro ao carregar variáveis de ambiente:', error);
    return {};
  }
}

/**
 * COMO USAR ESTE ARQUIVO:
 * 
 * Este arquivo serve apenas como exemplo de como você poderia implementar o carregamento
 * de variáveis de ambiente em um processo de build real.
 * 
 * 1. Configure um arquivo .env na raiz do projeto
 * 2. Use uma ferramenta como dotenv para carregar as variáveis
 * 3. No processo de build, substitua os valores em env-config.js
 * 
 * Exemplo com webpack:
 * 
 * const webpack = require('webpack');
 * require('dotenv').config();
 * 
 * module.exports = {
 *   // ... outras configurações webpack
 *   plugins: [
 *     new webpack.DefinePlugin({
 *       'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
 *       // ... outras variáveis
 *     }),
 *   ],
 * };
 */

// Este objeto é apenas para demonstração e não deve ser usado diretamente
const ENV_EXAMPLE = {
  // Firebase Configuration - SUBSTITUA POR SUAS PRÓPRIAS CHAVES
  FIREBASE_API_KEY: 'sua-chave-api-aqui',
  FIREBASE_AUTH_DOMAIN: 'seu-projeto.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'seu-projeto-id',
  FIREBASE_STORAGE_BUCKET: 'seu-projeto.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: 'seu-sender-id',
  FIREBASE_APP_ID: 'seu-app-id',
  FIREBASE_MEASUREMENT_ID: 'sua-measurement-id',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: 'sua-chave-google-maps-aqui',

  // WebSocket (se necessário)
  WEBSOCKET_URL: 'wss://seu-servidor.com/ws'
}; 