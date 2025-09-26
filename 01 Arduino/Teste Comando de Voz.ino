// Definição dos pinos de controle dos relés
const int releA = 2;  // Relé que controla um lado do motor
const int releB = 3;  // Relé que controla o outro lado do motor

void setup() {
  // Configura os pinos como saída
  pinMode(releA, OUTPUT);
  pinMode(releB, OUTPUT);

  // Garante motor desligado no início
  digitalWrite(releA, LOW);
  digitalWrite(releB, LOW);
}

void loop() {
  // Motor para frente (A ligado, B desligado)
  digitalWrite(releA, HIGH);
  digitalWrite(releB, LOW);
  delay(10000); // 10 segundos

  // Motor desligado
  digitalWrite(releA, LOW);
  digitalWrite(releB, LOW);
  delay(1000); // 1 segundo

  // Motor para trás (A desligado, B ligado)
  digitalWrite(releA, LOW);
  digitalWrite(releB, HIGH);
  delay(10000); // 10 segundos

  // Motor desligado
  digitalWrite(releA, LOW);
  digitalWrite(releB, LOW);
  delay(1000); // 1 segundo
}
