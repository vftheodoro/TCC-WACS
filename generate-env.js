const fs = require('fs');
const path = require('path');

const envConfig = `\nwindow.ENV = {\n    FIREBASE_API_KEY: '${process.env.FIREBASE_API_KEY}',\n    FIREBASE_AUTH_DOMAIN: '${process.env.FIREBASE_AUTH_DOMAIN}',\n    FIREBASE_PROJECT_ID: '${process.env.FIREBASE_PROJECT_ID}',\n    FIREBASE_STORAGE_BUCKET: '${process.env.FIREBASE_STORAGE_BUCKET}',\n    FIREBASE_MESSAGING_SENDER_ID: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',\n    FIREBASE_APP_ID: '${process.env.FIREBASE_APP_ID}',\n    FIREBASE_MEASUREMENT_ID: '${process.env.FIREBASE_MEASUREMENT_ID}',\n    GOOGLE_MAPS_API_KEY: '${process.env.GOOGLE_MAPS_API_KEY}',\n    WEBSOCKET_URL: '${process.env.WEBSOCKET_URL}'\n};\n`;

fs.writeFileSync(
  path.join(__dirname, 'public/js/env-config.js'),
  envConfig
);

console.log('env-config.js gerado com sucesso!');
