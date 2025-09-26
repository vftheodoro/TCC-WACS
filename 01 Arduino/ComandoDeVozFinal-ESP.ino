#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

// Definição dos pinos usando "Dxx"
const int releA = 13;   // Relé que controla um lado do motor (D13)
const int releB = 12;   // Relé que controla o outro lado do motor (D12)

void setup() {
  Serial.begin(115200);

  pinMode(releA, OUTPUT);
  pinMode(releB, OUTPUT);

  digitalWrite(releA, LOW);
  digitalWrite(releB, LOW);

  // Inicia Bluetooth
  SerialBT.begin("ESP32_VOZ"); 
  Serial.println("Bluetooth iniciado. Pareie com ESP32_VOZ no celular");
}

void loop() {
  if (SerialBT.available()) {
    String comando = SerialBT.readStringUntil('\n');
    comando.toLowerCase();
    comando.trim();
    Serial.println("Recebido: " + comando);

    if (comando.indexOf("frente") >= 0) {
      frente();
    } else if (comando.indexOf("trás") >= 0 || comando.indexOf("tras") >= 0) {
      tras();
    } else if (comando.indexOf("parar") >= 0) {
      parar();
    }
  }
}

// Funções motor
void frente() {
  digitalWrite(releA, HIGH);
  digitalWrite(releB, LOW);
}

void tras() {
  digitalWrite(releA, LOW);
  digitalWrite(releB, HIGH);
}

void parar() {
  digitalWrite(releA, LOW);
  digitalWrite(releB, LOW);
}
