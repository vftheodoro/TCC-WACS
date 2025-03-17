#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); 

// Definição dos pinos do motor
int rodaEsquerdaForca = 2;
int rodaEsquerdaGiro = 3;
int rodaDireitaForca = 4;
int rodaDireitaGiro = 5;

void setup() {
  // Configuração dos pinos dos motores
  pinMode(rodaEsquerdaForca, OUTPUT);
  pinMode(rodaEsquerdaGiro, OUTPUT);
  pinMode(rodaDireitaForca, OUTPUT);
  pinMode(rodaDireitaGiro, OUTPUT);

  // Inicialização do LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Sistema pronto!");
  delay(2000);
  lcd.clear();
}

void loop() {
  lcd.setCursor(0, 0);
  lcd.print("Rod. Esq: FRENTE");
  digitalWrite(rodaEsquerdaForca, HIGH);
  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Rod. Esq: TRAS");
  digitalWrite(rodaEsquerdaGiro, HIGH);
  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Rod. Dir: FRENTE");
  digitalWrite(rodaDireitaForca, HIGH);
  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Rod. Dir: TRAS");
  digitalWrite(rodaDireitaGiro, HIGH);
  delay(2000);

  lcd.clear();
}
