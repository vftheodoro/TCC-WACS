const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configure sua porta serial
const arduinoPort = new SerialPort({
  path: 'COM5', // Altere para sua porta
  baudRate: 9600,
  autoOpen: false
});

// 2. Rotas
app.post('/send-command', (req, res) => {
  const { command } = req.body;
  
  if (!command) return res.status(400).json({ error: 'Comando inválido' });
  
  arduinoPort.write(command + '\n', (err) => {
    if (err) return res.status(500).json({ error: 'Erro na comunicação' });
    res.json({ status: 'Comando enviado', command });
  });
});

// 3. Inicialização
arduinoPort.open((err) => {
  if (err) {
    console.error('ERRO ARDUINO:', err.message);
    process.exit(1);
  }
  
  app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
    console.log('Arduino conectado em', arduinoPort.path);
  });
});

// 4. Tratamento de erros
arduinoPort.on('error', (err) => console.error('Erro serial:', err));
process.on('SIGINT', () => {
  arduinoPort.close();
  process.exit();
});