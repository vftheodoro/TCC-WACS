#include <Wire.h>  // Biblioteca para comunicação I2C
#include <LiquidCrystal_I2C.h> // Biblioteca para controle do LCD

// Definição do display LCD (endereço 0x27, 16 colunas, 2 linhas)
LiquidCrystal_I2C lcd(0x27, 16, 2); 

// Definição dos pinos para controle dos motores
int rodaEsquerdaForca = 2;
int rodaEsquerdaGiro = 3;
int rodaDireitaForca = 4;
int rodaDireitaGiro = 5;

// Definição dos pinos dos botões
int botaoFrente = 6;
int botaoTras = 7;
int botaoEsquerda = 8;
int botaoDireita = 9;

void setup() {
  // Inicializa o LCD e ativa a luz de fundo
  lcd.init();
  lcd.backlight();
  lcd.print("Sistema Pronto"); // Mensagem inicial
  delay(2000);
  lcd.clear(); // Limpa o display após a mensagem inicial

  // Define os pinos dos motores como saída
  pinMode(rodaEsquerdaForca, OUTPUT);
  pinMode(rodaEsquerdaGiro, OUTPUT);
  pinMode(rodaDireitaForca, OUTPUT);
  pinMode(rodaDireitaGiro, OUTPUT);
  
  // Define os pinos dos botões como entrada com pull-up interno
  pinMode(botaoFrente, INPUT_PULLUP);
  pinMode(botaoTras, INPUT_PULLUP);
  pinMode(botaoEsquerda, INPUT_PULLUP);
  pinMode(botaoDireita, INPUT_PULLUP);
}

void loop() {
  lcd.setCursor(0, 0); // Posiciona o cursor no canto superior esquerdo do LCD

  // Verifica se o botão "Frente" foi pressionado
  if (digitalRead(botaoFrente) == LOW) { 
    lcd.print("Movendo Frente  ");
    digitalWrite(rodaEsquerdaForca, HIGH);  // Liga motor esquerdo para frente
    digitalWrite(rodaDireitaForca, HIGH);   // Liga motor direito para frente
    digitalWrite(rodaEsquerdaGiro, LOW);    // Mantém direção normal
    digitalWrite(rodaDireitaGiro, LOW);
  } 
  // Verifica se o botão "Trás" foi pressionado
  else if (digitalRead(botaoTras) == LOW) { 
    lcd.print("Movendo Tras    ");
    digitalWrite(rodaEsquerdaForca, HIGH);  // Liga motor esquerdo para trás
    digitalWrite(rodaDireitaForca, HIGH);   // Liga motor direito para trás
    digitalWrite(rodaEsquerdaGiro, HIGH);   // Inverte direção
    digitalWrite(rodaDireitaGiro, HIGH);
  } 
  // Verifica se o botão "Esquerda" foi pressionado
  else if (digitalRead(botaoEsquerda) == LOW) { 
    lcd.print("Virando Esquerda");
    digitalWrite(rodaEsquerdaForca, LOW);   // Desliga motor esquerdo
    digitalWrite(rodaDireitaForca, HIGH);   // Liga motor direito para girar para esquerda
    digitalWrite(rodaDireitaGiro, LOW);
  } 
  // Verifica se o botão "Direita" foi pressionado
  else if (digitalRead(botaoDireita) == LOW) { 
    lcd.print("Virando Direita ");
    digitalWrite(rodaEsquerdaForca, HIGH);  // Liga motor esquerdo para girar para direita
    digitalWrite(rodaDireitaForca, LOW);    // Desliga motor direito
    digitalWrite(rodaEsquerdaGiro, LOW);
  } 
  
  // Se nenhum botão estiver pressionado, a cadeira fica parada
  else { 
    lcd.print("Parado          ");
    digitalWrite(rodaEsquerdaForca, LOW);  // Desliga os motores
    digitalWrite(rodaDireitaForca, LOW);
  }

  delay(100); // Pequeno delay para evitar leituras falsas
}
