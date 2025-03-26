#include <Wire.h>

// Definição dos pinos dos motores
const int IN1 = 5;  // Motor esquerdo
const int IN2 = 6;  // Motor esquerdo
int ENA1 = 7;       // Velocidade motor esquerdo
const int IN3 = 3;  // Motor direito
const int IN4 = 2;  // Motor direito
int ENA2 = 4;       // Velocidade motor direito

// Led de conexão
const int ledAzul = 8;

// Sensores de Distância 
int TRIG = 9;
int ECHO = 10;

// Variáveis para medição de distância
long tempo;
long distancia;

// Estados do sistema
bool conectado = false;
String comandoAtual = "Parado";
unsigned long previousMillis = 0;

void medirDistancia() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  
  tempo = pulseIn(ECHO, HIGH);
  distancia = tempo * 0.034 / 2;
}

void atualizarSerial() {
  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.println(" cm");
  
  Serial.print("Comando: ");
  Serial.println(comandoAtual);
  
  Serial.print("Conexao: ");
  if(conectado) {
    Serial.println("Conectado");
  } else {
    Serial.println("Desconectado");
  }
  Serial.println("-----------------------");
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

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA1, OUTPUT);
  pinMode(ENA2, OUTPUT);
  pinMode(ledAzul, OUTPUT);

  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  delay(1000);
  Serial.println("Sistema Iniciado");
}

void loop() {
  medirDistancia();
  atualizarSerial();

  // Piscar LED quando desconectado
  if(millis() - previousMillis >= 500) {
    previousMillis = millis();
    digitalWrite(ledAzul, !digitalRead(ledAzul));
  }

  if(!conectado) {
    // Sequência de movimentos não bloqueante
    static unsigned long inicioMovimento = 0;
    static int etapa = 0;
    
    switch(etapa) {
      case 0:
        frente();
        inicioMovimento = millis();
        etapa = 1;
        break;
        
      case 1:
        if(millis() - inicioMovimento >= 2000) {
          parar();
          etapa = 2;
          inicioMovimento = millis();
        }
        break;
        
      case 2:
        if(millis() - inicioMovimento >= 1000) {
          tras();
          etapa = 3;
          inicioMovimento = millis();
        }
        break;
        
      case 3:
        if(millis() - inicioMovimento >= 2000) {
          parar();
          etapa = 4;
          inicioMovimento = millis();
        }
        break;
        
      case 4:
        if(millis() - inicioMovimento >= 1000) {
          esquerda();
          etapa = 5;
          inicioMovimento = millis();
        }
        break;
        
      case 5:
        if(millis() - inicioMovimento >= 2000) {
          parar();
          etapa = 6;
          inicioMovimento = millis();
        }
        break;
        
      case 6:
        if(millis() - inicioMovimento >= 1000) {
          direita();
          etapa = 7;
          inicioMovimento = millis();
        }
        break;
        
      case 7:
        if(millis() - inicioMovimento >= 2000) {
          parar();
          etapa = 0;
          inicioMovimento = millis();
        }
        break;
    }
  }
}