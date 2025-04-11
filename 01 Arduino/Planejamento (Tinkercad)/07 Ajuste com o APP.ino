#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pinos dos motores
const int IN1 = 5, IN2 = 6, ENA1 = 7;
const int IN3 = 3, IN4 = 2, ENA2 = 4;

// Sensores
const int TRIG_PIN = 9, ECHO_PIN = 10;
const int BATT_PIN = A0;
const int LED_PIN = 8;

// Parâmetros da bateria
const float R1 = 56000.0;
const float R2 = 33000.0;
const float VOLT_MAX = 11.99;
const float VOLT_MIN = 9.99;

// Variáveis de controle
bool connected = false;
String currentCommand = "Parado";
unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENA1, OUTPUT); pinMode(ENA2, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  lcd.init();
  lcd.backlight();
  lcd.print("Sistema Pronto");
  delay(1000);
}

void loop() {
  checkConnection();
  updateDisplay();
  controlLED();
  sendSerialData();
  
  if(connected) {
    handleCommands();
  } else {
    autonomousMode();
  }
}

void checkConnection() {
  if(Serial.available()) {
    char c = Serial.read();
    connected = (c == 'C');
  }
}

void updateDisplay() {
  if(millis() - lastUpdate > 1000) {
    lastUpdate = millis();
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Bateria: ");
    lcd.print(calculateBattery());
    lcd.print("%");
    
    lcd.setCursor(0, 1);
    lcd.print(measureVoltage(), 1);
    lcd.print("V");
  }
}

void controlLED() {
  digitalWrite(LED_PIN, connected ? HIGH : (millis() % 500 < 250));
}

float measureVoltage() {
  int reading = analogRead(BATT_PIN);
  return (reading * 5.0 / 1023.0) * ((R1 + R2) / R2);
}

int calculateBattery() {
  float voltage = constrain(measureVoltage(), VOLT_MIN, VOLT_MAX);
  return map(voltage * 100, VOLT_MIN * 100, VOLT_MAX * 100, 0, 100);
}

long measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  return pulseIn(ECHO_PIN, HIGH) * 0.034 / 2;
}

void sendSerialData() {
  if(millis() % 500 < 100) {
    Serial.print("BAT:");
    Serial.print(calculateBattery());
    Serial.print("% | DIST:");
    Serial.print(measureDistance());
    Serial.print("cm | CMD:");
    Serial.print(currentCommand);
    Serial.print(" | CONEX:");
    Serial.println(connected ? "SIM" : "NAO");
  }
}

void handleCommands() {
  if(Serial.available()) {
    char cmd = toupper(Serial.read());
    
    switch(cmd) {
      case 'F': moveForward(); break;
      case 'B': moveBackward(); break;
      case 'E': turnLeft(); break;
      case 'D': turnRight(); break;
      case 'S': stopMotors(); break;
      default: break;
    }
  }
}

void autonomousMode() {
  static unsigned long phaseStart = millis();
  static byte phase = 0;
  
  switch(phase) {
    case 0: moveForward(); phase = checkPhase(phaseStart, 2000, 1); break;
    case 1: stopMotors(); phase = checkPhase(phaseStart, 1000, 2); break;
    case 2: moveBackward(); phase = checkPhase(phaseStart, 2000, 3); break;
    case 3: stopMotors(); phase = checkPhase(phaseStart, 1000, 0); break;
  }
}

byte checkPhase(unsigned long &start, unsigned long duration, byte nextPhase) {
  return (millis() - start > duration) ? (start = millis(), nextPhase) : (nextPhase - 1);
}

void moveForward() {
  analogWrite(ENA1, 255);
  analogWrite(ENA2, 255);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  currentCommand = "Frente";
}

void moveBackward() {
  analogWrite(ENA1, 200);
  analogWrite(ENA2, 200);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  currentCommand = "Tras";
}

void turnLeft() {
  analogWrite(ENA1, 0);
  analogWrite(ENA2, 255);
  digitalWrite(IN3, HIGH);
  currentCommand = "Esquerda";
}

void turnRight() {
  analogWrite(ENA1, 255);
  analogWrite(ENA2, 0);
  digitalWrite(IN1, HIGH);
  currentCommand = "Direita";
}

void stopMotors() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  currentCommand = "Parado";
}