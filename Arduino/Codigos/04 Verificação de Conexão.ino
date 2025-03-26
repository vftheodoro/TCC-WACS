#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

// LCD Configuration
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Motor Control Pins
const int rodaEsquerdaForca = 2;
const int rodaEsquerdaGiro = 3;
const int rodaDireitaForca = 4;
const int rodaDireitaGiro = 5;

// Bluetooth Module Pins
const int bluetoothTx = 10;  // Connect to RX of HC-05
const int bluetoothRx = 11;  // Connect to TX of HC-05
SoftwareSerial bluetooth(bluetoothRx, bluetoothTx);

// LED Pins
const int ledVermelho = 13;
const int ledAzul = 12;

// Button Pins
const int botaoFrente = 6;
const int botaoTras = 7;
const int botaoEsquerda = 8;
const int botaoDireita = 9;

// Control Mode Variables
bool bluetoothControlMode = false;
unsigned long lastBluetoothActivity = 0;
unsigned long bluetoothTimeoutDuration = 5000; // 5 segundos de timeout

// LED Blinking Variables
unsigned long previousMillis = 0;
const long blinkInterval = 500; // Intervalo de 500ms para piscar
bool ledState = LOW;

// Status Display Variables
enum ConnectionStatus {
  DESCONECTADO,
  CONECTANDO,
  CONECTADO
};
ConnectionStatus currentStatus = DESCONECTADO;

void updateLEDStatus() {
  switch(currentStatus) {
    case DESCONECTADO:
      // LED vermelho pisca quando desconectado
      digitalWrite(ledVermelho, ledState);
      digitalWrite(ledAzul, LOW);
      break;
    case CONECTADO:
      // LED azul aceso fixo quando conectado
      digitalWrite(ledVermelho, LOW);
      digitalWrite(ledAzul, HIGH);
      break;
    case CONECTANDO:
      // Opcional: Você pode adicionar um estado intermediário se necessário
      digitalWrite(ledVermelho, LOW);
      digitalWrite(ledAzul, LOW);
      break;
  }
}

void blinkDisconnectedLED() {
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= blinkInterval) {
    // Salva o último tempo de alternância
    previousMillis = currentMillis;
    
    // Alterna o estado do LED
    if (currentStatus == DESCONECTADO) {
      ledState = !ledState;
      digitalWrite(ledVermelho, ledState);
    }
  }
}

void updateLCDStatus() {
  lcd.clear();
  lcd.setCursor(0, 0);
  
  switch(currentStatus) {
    case DESCONECTADO:
      lcd.print("Bluetooth:");
      lcd.setCursor(0, 1);
      lcd.print("Desconectado    ");
      break;
    case CONECTADO:
      lcd.print("Bluetooth:");
      lcd.setCursor(0, 1);
      lcd.print("Conectado       ");
      break;
    case CONECTANDO:
      lcd.print("Bluetooth:");
      lcd.setCursor(0, 1);
      lcd.print("Conectando...   ");
      break;
  }
}

void processButtonControls() {
  // Função para processar controles por botão
  if (digitalRead(botaoFrente) == LOW) {
    // Move para frente
    digitalWrite(rodaEsquerdaForca, HIGH);
    digitalWrite(rodaDireitaForca, HIGH);
    digitalWrite(rodaEsquerdaGiro, LOW);
    digitalWrite(rodaDireitaGiro, LOW);
  }
  else if (digitalRead(botaoTras) == LOW) {
    // Move para trás
    digitalWrite(rodaEsquerdaForca, HIGH);
    digitalWrite(rodaDireitaForca, HIGH);
    digitalWrite(rodaEsquerdaGiro, HIGH);
    digitalWrite(rodaDireitaGiro, HIGH);
  }
  else if (digitalRead(botaoEsquerda) == LOW) {
    // Vira para a esquerda
    digitalWrite(rodaEsquerdaForca, LOW);
    digitalWrite(rodaDireitaForca, HIGH);
    digitalWrite(rodaEsquerdaGiro, LOW);
    digitalWrite(rodaDireitaGiro, LOW);
  }
  else if (digitalRead(botaoDireita) == LOW) {
    // Vira para a direita
    digitalWrite(rodaEsquerdaForca, HIGH);
    digitalWrite(rodaDireitaForca, LOW);
    digitalWrite(rodaEsquerdaGiro, LOW);
    digitalWrite(rodaDireitaGiro, LOW);
  }
  else {
    // Para todos os motores quando nenhum botão é pressionado
    digitalWrite(rodaEsquerdaForca, LOW);
    digitalWrite(rodaDireitaForca, LOW);
    digitalWrite(rodaEsquerdaGiro, LOW);
    digitalWrite(rodaDireitaGiro, LOW);
  }
}

void checkBluetoothConnection() {
  // Verifica se houve timeout na conexão Bluetooth
  if (currentStatus == CONECTADO && 
      (millis() - lastBluetoothActivity > bluetoothTimeoutDuration)) {
    currentStatus = DESCONECTADO;
    updateLCDStatus();
    updateLEDStatus();
  }
}

void processBluetooth() {
  if (bluetooth.available()) {
    char command = bluetooth.read();
    
    // Atualiza status de conexão
    if (currentStatus != CONECTADO) {
      currentStatus = CONECTADO;
      updateLCDStatus();
      updateLEDStatus();
    }
    
    // Reseta o tempo de timeout
    lastBluetoothActivity = millis();
    
    // Processamento dos comandos Bluetooth
    switch(command) {
      case 'F': // Frente
        digitalWrite(rodaEsquerdaForca, HIGH);
        digitalWrite(rodaDireitaForca, HIGH);
        digitalWrite(rodaEsquerdaGiro, LOW);
        digitalWrite(rodaDireitaGiro, LOW);
        break;
      case 'B': // Trás
        digitalWrite(rodaEsquerdaForca, HIGH);
        digitalWrite(rodaDireitaForca, HIGH);
        digitalWrite(rodaEsquerdaGiro, HIGH);
        digitalWrite(rodaDireitaGiro, HIGH);
        break;
      case 'L': // Esquerda
        digitalWrite(rodaEsquerdaForca, LOW);
        digitalWrite(rodaDireitaForca, HIGH);
        digitalWrite(rodaEsquerdaGiro, LOW);
        digitalWrite(rodaDireitaGiro, LOW);
        break;
      case 'R': // Direita
        digitalWrite(rodaEsquerdaForca, HIGH);
        digitalWrite(rodaDireitaForca, LOW);
        digitalWrite(rodaEsquerdaGiro, LOW);
        digitalWrite(rodaDireitaGiro, LOW);
        break;
      case 'S': // Stop
      default:
        digitalWrite(rodaEsquerdaForca, LOW);
        digitalWrite(rodaDireitaForca, LOW);
        digitalWrite(rodaEsquerdaGiro, LOW);
        digitalWrite(rodaDireitaGiro, LOW);
        break;
    }
  }
}

void setup() {
  // Initialize Serial and Bluetooth Communication
  Serial.begin(9600);
  bluetooth.begin(9600);

  // Configura pinos de LED
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledAzul, OUTPUT);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  
  // Exibe mensagem inicial
  lcd.clear();
  lcd.print("Cadeira de Rodas");
  lcd.setCursor(0, 1);
  lcd.print("Inicializando...");
  delay(2000);

  // Atualiza status inicial
  updateLCDStatus();
  updateLEDStatus();

  // Motor pins as output
  pinMode(rodaEsquerdaForca, OUTPUT);
  pinMode(rodaEsquerdaGiro, OUTPUT);
  pinMode(rodaDireitaForca, OUTPUT);
  pinMode(rodaDireitaGiro, OUTPUT);

  // Button pins as input with internal pull-up
  pinMode(botaoFrente, INPUT_PULLUP);
  pinMode(botaoTras, INPUT_PULLUP);
  pinMode(botaoEsquerda, INPUT_PULLUP);
  pinMode(botaoDireita, INPUT_PULLUP);
}

void loop() {
  // Processa comandos Bluetooth
  processBluetooth();
  
  // Verifica status da conexão Bluetooth
  checkBluetoothConnection();
  
  // Pisca LED vermelho quando desconectado
  blinkDisconnectedLED();
  
  // Processa controles por botão
  processButtonControls();

  delay(100);  // Pequeno delay para evitar leituras falsas
}