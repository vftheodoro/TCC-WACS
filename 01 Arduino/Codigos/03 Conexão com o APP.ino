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

// Button Pins
const int botaoFrente = 6;
const int botaoTras = 7;
const int botaoEsquerda = 8;
const int botaoDireita = 9;

// Control Mode Variables
bool bluetoothControlMode = false;
unsigned long lastBluetoothActivity = 0;
unsigned long bluetoothTimeoutDuration = 5000; // 5 segundos de timeout

// Status Display Variables
enum ConnectionStatus {
  DESCONECTADO,
  CONECTANDO,
  CONECTADO
};
ConnectionStatus currentStatus = DESCONECTADO;

void updateLCDStatus() {
  lcd.clear();
  lcd.setCursor(0, 0);
  
  switch(currentStatus) {
    case DESCONECTADO:
      lcd.print("Bluetooth:");
      lcd.setCursor(0, 1);
      lcd.print("Desconectado    ");
      break;
    case CONECTANDO:
      lcd.print("Bluetooth:");
      lcd.setCursor(0, 1);
      lcd.print("Conectando...   ");
      break;
    case CONECTADO:
      lcd.print("Bluetooth:");
      lcd.setCursor(0, 1);
      lcd.print("Conectado       ");
      break;
  }
}

void setup() {
  // Initialize Serial and Bluetooth Communication
  Serial.begin(9600);
  bluetooth.begin(9600);

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

void moveForward() {
  lcd.clear();
  lcd.print("Comando: Frente");
  digitalWrite(rodaEsquerdaForca, HIGH);
  digitalWrite(rodaDireitaForca, HIGH);
  digitalWrite(rodaEsquerdaGiro, LOW);
  digitalWrite(rodaDireitaGiro, LOW);
}

void moveBackward() {
  lcd.clear();
  lcd.print("Comando: Tras");
  digitalWrite(rodaEsquerdaForca, HIGH);
  digitalWrite(rodaDireitaForca, HIGH);
  digitalWrite(rodaEsquerdaGiro, HIGH);
  digitalWrite(rodaDireitaGiro, HIGH);
}

void turnLeft() {
  lcd.clear();
  lcd.print("Comando: Esq");
  digitalWrite(rodaEsquerdaForca, LOW);
  digitalWrite(rodaDireitaForca, HIGH);
  digitalWrite(rodaDireitaGiro, LOW);
}

void turnRight() {
  lcd.clear();
  lcd.print("Comando: Dir");
  digitalWrite(rodaEsquerdaForca, HIGH);
  digitalWrite(rodaDireitaForca, LOW);
  digitalWrite(rodaEsquerdaGiro, LOW);
}

void stopMoving() {
  lcd.clear();
  lcd.print("Comando: Parar");
  digitalWrite(rodaEsquerdaForca, LOW);
  digitalWrite(rodaDireitaForca, LOW);
}

void processBluetooth() {
  if (bluetooth.available()) {
    char command = bluetooth.read();
    
    // Atualiza status de conexão
    if (currentStatus != CONECTADO) {
      currentStatus = CONECTADO;
      updateLCDStatus();
    }
    
    // Reseta o tempo de timeout
    lastBluetoothActivity = millis();
    
    switch(command) {
      case 'F':  // Forward
        moveForward();
        bluetoothControlMode = true;
        break;
      case 'B':  // Backward
        moveBackward();
        bluetoothControlMode = true;
        break;
      case 'L':  // Left
        turnLeft();
        bluetoothControlMode = true;
        break;
      case 'R':  // Right
        turnRight();
        bluetoothControlMode = true;
        break;
      case 'S':  // Stop
        stopMoving();
        bluetoothControlMode = true;
        break;
    }
  }
}

void processButtonControls() {
  // Sempre permite controle por botão se não houver atividade Bluetooth
  if (millis() - lastBluetoothActivity > bluetoothTimeoutDuration) {
    bluetoothControlMode = false;
    
    // Verifica se o botão "Frente" foi pressionado
    if (digitalRead(botaoFrente) == LOW) {
      lcd.clear();
      lcd.print("Botao: Frente");
      digitalWrite(rodaEsquerdaForca, HIGH);
      digitalWrite(rodaDireitaForca, HIGH);
      digitalWrite(rodaEsquerdaGiro, LOW);
      digitalWrite(rodaDireitaGiro, LOW);
    }
    // Verifica se o botão "Trás" foi pressionado
    else if (digitalRead(botaoTras) == LOW) {
      lcd.clear();
      lcd.print("Botao: Tras");
      digitalWrite(rodaEsquerdaForca, HIGH);
      digitalWrite(rodaDireitaForca, HIGH);
      digitalWrite(rodaEsquerdaGiro, HIGH);
      digitalWrite(rodaDireitaGiro, HIGH);
    }
    // Verifica se o botão "Esquerda" foi pressionado
    else if (digitalRead(botaoEsquerda) == LOW) {
      lcd.clear();
      lcd.print("Botao: Esquerda");
      digitalWrite(rodaEsquerdaForca, LOW);
      digitalWrite(rodaDireitaForca, HIGH);
      digitalWrite(rodaDireitaGiro, LOW);
    }
    // Verifica se o botão "Direita" foi pressionado
    else if (digitalRead(botaoDireita) == LOW) {
      lcd.clear();
      lcd.print("Botao: Direita");
      digitalWrite(rodaEsquerdaForca, HIGH);
      digitalWrite(rodaDireitaForca, LOW);
      digitalWrite(rodaEsquerdaGiro, LOW);
    }
    // Se nenhum botão estiver pressionado, a cadeira fica parada
    else {
      lcd.clear();
      lcd.print("Modo: Repouso");
      digitalWrite(rodaEsquerdaForca, LOW);
      digitalWrite(rodaDireitaForca, LOW);
    }
  }
}

void checkBluetoothConnection() {
  // Verifica se houve timeout na conexão Bluetooth
  if (currentStatus == CONECTADO && 
      (millis() - lastBluetoothActivity > bluetoothTimeoutDuration)) {
    currentStatus = DESCONECTADO;
    updateLCDStatus();
  }
}

void loop() {
  // Processa comandos Bluetooth
  processBluetooth();
  
  // Verifica status da conexão Bluetooth
  checkBluetoothConnection();
  
  // Processa controles por botão
  processButtonControls();

  delay(100);  // Pequeno delay para evitar leituras falsas
}