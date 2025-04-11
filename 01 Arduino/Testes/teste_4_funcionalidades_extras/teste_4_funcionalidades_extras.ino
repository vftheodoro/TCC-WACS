#include <SoftwareSerial.h>

/* ====================== CONFIGURAÇÃO DE PINOS ====================== */
const int IN1_right = 5;    // Pino de controle 1 do motor direito
const int IN2_right = 6;    // Pino de controle 2 do motor direito
const int IN3_left = 3;     // Pino de controle 1 do motor esquerdo
const int IN4_left = 2;     // Pino de controle 2 do motor esquerdo
const int ENA = 7;          // Pino PWM para velocidade motor direito
const int ENB = 4;          // Pino PWM para velocidade motor esquerdo

const int trigPin = 8;      // Pino de trigger do sensor ultrassônico
const int echoPin = 9;      // Pino de echo do sensor ultrassônico
const int headlightPin = 13;// Pino do farol (LED)
const int buzzerPin = 12;   // Pino do buzzer
const int mhSensorPin = A0; // Pino do sensor magnético
const int batteryPin = A1;  // Pino para leitura da bateria

/* ====================== VARIÁVEIS DO SISTEMA ====================== */
int speed = 150;
bool reverseMode = false;
bool headlightOn = false;
bool emergencyStop = false;
unsigned long usageTime = 0;
unsigned long lastDataSend = 0;
unsigned long lastBuzzerBeep = 0;
unsigned long lastBatteryCheck = 0;
int beepInterval = 1000;
const int LOW_BATTERY_THRESHOLD = 300;

/* ====================== NOTAS MUSICAIS ====================== */
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523
#define NOTE_G3  196
#define NOTE_A3  220

/* ====================== CONFIGURAÇÃO INICIAL ====================== */
void setup() {
  Serial.begin(9600);
  
  pinMode(IN1_right, OUTPUT);
  pinMode(IN2_right, OUTPUT);
  pinMode(IN3_left, OUTPUT);
  pinMode(IN4_left, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(headlightPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  
  Serial.println(F("╔════════════════════════════╗"));
  Serial.println(F("║   SISTEMA INICIALIZANDO   ║"));
  Serial.println(F("╚════════════════════════════╝"));
  
  playStartupSound();
  selfTest();
  
  stopMotors();
  digitalWrite(headlightPin, LOW);
  
  beep(1, 100);
  digitalWrite(headlightPin, HIGH);
  delay(200);
  digitalWrite(headlightPin, LOW);
  
  Serial.println(F("\n╔════════════════════════════╗"));
  Serial.println(F("║   SISTEMA PRONTO PARA USO  ║"));
  Serial.println(F("╚════════════════════════════╝"));
}

/* ====================== LOOP PRINCIPAL ====================== */
void loop() {
  handleSerialInput();
  
  if (reverseMode) {
    handleReverseSafety();
  }
  
  if (millis() - lastDataSend >= 500) {
    sendSystemData();
    lastDataSend = millis();
  }
  
  if (millis() - lastBatteryCheck >= 5000) {
    checkBattery();
    lastBatteryCheck = millis();
  }
  
  if (!emergencyStop) {
    usageTime = millis() / 1000;
  }
}

/* ====================== FUNÇÕES DE SISTEMA ====================== */
void selfTest() {
  bool testPassed = true;
  
  Serial.println(F("\n🔧 INICIANDO AUTOTESTE 🔧"));
  
  Serial.print(F("🔄 Testando motores... "));
  if (!testMotorMovement()) {
    sendError("MOT-01", "Falha no teste dos motores");
    testPassed = false;
  } else {
    Serial.println(F("✅ OK"));
  }
  
  Serial.print(F("📏 Testando sensor ultrassônico... "));
  float distance = measureDistance();
  if (distance < 0 || distance > 400) {
    sendError("US-01", "Falha no sensor ultrassônico");
    testPassed = false;
  } else {
    Serial.print(F("✅ OK ("));
    Serial.print(distance);
    Serial.println(F(" cm)"));
  }
  
  Serial.print(F("🔋 Testando bateria... "));
  int batteryLevel = analogRead(batteryPin);
  if (batteryLevel < LOW_BATTERY_THRESHOLD) {
    sendError("BAT-01", "Bateria fraca");
    testPassed = false;
  } else {
    Serial.print(F("✅ OK ("));
    Serial.print(map(batteryLevel, 0, 1023, 0, 100));
    Serial.println(F("%)"));
  }
  
  Serial.print(F("🔊 Testando buzzer e farol... "));
  beep(3, 100);
  digitalWrite(headlightPin, HIGH);
  delay(500);
  digitalWrite(headlightPin, LOW);
  Serial.println(F("✅ OK"));
  
  if (testPassed) {
    Serial.println(F("\n🎉 AUTOTESTE CONCLUÍDO COM SUCESSO!"));
    playSuccessMelody();
  } else {
    Serial.println(F("\n⚠️ AUTOTESTE CONCLUÍDO COM FALHAS!"));
    playErrorMelody();
  }
}

void resetEmergencyStop() {
  if (emergencyStop) {
    emergencyStop = false;
    Serial.println(F("🟢 PARADA DE EMERGÊNCIA RESETADA"));
    playResetMelody();
    
    for (int i = 0; i < 3; i++) {
      digitalWrite(headlightPin, HIGH);
      delay(150);
      digitalWrite(headlightPin, LOW);
      delay(150);
    }
  }
}

void handleReverseSafety() {
  float distance = measureDistance();
  
  if (distance < 0) {
    sendError("US-02", "Leitura inválida do sensor ultrassônico");
    return;
  }
  
  if (distance < 100) {
    beepInterval = constrain(map(distance, 30, 100, 200, 1000), 200, 1000);
    
    if (millis() - lastBuzzerBeep >= beepInterval) {
      beep(1, 100);
      lastBuzzerBeep = millis();
    }
  }
  
  if (distance < 30 && distance > 0) {
    emergencyStopProcedure();
    sendAlert("OBSTÁCULO DETECTADO!");
  }
}

void checkBattery() {
  int batteryLevel = analogRead(batteryPin);
  if (batteryLevel < LOW_BATTERY_THRESHOLD) {
    sendAlert("BATERIA FRACA!");
    playLowBatterySound();
    
    if (batteryLevel < LOW_BATTERY_THRESHOLD / 2) {
      emergencyStopProcedure();
      sendAlert("BATERIA CRÍTICA!");
    }
  }
}

void toggleHeadlight() {
  headlightOn = !headlightOn;
  digitalWrite(headlightPin, headlightOn ? HIGH : LOW);
  Serial.print(F("💡 Farol "));
  Serial.println(headlightOn ? F("LIGADO") : F("DESLIGADO"));
  if (headlightOn) {
    beep(1, 50);
  }
}

void manualHorn() {
  Serial.println(F("🔊 Buzina acionada"));
  tone(buzzerPin, NOTE_A4, 200);
  delay(200);
  noTone(buzzerPin);
  delay(50);
  tone(buzzerPin, NOTE_A4, 200);
  delay(200);
  noTone(buzzerPin);
}

void emergencyStopProcedure() {
  emergencyStop = true;
  stopMotors();
  Serial.println(F("🛑 PARADA DE EMERGÊNCIA ACIONADA!"));
  
  for (int i = 0; i < 5; i++) {
    digitalWrite(headlightPin, HIGH);
    tone(buzzerPin, NOTE_G3, 100);
    delay(100);
    digitalWrite(headlightPin, LOW);
    noTone(buzzerPin);
    delay(100);
  }
}

/* ====================== FUNÇÕES DE ÁUDIO ====================== */
void playStartupSound() {
  tone(buzzerPin, NOTE_C4, 200); delay(250);
  tone(buzzerPin, NOTE_E4, 200); delay(250);
  tone(buzzerPin, NOTE_G4, 200); delay(250);
  tone(buzzerPin, NOTE_C5, 400); delay(500);
  noTone(buzzerPin);
}

void playSuccessMelody() {
  tone(buzzerPin, NOTE_C4, 200); delay(250);
  tone(buzzerPin, NOTE_E4, 200); delay(250);
  tone(buzzerPin, NOTE_G4, 200); delay(250);
  noTone(buzzerPin);
}

void playErrorMelody() {
  tone(buzzerPin, NOTE_G4, 200); delay(250);
  tone(buzzerPin, NOTE_E4, 200); delay(250);
  tone(buzzerPin, NOTE_C4, 200); delay(250);
  noTone(buzzerPin);
}

void playResetMelody() {
  tone(buzzerPin, NOTE_C4, 200); delay(250);
  tone(buzzerPin, NOTE_G4, 200); delay(250);
  noTone(buzzerPin);
}

void playLowBatterySound() {
  for (int i = 0; i < 3; i++) {
    tone(buzzerPin, NOTE_A3, 200); delay(300);
    noTone(buzzerPin); delay(100);
  }
}

void beep(int times, int duration) {
  for (int i = 0; i < times; i++) {
    digitalWrite(buzzerPin, HIGH);
    delay(duration);
    digitalWrite(buzzerPin, LOW);
    if (i < times - 1) delay(duration);
  }
}

/* ====================== FUNÇÕES DE MOVIMENTO ====================== */
void moveForward() {
  reverseMode = false;
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1_right, HIGH);
  digitalWrite(IN2_right, LOW);
  digitalWrite(IN3_left, HIGH);
  digitalWrite(IN4_left, LOW);
  Serial.println(F("🔼 MOVENDO PARA FRENTE"));
}

void moveBackward() {
  reverseMode = true;
  speed = constrain(speed, 60, 150);
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1_right, LOW);
  digitalWrite(IN2_right, HIGH);
  digitalWrite(IN3_left, LOW);
  digitalWrite(IN4_left, HIGH);
  Serial.println(F("🔽 MOVENDO PARA TRÁS (MODO RÉ)"));
}

void turnLeft() {
  reverseMode = false;
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1_right, HIGH);
  digitalWrite(IN2_right, LOW);
  digitalWrite(IN3_left, LOW);
  digitalWrite(IN4_left, HIGH);
  Serial.println(F("↪️ VIRANDO PARA ESQUERDA"));
}

void turnRight() {
  reverseMode = false;
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1_right, LOW);
  digitalWrite(IN2_right, HIGH);
  digitalWrite(IN3_left, HIGH);
  digitalWrite(IN4_left, LOW);
  Serial.println(F("↩️ VIRANDO PARA DIREITA"));
}

void stopMotors() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  digitalWrite(IN1_right, LOW);
  digitalWrite(IN2_right, LOW);
  digitalWrite(IN3_left, LOW);
  digitalWrite(IN4_left, LOW);
  Serial.println(F("⏹️ MOTORES PARADOS"));
}

/* ====================== FUNÇÕES AUXILIARES ====================== */
float measureDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  unsigned long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * 0.034 / 2;
}

bool testMotorMovement() {
  bool result = true;
  int testSpeed = 100;
  
  analogWrite(ENA, testSpeed);
  digitalWrite(IN1_right, HIGH);
  digitalWrite(IN2_right, LOW);
  delay(200);
  analogWrite(ENA, 0);
  digitalWrite(IN1_right, LOW);
  digitalWrite(IN2_right, LOW);
  delay(100);
  
  analogWrite(ENA, testSpeed);
  digitalWrite(IN1_right, LOW);
  digitalWrite(IN2_right, HIGH);
  delay(200);
  analogWrite(ENA, 0);
  digitalWrite(IN1_right, LOW);
  digitalWrite(IN2_right, LOW);
  delay(100);
  
  analogWrite(ENB, testSpeed);
  digitalWrite(IN3_left, HIGH);
  digitalWrite(IN4_left, LOW);
  delay(200);
  analogWrite(ENB, 0);
  digitalWrite(IN3_left, LOW);
  digitalWrite(IN4_left, LOW);
  delay(100);
  
  analogWrite(ENB, testSpeed);
  digitalWrite(IN3_left, LOW);
  digitalWrite(IN4_left, HIGH);
  delay(200);
  analogWrite(ENB, 0);
  digitalWrite(IN3_left, LOW);
  digitalWrite(IN4_left, LOW);
  delay(100);
  
  return result;
}

void sendSystemData() {
  String data = F("📊 DADOS DO SISTEMA:\n");
  
  data += F("  🚗 Estado: ");
  data += emergencyStop ? F("⛔ PARADA DE EMERGÊNCIA") : F("✅ OPERACIONAL");
  data += F("\n  🏎️  Velocidade: ");
  data += speed;
  data += F("\n  💡 Farol: ");
  data += headlightOn ? F("🔆 LIGADO") : F("🌚 DESLIGADO");
  data += F("\n  📏 Distância: ");
  data += measureDistance();
  data += F(" cm");
  data += F("\n  🔋 Bateria: ");
  data += map(analogRead(batteryPin), 0, 1023, 0, 100);
  data += F("%");
  data += F("\n  ⏱️  Tempo de uso: ");
  data += usageTime;
  data += F(" segundos");
  
  Serial.println(data);
}

void sendError(String errorCode, String message) {
  Serial.print(F("❌ ERRO "));
  Serial.print(errorCode);
  Serial.print(F(": "));
  Serial.println(message);
  beep(2, 500);
}

void sendAlert(String alert) {
  Serial.print(F("⚠️ ALERTA: "));
  Serial.println(alert);
  beep(3, 200);
}

void handleCommand(String command) {
  if (command.length() == 0) return;
  
  char cmd = command.charAt(0);
  int newSpeed = 0;
  
  if (command.length() > 1) {
    newSpeed = command.substring(1).toInt();
  }
  
  if (emergencyStop && cmd != 'S' && cmd != 'X' && cmd != 'R') {
    Serial.println(F("⚠️ EMERGENCY_STOP_ACTIVE"));
    return;
  }
  
  if (newSpeed > 0) {
    speed = constrain(newSpeed, 60, 255);
    if (reverseMode) {
      speed = constrain(speed, 60, 150);
    }
  }
  
  switch(cmd) {
    case 'F': moveForward(); break;
    case 'B': moveBackward(); break;
    case 'E': turnLeft(); break;
    case 'D': turnRight(); break;
    case 'S': stopMotors(); break;
    case 'L': toggleHeadlight(); break;
    case 'Z': manualHorn(); break;
    case 'X': emergencyStopProcedure(); break;
    case 'R': resetEmergencyStop(); break;
    case '?': sendSystemData(); break;
    default: 
      Serial.println(F("❌ COMANDO INVÁLIDO"));
      playErrorMelody();
      break;
  }
}