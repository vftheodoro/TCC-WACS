const int motorEsquerda = 9;
const int motorDireita = 10;

void setup() {
  Serial.begin(9600);
  pinMode(motorEsquerda, OUTPUT);
  pinMode(motorDireita, OUTPUT);
  // Inicia com motores desligados
  digitalWrite(motorEsquerda, LOW);
  digitalWrite(motorDireita, LOW);
}

void loop() {
  if (Serial.available() > 0) {
    char comando = Serial.read();
    
    // Limpa buffer serial
    while(Serial.available() > 0) Serial.read();

    switch(comando) {
      case 'F': // Frente
        digitalWrite(motorEsquerda, HIGH);
        digitalWrite(motorDireita, HIGH);
        break;
      case 'B': // Trás
        digitalWrite(motorEsquerda, HIGH);
        digitalWrite(motorDireita, HIGH);
        break;
      case 'E': // Esquerda
        digitalWrite(motorEsquerda, HIGH);
        digitalWrite(motorDireita, LOW);
        break;
      case 'D': // Direita
        digitalWrite(motorEsquerda, LOW);
        digitalWrite(motorDireita, HIGH);
        break;
      case 'S': // Parar (novo código)
        digitalWrite(motorEsquerda, LOW);
        digitalWrite(motorDireita, LOW);
        break;
    }
    Serial.print("Recebido: ");
    Serial.println(comando);
  }
}
