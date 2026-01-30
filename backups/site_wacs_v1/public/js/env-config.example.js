// Carrega as configurações do ambiente para uso nos arquivos JavaScript
// Este arquivo deve ser carregado antes dos outros scripts do Firebase
// RENOMEIE ESTE ARQUIVO PARA env-config.js E SUBSTITUA OS VALORES ABAIXO PELOS SEUS PRÓPRIOS

// Objeto global para armazenar as variáveis de ambiente
window.ENV = {
    // Firebase Configuration
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

console.log('Variáveis de ambiente carregadas com sucesso.'); 