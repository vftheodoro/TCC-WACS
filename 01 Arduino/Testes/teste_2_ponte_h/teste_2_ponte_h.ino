#include <SoftwareSerial.h> // Opcional para Bluetooth

// Pinos da Ponte H
const int IN1_esquerda = 9;
const int IN2_esquerda = 10;
const int IN3_direita = 11;
const int IN4_direita = 12;
const int ENA = 5;  // PWM motor esquerdo
const int ENB = 6;  // PWM motor direito

int velocidade = 200; // Velocidade padrão (0-255)

void setup() {
  Serial.begin(9600);
  
  pinMode(IN1_esquerda, OUTPUT);
  pinMode(IN2_esquerda, OUTPUT);
  pinMode(IN3_direita, OUTPUT);
  pinMode(IN4_direita, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  
  pararMotores();
}

void loop() {
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n'); // Lê até nova linha
    
    if (comando.length() >= 1) {
      char direcao = comando[0];
      int novaVelocidade = comando.substring(1).toInt();
      
      if (novaVelocidade > 0) {
        velocidade = constrain(novaVelocidade, 0, 255);
      }
      
      executarComando(direcao);
      Serial.print("Comando: ");
      Serial.print(direcao);
      Serial.print(" | Velocidade: ");
      Serial.println(velocidade);
    }
  }
}

void executarComando(char direcao) {
  switch(direcao) {
    case 'F': frente(); break;
    case 'B': tras(); break;
    case 'E': esquerda(); break;
    case 'D': direita(); break;
    case 'S': pararMotores(); break;
  }
}

// Funções atualizadas com PWM
void frente() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  digitalWrite(IN1_esquerda, LOW);
  digitalWrite(IN2_esquerda, HIGH);
  digitalWrite(IN3_direita, LOW);
  digitalWrite(IN4_direita, HIGH);
}

void tras() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  digitalWrite(IN1_esquerda, HIGH);
  digitalWrite(IN2_esquerda, LOW);
  digitalWrite(IN3_direita, HIGH);
  digitalWrite(IN4_direita, LOW);
}

void esquerda() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  digitalWrite(IN1_esquerda, HIGH);
  digitalWrite(IN2_esquerda, LOW);
  digitalWrite(IN3_direita, LOW);
  digitalWrite(IN4_direita, HIGH);
}

void direita() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  digitalWrite(IN1_esquerda, LOW);
  digitalWrite(IN2_esquerda, HIGH);
  digitalWrite(IN3_direita, HIGH);
  digitalWrite(IN4_direita, LOW);
}

void pararMotores() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  digitalWrite(IN1_esquerda, LOW);
  digitalWrite(IN2_esquerda, LOW);
  digitalWrite(IN3_direita, LOW);
  digitalWrite(IN4_direita, LOW);
}
