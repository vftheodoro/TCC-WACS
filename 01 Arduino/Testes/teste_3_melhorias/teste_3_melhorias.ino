#include <SoftwareSerial.h>

// Configuração Bluetooth (HC-05/06)
SoftwareSerial bluetooth(10, 11); // RX, TX

// Pinos dos motores invertidos
const int IN1_direita = 5;   // Motor direito IN1
const int IN2_direita = 6;   // Motor direito IN2
const int IN3_esquerda = 3;  // Motor esquerdo IN3
const int IN4_esquerda = 2;  // Motor esquerdo IN4
const int ENA = 7;           // PWM motor direito
const int ENB = 4;           // PWM motor esquerdo

// Sensor ultrassônico HC-SR04
const int trigPin = 8;
const int echoPin = 9;

// Pinos adicionais para funções extras
const int buzzerPin = 12;    // Buzina
const int farolPin = 13;     // Farol/Luz LED

int velocidade = 200;        // Velocidade padrão (0-255)
unsigned long ultimaMedida = 0;
const int intervaloMedida = 100; // Intervalo entre medições em ms
boolean farolLigado = false;
boolean modoReverso = false;

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  
  // Configuração dos pinos dos motores
  pinMode(IN1_direita, OUTPUT);
  pinMode(IN2_direita, OUTPUT);
  pinMode(IN3_esquerda, OUTPUT);
  pinMode(IN4_esquerda, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  
  // Configuração do sensor
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Configuração dos pinos extras
  pinMode(buzzerPin, OUTPUT);
  pinMode(farolPin, OUTPUT);
  
  pararMotores();
  bluetooth.println("Sistema iniciado!");
}

void loop() {
  verificarBluetooth();
  verificarObstaculo();
}

void verificarBluetooth() {
  if (bluetooth.available() > 0) {
    String comando = bluetooth.readStringUntil('\n');
    comando.trim();
    
    if (comando.length() >= 1) {
      char direcao = comando.charAt(0);
      
      // Extrair valor da velocidade, se presente
      if (comando.length() > 1) {
        int novaVelocidade = comando.substring(1).toInt();
        if (novaVelocidade > 0) {
          velocidade = constrain(novaVelocidade, 0, 255);
        }
      }
      
      executarComando(direcao);
      enviarFeedback(direcao, velocidade);
    }
  }
}

void verificarObstaculo() {
  if (millis() - ultimaMedida >= intervaloMedida) {
    int distancia = medirDistancia();
    
    if (distancia > 0 && distancia < 20) { // 20cm mínimo
      pararMotores();
      bluetooth.println("ALERTA: Obstáculo próximo!");
      // Aviso sonoro
      tone(buzzerPin, 2000, 200);
    }
    ultimaMedida = millis();
  }
}

int medirDistancia() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duracao = pulseIn(echoPin, HIGH);
  return duracao * 0.034 / 2; // Conversão para cm
}

void executarComando(char direcao) {
  switch(direcao) {
    case 'F': frente(); break;
    case 'B': tras(); break;
    case 'E': esquerda(); break;
    case 'D': direita(); break;
    case 'S': pararMotores(); break;
    case 'L': controlarFarol(); break;
    case 'H': acionarBuzina(); break;
    case 'R': alternarModoReverso(); break;
    default: pararMotores(); break;
  }
}

void enviarFeedback(char direcao, int velocidade) {
  bluetooth.print("Comando: ");
  bluetooth.print(direcao);
  bluetooth.print(" | Velocidade: ");
  bluetooth.println(velocidade);
  
  // Enviar status da bateria (simulado por enquanto)
  static unsigned long ultimoEnvioBateria = 0;
  if (millis() - ultimoEnvioBateria > 30000) { // A cada 30 segundos
    bluetooth.println("Bateria: 85%");
    ultimoEnvioBateria = millis();
  }
}

void controlarFarol() {
  farolLigado = !farolLigado;
  digitalWrite(farolPin, farolLigado ? HIGH : LOW);
  bluetooth.print("Farol: ");
  bluetooth.println(farolLigado ? "LIGADO" : "DESLIGADO");
}

void acionarBuzina() {
  tone(buzzerPin, 1000, 500); // Frequência 1kHz, duração 500ms
  bluetooth.println("Buzina acionada");
}

void alternarModoReverso() {
  modoReverso = !modoReverso;
  bluetooth.print("Modo reverso: ");
  bluetooth.println(modoReverso ? "ATIVADO" : "DESATIVADO");
}

// Funções de movimento (com suporte para modo reverso)
void frente() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  
  if (!modoReverso) {
    digitalWrite(IN1_direita, HIGH);
    digitalWrite(IN2_direita, LOW);
    digitalWrite(IN3_esquerda, HIGH);
    digitalWrite(IN4_esquerda, LOW);
  } else {
    digitalWrite(IN1_direita, LOW);
    digitalWrite(IN2_direita, HIGH);
    digitalWrite(IN3_esquerda, LOW);
    digitalWrite(IN4_esquerda, HIGH);
  }
}

void tras() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  
  if (!modoReverso) {
    digitalWrite(IN1_direita, LOW);
    digitalWrite(IN2_direita, HIGH);
    digitalWrite(IN3_esquerda, LOW);
    digitalWrite(IN4_esquerda, HIGH);
  } else {
    digitalWrite(IN1_direita, HIGH);
    digitalWrite(IN2_direita, LOW);
    digitalWrite(IN3_esquerda, HIGH);
    digitalWrite(IN4_esquerda, LOW);
  }
}

void esquerda() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  
  if (!modoReverso) {
    digitalWrite(IN1_direita, HIGH);
    digitalWrite(IN2_direita, LOW);
    digitalWrite(IN3_esquerda, LOW);
    digitalWrite(IN4_esquerda, HIGH);
  } else {
    digitalWrite(IN1_direita, LOW);
    digitalWrite(IN2_direita, HIGH);
    digitalWrite(IN3_esquerda, HIGH);
    digitalWrite(IN4_esquerda, LOW);
  }
}

void direita() {
  analogWrite(ENA, velocidade);
  analogWrite(ENB, velocidade);
  
  if (!modoReverso) {
    digitalWrite(IN1_direita, LOW);
    digitalWrite(IN2_direita, HIGH);
    digitalWrite(IN3_esquerda, HIGH);
    digitalWrite(IN4_esquerda, LOW);
  } else {
    digitalWrite(IN1_direita, HIGH);
    digitalWrite(IN2_direita, LOW);
    digitalWrite(IN3_esquerda, LOW);
    digitalWrite(IN4_esquerda, HIGH);
  }
}

void pararMotores() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  digitalWrite(IN1_direita, LOW);
  digitalWrite(IN2_direita, LOW);
  digitalWrite(IN3_esquerda, LOW);
  digitalWrite(IN4_esquerda, LOW);
}