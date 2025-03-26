#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Configuração do LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Definição dos pinos dos motores
const int IN1 = 5, IN2 = 6, ENA1 = 7;
const int IN3 = 3, IN4 = 2, ENA2 = 4;

// LED e sensores
const int ledAzul = 8;
const int TRIG = 9, ECHO = 10;
const int pinoBateria = A0;

// Parâmetros atualizados para 12V
const float VOLTAGE_MAX = 11.99;  // Tensão máxima de uma bateria de 12V (100%)
const float VOLTAGE_MIN = 9.5;  // Tensão mínima (0%)
const float R1 = 56000.0;       // Resistor divisor de tensão R1 (56kΩ)
const float R2 = 33000.0;       // Resistor divisor de tensão R2 (33kΩ)

// Variáveis do sistema
bool conectado = false;
String comandoAtual = "Parado";
unsigned long lastSerial = 0, lastLCD = 0, lastLED = 0;

void setup() {
  // Configuração dos pinos
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENA1, OUTPUT); pinMode(ENA2, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ledAzul, OUTPUT);
  
  // Inicialização do LCD
  lcd.init();
  lcd.backlight();
  
  // Comunicação serial
  Serial.begin(9600);
  Serial.println("Sistema Iniciado");
}
float medirTensao() {
  int leitura = analogRead(pinoBateria);
  // Cálculo para 12V com divisor de tensão
  return (leitura * 5.0 / 1023.0) * ((R1 + R2)/R2);
}

int calcularBateria() {
  float tensao = medirTensao();
  tensao = constrain(tensao, VOLTAGE_MIN, VOLTAGE_MAX);
  return map(tensao * 100, VOLTAGE_MIN * 100, VOLTAGE_MAX * 100, 0, 100);
}

void atualizarLCD() {
  if(millis() - lastLCD > 1000) {
    lastLCD = millis();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Bateria: ");
    lcd.print(calcularBateria());
    lcd.print("%");
    lcd.setCursor(0, 1);
    lcd.print(medirTensao(), 1);  // Uma casa decimal
    lcd.print("V");
  }
}

long medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH) * 0.034 / 2;
}

void enviarSerial() {
  if(millis() - lastSerial > 100) {
    lastSerial = millis();
    Serial.print("Distancia: ");
    Serial.print(medirDistancia());
    Serial.print(" cm | Bateria: ");
    Serial.print(calcularBateria());
    Serial.print("% (");
    Serial.print(medirTensao(), 2);
    Serial.print("V) | Comando: ");
    Serial.print(comandoAtual);
    Serial.print(" | Conexao: ");
    Serial.println(conectado ? "Conectado" : "Desconectado");
  }
}

void controleLED() {
  if(conectado) {
    digitalWrite(ledAzul, HIGH);
  } else {
    if(millis() - lastLED > 250) {
      lastLED = millis();
      digitalWrite(ledAzul, !digitalRead(ledAzul));
    }
  }
}

void frente() {
  analogWrite(ENA1, 255);
  analogWrite(ENA2, 255);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  comandoAtual = "Movendo para Frente";
}

void tras() {
  analogWrite(ENA1, 200);
  analogWrite(ENA2, 200);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  comandoAtual = "Movendo para Tras";
}

void esquerda() {
  analogWrite(ENA1, 0);
  analogWrite(ENA2, 255);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  comandoAtual = "Virando a Esquerda";
}

void direita() {
  analogWrite(ENA1, 255);
  analogWrite(ENA2, 0);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  comandoAtual = "Virando a Direita";
}

void parar() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  comandoAtual = "Parado";
}

void verificarConexao() {
  if(Serial.available()) {
    char c = Serial.read();
    if(c == 'C') conectado = true;
    if(c == 'D') conectado = false;
  }
}

void loop() {
  verificarConexao();
  atualizarLCD();
  enviarSerial();
  controleLED();

  if(conectado) {
    if(Serial.available()) {
      char cmd = toupper(Serial.read());
      switch(cmd) {
        case 'F': frente(); break;
        case 'T': tras(); break;
        case 'E': esquerda(); break;
        case 'D': direita(); break;
        default: parar();
      }
    }
  } else {
    static unsigned long etapaStart = millis();
    static byte etapa = 0;
    
    switch(etapa) {
      case 0:
        frente();
        if(millis() - etapaStart > 2000) {
          etapa = 1;
          etapaStart = millis();
        }
        break;
        
      case 1:
        parar();
        if(millis() - etapaStart > 1000) {
          etapa = 2;
          etapaStart = millis();
        }
        break;
        
      case 2:
        tras();
        if(millis() - etapaStart > 2000) {
          etapa = 3;
          etapaStart = millis();
        }
        break;
        
      case 3:
        parar();
        if(millis() - etapaStart > 1000) {
          etapa = 0;
          etapaStart = millis();
        }
        break;
    }
  }
}