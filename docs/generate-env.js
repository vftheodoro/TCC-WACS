const fs = require('fs');
const path = require('path');

// Caminho para o arquivo env-config.js
const envConfigPath = path.join(__dirname, 'public', 'js', 'env-config.js');

// Conteúdo do arquivo, preenchido com as variáveis do ambiente do Netlify
const content = `window.ENV = {
    FIREBASE_API_KEY: '${process.env.FIREBASE_API_KEY}',
    FIREBASE_AUTH_DOMAIN: '${process.env.FIREBASE_AUTH_DOMAIN}',
    FIREBASE_PROJECT_ID: '${process.env.FIREBASE_PROJECT_ID}',
    FIREBASE_STORAGE_BUCKET: '${process.env.FIREBASE_STORAGE_BUCKET}',
    FIREBASE_MESSAGING_SENDER_ID: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    FIREBASE_APP_ID: '${process.env.FIREBASE_APP_ID}',
    FIREBASE_MEASUREMENT_ID: '${process.env.FIREBASE_MEASUREMENT_ID}',
    GOOGLE_MAPS_API_KEY: '${process.env.GOOGLE_MAPS_API_KEY}',
    WEBSOCKET_URL: '${process.env.WEBSOCKET_URL || ''}'
};\n`;

fs.writeFileSync(envConfigPath, content);
console.log('Arquivo env-config.js gerado com sucesso!');
