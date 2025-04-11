const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const WebSocket = require('ws');

class WACSBackend {
  constructor() {
    this.app = express();
    this.server = null;
    this.wss = null;
    this.systemStatus = {
      connected: false,
      battery: 0,
      distance: 0,
      headlight: false,
      buzzer: false,
      emergency: false,
      usageTime: 0,
      lastCommand: null
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSerial();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.post('/send-command', (req, res) => {
      const { command } = req.body;
      
      if (!command) {
        return res.status(400).json({ error: 'Invalid command' });
      }
      
      if (!this.systemStatus.connected) {
        return res.status(503).json({ error: 'Device not connected' });
      }
      
      this.sendToArduino(command);
      this.systemStatus.lastCommand = command;
      
      res.json({ 
        status: 'Command sent',
        command,
        timestamp: new Date().toISOString()
      });
    });
    
    this.app.get('/status', (req, res) => {
      res.json(this.systemStatus);
    });
  }

  setupSerial() {
    this.port = new SerialPort({
      path: 'COM4', // ATUALIZE PARA SUA PORTA
      baudRate: 9600,
      autoOpen: false
    });

    this.port.on('open', () => {
      console.log('Serial port opened');
      this.systemStatus.connected = true;
      this.broadcastStatus();
    });

    this.port.on('data', (data) => {
      const message = data.toString().trim();
      this.parseArduinoMessage(message);
    });

    this.port.on('close', () => {
      console.log('Serial port closed');
      this.systemStatus.connected = false;
      this.broadcastStatus();
    });

    this.port.on('error', (err) => {
      console.error('Serial error:', err);
      this.systemStatus.connected = false;
      this.broadcastStatus();
    });

    this.port.open((err) => {
      if (err) {
        console.error('Error opening port:', err.message);
      }
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      ws.send(JSON.stringify(this.systemStatus));
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'COMMAND') {
            console.log('Received command:', data.command);
            this.sendToArduino(data.command);
            this.systemStatus.lastCommand = data.command;
            this.broadcastStatus();
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket disconnected');
      });
    });
  }

  parseArduinoMessage(message) {
    console.log('Received from Arduino:', message);
    // ... (mantenha o mesmo conteúdo da função parseArduinoMessage)
  }

  sendToArduino(command) {
    if (this.port && this.port.isOpen) {
      console.log('Sending to Arduino:', command);
      this.port.write(command + '\n');
    } else {
      console.error('Serial port not available');
    }
  }

  broadcastStatus() {
    if (!this.wss) return;
    
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(this.systemStatus));
      }
    });
  }

  sendAlert(alert) {
    if (!this.wss) return;
    
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'ALERT', message: alert }));
      }
    });
    
    if (alert === 'OBSTACLE' || alert === 'LOW_BATTERY') {
      this.sendToArduino('S');
    }
  }

  start() {
    this.server = this.app.listen(3000, () => {
      console.log('HTTP server running on port 3000');
      this.setupWebSocket();
      console.log('WebSocket server running on the same port');
    });
  }
}

// Inicialização
const backend = new WACSBackend();
backend.start();

process.on('SIGINT', () => {
  if (backend.port.isOpen) {
    backend.port.close();
  }
  if (backend.server) {
    backend.server.close();
  }
  process.exit();
});