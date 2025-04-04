import re
import random
import time

class WheelchairAssistant:
    def __init__(self):
        self.name = "AstraChair"
        self.speed = 0
        self.battery = 100
        self.obstacle_detected = False
        self.emergency_mode = False
        self.user_name = None

    def get_intent(self, question):
        question = question.lower()
        patterns = {
            'greeting': r'olá|oi|eae|bom dia|boa tarde|boa noite',
            'speed': r'velocidade|rápido|devagar|lento|acelerar|desacelerar',
            'battery': r'bateria|carregar|duração|energia',
            'navigation': r'ir para|navegar até|como chegar|direções|virar|esquerda|direita|frente|ré',
            'safety': r'segurança|obstáculo|parar|emergência|colisão|perigo',
            'emergency': r'emergência|socorro|ajuda|parada de emergência',
            'gratitude': r'obrigado|valeu|grato|agradeço',
            'capabilities': r'o que você faz|funcionalidades|comandos|ajuda'
        }

        for intent, pattern in patterns.items():
            if re.search(pattern, question):
                return intent
        return None

    def handle_speed(self, question):
        if re.search(r'aumentar|acelerar|mais rápido', question):
            new_speed = min(100, self.speed + 20)
            self.speed = new_speed
            return f"Velocidade aumentada para {new_speed}%"
        
        elif re.search(r'diminuir|desacelerar|mais devagar', question):
            new_speed = max(0, self.speed - 20)
            self.speed = new_speed
            return f"Velocidade reduzida para {new_speed}%"
        
        return f"Velocidade atual: {self.speed}% (Máximo: 100%)"

    def handle_emergency(self):
        self.speed = 0
        self.emergency_mode = True
        return "⚠️ Modo de emergência ativado! Cadeira parada imediatamente. ⚠️"

    def handle_navigation(self, question):
        directions = {
            'esquerda': 'Virando para esquerda',
            'direita': 'Virando para direita',
            'frente': 'Movendo para frente',
            'ré': 'Movendo em ré'
        }
        for direction, response in directions.items():
            if re.search(direction, question):
                return response
        return "Navegação segura ativada. Rotas sendo calculadas..."

    def get_response(self, question):
        intent = self.get_intent(question)
        
        if not intent:
            return "Desculpe, não entendi. Posso ajudar com navegação, velocidade, bateria ou situações de emergência."
        
        if intent == 'greeting':
            return random.choice([
                f"Olá! Sou o assistente da {self.name}, como posso ajudar?",
                f"Bom dia! Pronto para ajudá-lo com a {self.name}!"
            ])
        
        elif intent == 'speed':
            return self.handle_speed(question)
        
        elif intent == 'battery':
            return f"Nível da bateria: {self.battery}% | Autonomia estimada: {self.battery*2} minutos"
        
        elif intent == 'navigation':
            return self.handle_navigation(question)
        
        elif intent == 'safety':
            return "Sistema de segurança ativo: Sensores de obstáculos e parada automática habilitados"
        
        elif intent == 'emergency':
            return self.handle_emergency()
        
        elif intent == 'gratitude':
            return random.choice([
                "De nada! Estou aqui para ajudar.",
                "Às suas ordens!",
                "Qualquer momento!"
            ])
        
        elif intent == 'capabilities':
            return """Posso ajudar com:
            - Controle de velocidade
            - Navegação básica
            - Informações da bateria
            - Procedimentos de emergência
            - Informações de segurança
            Diga 'sair' para encerrar"""

    def monitor_environment(self):
        # Simulação de monitoramento do ambiente
        if random.random() < 0.2:
            self.obstacle_detected = True
            print("\nALERTA: Obstáculo detectado à frente! Parando automaticamente.")
            self.speed = 0

    def run(self):
        print(f"{self.name} Inicializando...\n")
        time.sleep(1)
        print("Sistema pronto. Como posso ajudá-lo hoje?")
        
        while True:
            user_input = input("\nVocê: ").strip()
            
            if user_input.lower() in ['sair', 'exit', 'parar']:
                print("Encerrando sistema... Tenha um bom dia!")
                break
                
            self.monitor_environment()
            response = self.get_response(user_input)
            print(f"Assistente: {response}")

            # Atualização contínua do sistema
            self.battery = max(0, self.battery - 0.5)
            if self.battery <= 10:
                print("\nALERTA: Bateria crítica! Por favor, recarregue imediatamente.")

if __name__ == "__main__":
    assistant = WheelchairAssistant()
    assistant.run()